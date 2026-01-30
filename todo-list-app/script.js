// 待办事项应用主逻辑
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // 检查是否有示例任务，如果没有则添加
        if (!localStorage.getItem('demoTaskAdded')) {
            this.addDemoTask();
            localStorage.setItem('demoTaskAdded', 'true');
        }
        
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    addDemoTask() {
        // 添加一个示例任务
        const demoTodo = {
            id: Date.now(),
            text: '欢迎使用Moltbot Todo List应用！',
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // 检查是否已存在此示例任务
        const existingDemoTask = this.todos.find(todo => todo.text === demoTodo.text);
        if (!existingDemoTask) {
            this.todos.push(demoTodo);
            this.saveTodos();
        }
    }

    bindEvents() {
        // 添加待办事项
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 过滤按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 清除按钮
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (text) {
            const newTodo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };

            this.todos.unshift(newTodo);
            this.saveTodos();
            this.render();
            this.updateStats();
            input.value = '';
            input.focus();
        }
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveTodos();
        this.render();
        this.updateStats();
    }

    editTodo(id, newText) {
        if (newText.trim()) {
            this.todos = this.todos.map(todo =>
                todo.id === id ? { ...todo, text: newText.trim() } : todo
            );
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
        this.updateStats();
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
        if (confirm('确定要清除所有已完成的任务吗？')) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    clearAll() {
        if (confirm('确定要清空所有任务吗？此操作不可撤销！')) {
            this.todos = [];
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const remaining = total - completed;

        document.getElementById('totalTasks').textContent = `总计: ${total}`;
        document.getElementById('completedTasks').textContent = `已完成: ${completed}`;
        document.getElementById('remainingTasks').textContent = `剩余: ${remaining}`;
    }

    render() {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '';

        let filteredTodos = this.todos;
        switch (this.currentFilter) {
            case 'active':
                filteredTodos = this.todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                filteredTodos = this.todos.filter(todo => todo.completed);
                break;
        }

        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div style="
                    text-align: center; 
                    padding: 40px 20px; 
                    color: #999; 
                    font-size: 1.1rem;
                ">
                    <div style="font-size: 3rem; margin-bottom: 10px;">😊</div>
                    <div>${this.getEmptyStateText()}</div>
                </div>
            `;
            return;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn">✏️ 编辑</button>
                    <button class="delete-btn">🗑️ 删除</button>
                </div>
            `;

            // 绑定事件
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => this.showEditInput(li, todo));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

            todoList.appendChild(li);
        });
    }

    getEmptyStateText() {
        switch (this.currentFilter) {
            case 'active':
                return '没有未完成的任务，休息一下吧！';
            case 'completed':
                return '还没有完成的任务，加油！';
            default:
                return '还没有任务，添加一个吧！';
        }
    }

    showEditInput(listItem, todo) {
        listItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}">
            <div class="todo-actions">
                <button class="save-btn">💾 保存</button>
                <button class="cancel-btn">❌ 取消</button>
            </div>
        `;

        const editInput = listItem.querySelector('.edit-input');
        editInput.focus();
        editInput.select();

        // 绑定保存事件
        listItem.querySelector('.save-btn').addEventListener('click', () => {
            const newText = editInput.value.trim();
            this.editTodo(todo.id, newText);
        });

        // 绑定取消事件
        listItem.querySelector('.cancel-btn').addEventListener('click', () => {
            this.render(); // 重新渲染以恢复原始状态
        });

        // 按回车保存
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const newText = editInput.value.trim();
                this.editTodo(todo.id, newText);
            }
        });

        // 绑定复选框事件
        const checkbox = listItem.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// 添加一些额外的交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 为按钮添加点击波纹效果
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 创建波纹效果
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 添加拖拽排序功能（可选增强）
    const todoList = document.getElementById('todoList');
    let draggedItem = null;

    // 如果支持HTML5拖放API，启用拖放排序
    if ('draggable' in document.createElement('li')) {
        todoList.addEventListener('dragstart', (e) => {
            if (e.target.closest('.todo-item')) {
                draggedItem = e.target.closest('.todo-item');
                setTimeout(() => {
                    draggedItem.style.opacity = '0.5';
                }, 0);
            }
        });

        todoList.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.style.opacity = '1';
                draggedItem = null;
            }
        });

        todoList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(todoList, e.clientY);
            const currentItem = document.querySelector('.dragging') || draggedItem;
            
            if (afterElement == null) {
                todoList.appendChild(currentItem);
            } else {
                todoList.insertBefore(currentItem, afterElement);
            }
        });

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    }
});