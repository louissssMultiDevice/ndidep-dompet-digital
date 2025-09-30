
class AuthManager {
    constructor() {
        this.currentStep = 1;
        this.selectedWallet = null;
        this.registrationData = {};
        this.otpTimer = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedData();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Registration form
        const regForm = document.querySelector('.registration-form');
        if (regForm) {
            regForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }

        // OTP inputs
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
        });

        // PIN inputs
        const pinInputs = document.querySelectorAll('.pin-digit');
        pinInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    pinInputs[index - 1].focus();
                }
            });
        });
    }

    loadSavedData() {
        const savedData = localStorage.getItem('registrationData');
        if (savedData) {
            this.registrationData = JSON.parse(savedData);
        }
    }

    saveRegistrationData() {
        localStorage.setItem('registrationData', JSON.stringify(this.registrationData));
    }

    // Google Login
    async loginWithGoogle() {
        try {
            // Simulate Google OAuth
            this.showLoading('Menghubungkan dengan Google...');
            
            await this.delay(2000);
            
            const userData = {
                id: 'google_' + Date.now(),
                name: 'User Google',
                email: 'user@gmail.com',
                provider: 'google',
                avatar: 'https://via.placeholder.com/100'
            };

            this.handleSuccessfulAuth(userData);
        } catch (error) {
            this.showError('Gagal login dengan Google');
        } finally {
            this.hideLoading();
        }
    }

    // Wallet Selection
    selectWallet(walletType) {
        this.selectedWallet = walletType;
        
        // Update UI
        document.querySelectorAll('.wallet-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelector(`.${walletType}-option`).classList.add('selected');
        
        // Show login form
        document.getElementById('loginForm').style.display = 'block';
        
        // Update form placeholder based on wallet
        this.updateFormForWallet(walletType);
    }

    updateFormForWallet(walletType) {
        const phoneInput = document.getElementById('phone');
        const pinInput = document.getElementById('pin');
        
        const walletConfig = {
            dana: {
                phonePlaceholder: '8xx-xxxx-xxxx (Nomor DANA)',
                pinPlaceholder: 'PIN DANA (6 digit)'
            },
            gopay: {
                phonePlaceholder: '8xx-xxxx-xxxx (Nomor GoPay)',
                pinPlaceholder: 'PIN GoPay (6 digit)'
            },
            ovo: {
                phonePlaceholder: '8xx-xxxx-xxxx (Nomor OVO)',
                pinPlaceholder: 'PIN OVO (6 digit)'
            },
            shopeepay: {
                phonePlaceholder: '8xx-xxxx-xxxx (Nomor ShopeePay)',
                pinPlaceholder: 'PIN ShopeePay (6 digit)'
            }
        };

        const config = walletConfig[walletType];
        if (config) {
            phoneInput.placeholder = config.phonePlaceholder;
            pinInput.placeholder = config.pinPlaceholder;
        }
    }

    // Login Handler
    async handleLogin() {
        const phone = document.getElementById('phone').value;
        const pin = document.getElementById('pin').value;

        if (!this.validatePhone(phone)) {
            this.showError('Format nomor telepon tidak valid');
            return;
        }

        if (!this.validatePin(pin)) {
            this.showError('PIN harus 6 digit angka');
            return;
        }

        try {
                        this.showLoading('Memverifikasi akun...');
            
            // Simulate API call
            await this.delay(2000);
            
            // Check if user exists (simulate)
            const userData = await this.authenticateUser(phone, pin);
            
            if (userData) {
                this.handleSuccessfulAuth(userData);
            } else {
                this.showError('Nomor telepon atau PIN salah');
            }
        } catch (error) {
            this.showError('Terjadi kesalahan saat login');
        } finally {
            this.hideLoading();
        }
    }

    async authenticateUser(phone, pin) {
        // Simulate user authentication
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.phone === phone && u.pin === pin && u.wallet === this.selectedWallet);
        
        if (user) {
            return {
                id: user.id,
                name: user.firstName + ' ' + user.lastName,
                email: user.email,
                phone: user.phone,
                wallet: user.wallet,
                avatar: user.avatar || 'https://via.placeholder.com/100',
                balance: user.balance || 0
            };
        }
        
        return null;
    }

    // Registration Methods
    selectRegistrationWallet(walletType) {
        this.selectedWallet = walletType;
        this.registrationData.wallet = walletType;
        
        // Update UI
        document.querySelectorAll('.wallet-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelector(`.${walletType}-option`).classList.add('selected');
        
        // Move to next step
        setTimeout(() => {
            this.nextStep();
        }, 500);
    }

    nextStep() {
        if (this.currentStep === 2) {
            if (!this.validateRegistrationForm()) {
                return;
            }
            this.collectRegistrationData();
        }

        this.currentStep++;
        this.updateStepUI();
        
        if (this.currentStep === 3) {
            this.startOTPProcess();
        }
    }

    updateStepUI() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update step content
        document.querySelectorAll('.step-content').forEach((content, index) => {
            content.classList.remove('active');
            if (index + 1 === this.currentStep) {
                content.classList.add('active');
            }
        });
    }

    validateRegistrationForm() {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const birthDate = document.getElementById('birthDate').value;
        const pin = document.getElementById('pin').value;
        const confirmPin = document.getElementById('confirmPin').value;
        const terms = document.getElementById('terms').checked;

        if (!firstName || !lastName) {
            this.showError('Nama lengkap harus diisi');
            return false;
        }

        if (!this.validateEmail(email)) {
            this.showError('Format email tidak valid');
            return false;
        }

        if (!this.validatePhone(phone)) {
            this.showError('Format nomor telepon tidak valid');
            return false;
        }

        if (!birthDate) {
            this.showError('Tanggal lahir harus diisi');
            return false;
        }

        if (!this.validatePin(pin)) {
            this.showError('PIN harus 6 digit angka');
            return false;
        }

        if (pin !== confirmPin) {
            this.showError('Konfirmasi PIN tidak cocok');
            return false;
        }

        if (!terms) {
            this.showError('Anda harus menyetujui syarat dan ketentuan');
            return false;
        }

        return true;
    }

    collectRegistrationData() {
        this.registrationData = {
            ...this.registrationData,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            birthDate: document.getElementById('birthDate').value,
            pin: document.getElementById('pin').value
        };

        this.saveRegistrationData();
        
        // Display phone number in verification step
        document.getElementById('phoneDisplay').textContent = '+62 ' + this.registrationData.phone;
    }

    startOTPProcess() {
        this.sendOTP();
        this.startOTPTimer();
    }

    async sendOTP() {
        try {
            // Simulate sending OTP
            this.showNotification('Kode OTP telah dikirim ke nomor Anda', 'success');
            
            // For demo purposes, store OTP
            this.currentOTP = '123456';
            localStorage.setItem('currentOTP', this.currentOTP);
        } catch (error) {
            this.showError('Gagal mengirim kode OTP');
        }
    }

    startOTPTimer() {
        let timeLeft = 60;
        const timerElement = document.getElementById('timer');
        const resendBtn = document.getElementById('resendBtn');
        
        resendBtn.disabled = true;
        
        this.otpTimer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(this.otpTimer);
                resendBtn.disabled = false;
                timerElement.textContent = '0';
            }
        }, 1000);
    }

    resendOTP() {
        this.sendOTP();
        this.startOTPTimer();
    }

    moveToNext(current, position) {
        if (current.value.length === 1) {
            const nextInput = document.querySelectorAll('.otp-input')[position];
            if (nextInput) {
                nextInput.focus();
            }
        }
        
        // Auto verify when all digits are filled
        const otpInputs = document.querySelectorAll('.otp-input');
        const otpValue = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otpValue.length === 6) {
            setTimeout(() => {
                this.verifyOTP();
            }, 500);
        }
    }

    async verifyOTP() {
        const otpInputs = document.querySelectorAll('.otp-input');
        const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
        
        if (enteredOTP.length !== 6) {
            this.showError('Masukkan kode OTP lengkap');
            return;
        }

        try {
            this.showLoading('Memverifikasi kode OTP...');
            
            await this.delay(1500);
            
            const storedOTP = localStorage.getItem('currentOTP');
            
            if (enteredOTP === storedOTP) {
                await this.completeRegistration();
            } else {
                this.showError('Kode OTP tidak valid');
                // Clear OTP inputs
                otpInputs.forEach(input => input.value = '');
                otpInputs[0].focus();
            }
        } catch (error) {
            this.showError('Terjadi kesalahan saat verifikasi');
        } finally {
            this.hideLoading();
        }
    }

    async completeRegistration() {
        try {
            // Generate user ID
            const userId = 'user_' + Date.now();
            
            // Create user object
            const newUser = {
                id: userId,
                ...this.registrationData,
                createdAt: new Date().toISOString(),
                balance: 10000, // Welcome bonus
                isVerified: true
            };

            // Save to localStorage (simulate database)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Clean up
            localStorage.removeItem('registrationData');
            localStorage.removeItem('currentOTP');
            
            this.showNotification('Registrasi berhasil! Selamat datang!', 'success');
            
            // Auto login
            setTimeout(() => {
                this.handleSuccessfulAuth({
                    id: newUser.id,
                    name: newUser.firstName + ' ' + newUser.lastName,
                    email: newUser.email,
                    phone: newUser.phone,
                    wallet: newUser.wallet,
                    balance: newUser.balance
                });
            }, 2000);
            
        } catch (error) {
            this.showError('Gagal menyelesaikan registrasi');
        }
    }

    handleSuccessfulAuth(userData) {
        // Save user session
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        this.showNotification('Login berhasil! Mengalihkan...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    // Validation Methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^8[0-9]{8,11}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    validatePin(pin) {
        const pinRegex = /^\d{6}$/;
        return pinRegex.test(pin);
    }

    // Utility Methods
    showLoading(message = 'Memproses...') {
        const loading = document.createElement('div');
        loading.id = 'authLoading';
        loading.className = 'auth-loading';
        loading.innerHTML = `
            <div class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('authLoading');
        if (loading) {
            loading.remove();
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
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
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}

// Global functions for HTML onclick events
function loginWithGoogle() {
    authManager.loginWithGoogle();
}

function selectWallet(walletType) {
    authManager.selectWallet(walletType);
}

function selectRegistrationWallet(walletType) {
    authManager.selectRegistrationWallet(walletType);
}

function nextStep() {
    authManager.nextStep();
}

function moveToNext(current, position) {
    authManager.moveToNext(current, position);
}

function resendOTP() {
    authManager.resendOTP();
}

function verifyOTP() {
    authManager.verifyOTP();
}

function logout() {
    authManager.logout();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
      
