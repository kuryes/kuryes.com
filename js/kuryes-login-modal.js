// Kuryes.com - Login Modal Handler
// Handles login modal display and form submission

// Google Apps Script Web App URL'i (login için)
const LOGIN_API_URL = 'https://script.google.com/macros/s/AKfycbyP4rGbVDXG8-xli6QPv4YXaHgiCyCoCr5UvdJtYJyTi2RWfFx-rqUd-ZtTQiMsz6Hdww/exec';

/**
 * Login modal'ı açar
 */
function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        loginModal.classList.add('flex');
        
        // Body scroll'u engelle
        document.body.classList.add('overflow-hidden');
        document.documentElement.classList.add('overflow-hidden');
        
        // Preview mode: Kayıt bilgilerini yükle
        if (typeof loadRegistrationDataToLogin === 'function') {
            loadRegistrationDataToLogin();
        }
        
        // Email input'una focus
        const emailInput = document.getElementById('login-email');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 100);
        }
    } else {
        console.error('Login modal bulunamadı!');
    }
}

/**
 * Login modal'ı kapatır
 */
function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('hidden');
        loginModal.classList.remove('flex');
        
        // Body scroll'u aktif et
        document.body.classList.remove('overflow-hidden');
        document.documentElement.classList.remove('overflow-hidden');
        
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
    
    // Login request gönder
    const loginData = new URLSearchParams();
    loginData.append('action', 'login');
    loginData.append('email', email);
    loginData.append('sifre', sifre);
    
    fetch(LOGIN_API_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginData.toString()
    })
    .then(response => {
        // Response'u text olarak oku
        return response.text();
    })
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
                localStorage.setItem('kuryes_user_avatar', data.avatar || '1');
                
                if (data.userType === 'kurye') {
                    localStorage.setItem('kuryes_user_name', data.adSoyad || '');
                } else {
                    localStorage.setItem('kuryes_user_name', data.isletmeAdi || '');
                    if (data.yetkiliAdi) {
                        localStorage.setItem('kuryes_yetkili_adi', data.yetkiliAdi);
                    }
                }
                
                // Auth state'i güncelle
                if (typeof window.KuryesAuth !== 'undefined' && window.KuryesAuth.updateHeaderForAuth) {
                    window.KuryesAuth.updateHeaderForAuth();
                }
                
                // Form input'larını disable et
                const inputs = loginForm.querySelectorAll('input');
                inputs.forEach(input => input.disabled = true);
                
                // Profil sayfasına yönlendir
                setTimeout(() => {
                    if (data.userType === 'kurye') {
                        window.location.href = `kurye-kart.html?id=${data.id}&type=kurye`;
                    } else if (data.userType === 'isletme') {
                        window.location.href = `isletme-kart.html?id=${data.id}&type=isletme`;
                    } else if (data.userType === 'lojistik') {
                        window.location.href = `lojistik-kart.html?id=${data.id}&type=lojistik`;
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
            console.error('Response text:', text);
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

// Global fonksiyonlar (onclick için) - Sayfa yüklenmeden önce de erişilebilir olmalı
if (typeof window !== 'undefined') {
    window.openLoginModal = openLoginModal;
    window.closeLoginModal = closeLoginModal;
}

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
    const loginButtons = document.querySelectorAll('[data-login-btn]');
    
    loginButtons.forEach(btn => {
        // Mevcut onclick'i kaldır
        btn.removeAttribute('onclick');
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Giriş Yap butonuna tıklandı');
            openLoginModal();
        });
    });
    
    // Ayrıca onclick attribute'u olan butonları da kontrol et
    const onclickButtons = document.querySelectorAll('button[onclick*="openLoginModal"]');
    onclickButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('onclick ile Giriş Yap butonuna tıklandı');
            openLoginModal();
        });
    });
});



