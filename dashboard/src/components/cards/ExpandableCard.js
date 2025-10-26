/**
 * Expandable Card Component
 * Supports both requirements and kanban tasks with smooth expand/collapse animations
 */
class ExpandableCard {
    constructor(data, type = 'requirement', options = {}) {
        this.data = data;
        this.type = type; // 'requirement' or 'kanban'
        this.options = {
            expandable: true,
            showActions: true,
            ...options
        };
        this.expanded = false;
        this.element = null;
        this.expandedContent = null;
    }

    /**
     * Render the card HTML
     */
    render() {
        const card = document.createElement('div');
        card.className = `expandable-card ${this.type}-card`;
        card.dataset.id = this.data.id;
        card.dataset.type = this.type;
        
        card.innerHTML = `
            <div class="card-header">
                ${this.renderHeader()}
                ${this.options.expandable ? '<button class="expand-btn" aria-label="Expand details">▼</button>' : ''}
            </div>
            <div class="card-content">
                ${this.renderContent()}
            </div>
            ${this.options.expandable ? '<div class="card-expanded" style="display: none;"></div>' : ''}
            ${this.options.showActions ? '<div class="card-actions">' + this.renderActions() + '</div>' : ''}
        `;

        this.element = card;
        this.expandedContent = card.querySelector('.card-expanded');
        this.bindEvents();
        
        return card;
    }

    /**
     * Render card header based on type
     */
    renderHeader() {
        if (this.type === 'requirement') {
            return `
                <div class="req-header">
                    <span class="req-id">${this.data.id}</span>
                    <span class="priority-badge ${this.data.priority.toLowerCase()}">${this.data.priority}</span>
                </div>
            `;
        } else if (this.type === 'kanban') {
            return `
                <div class="kanban-header">
                    <span class="task-type ${this.data.type}">${this.data.type}</span>
                    <span class="task-status ${this.data.status.toLowerCase()}">${this.data.status}</span>
                </div>
            `;
        }
        return '';
    }

    /**
     * Render main card content
     */
    renderContent() {
        if (this.type === 'requirement') {
            return `
                <div class="req-title">${this.data.title}</div>
                <div class="req-meta">
                    <span class="category">${this.data.category}</span>
                    <span class="status">${this.data.status}</span>
                </div>
            `;
        } else if (this.type === 'kanban') {
            return `
                <div class="task-title">${this.data.title}</div>
                <div class="task-meta">
                    ${this.data.epic ? `<span class="epic">Epic: ${this.data.epic}</span>` : ''}
                    <span class="assignee">Assignee: ${this.data.assignee}</span>
                    ${this.data.requirements.length > 0 ? 
                        `<span class="linked-reqs">Links: ${this.data.requirements.join(', ')}</span>` : ''}
                </div>
            `;
        }
        return '';
    }

