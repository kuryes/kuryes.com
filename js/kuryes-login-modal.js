// Kuryes.com - Login Modal Handler
// Handles login modal display and form submission

// Google Apps Script Web App URL'i (login için)
// TODO: Yeni Google Apps Script URL'i eklenecek
const LOGIN_API_URL = '';

/**
 * Login modal'ı açar
 */
function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        
        // Preview mode: Kayıt bilgilerini yükle
        if (typeof loadRegistrationDataToLogin === 'function') {
            loadRegistrationDataToLogin();
        }
        
        // Email input'una focus
        const emailInput = document.getElementById('login-email');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 100);
        }
    }
}

/**
 * Login modal'ı kapatır
 */
function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('hidden');
        // Form'u temizle
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.reset();
        }
        // Mesajları temizle
        const messageDiv = document.getElementById('login-message');
        if (messageDiv) {
            messageDiv.classList.add('hidden');
            messageDiv.textContent = '';
        }
        // Submit butonunu resetle
        const submitBtn = document.getElementById('login-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Giriş Yap';
        }
    }
}

/**
 * Login form submit handler
 */
function handleLoginModalSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const loginForm = document.getElementById('login-form');
    const submitBtn = document.getElementById('login-submit-btn');
    const messageDiv = document.getElementById('login-message');
    
    if (!loginForm || !submitBtn) return;
    
    // Form validation
    if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
    }
    
    // Form verilerini al
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const sifre = formData.get('sifre');
    
    if (!email || !sifre) {
        showLoginModalMessage('Lütfen e-posta ve şifre giriniz.', 'error');
        return;
    }
    
    // Submit butonunu disable et
    submitBtn.disabled = true;
    submitBtn.textContent = 'Giriş yapılıyor...';
    
    // Preview mode: DB yoksa localStorage'dan kontrol et
    if (!LOGIN_API_URL) {
        // Preview mode için localStorage'dan kontrol
        const registrationDataStr = localStorage.getItem('kuryes_registration_data');
        if (registrationDataStr) {
            try {
                const registrationData = JSON.parse(registrationDataStr);
                
                // E-posta ve şifre eşleşiyorsa giriş yap
                if (registrationData.email === email && registrationData.sifre === sifre) {
                    showLoginModalMessage('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
                    submitBtn.textContent = 'Giriş Başarılı ✓';
                    
                    // Form input'larını disable et
                    const inputs = loginForm.querySelectorAll('input');
                    inputs.forEach(input => input.disabled = true);
                    
                    // Kullanıcı kartını göster
                    setTimeout(() => {
                        if (typeof showUserCard === 'function') {
                            showUserCard(registrationData.userType, registrationData);
                        }
                        closeLoginModal();
                    }, 1500);
                    return;
                } else {
                    showLoginModalMessage('E-posta veya şifre hatalı. Kayıt formunda girdiğiniz bilgileri kullanın.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Giriş Yap';
                    return;
                }
            } catch (error) {
                console.error('Registration data parse error:', error);
            }
        }
        
        showLoginModalMessage('Giriş sistemi henüz yapılandırılmamış. Önce kayıt olun.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Giriş Yap';
        return;
    }
    
    // Login request gönder
    const loginData = new URLSearchParams();
    loginData.append('action', 'login');
    loginData.append('email', email);
    loginData.append('sifre', sifre);
    
    fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginData.toString()
    })
    .then(response => response.text())
    .then(text => {
        try {
            const data = JSON.parse(text);
            
            if (data.success) {
                // Başarılı giriş
                showLoginModalMessage('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
                submitBtn.textContent = 'Giriş Başarılı ✓';
                
                // localStorage'a kaydet
                localStorage.setItem('kuryes_logged_in', 'true');
                localStorage.setItem('kuryes_user_id', data.id);
                localStorage.setItem('kuryes_user_type', data.userType);
                
                // Form input'larını disable et
                const inputs = loginForm.querySelectorAll('input');
                inputs.forEach(input => input.disabled = true);
                
                // Profil sayfasına yönlendir
                setTimeout(() => {
                    if (data.userType === 'kurye') {
                        window.location.href = `kurye-kart.html?id=${data.id}`;
                    } else if (data.userType === 'isletme') {
                        window.location.href = `isletme-kart.html?id=${data.id}`;
                    } else {
                        window.location.reload();
                    }
                }, 1500);
            } else {
                // Hatalı giriş
                showLoginModalMessage(data.message || 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Giriş Yap';
            }
        } catch (error) {
            console.error('Login response parse error:', error);
            showLoginModalMessage('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Giriş Yap';
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showLoginModalMessage('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Giriş Yap';
    });
}

/**
 * Login modal mesaj gösterir
 */
function showLoginModalMessage(message, type) {
    const messageDiv = document.getElementById('login-message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden', 'bg-green-50', 'border-green-200', 'text-green-700', 'bg-red-50', 'border-red-200', 'text-red-700');
    
    if (type === 'success') {
        messageDiv.classList.add('bg-green-50', 'border-green-200', 'text-green-700');
    } else {
        messageDiv.classList.add('bg-red-50', 'border-red-200', 'text-red-700');
    }
}

// Global fonksiyonlar (onclick için)
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;

// DOM yüklendiğinde event listener'ları ekle
document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('login-form');
    const closeLoginModalBtn = document.getElementById('closeLoginModal');
    
    // Form submit handler
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginModalSubmit);
    }
    
    // Close button handler
    if (closeLoginModalBtn) {
        closeLoginModalBtn.addEventListener('click', closeLoginModal);
    }
    
    // Modal backdrop click handler
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }
    
    // ESC tuşu ile kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const loginModal = document.getElementById('loginModal');
            if (loginModal && !loginModal.classList.contains('hidden')) {
                closeLoginModal();
            }
        }
    });
    
    // Tüm "Giriş Yap" butonlarına event listener ekle
    const loginButtonCandidates = Array.from(document.querySelectorAll('[data-login-btn], a[href="giris.html"], button'));
    const loginButtons = loginButtonCandidates.filter(btn => {
        if (btn.matches('[data-login-btn], a[href="giris.html"]')) {
            return true;
        }
        return btn.tagName === 'BUTTON' && btn.textContent.trim().toLowerCase() === 'giriş yap';
    });
    
    loginButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const isLoginLink = btn.matches('a[href="giris.html"]');
            const isLoginDataBtn = btn.hasAttribute('data-login-btn');
            const isLoginTextButton = btn.tagName === 'BUTTON' && btn.textContent.trim().toLowerCase() === 'giriş yap';
            
            if (isLoginLink || isLoginDataBtn || isLoginTextButton) {
                e.preventDefault();
                openLoginModal();
            }
        });
    });
});



