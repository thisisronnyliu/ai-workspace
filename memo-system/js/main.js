class MemoSystem {
    constructor() {
        this.memos = JSON.parse(localStorage.getItem('memos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
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

        // 导出备忘录事件
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportMemos();
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
                createdAt: new Date().toISOString()
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
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `memos-export-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    getFilteredMemos() {
        switch (this.currentFilter) {
            case 'active':
                return this.memos.filter(memo => !memo.completed);
            case 'completed':
                return this.memos.filter(memo => memo.completed);
            default:
                return this.memos;
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('memos', JSON.stringify(this.memos));
    }

    render() {
        const filteredMemos = this.getFilteredMemos();
        const memoList = document.getElementById('memoList');
        
        memoList.innerHTML = '';

        filteredMemos.forEach(memo => {
            const li = document.createElement('li');
            li.className = `memo-item ${memo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="memo-checkbox" ${memo.completed ? 'checked' : ''}>
                <span class="memo-text">${this.escapeHtml(memo.text)}</span>
                <div class="memo-actions">
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
            
            memoList.appendChild(li);
        });

        this.updateStats();
    }

    startEdit(listItem, memo) {
        const memoText = listItem.querySelector('.memo-text');
        const actions = listItem.querySelector('.memo-actions');
        
        // 创建编辑输入框
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = memo.text;
        
        // 替换文本和按钮
        memoText.replaceWith(editInput);
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