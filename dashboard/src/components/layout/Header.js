/**
 * Dashboard Header Component
 * Contains navigation, manual refresh controls, search, and settings
 */
class Header {
    constructor(options = {}) {
        this.options = {
            showSearch: true,
            showRefresh: true,
            showSettings: true,
            autoRefreshInterval: 30000,
            ...options
        };
        this.element = null;
        this.isRefreshing = false;
        this.lastRefreshTime = null;
        this.autoRefreshTimer = null;
    }

    /**
     * Render the header HTML
     */
    render() {
        const header = document.createElement('header');
        header.className = 'dashboard-header';
        
        header.innerHTML = `
            <div class="header-content">
                <div class="header-left">
                    <div class="logo-section">
                        <h1 class="dashboard-title">
                            <span class="logo">🚀</span>
                            Supernal Coding Dashboard
                        </h1>
                        <p class="dashboard-subtitle">Living, Learning Ecosystem Progress Tracker</p>
                    </div>
                </div>
                
                <div class="header-center">
                    ${this.options.showSearch ? this.renderSearch() : ''}
                </div>
                
                <div class="header-right">
                    <div class="header-controls">
                        ${this.options.showRefresh ? this.renderRefreshControls() : ''}
                        ${this.options.showSettings ? this.renderSettings() : ''}
                    </div>
                    <div class="header-status">
                        <div class="connection-status" data-status="connected">
                            <span class="status-indicator"></span>
                            <span class="status-text">Connected</span>
                        </div>
                        <div class="last-update">
                            <span class="update-label">Last update:</span>
                            <span class="update-time">--</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.element = header;
        this.bindEvents();
        this.startAutoRefresh();
        
        return header;
    }

    /**
     * Render search controls
     */
    renderSearch() {
        return `
            <div class="search-container">
                <div class="search-input-wrapper">
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="Search requirements, tasks, epics..." 
                        aria-label="Search dashboard items"
                    >
                    <button class="search-btn" aria-label="Search">
                        <span class="search-icon">🔍</span>
                    </button>
                    <button class="search-clear" style="display: none;" aria-label="Clear search">
                        <span class="clear-icon">✕</span>
                    </button>
                </div>
                <div class="search-results" style="display: none;"></div>
            </div>
        `;
    }

    /**
     * Render refresh controls
     */
    renderRefreshControls() {
        return `
            <div class="refresh-controls">
                <button class="refresh-btn manual-refresh" aria-label="Manual refresh" title="Refresh data">
                    <span class="refresh-icon">🔄</span>
                    <span class="refresh-text">Refresh</span>
                </button>
                <button class="refresh-btn force-refresh" aria-label="Force refresh" title="Force refresh (bypass cache)">
                    <span class="force-icon">⚡</span>
                </button>
                <div class="auto-refresh-toggle">
                    <label class="toggle-label">
                        <input type="checkbox" class="auto-refresh-checkbox" checked>
                        <span class="toggle-slider"></span>
                        <span class="toggle-text">Auto-refresh</span>
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Render settings controls
     */
    renderSettings() {
        return `
            <div class="settings-controls">
                <button class="settings-btn" aria-label="Dashboard settings" title="Settings">
                    <span class="settings-icon">⚙️</span>
                </button>
                <button class="help-btn" aria-label="Help and shortcuts" title="Help & Shortcuts">
                    <span class="help-icon">❓</span>
                </button>
            </div>
        `;
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        if (!this.element) return;

        // Manual refresh
        const manualRefreshBtn = this.element.querySelector('.manual-refresh');
        if (manualRefreshBtn) {
            manualRefreshBtn.addEventListener('click', () => this.handleManualRefresh());
        }

        // Force refresh
        const forceRefreshBtn = this.element.querySelector('.force-refresh');
        if (forceRefreshBtn) {
            forceRefreshBtn.addEventListener('click', () => this.handleForceRefresh());
        }

        // Auto-refresh toggle
        const autoRefreshCheckbox = this.element.querySelector('.auto-refresh-checkbox');
        if (autoRefreshCheckbox) {
            autoRefreshCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }

        // Search functionality
        const searchInput = this.element.querySelector('.search-input');
        const searchBtn = this.element.querySelector('.search-btn');
        const searchClear = this.element.querySelector('.search-clear');

        if (searchInput) {
            // Search on input with debouncing
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length > 0) {
                    if (searchClear) searchClear.style.display = 'block';
                    searchTimeout = setTimeout(() => this.handleSearch(query), 300);
                } else {
                    if (searchClear) searchClear.style.display = 'none';
                    this.clearSearch();
                }
            });

