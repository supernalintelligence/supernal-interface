/**
 * Kanban Parser Service - Scans and parses kanban task files
 */
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../../../scripts/config-loader');

class KanbanParser {
    constructor(kanbanRoot = null) {
        if (kanbanRoot) {
            this.kanbanRoot = kanbanRoot;
        } else {
            // Load from configuration
            const config = getConfig();
            config.load();
            this.kanbanRoot = path.join(__dirname, '../../../', config.getKanbanBaseDirectory());
        }
    }

    /**
     * Parse a kanban task file and extract metadata
     */
    parseKanbanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = path.basename(filePath, '.md');
            const relativePath = path.relative(this.kanbanRoot, filePath);
            const pathParts = path.dirname(relativePath).split(path.sep);
            
            // Extract status from directory structure
            const status = pathParts[pathParts.length - 1] || 'unknown';
            
            // Extract title from content or filename
            const titleMatch = content.match(/^#\s+(.+)/m);
            const title = titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' ');
            
            // Extract dates
            const dateMatch = content.match(/Date:\s*(.+)/);
            const date = dateMatch ? new Date(dateMatch[1]) : fs.statSync(filePath).mtime;
            
            // Extract priority if present
            const priorityMatch = content.match(/Priority:\s*(High|Medium|Low|Critical)/i);
            const priority = priorityMatch ? priorityMatch[1] : 'Medium';
            
            // Extract assignee
            const assigneeMatch = content.match(/Assignee:\s*(.+)/);
            const assignee = assigneeMatch ? assigneeMatch[1].trim() : 'unassigned';
            
            // Extract requirement references
            const reqMatches = content.match(/REQ-\d+/g) || [];
            const requirements = [...new Set(reqMatches)]; // Remove duplicates
            
            // Extract epic if in epic structure
            const epicMatch = relativePath.match(/epics\/([^\/]+)/);
            const epic = epicMatch ? epicMatch[1] : null;
            
            // Determine task type
            let type = 'task';
            if (pathParts.includes('epics')) {
                type = epic ? 'epic-task' : 'epic';
            } else if (pathParts.includes('handoffs')) {
                type = 'handoff';
            } else if (pathParts.includes('immediate')) {
                type = 'immediate';
            }
            
            return {
                id: this.generateTaskId(relativePath),
                title: title,
                status: status,
                type: type,
                priority: priority,
                assignee: assignee,
                epic: epic,
                requirements: requirements,
                date: date,
                filePath: filePath,
                relativePath: relativePath,
                content: content.substring(0, 500) + '...', // First 500 chars for preview
                lastModified: fs.statSync(filePath).mtime
            };
        } catch (error) {
            console.error(`Error parsing kanban file ${filePath}:`, error.message);
            return null;
        }
    }

    /**
     * Generate a unique task ID from file path
     */
    generateTaskId(relativePath) {
        return relativePath
            .replace(/\//g, '-')
            .replace(/\.md$/, '')
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .toLowerCase();
    }

    /**
     * Scan kanban directory and return all tasks
     */
    scanKanbanTasks() {
        const tasks = [];
        
        function scanDir(dir, parser) {
            try {
                const items = fs.readdirSync(dir);
                
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        scanDir(fullPath, parser);
                    } else if (item.endsWith('.md')) {
                        const task = parser.parseKanbanFile(fullPath);
                        if (task) {
                            tasks.push(task);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error scanning kanban directory ${dir}:`, error.message);
            }
        }
        
        scanDir(this.kanbanRoot, this);
        
        // Sort by priority, then by date
        tasks.sort((a, b) => {
            const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
            const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.date) - new Date(a.date);
        });
        
        return tasks;
    }

    /**
     * Get tasks organized by status
     */
    getTasksByStatus() {
        const tasks = this.scanKanbanTasks();
        const byStatus = {
            todo: [],
            doing: [],
            done: [],
            blocked: [],
            planning: [],
            other: []
        };
        
        tasks.forEach(task => {
            const status = task.status.toLowerCase();
            if (byStatus.hasOwnProperty(status)) {
                byStatus[status].push(task);
            } else {
                byStatus.other.push(task);
            }
        });
        
        return byStatus;
    }

    /**
     * Get tasks organized by epic
     */
    getTasksByEpic() {
        const tasks = this.scanKanbanTasks();
        const byEpic = {};
        
        tasks.forEach(task => {
            const epic = task.epic || 'unassigned';
            if (!byEpic[epic]) {
                byEpic[epic] = [];
            }
            byEpic[epic].push(task);
        });
        
        return byEpic;
    }

    /**
     * Get statistics about kanban tasks
     */
    getKanbanStats() {
        const tasks = this.scanKanbanTasks();
        const byStatus = this.getTasksByStatus();
        
        return {
            total: tasks.length,
            todo: byStatus.todo.length,
            doing: byStatus.doing.length,
            done: byStatus.done.length,
            blocked: byStatus.blocked.length,
            planning: byStatus.planning.length,
            completion: tasks.length > 0 ? Math.round((byStatus.done.length / tasks.length) * 100) : 0,
            epics: Object.keys(this.getTasksByEpic()).length,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Link kanban tasks to requirements
     */
    linkTasksToRequirements(requirements) {
        const tasks = this.scanKanbanTasks();
        const linked = {};
        
        requirements.forEach(req => {
            linked[req.id] = {
                requirement: req,
                tasks: tasks.filter(task => task.requirements.includes(req.id))
            };
        });
        
        // Add unlinked tasks
        const linkedTaskIds = new Set();
        Object.values(linked).forEach(item => {
            item.tasks.forEach(task => linkedTaskIds.add(task.id));
        });
        
        const unlinkedTasks = tasks.filter(task => !linkedTaskIds.has(task.id));
        if (unlinkedTasks.length > 0) {
            linked['unlinked'] = {
                requirement: null,
                tasks: unlinkedTasks
            };
        }
        
        return linked;
    }
}

module.exports = KanbanParser; 