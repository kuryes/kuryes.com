// Kuryes.com - Preview Mode (DB olmadan önizleme)
// Kayıt bilgilerini localStorage'da saklar ve giriş modalında gösterir

/**
 * Kayıt formu submit edildiğinde verileri localStorage'a kaydeder
 */
function saveRegistrationData(userType, formData) {
    const registrationData = {
        userType: userType, // 'kurye' veya 'isletme'
        email: formData.email || formData.get('email'),
        sifre: formData.sifre || formData.get('sifre'),
        timestamp: new Date().toISOString(),
        data: {}
    };
    
    // Form verilerini topla
    if (formData instanceof FormData) {
        for (const [key, value] of formData.entries()) {
            if (key !== '_gotcha' && key !== 'sifre' && key !== 'sifreTekrar' && key !== 'kvkk' && key !== 'veriPaylasimi') {
                registrationData.data[key] = value;
            }
        }
    } else {
        // Object ise direkt kopyala
        Object.keys(formData).forEach(key => {
            if (key !== 'sifre' && key !== 'sifreTekrar' && key !== 'kvkk' && key !== 'veriPaylasimi') {
                registrationData.data[key] = formData[key];
            }
        });
    }
    
    // localStorage'a kaydet
    localStorage.setItem('kuryes_registration_data', JSON.stringify(registrationData));
    localStorage.setItem('kuryes_pending_login', 'true');
    
    console.log('Kayıt verileri kaydedildi:', registrationData);
}

/**
 * Giriş modalı açıldığında localStorage'dan bilgileri yükler
 */
function loadRegistrationDataToLogin() {
    const registrationDataStr = localStorage.getItem('kuryes_registration_data');
    const pendingLogin = localStorage.getItem('kuryes_pending_login');
    
    if (!registrationDataStr || !pendingLogin) {
        return false;
    }
    
    try {
        const registrationData = JSON.parse(registrationDataStr);
        const emailInput = document.getElementById('login-email');
        const sifreInput = document.getElementById('login-sifre');
        
        if (emailInput && registrationData.email) {
            emailInput.value = registrationData.email;
        }
        
        if (sifreInput && registrationData.sifre) {
            sifreInput.value = registrationData.sifre;
        }
        
        return true;
    } catch (error) {
        console.error('Kayıt verileri yüklenirken hata:', error);
        return false;
    }
}

/**
 * Giriş yapıldığında ilgili kartı gösterir
 */
function showUserCard(userType, userData) {
    // Giriş durumunu kaydet
    localStorage.setItem('kuryes_logged_in', 'true');
    localStorage.setItem('kuryes_user_type', userType);
    localStorage.setItem('kuryes_user_data', JSON.stringify(userData));
    
    // Pending login flag'ini kaldır
    localStorage.removeItem('kuryes_pending_login');
    
    // İlgili kart sayfasına yönlendir veya modal göster
    if (userType === 'isletme') {
        // İşletme kartını göster
        showIsletmeCard(userData);
    } else if (userType === 'kurye') {
        // Kurye kartını göster
        showKuryeCard(userData);
    }
}

/**
 * İşletme kartını gösterir
 */
function showIsletmeCard(userData) {
    // İlanlar sayfasındaysa kartı ekle
    if (window.location.pathname.includes('ilanlar.html')) {
        addIsletmeCardToPage(userData);
    } else {
        // İlanlar sayfasına yönlendir
        window.location.href = 'ilanlar.html?showCard=true';
    }
}

/**
 * Kurye kartını gösterir
 */
function showKuryeCard(userData) {
    // Kurye kartı sayfasına yönlendir veya modal göster
    alert('Kurye kartı önizlemesi: ' + JSON.stringify(userData, null, 2));
    // TODO: Kurye kartı sayfası oluşturulduğunda yönlendir
}

/**
 * İşletme kartını sayfaya ekler
 */