            // Search on enter
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch(searchInput.value.trim());
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                if (searchInput) {
                    this.handleSearch(searchInput.value.trim());
                }
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    searchClear.style.display = 'none';
                    this.clearSearch();
                }
            });
        }

        // Settings and help
        const settingsBtn = this.element.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        const helpBtn = this.element.querySelector('.help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Handle manual refresh
     */
    async handleManualRefresh(force = false) {
        if (this.isRefreshing) return;

        this.isRefreshing = true;
        this.updateRefreshState(true);

        try {
            // Emit refresh event
            const event = new CustomEvent('dashboardRefresh', {
                detail: { force, manual: true }
            });
            document.dispatchEvent(event);

            this.updateLastRefreshTime();
        } catch (error) {
            console.error('Refresh error:', error);
            this.updateConnectionStatus('error');
        } finally {
            this.isRefreshing = false;
            this.updateRefreshState(false);
        }
    }

    /**
     * Handle force refresh (bypass cache)
     */
    async handleForceRefresh() {
        await this.handleManualRefresh(true);
    }

    /**
     * Handle search
     */
    async handleSearch(query) {
        if (!query) {
            this.clearSearch();
            return;
        }

        try {
            const event = new CustomEvent('dashboardSearch', {
                detail: { query }
            });
            document.dispatchEvent(event);

            // Show search results container
            const resultsContainer = this.element.querySelector('.search-results');
            if (resultsContainer) {
                resultsContainer.style.display = 'block';
                resultsContainer.innerHTML = '<div class="search-loading">Searching...</div>';
            }

        } catch (error) {
            console.error('Search error:', error);
        }
    }

    /**
     * Clear search
     */
    clearSearch() {
        const resultsContainer = this.element.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
        }

        // Emit clear search event
        const event = new CustomEvent('dashboardSearchClear');
        document.dispatchEvent(event);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Don't interfere with input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key.toLowerCase()) {
            case 'r':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.handleManualRefresh();
                }
                break;
            
            case 'f':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    const searchInput = this.element.querySelector('.search-input');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
                break;
            
            case 'escape':
                this.clearSearch();
                break;
        }
    }

    /**
     * Start auto-refresh timer
     */
    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear existing timer
        
        if (this.options.autoRefreshInterval > 0) {
            this.autoRefreshTimer = setInterval(() => {
                if (!this.isRefreshing) {
                    this.handleManualRefresh(false);
                }
            }, this.options.autoRefreshInterval);
        }
    }

    /**
     * Stop auto-refresh timer
     */
    stopAutoRefresh() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = null;
        }
    }

    /**
     * Update refresh button state
     */
    updateRefreshState(isRefreshing) {
        const refreshBtn = this.element.querySelector('.manual-refresh');
        const refreshIcon = this.element.querySelector('.refresh-icon');
        
        if (refreshBtn) {
            refreshBtn.disabled = isRefreshing;
        }
        
        if (refreshIcon) {
            if (isRefreshing) {
                refreshIcon.style.animation = 'spin 1s linear infinite';
            } else {
                refreshIcon.style.animation = '';
            }
        }
    }

    /**
     * Update last refresh time display
     */
    updateLastRefreshTime() {
        this.lastRefreshTime = new Date();
        const timeEl = this.element.querySelector('.update-time');
        if (timeEl) {
            timeEl.textContent = this.lastRefreshTime.toLocaleTimeString();
        }
        this.updateConnectionStatus('connected');
    }

    /**
     * Update connection status
     */
    updateConnectionStatus(status) {
        const statusEl = this.element.querySelector('.connection-status');
        if (statusEl) {
            statusEl.dataset.status = status;
            const statusText = statusEl.querySelector('.status-text');
            if (statusText) {
                switch (status) {
                    case 'connected':
                        statusText.textContent = 'Connected';
                        break;
                    case 'error':
                        statusText.textContent = 'Error';
                        break;
                    case 'disconnected':
                        statusText.textContent = 'Disconnected';
                        break;
                }
            }
        }
    }

    /**
     * Show settings modal
     */
    showSettings() {
        const event = new CustomEvent('showSettings');
        document.dispatchEvent(event);
    }

    /**
     * Show help modal
     */
    showHelp() {
        const event = new CustomEvent('showHelp');
        document.dispatchEvent(event);
    }

    /**
     * Update search results
     */
    updateSearchResults(results) {
        const resultsContainer = this.element.querySelector('.search-results');
        if (!resultsContainer) return;

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
            return;
        }

        const resultsHtml = results.map(result => `
            <div class="search-result" data-type="${result.type}" data-id="${result.id}">
                <div class="result-title">${result.title}</div>
                <div class="result-meta">${result.type} • ${result.category || result.status}</div>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHtml;

        // Bind click handlers for results
        resultsContainer.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const type = result.dataset.type;
                const id = result.dataset.id;
                
                const event = new CustomEvent('searchResultClick', {
                    detail: { type, id }
                });
                document.dispatchEvent(event);
                
                this.clearSearch();
            });
        });
    }

    /**
     * Destroy the header and clean up
     */
    destroy() {
        this.stopAutoRefresh();
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = null;
    }
}

export default Header; 