class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.transactionChart = null;
        this.balanceVisible = true;
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadUserData();
        this.setupEventListeners();
        this.initializeChart();
        this.loadDashboardData();
    }

    checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }

        const userData = localStorage.getItem('currentUser');
        if (!userData) {
            window.location.href = 'login.html';
            return;
        }

        this.currentUser = JSON.parse(userData);
    }

    loadUserData() {
        if (!this.currentUser) return;

        // Update profile information
        document.querySelector('.profile-name').textContent = this.currentUser.name;
        document.querySelector('.profile-avatar').src = this.currentUser.avatar || 'https://via.placeholder.com/40';
        
        // Update balance
        this.updateBalance();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Sidebar toggle
        document.querySelector('.sidebar-toggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });

        // Balance toggle
        const balanceToggle = document.querySelector('.btn-toggle-balance');
        if (balanceToggle) {
            balanceToggle.addEventListener('click', () => {
                this.toggleBalance();
            });
        }

        // Form submissions
        this.setupFormListeners();
    }

    setupFormListeners() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // Transfer amount input
        const transferAmount = document.getElementById('transferAmount');
        if (transferAmount) {
            transferAmount.addEventListener('input', () => {
                this.updateTransferSummary();
            });
        }

        // Withdraw amount input
        const withdrawAmount = document.getElementById('withdrawAmount');
        if (withdrawAmount) {
            withdrawAmount.addEventListener('input', () => {
                this.updateWithdrawSummary();
            });
        }
    }

    showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionId}"]`).parentElement.classList.add('active');

        // Update content
        document.querySelectorAll('.dashboard-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionId;
            
            // Update page title
            this.updatePageTitle(sectionId);
            
            // Load section-specific data
            this.loadSectionData(sectionId);
        }
    }

    updatePageTitle(sectionId) {
        const titles = {
            dashboard: 'Dashboard',
            profile: 'Profile',
            topup: 'Top Up',
            transfer: 'Transfer',
            withdraw: 'Tarik Tunai',
            merchant: 'Merchant QRIS',
            transactions: 'Riwayat Transaksi',
            balance: 'Saldo',
            notifications: 'Pemberitahuan',
            about: 'Tentang',
            contact: 'Hubungi Dev',
            reports: 'Rekap'
        };
        
        document.querySelector('.page-title').textContent = titles[sectionId] || 'Dashboard';
        
        // Update breadcrumb
        const breadcrumb = document.querySelector('.breadcrumb');
        breadcrumb.innerHTML = `
            <span>Home</span>
            <i class="fas fa-chevron-right"></i>
            <span>${titles[sectionId] || 'Dashboard'}</span>
        `;
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'transactions':
                this.loadTransactions();
                break;
            case 'notifications':
                this.loadNotifications();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    updateBalance() {
        const balance = this.currentUser.balance || 0;
        const balanceElement = document.getElementById('mainBalance');
        
        if (this.balanceVisible) {
            balanceElement.textContent = this.formatCurrency(balance);
        } else {
            balanceElement.textContent = '••••••';
        }
    }

    toggleBalance() {
        this.balanceVisible = !this.balanceVisible;
        const icon = document.getElementById('balanceToggleIcon');
        
        if (this.balanceVisible) {
            icon.className = 'fas fa-eye';
        } else {
            icon.className = 'fas fa-eye-slash';
        }
        
        this.updateBalance();
    }

    initializeChart() {
        const ctx = document.getElementById('transactionChart');
        if (!ctx) return;

        this.transactionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                datasets: [{
                    label: 'Pemasukan',
                    data: [120000, 190000, 300000, 500000, 200000, 300000, 450000],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Pengeluaran',
                    data: [80000, 150000, 200000, 300000, 150000, 250000, 300000],
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString('id-ID');
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    loadDashboardData() {
        // Load recent transactions
        this.loadRecentTransactions();
        
        // Update statistics
        this.updateStatistics();
    }

    loadRecentTransactions() {
        const transactions = this.getTransactions().slice(0, 5);
        const container = document.querySelector('.transactions-list');
        
        if (!container) return;
        
        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${transaction.type === 'income' ? 'plus' : 'minus'}"></i>
                </div>
                <div class="transaction-info">
                    <span class="transaction-title">${transaction.title}</span>
                    <span class="transaction-time">${this.formatTimeAgo(transaction.date)}</span>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-status ${transaction.status}">${transaction.status === 'success' ? 'Berhasil' : 'Gagal'}</div>
            </div>
        `).join('');
    }

    updateStatistics() {
        const transactions = this.getTransactions();
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
        
        const income = weekTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expense = weekTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalTransactions = weekTransactions.length;
        
        // Update stat cards
        document.querySelector('.stat-card.income .stat-value').textContent = this.formatCurrency(income);
        document.querySelector('.stat-card.expense .stat-value').textContent = this.formatCurrency(expense);
        document.querySelector('.stat-card.transactions .stat-value').textContent = totalTransactions;
    }

    // Top Up Methods
    switchTopupMethod(method) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.method-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`${method}-method`).classList.add('active');
    }

    selectAmount(amount) {
        document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.classList.add('selected');
        
        this.updateTopupSummary(amount);
    }

    updateTopupSummary(amount) {
        const adminFee = this.calculateTopupFee(amount);
        const total = amount + adminFee;
        
        document.getElementById('topupAmount').textContent = this.formatCurrency(amount);
        document.getElementById('adminFee').textContent = this.formatCurrency(adminFee);
        document.getElementById('totalAmount').textContent = this.formatCurrency(total);
        
        document.querySelector('.btn-topup').disabled = false;
    }

    calculateTopupFee(amount) {
        // Different fees based on method
        return 0; // Free for demo
    }

    processTopup() {
        this.showPinModal('topup');
    }

    // Transfer Methods
    switchTransferType(type) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.transfer-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`${type}-transfer`).classList.add('active');
    }

    selectContact(name, phone) {
        document.getElementById('recipientName').textContent = name;
        document.getElementById('recipientPhoneDisplay').textContent = phone;
        document.getElementById('recipientAvatar').textContent = name.charAt(0);
        
        document.getElementById('transferForm').style.display = 'block';
    }

    updateTransferSummary() {
        const amount = parseInt(document.getElementById('transferAmount').value) || 0;
        document.getElementById('transferAmountDisplay').textContent = this.formatCurrency(amount);
        document.getElementById('transferTotal').textContent = this.formatCurrency(amount);
    }

    processTransfer() {
        const amount = parseInt(document.getElementById('transferAmount').value);
        const recipient = document.getElementById('recipientName').textContent;
        
        if (!amount || amount < 10000) {
            this.showNotification('Minimum transfer Rp 10,000', 'error');
            return;
        }
        
        if (amount > this.currentUser.balance) {
            this.showNotification('Saldo tidak mencukupi', 'error');
            return;
        }
        
        this.showPinModal('transfer', { amount, recipient });
    }

    // Withdraw Methods
    selectWithdrawMethod(method) {
        document.querySelectorAll('.method-item').forEach(item => item.classList.remove('selected'));
        event.target.classList.add('selected');
        
        document.getElementById('withdrawForm').style.display = 'block';
        
        if (method === 'bank') {
            document.getElementById('bankAccountSection').style.display = 'block';
        } else {
            document.getElementById('bankAccountSection').style.display = 'none';
        }
    }

    updateWithdrawSummary() {
        const amount = parseInt(document.getElementById('withdrawAmount').value) || 0;
        const fee = this.calculateWithdrawFee(amount);
        const total = amount + fee;
        
        document.getElementById('withdrawAmountDisplay').textContent = this.formatCurrency(amount);
        document.getElementById('withdrawFee').textContent = this.formatCurrency(fee);
        document.getElementById('withdrawTotal').textContent = this.formatCurrency(total);
    }

    calculateWithdrawFee(amount) {
        return 2500; // Fixed fee for demo
    }

    processWithdraw() {
        const amount = parseInt(document.getElementById('withdrawAmount').value);
        
        if (!amount || amount < 50000) {
            this.showNotification('Minimum penarikan Rp 50,000', 'error');
            return;
        }
        
        if (amount > this.currentUser.balance) {
            this.showNotification('Saldo tidak mencukupi', 'error');
            return;
        }
        
        this.showPinModal('withdraw', { amount });
    }

    // Merchant Methods
    generateQRIS() {
        const merchantName = document.getElementById('merchantName').value;
        const amount = document.getElementById('qrAmount').value;
        const description = document.getElementById('qrDescription').value;
        
        // Generate QR code (simplified)
        const qrData = {
            merchant: merchantName,
            amount: amount || 'dynamic',
            description: description,
            timestamp: Date.now()
        };
        
        this.displayQRCode(qrData);
    }

    displayQRCode(data) {
        const qrDisplay = document.getElementById('qrDisplay');
        const qrCode = document.getElementById('generatedQR');
        
        // Simple QR representation
        qrCode.innerHTML = `
            <div class="qr-placeholder">
                <i class="fas fa-qrcode"></i>
                <p>QR Code Generated</p>
            </div>
        `;
        
        document.getElementById('qrMerchantName').textContent = data.merchant;
        document.getElementById('qrAmountDisplay').textContent = data.amount === 'dynamic' ? 'Nominal Dinamis' : this.formatCurrency(parseInt(data.amount));
        document.getElementById('qrDescriptionDisplay').textContent = data.description || '-';
        
        qrDisplay.style.display = 'block';
    }

    // PIN Modal
    showPinModal(action, data = {}) {
        const modal = document.getElementById('pinModal');
        modal.style.display = 'flex';
        modal.dataset.action = action;
        modal.dataset.data = JSON.stringify(data);
        
        // Clear previous PIN
        document.querySelectorAll('.pin-digit').forEach(input => {
            input.value = '';
        });
        
        document.querySelector('.pin-digit').focus();
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    verifyPin() {
        const pinInputs = document.querySelectorAll('.pin-digit');
        const enteredPin = Array.from(pinInputs).map(input => input.value).join('');
        
        if (enteredPin.length !== 6) {
            this.showNotification('Masukkan PIN lengkap', 'error');
            return;
        }
        
        if (enteredPin !== this.currentUser.pin) {
            this.showNotification('PIN salah', 'error');
            pinInputs.forEach(input => input.value = '');
            pinInputs[0].focus();
            return;
        }
        
        const modal = document.getElementById('pinModal');
        const action = modal.dataset.action;
        const data = JSON.parse(modal.dataset.data || '{}');
        
        this.executeTransaction(action, data);
        this.closeModal('pinModal');
    }

    executeTransaction(action, data) {
        switch (action) {
            case 'topup':
                this.executeTopup(data);
                break;
            case 'transfer':
                this.executeTransfer(data);
                break;
            case 'withdraw':
                this.executeWithdraw(data);
                break;
        }
    }

    executeTopup(data) {
        // Simulate topup process
        this.showNotification('Top up berhasil!', 'success');
        
        // Update balance
        this.currentUser.balance += data.amount || 100000;
        this.updateUserData();
        
        // Add transaction record
        this.addTransaction({
            type: 'income',
            title: 'Top Up',
            amount: data.amount || 100000,
            status: 'success'
        });
    }

    executeTransfer(data) {
        // Simulate transfer process
        this.showNotification(`Transfer ke ${data.recipient} berhasil!`, 'success');
        
        // Update balance
        this.currentUser.balance -= data.amount;
        this.updateUserData();
        
        // Add transaction record
        this.addTransaction({
            type: 'expense',
            title: `Transfer ke ${data.recipient}`,
            amount: data.amount,
            status: 'success'
        });
    }

    executeWithdraw(data) {
        // Simulate withdraw process
        this.showNotification('Penarikan berhasil!', 'success');
        
        // Update balance
        this.currentUser.balance -= (data.amount + this.calculateWithdrawFee(data.amount));
        this.updateUserData();
        
                // Add transaction record
        this.addTransaction({
            type: 'expense',
            title: 'Tarik Tunai',
            amount: data.amount,
            status: 'success'
        });
    }

    updateUserData() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateBalance();
        this.loadRecentTransactions();
        this.updateStatistics();
    }

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        const newTransaction = {
            id: 'txn_' + Date.now(),
            date: new Date().toISOString(),
            ...transaction
        };
        
        transactions.unshift(newTransaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    getTransactions() {
        return JSON.parse(localStorage.getItem('transactions') || '[]');
    }

    // Profile Methods
    updateProfile() {
        const formData = new FormData(document.getElementById('profileForm'));
        
        this.currentUser.firstName = formData.get('firstName');
        this.currentUser.lastName = formData.get('lastName');
        this.currentUser.email = formData.get('email');
        this.currentUser.phone = formData.get('phone');
        this.currentUser.birthDate = formData.get('birthDate');
        this.currentUser.address = formData.get('address');
        this.currentUser.name = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        
        this.updateUserData();
        this.showNotification('Profile berhasil diperbarui', 'success');
    }

    changePin() {
        // Show PIN change modal (simplified)
        this.showNotification('Fitur ubah PIN akan segera hadir', 'info');
    }

    resetForm() {
        document.getElementById('profileForm').reset();
        this.loadUserData();
    }

    // Transaction History
    loadTransactions() {
        const transactions = this.getTransactions();
        const container = document.querySelector('#transactions .transactions-list');
        
        if (!container) return;
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>Belum ada transaksi</h3>
                    <p>Transaksi Anda akan muncul di sini</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${this.getTransactionIcon(transaction.title)}"></i>
                </div>
                <div class="transaction-info">
                    <span class="transaction-title">${transaction.title}</span>
                    <span class="transaction-time">${this.formatDate(transaction.date)}</span>
                    <span class="transaction-id">ID: ${transaction.id}</span>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-status ${transaction.status}">
                    <i class="fas fa-${transaction.status === 'success' ? 'check-circle' : 'times-circle'}"></i>
                    ${transaction.status === 'success' ? 'Berhasil' : 'Gagal'}
                </div>
            </div>
        `).join('');
    }

    getTransactionIcon(title) {
        const iconMap = {
            'Top Up': 'plus-circle',
            'Transfer': 'paper-plane',
            'Tarik Tunai': 'money-bill-wave',
            'Pembayaran': 'shopping-cart',
            'Cashback': 'gift'
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (title.includes(key)) return icon;
        }
        
        return 'exchange-alt';
    }

    // Notifications
    loadNotifications() {
        const notifications = this.getNotifications();
        const container = document.querySelector('#notifications .notifications-list');
        
        if (!container) return;
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <h3>Tidak ada notifikasi</h3>
                    <p>Notifikasi akan muncul di sini</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                <div class="notification-icon ${notification.type}">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <span class="notification-time">${this.formatTimeAgo(notification.date)}</span>
                </div>
                <button class="notification-action" onclick="markAsRead('${notification.id}')">
                    <i class="fas fa-${notification.read ? 'check' : 'circle'}"></i>
                </button>
            </div>
        `).join('');
    }

    getNotifications() {
        // Generate sample notifications
        return [
            {
                id: 'notif_1',
                type: 'success',
                title: 'Transfer Berhasil',
                message: 'Transfer Rp 100,000 ke Budi Santoso berhasil',
                date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                read: false
            },
            {
                id: 'notif_2',
                type: 'info',
                title: 'Promo Spesial',
                message: 'Dapatkan cashback 10% untuk transaksi hari ini',
                date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                read: false
            },
            {
                id: 'notif_3',
                type: 'warning',
                title: 'Keamanan Akun',
                message: 'Login dari perangkat baru terdeteksi',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                read: true
            }
        ];
    }

    getNotificationIcon(type) {
        const iconMap = {
            success: 'check-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return iconMap[type] || 'bell';
    }

    markAsRead(notificationId) {
        this.showNotification('Notifikasi ditandai sebagai dibaca', 'success');
        this.loadNotifications();
    }

    // Reports
    loadReports() {
        const container = document.querySelector('#reports .reports-content');
        if (!container) return;
        
        const transactions = this.getTransactions();
        const monthlyData = this.generateMonthlyReport(transactions);
        
        container.innerHTML = `
            <div class="report-summary">
                <div class="summary-card">
                    <h3>Total Pemasukan</h3>
                    <div class="amount income">+${this.formatCurrency(monthlyData.totalIncome)}</div>
                </div>
                <div class="summary-card">
                    <h3>Total Pengeluaran</h3>
                    <div class="amount expense">-${this.formatCurrency(monthlyData.totalExpense)}</div>
                </div>
                <div class="summary-card">
                    <h3>Saldo Akhir</h3>
                    <div class="amount ${monthlyData.netAmount >= 0 ? 'income' : 'expense'}">
                        ${monthlyData.netAmount >= 0 ? '+' : ''}${this.formatCurrency(Math.abs(monthlyData.netAmount))}
                    </div>
                </div>
            </div>
            
            <div class="report-chart">
                <canvas id="reportChart"></canvas>
            </div>
            
            <div class="report-actions">
                <button class="btn-export" onclick="exportReport('pdf')">
                    <i class="fas fa-file-pdf"></i>
                    Export PDF
                </button>
                <button class="btn-export" onclick="exportReport('excel')">
                    <i class="fas fa-file-excel"></i>
                    Export Excel
                </button>
            </div>
        `;
        
        this.initializeReportChart(monthlyData);
    }

    generateMonthlyReport(transactions) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        
        const totalIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        return {
            totalIncome,
            totalExpense,
            netAmount: totalIncome - totalExpense,
            transactions: monthlyTransactions
        };
    }

    initializeReportChart(data) {
        const ctx = document.getElementById('reportChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pemasukan', 'Pengeluaran'],
                datasets: [{
                    data: [data.totalIncome, data.totalExpense],
                    backgroundColor: ['#4CAF50', '#f44336'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Utility Methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
        
        return this.formatDate(dateString);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}

// Global functions for HTML onclick events
function toggleBalance() {
    dashboardManager.toggleBalance();
}

function showSection(sectionId) {
    dashboardManager.showSection(sectionId);
}

function switchTopupMethod(method) {
    dashboardManager.switchTopupMethod(method);
}

function selectAmount(amount) {
    dashboardManager.selectAmount(amount);
}

function processTopup() {
    dashboardManager.processTopup();
}

function switchTransferType(type) {
    dashboardManager.switchTransferType(type);
}

function selectContact(name, phone) {
    dashboardManager.selectContact(name, phone);
}

function setTransferAmount(amount) {
    document.getElementById('transferAmount').value = amount;
    dashboardManager.updateTransferSummary();
}

function processTransfer() {
    dashboardManager.processTransfer();
}

function selectWithdrawMethod(method) {
    dashboardManager.selectWithdrawMethod(method);
}

function processWithdraw() {
    dashboardManager.processWithdraw();
}

function generateQRIS() {
    dashboardManager.generateQRIS();
}

function closeModal(modalId) {
    dashboardManager.closeModal(modalId);
}

function verifyPin() {
    dashboardManager.verifyPin();
}

function updateProfile() {
    dashboardManager.updateProfile();
}

function changePin() {
    dashboardManager.changePin();
}

function resetForm() {
    dashboardManager.resetForm();
}

function markAsRead(notificationId) {
    dashboardManager.markAsRead(notificationId);
}

function exportReport(format) {
    dashboardManager.showNotification(`Export ${format.toUpperCase()} akan segera hadir`, 'info');
}

function logout() {
    dashboardManager.logout();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});
          
