// 图书管理系统主逻辑
class LibraryManager {
    constructor() {
        this.books = JSON.parse(localStorage.getItem('library-books')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        // 添加图书
        document.getElementById('addBookBtn').addEventListener('click', () => this.addBook());
        document.getElementById('bookTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBook();
        });
        document.getElementById('bookAuthor').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBook();
        });
        document.getElementById('bookISBN').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBook();
        });

        // 搜索功能
        document.getElementById('searchBtn').addEventListener('click', () => this.searchBooks());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchBooks();
        });

        // 过滤按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 清空和导出按钮
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
    }

    addBook() {
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();
        const isbn = document.getElementById('bookISBN').value.trim();
        const category = document.getElementById('bookCategory').value;

        if (!title || !author) {
            alert('请填写书名和作者！');
            return;
        }

        const newBook = {
            id: Date.now(),
            title: title,
            author: author,
            isbn: isbn || '未知',
            category: category || '其他',
            status: 'available', // available, borrowed
            addedAt: new Date().toISOString()
        };

        this.books.unshift(newBook);
        this.saveBooks();
        this.render();
        this.updateStats();
        
        // 清空输入框
        document.getElementById('bookTitle').value = '';
        document.getElementById('bookAuthor').value = '';
        document.getElementById('bookISBN').value = '';
        document.getElementById('bookCategory').value = '';
        document.getElementById('bookTitle').focus();
    }

    borrowBook(id) {
        this.books = this.books.map(book =>
            book.id === id ? { ...book, status: 'borrowed' } : book
        );
        this.saveBooks();
        this.render();
        this.updateStats();
    }

    returnBook(id) {
        this.books = this.books.map(book =>
            book.id === id ? { ...book, status: 'available' } : book
        );
        this.saveBooks();
        this.render();
        this.updateStats();
    }

    editBook(id) {
        const book = this.books.find(book => book.id === id);
        if (!book) return;

        const newTitle = prompt('修改书名:', book.title);
        if (newTitle === null) return; // 用户取消
        
        const newAuthor = prompt('修改作者:', book.author);
        if (newAuthor === null) return; // 用户取消
        
        const newIsbn = prompt('修改ISBN:', book.isbn);
        if (newIsbn === null) return; // 用户取消
        
        const newCategory = prompt('修改分类:', book.category);
        if (newCategory === null) return; // 用户取消

        if (newTitle.trim() && newAuthor.trim()) {
            this.books = this.books.map(b => 
                b.id === id ? { 
                    ...b, 
                    title: newTitle.trim(),
                    author: newAuthor.trim(), 
                    isbn: newIsbn.trim() || '未知',
                    category: newCategory.trim() || '其他'
                } : b
            );
            this.saveBooks();
            this.render();
        }
    }

    deleteBook(id) {
        if (confirm('确定要删除这本书吗？此操作不可撤销！')) {
            this.books = this.books.filter(book => book.id !== id);
            this.saveBooks();
            this.render();
            this.updateStats();
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

    searchBooks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        if (!searchTerm) {
            this.render();
            return;
        }

        const filteredBooks = this.books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.isbn.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm)
        );

        this.renderBooks(filteredBooks);
    }

    clearAll() {
        if (confirm('确定要清空所有图书吗？此操作不可撤销！')) {
            this.books = [];
            this.saveBooks();
            this.render();
            this.updateStats();
        }
    }

    exportData() {
        const dataStr = JSON.stringify(this.books, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `library-data-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    }

    saveBooks() {
        localStorage.setItem('library-books', JSON.stringify(this.books));
    }

    updateStats() {
        const total = this.books.length;
        const available = this.books.filter(book => book.status === 'available').length;
        const borrowed = this.books.filter(book => book.status === 'borrowed').length;

        document.getElementById('totalBooks').textContent = `总图书数: ${total}`;
        document.getElementById('availableBooks').textContent = `可借阅: ${available}`;
        document.getElementById('borrowedBooks').textContent = `已借出: ${borrowed}`;
    }

    render() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        if (searchTerm) {
            this.searchBooks();
            return;
        }

        let filteredBooks = this.books;
        switch (this.currentFilter) {
            case 'available':
                filteredBooks = this.books.filter(book => book.status === 'available');
                break;
            case 'borrowed':
                filteredBooks = this.books.filter(book => book.status === 'borrowed');
                break;
        }

        this.renderBooks(filteredBooks);
    }

    renderBooks(booksToShow) {
        const booksList = document.getElementById('booksList');
        booksList.innerHTML = '';

        if (booksToShow.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div>${this.getEmptyStateText()}</div>
                </td>
            `;
            booksList.appendChild(row);
            return;
        }

        booksToShow.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.escapeHtml(book.title)}</td>
                <td>${this.escapeHtml(book.author)}</td>
                <td>${this.escapeHtml(book.isbn)}</td>
                <td>${this.escapeHtml(book.category)}</td>
                <td class="status-${book.status}">${book.status === 'available' ? '可借阅' : '已借出'}</td>
                <td class="book-actions">
                    ${book.status === 'available' 
                        ? `<button class="action-btn borrow" onclick="libraryManager.borrowBook(${book.id})">貸出</button>` 
                        : `<button class="action-btn return" onclick="libraryManager.returnBook(${book.id})">归还</button>`
                    }
                    <button class="action-btn edit" onclick="libraryManager.editBook(${book.id})">编辑</button>
                    <button class="action-btn delete" onclick="libraryManager.deleteBook(${book.id})">删除</button>
                </td>
            `;
            booksList.appendChild(row);
        });
    }

    getEmptyStateText() {
        switch (this.currentFilter) {
            case 'available':
                return '没有可借阅的图书';
            case 'borrowed':
                return '没有已借出的图书';
            default:
                return '还没有图书，添加一本吧！';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.libraryManager = new LibraryManager();
});

// 添加一些示例图书
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已有图书数据
    const existingBooks = JSON.parse(localStorage.getItem('library-books')) || [];
    if (existingBooks.length === 0) {
        // 添加一些示例图书
        const sampleBooks = [
            {
                id: Date.now(),
                title: '《JavaScript高级程序设计》',
                author: 'Nicholas C. Zakas',
                isbn: '978-7-115-23955-1',
                category: '科技',
                status: 'available',
                addedAt: new Date().toISOString()
            },
            {
                id: Date.now() + 1,
                title: '《红楼梦》',
                author: '曹雪芹',
                isbn: '978-7-01-000195-0',
                category: '文学',
                status: 'borrowed',
                addedAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('library-books', JSON.stringify(sampleBooks));
        window.libraryManager = new LibraryManager();
    } else {
        window.libraryManager = new LibraryManager();
    }
});