    /**
     * Render expanded content when card is opened
     */
    renderExpandedContent() {
        if (this.type === 'requirement') {
            return `
                <div class="expanded-details">
                    <div class="detail-section">
                        <h4>Dependencies</h4>
                        <div class="dependencies">
                            ${this.data.dependencies ? this.data.dependencies.map(dep => 
                                `<span class="dependency">${dep}</span>`
                            ).join('') : '<span class="none">None</span>'}
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>Priority Score</h4>
                        <div class="priority-score">${this.data.priorityScore || 'N/A'}</div>
                    </div>
                    <div class="detail-section">
                        <h4>File Path</h4>
                        <div class="file-path">${this.data.filePath || 'N/A'}</div>
                    </div>
                </div>
            `;
        } else if (this.type === 'kanban') {
            return `
                <div class="expanded-details">
                    <div class="detail-section">
                        <h4>Content Preview</h4>
                        <div class="content-preview">${this.data.content}</div>
                    </div>
                    <div class="detail-section">
                        <h4>Details</h4>
                        <div class="task-details">
                            <div><strong>Priority:</strong> ${this.data.priority}</div>
                            <div><strong>Type:</strong> ${this.data.type}</div>
                            <div><strong>Last Modified:</strong> ${new Date(this.data.lastModified).toLocaleDateString()}</div>
                            <div><strong>File:</strong> ${this.data.relativePath}</div>
                        </div>
                    </div>
                    ${this.data.requirements.length > 0 ? `
                        <div class="detail-section">
                            <h4>Linked Requirements</h4>
                            <div class="linked-requirements">
                                ${this.data.requirements.map(req => 
                                    `<span class="linked-req" data-req="${req}">${req}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        return '';
    }

    /**
     * Render action buttons
     */
    renderActions() {
        if (this.type === 'requirement') {
            return `
                <button class="action-btn edit-btn" data-action="edit">Edit</button>
                <button class="action-btn status-btn" data-action="status">Change Status</button>
                <button class="action-btn view-btn" data-action="view">View File</button>
            `;
        } else if (this.type === 'kanban') {
            return `
                <button class="action-btn move-btn" data-action="move">Move</button>
                <button class="action-btn edit-btn" data-action="edit">Edit</button>
                <button class="action-btn view-btn" data-action="view">View File</button>
            `;
        }
        return '';
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        if (!this.element) return;

        // Expand/collapse functionality
        const expandBtn = this.element.querySelector('.expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // Card click to expand (except on buttons)
        this.element.addEventListener('click', (e) => {
            if (!e.target.closest('button') && this.options.expandable) {
                this.toggle();
            }
        });

        // Action button handlers
        const actionBtns = this.element.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                this.handleAction(action);
            });
        });

        // Keyboard accessibility
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Make focusable for accessibility
        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'button');
        this.element.setAttribute('aria-expanded', 'false');
    }

    /**
     * Toggle expanded state
     */
    async toggle() {
        if (!this.options.expandable) return;

        this.expanded = !this.expanded;
        
        const expandBtn = this.element.querySelector('.expand-btn');
        
        if (this.expanded) {
            await this.expand();
            if (expandBtn) expandBtn.textContent = '▲';
            this.element.setAttribute('aria-expanded', 'true');
        } else {
            await this.collapse();
            if (expandBtn) expandBtn.textContent = '▼';
            this.element.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Expand the card with animation
     */
    async expand() {
        if (!this.expandedContent) return;

        // Load expanded content
        this.expandedContent.innerHTML = this.renderExpandedContent();
        
        // Show with animation
        this.expandedContent.style.display = 'block';
        this.expandedContent.style.maxHeight = '0px';
        this.expandedContent.style.overflow = 'hidden';
        this.expandedContent.style.transition = 'max-height 0.3s ease-out';
        
        // Force reflow
        this.expandedContent.offsetHeight;
        
        // Animate to full height
        this.expandedContent.style.maxHeight = this.expandedContent.scrollHeight + 'px';
        
        // Clean up after animation
        setTimeout(() => {
            this.expandedContent.style.maxHeight = 'none';
            this.expandedContent.style.overflow = 'visible';
        }, 300);

        this.element.classList.add('expanded');
    }

    /**
     * Collapse the card with animation
     */
    async collapse() {
        if (!this.expandedContent) return;

        this.expandedContent.style.maxHeight = this.expandedContent.scrollHeight + 'px';
        this.expandedContent.style.overflow = 'hidden';
        this.expandedContent.style.transition = 'max-height 0.3s ease-in';
        
        // Force reflow
        this.expandedContent.offsetHeight;
        
        // Animate to 0 height
        this.expandedContent.style.maxHeight = '0px';
        
        // Hide after animation
        setTimeout(() => {
            this.expandedContent.style.display = 'none';
            this.expandedContent.innerHTML = '';
        }, 300);

        this.element.classList.remove('expanded');
    }

    /**
     * Handle action button clicks
     */
    handleAction(action) {
        const event = new CustomEvent('cardAction', {
            detail: {
                action: action,
                data: this.data,
                type: this.type,
                card: this
            }
        });
        
        this.element.dispatchEvent(event);
        
        // Also emit to document for global handlers
        document.dispatchEvent(event);
    }

    /**
     * Update card data and re-render
     */
    update(newData) {
        this.data = { ...this.data, ...newData };
        
        // Update visible content
        const contentEl = this.element.querySelector('.card-content');
        if (contentEl) {
            contentEl.innerHTML = this.renderContent();
        }
        
        // Update expanded content if currently expanded
        if (this.expanded && this.expandedContent) {
            this.expandedContent.innerHTML = this.renderExpandedContent();
        }
    }

    /**
     * Destroy the card and clean up
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.expandedContent = null;
    }
}

export default ExpandableCard; 