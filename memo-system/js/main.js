class MemoSystem {
    constructor() {
        this.memos = JSON.parse(localStorage.getItem('memos')) || [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadThemePreference();
        this.render();
    }

    bindEvents() {
        // 添加备忘录事件
        document.getElementById('addMemoBtn').addEventListener('click', () => {
            this.addMemo();
        });

        document.getElementById('memoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addMemo();
            }
        });

        // 搜索事件
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.trim();
            this.render();
        });

        // 过滤按钮事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 清除已完成事件
        document.getElementById('clearCompletedBtn').addEventListener('click', () => {
            this.clearCompleted();
        });

        // 导入导出事件
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportMemos();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.importMemos(e.target.files[0]);
        });

        // 切换主题事件
        document.getElementById('toggleThemeBtn').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    addMemo() {
        const input = document.getElementById('memoInput');
        const text = input.value.trim();

        if (text) {
            const memo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'medium', // 默认中等优先级
                dueDate: null, // 默认无截止日期
                tags: [] // 默认无标签
            };

            this.memos.unshift(memo);
            this.saveToLocalStorage();
            this.render();
            input.value = '';
            input.focus();
        }
    }

    toggleMemo(id) {
        const memo = this.memos.find(memo => memo.id === id);
        if (memo) {
            memo.completed = !memo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }

    deleteMemo(id) {
        this.memos = this.memos.filter(memo => memo.id !== id);
        this.saveToLocalStorage();
        this.render();
    }

    editMemo(id, newText) {
        const memo = this.memos.find(memo => memo.id === id);
        if (memo && newText.trim()) {
            memo.text = newText.trim();
            this.saveToLocalStorage();
            this.render();
        }
    }

    updateMemoOptions(id, options) {
        const memo = this.memos.find(memo => memo.id === id);
        if (memo) {
            if (options.priority) memo.priority = options.priority;
            if (options.dueDate) memo.dueDate = options.dueDate;
            if (options.tags) memo.tags = options.tags;
            this.saveToLocalStorage();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    clearCompleted() {
        if (confirm('确定要清除所有已完成的备忘录吗？')) {
            this.memos = this.memos.filter(memo => !memo.completed);
            this.saveToLocalStorage();
            this.render();
        }
    }

    exportMemos() {
        const exportData = {
            memos: this.memos,
            exportedAt: new Date().toISOString(),
            version: '2.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `memos-export-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importMemos(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // 兼容旧版本数据结构
                if (Array.isArray(importedData)) {
                    // 老版本数据
                    this.memos = [...importedData.map(memo => ({
                        ...memo,
                        priority: memo.priority || 'medium',
                        dueDate: memo.dueDate || null,
                        tags: memo.tags || []
                    })), ...this.memos];
                } else if (importedData.memos) {
                    // 新版本数据
                    this.memos = [...importedData.memos.map(memo => ({
                        ...memo,
                        priority: memo.priority || 'medium',
                        dueDate: memo.dueDate || null,
                        tags: memo.tags || []
                    })), ...this.memos];
                } else {
                    throw new Error('无效的数据格式');
                }
                
                this.saveToLocalStorage();
                this.render();
                alert(`成功导入 ${importedData.memos ? importedData.memos.length : importedData.length} 条备忘录！`);
            } catch (error) {
                console.error('导入失败:', error);
                alert('导入失败：文件格式不正确');
            }
        };
        reader.readAsText(file);
    }

    getFilteredMemos() {
        let filteredMemos = this.memos;
        
        // 应用状态过滤
        switch (this.currentFilter) {
            case 'active':
                filteredMemos = filteredMemos.filter(memo => !memo.completed);
                break;
            case 'completed':
                filteredMemos = filteredMemos.filter(memo => memo.completed);
                break;
            default:
                // no filter
        }
        
        // 应用搜索过滤
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filteredMemos = filteredMemos.filter(memo => 
                memo.text.toLowerCase().includes(term) ||
                memo.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }
        
        return filteredMemos;
    }

    saveToLocalStorage() {
        localStorage.setItem('memos', JSON.stringify(this.memos));
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        if (savedTheme === 'night' || (savedTheme === null && prefersDarkScheme.matches)) {
            document.body.classList.add('night-mode');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('night-mode');
        const isNightMode = document.body.classList.contains('night-mode');
        localStorage.setItem('theme', isNightMode ? 'night' : 'day');
    }

    createOptionsModal(memo) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>备忘录选项</h3>
                <div class="option-form">
                    <label for="prioritySelect">优先级:</label>
                    <select id="prioritySelect">
                        <option value="low" ${memo.priority === 'low' ? 'selected' : ''}>低</option>
                        <option value="medium" ${memo.priority === 'medium' ? 'selected' : ''}>中</option>
                        <option value="high" ${memo.priority === 'high' ? 'selected' : ''}>高</option>
                    </select>
                    
                    <label for="dueDateInput">截止日期:</label>
                    <input type="date" id="dueDateInput" value="${memo.dueDate || ''}">
                    
                    <label for="tagsInput">标签 (用逗号分隔):</label>
                    <input type="text" id="tagsInput" value="${memo.tags.join(', ')}" placeholder="工作, 重要, 个人...">
                    
                    <button id="saveOptionsBtn">保存选项</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定关闭事件
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', function closeModal(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                window.removeEventListener('click', closeModal);
            }
        });
        
        // 保存选项事件
        modal.querySelector('#saveOptionsBtn').addEventListener('click', () => {
            const priority = modal.querySelector('#prioritySelect').value;
            const dueDate = modal.querySelector('#dueDateInput').value;
            const tags = modal.querySelector('#tagsInput').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);
            
            this.updateMemoOptions(memo.id, { priority, dueDate, tags });
            document.body.removeChild(modal);
        });
    }

    render() {
        const filteredMemos = this.getFilteredMemos();
        const memoList = document.getElementById('memoList');
        
        memoList.innerHTML = '';

        filteredMemos.forEach(memo => {
            const li = document.createElement('li');
            li.className = `memo-item ${memo.completed ? 'completed' : ''} ${memo.priority}-priority`;
            li.innerHTML = `
                <input type="checkbox" class="memo-checkbox" ${memo.completed ? 'checked' : ''}>
                <div class="memo-content">
                    <span class="memo-text">${this.escapeHtml(memo.text)}</span>
                    <div class="memo-meta">
                        ${memo.dueDate ? `<span>📅 ${this.formatDate(memo.dueDate)}</span>` : ''}
                        ${memo.priority !== 'medium' ? `<span><span class="priority-indicator priority-${memo.priority}"></span>${this.getPriorityLabel(memo.priority)}</span>` : ''}
                        ${memo.tags && memo.tags.length > 0 ? memo.tags.map(tag => `<span class="memo-tag">${this.escapeHtml(tag)}</span>`).join(' ') : ''}
                    </div>
                </div>
                <div class="memo-actions">
                    <button class="more-options-btn">更多...</button>
                    <button class="edit-btn">编辑</button>
                    <button class="delete-btn">删除</button>
                </div>
            `;
            
            // 绑定事件
            li.querySelector('.memo-checkbox').addEventListener('change', () => {
                this.toggleMemo(memo.id);
            });
            
            li.querySelector('.delete-btn').addEventListener('click', () => {
                this.deleteMemo(memo.id);
            });
            
            li.querySelector('.edit-btn').addEventListener('click', () => {
                this.startEdit(li, memo);
            });
            
            li.querySelector('.more-options-btn').addEventListener('click', () => {
                this.createOptionsModal(memo);
            });
            
            memoList.appendChild(li);
        });

        this.updateStats();
    }

    startEdit(listItem, memo) {
        const memoContent = listItem.querySelector('.memo-content');
        const actions = listItem.querySelector('.memo-actions');
        
        // 创建编辑输入框
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = memo.text;
        
        // 替换文本和按钮
        memoContent.replaceWith(editInput);
        actions.innerHTML = `
            <button class="edit-btn confirm-edit">确认</button>
            <button class="delete-btn cancel-edit">取消</button>
        `;
        
        // 绑定新事件
        actions.querySelector('.confirm-edit').addEventListener('click', () => {
            this.finishEdit(listItem, memo, editInput.value);
        });
        
        actions.querySelector('.cancel-edit').addEventListener('click', () => {
            this.cancelEdit(listItem, memo);
        });
        
        editInput.focus();
        editInput.select();
    }

    finishEdit(listItem, memo, newText) {
        if (newText.trim()) {
            this.editMemo(memo.id, newText);
        } else {
            this.cancelEdit(listItem, memo);
        }
    }

    cancelEdit(listItem, memo) {
        this.render();
    }

    updateStats() {
        const total = this.memos.length;
        const completed = this.memos.filter(memo => memo.completed).length;
        const active = total - completed;

        document.getElementById('totalCount').textContent = `总计: ${total}`;
        document.getElementById('completedCount').textContent = `已完成: ${completed}`;
        document.getElementById('activeCount').textContent = `未完成: ${active}`;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }

    getPriorityLabel(priority) {
        switch(priority) {
            case 'high': return '高优先级';
            case 'medium': return '中优先级';
            case 'low': return '低优先级';
            default: return '普通';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化备忘录系统
document.addEventListener('DOMContentLoaded', () => {
    new MemoSystem();
});