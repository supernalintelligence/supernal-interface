#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Load configuration and get directory paths
// Use parent directory as project root since config file is there
const projectRoot = path.join(__dirname, '..', '..', '..');
let config;

try {
  const { getConfig } = require(path.join(projectRoot, 'scripts/config-loader'));
  config = getConfig(projectRoot);
  config.load(); // Ensure config is loaded
} catch (error) {
  console.warn('⚠️  Could not load config, using default paths');
  config = {
    getRequirementsDirectory: () => 'requirements',
    getKanbanBaseDirectory: () => 'kanban'
  };
}

const REQUIREMENTS_DIR = path.join(projectRoot, config.getRequirementsDirectory());
const KANBAN_DIR = path.join(projectRoot, config.getKanbanBaseDirectory());

let KanbanParser;
try {
  KanbanParser = require('./src/services/kanbanParser');
} catch (error) {
  console.warn('⚠️  Could not load KanbanParser, using mock data');
  KanbanParser = class MockKanbanParser {
    scanKanbanTasks() { return []; }
    getKanbanStats() { return { total: 0, epics: 0 }; }
    linkTasksToRequirements() { return []; }
  };
}

// Initialize services
const kanbanParser = new KanbanParser(KANBAN_DIR);

/**
 * Parse a requirement file and extract metadata
 */
function parseRequirement(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath, '.md');
        
        // Extract YAML front matter
        const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
        let priority = 'Medium';
        let priorityScore = 5;
        
        if (yamlMatch) {
            const yamlContent = yamlMatch[1];
            const priorityMatch = yamlContent.match(/priority:\s*(.+)/);
            const scoreMatch = yamlContent.match(/priorityScore:\s*(\d+)/);
            
            if (priorityMatch) priority = priorityMatch[1].trim();
            if (scoreMatch) priorityScore = parseInt(scoreMatch[1]);
        }
        
        // Extract title from markdown
        const titleMatch = content.match(/# (.+)/);
        const title = titleMatch ? titleMatch[1].replace(/REQ-\d+:\s*/, '') : fileName;
        
        // Extract category from file path
        const relativePath = path.relative(REQUIREMENTS_DIR, filePath);
        const category = path.dirname(relativePath);
        
        // Extract status from content
        const statusMatch = content.match(/\*\*Status\*\*:\s*(.+)/);
        const status = statusMatch ? statusMatch[1].trim() : 'Planning';
        
        // Extract req ID
        const reqIdMatch = fileName.match(/(req-\d+)/i) || title.match(/(REQ-\d+)/i);
        const reqId = reqIdMatch ? reqIdMatch[1].toUpperCase() : fileName.toUpperCase();
        
        return {
            id: reqId,
            title: title,
            category: category === '.' ? 'core' : category,
            priority: priority,
            priorityScore: priorityScore,
            status: status,
            filePath: filePath
        };
    } catch (error) {
        console.error(`Error parsing requirement ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Scan requirements directory and parse all requirement files
 */
function loadRequirements() {
    const requirements = [];
    
    try {
        // Validate frontmatter before loading
        let validator;
        try {
            const FrontmatterValidator = require(path.join(projectRoot, 'supernal-code-package/lib/cli/utils/frontmatter-validator'));
            validator = new FrontmatterValidator();
            const validation = validator.validateRequirements(REQUIREMENTS_DIR);
            
            if (!validation.valid) {
                console.log('⚠️  Frontmatter validation issues detected in dashboard:');
                console.log(`   ${validation.summary.errorCount} errors, ${validation.summary.warningCount} warnings`);
                console.log(`   Files with errors: ${validation.summary.filesWithErrors.join(', ')}`);
            }
        } catch (error) {
            console.warn('⚠️  Could not load frontmatter validator');
        }
        
        function scanDir(dir) {
            if (!fs.existsSync(dir)) {
                console.warn(`⚠️  Directory not found: ${dir}`);
                return;
            }
            
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDir(fullPath);
                } else if (item.endsWith('.md') && item.match(/req-\d+/i)) {
                    const requirement = parseRequirement(fullPath);
                    if (requirement) {
                        requirements.push(requirement);
                    }
                }
            }
        }
        
        scanDir(REQUIREMENTS_DIR);
        
    } catch (error) {
        console.error('Error loading requirements:', error.message);
    }
    
    return requirements;
}

/**
 * Generate dashboard statistics
 */
function generateStats(requirements) {
    const stats = requirements.reduce((acc, req) => {
        const priority = req.priority.toLowerCase();
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
    }, {});
    
    const totalReqs = requirements.length;
    const completedReqs = requirements.filter(req => 
        req.status.toLowerCase().includes('done') || 
        req.status.toLowerCase().includes('complete')
    ).length;
    
    return {
        total: totalReqs,
        completed: completedReqs,
        progress: totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0,
        critical: stats.critical || 0,
        high: stats.high || 0,
        medium: stats.medium || 0,
        low: stats.low || 0
    };
}

// Routes
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'index.html');
    res.sendFile(htmlPath);
});

app.get('/api/requirements', (req, res) => {
    const requirements = loadRequirements();
    res.json(requirements);
});

app.get('/api/stats', (req, res) => {
    const requirements = loadRequirements();
    const stats = generateStats(requirements);
    res.json(stats);
});

app.get('/api/kanban', (req, res) => {
    try {
        const kanbanData = kanbanParser.scanKanbanTasks();
        res.json(kanbanData);
    } catch (error) {
        console.error('Error loading kanban data:', error.message);
        res.json([]);
    }
});

app.get('/api/kanban/stats', (req, res) => {
    try {
        const kanbanStats = kanbanParser.getKanbanStats();
        res.json(kanbanStats);
    } catch (error) {
        console.error('Error loading kanban stats:', error.message);
        res.json({ total: 0, epics: 0 });
    }
});

app.get('/api/hierarchy', (req, res) => {
    try {
        const requirements = loadRequirements();
        const hierarchy = kanbanParser.linkTasksToRequirements(requirements);
        res.json(hierarchy);
    } catch (error) {
        console.error('Error loading hierarchy:', error.message);
        res.json([]);
    }
});

app.get('/api/health', (req, res) => {
    const requirements = loadRequirements();
    let kanbanStats = { total: 0, epics: 0 };
    
    try {
        kanbanStats = kanbanParser.getKanbanStats();
    } catch (error) {
        console.warn('Could not load kanban stats for health check');
    }
    
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        requirements_found: requirements.length,
        kanban_tasks_found: kanbanStats.total,
        epics_found: kanbanStats.epics
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Supernal Coding Dashboard API Server running at:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://0.0.0.0:${PORT}`);
    console.log(`\n📊 API Endpoints:`);
    console.log(`   GET /api/requirements - Get all requirements`);
    console.log(`   GET /api/stats       - Get dashboard statistics`);
    console.log(`   GET /api/health      - Health check`);
    console.log(`\n🔄 Auto-scanning requirements from: ${REQUIREMENTS_DIR}`);
    
    // Initial load to verify setup
    const requirements = loadRequirements();
    console.log(`\n✅ Found ${requirements.length} requirements`);
    
    if (requirements.length > 0) {
        const stats = generateStats(requirements);
        console.log(`📈 Progress: ${stats.progress}% (${stats.completed}/${stats.total} complete)`);
        console.log(`🎯 Priority Distribution: ${stats.critical} Critical, ${stats.high} High, ${stats.medium} Medium, ${stats.low} Low`);
    }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down dashboard server...');
    process.exit(0);
});

module.exports = { loadRequirements, generateStats, parseRequirement }; 