function addIsletmeCardToPage(userData) {
    const container = document.getElementById('isletmeCardsContainer');
    if (!container) return;
    
    // Kart HTML'i oluştur
    const cardHTML = generateIsletmeCardHTML(userData);
    
    // En üste ekle
    container.insertAdjacentHTML('afterbegin', cardHTML);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * İşletme kartı HTML'i oluşturur
 */
function generateIsletmeCardHTML(userData) {
    const data = userData.data || {};
    const isLojistik = data.lojistikFirmasi === 'on' || data.isletmeTuru === 'Lojistik';
    const icon = isLojistik ? '🚚' : getBusinessIcon(data.isletmeTuru);
    
    return `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-primary">
            <!-- Yeni Kayıt Badge -->
            <div class="bg-primary text-white text-xs font-semibold px-3 py-1 text-center">
                ✨ YENİ KAYIT - SİZİN KARTINIZ
            </div>
            
            <!-- Card Content -->
            <div class="p-3 sm:p-4 md:p-6">
                <div class="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6">
                    <!-- Logo & Name -->
                    <div class="flex-shrink-0 flex flex-col items-center md:items-start">
                        <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-2">
                            <span class="text-2xl sm:text-3xl md:text-4xl">${icon}</span>
                        </div>
                        <h3 class="text-base sm:text-lg md:text-xl font-bold text-text text-center md:text-left">${data.isletmeAdi || 'İşletme Adı'}</h3>
                        <p class="text-xs sm:text-xs md:text-sm text-muted text-center md:text-left">${data.isletmeTuru || 'İşletme Türü'}</p>
                        <p class="text-xs text-muted text-center md:text-left">${data.sehir || 'Şehir'}</p>
                    </div>
                    
                    <!-- Details -->
                    <div class="flex-1 space-y-2 sm:space-y-3">
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2 md:gap-3">
                            <div class="p-2 sm:p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span class="text-xs text-muted block mb-1">Yetkili Kişi</span>
                                <span class="text-xs sm:text-sm font-semibold text-primary break-words">${data.yetkiliKisi || '-'}</span>
                            </div>
                            <div class="p-2 sm:p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span class="text-xs text-muted block mb-1">Telefon</span>
                                <span class="text-xs sm:text-sm font-semibold text-text break-words">${data.telefon || '-'}</span>
                            </div>
                            <div class="p-2 sm:p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span class="text-xs text-muted block mb-1">E-posta</span>
                                <span class="text-xs sm:text-sm font-semibold text-text break-words">${userData.email || '-'}</span>
                            </div>
                            <div class="p-2 sm:p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span class="text-xs text-muted block mb-1">Şehir</span>
                                <span class="text-xs sm:text-sm font-semibold text-text">${data.sehir || '-'}</span>
                            </div>
                            <div class="p-2 sm:p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span class="text-xs text-muted block mb-1">İşletme Türü</span>
                                <span class="text-xs sm:text-sm font-semibold text-text break-words">${data.isletmeTuru || '-'}</span>
                            </div>
                            <div class="p-2 sm:p-2 md:p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <span class="text-xs text-muted block mb-1">Durum</span>
                                <span class="text-xs sm:text-sm font-semibold text-primary">Kayıt Tamamlandı ✓</span>
                            </div>
                        </div>
                        
                        <!-- İş Tanımı -->
                        <div class="pt-2 border-t border-gray-200">
                            <p class="text-xs sm:text-xs md:text-sm text-muted leading-relaxed">
                                Bu kart kayıt formunuzdan oluşturulmuştur. Gerçek sistemde burada daha detaylı bilgiler görünecektir.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex-shrink-0 flex flex-col justify-between gap-2 sm:gap-3 mt-3 md:mt-0">
                        <div class="flex justify-center md:justify-end gap-2">
                            <a href="tel:${data.telefon || ''}" class="p-2 text-accent hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Telefon">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                            </a>
                            <a href="mailto:${userData.email || ''}" class="p-2 text-accent hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="E-posta">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </a>
                        </div>
                        <div class="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                            <button onclick="alert('Kart düzenleme özelliği yakında eklenecek!')" class="w-full px-4 py-2.5 sm:py-2 bg-primary text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm min-h-[44px]">
                                Kartı Düzenle
                            </button>
                            <button onclick="openDetailModal('isletme', 'preview', false)" class="w-full px-4 py-2.5 sm:py-2 bg-accent text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm min-h-[44px]">
                                Detay Gör
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * İşletme türüne göre icon döndürür
 */
function getBusinessIcon(type) {
    const icons = {
        'Restoran': '🍕',
        'Kafe': '☕',
        'Market': '🛒',
        'Eczane': '💊',
        'Lojistik': '🚚',
        'E-ticaret': '📦',
        'Diğer': '🏪'
    };
    return icons[type] || '🏪';
}

// DOM yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Eğer URL'de showCard parametresi varsa ve giriş yapılmışsa kartı göster
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showCard') === 'true') {
        const userDataStr = localStorage.getItem('kuryes_user_data');
        const userType = localStorage.getItem('kuryes_user_type');
        
        if (userDataStr && userType === 'isletme') {
            const userData = JSON.parse(userDataStr);
            setTimeout(() => {
                showIsletmeCard(userData);
            }, 500);
        }
    }
    
    // Giriş modalı açıldığında kayıt bilgilerini yükle
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isHidden = loginModal.classList.contains('hidden');
                    if (!isHidden) {
                        // Modal açıldı, kayıt bilgilerini yükle
                        loadRegistrationDataToLogin();
                    }
                }
            });
        });
        
        observer.observe(loginModal, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});

// Global fonksiyonlar
window.saveRegistrationData = saveRegistrationData;
window.showUserCard = showUserCard;
window.showIsletmeCard = showIsletmeCard;
window.showKuryeCard = showKuryeCard;

