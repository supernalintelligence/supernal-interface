/**
 * API Service - Centralized data fetching and management
 */
class ApiService {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
    }

    /**
     * Generic fetch wrapper with error handling and caching
     */
    async fetch(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const cacheKey = `${url}${JSON.stringify(options)}`;
        
        // Check cache if not forcing refresh
        if (!options.force && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache successful responses
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * Get all requirements
     */
    async getRequirements(force = false) {
        return await this.fetch('/api/requirements', { force });
    }

    /**
     * Get dashboard statistics
     */
    async getStats(force = false) {
        return await this.fetch('/api/stats', { force });
    }

    /**
     * Get kanban data
     */
    async getKanban(force = false) {
        return await this.fetch('/api/kanban', { force });
    }

    /**
     * Get hierarchical data structure
     */
    async getHierarchy(force = false) {
        return await this.fetch('/api/hierarchy', { force });
    }

    /**
     * Get health status
     */
    async getHealth() {
        return await this.fetch('/api/health', { force: true });
    }

    /**
     * Update requirement status
     */
    async updateRequirementStatus(id, status) {
        const response = await fetch(`${this.baseUrl}/api/requirements/${id}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error(`Failed to update requirement ${id}: ${response.statusText}`);
        }

        // Invalidate cache
        this.clearCache();
        
        return await response.json();
    }

    /**
     * Search across all items
     */
    async search(query, filters = {}) {
        const params = new URLSearchParams({
            q: query,
            ...filters
        });
        
        return await this.fetch(`/api/search?${params}`, { force: true });
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheInfo() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            timeout: this.cacheTimeout
        };
    }
}

// Export singleton instance
export default new ApiService(); 