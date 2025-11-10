// Kuryes.com - Profile Data Handler
// Google Sheets'ten profil verilerini çeker ve formu doldurur

// Google Apps Script Web App URL'i
// TODO: Yeni Google Apps Script URL'i eklenecek
const PROFILE_API_URL = '';

/**
 * URL parametrelerinden ID'yi alır
 */
function getProfileId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Sayfa tipini belirler (kurye veya isletme)
 */
function getPageType() {
    const path = window.location.pathname;
    const href = window.location.href;
    const filename = window.location.pathname.split('/').pop() || window.location.href.split('/').pop();
    
    console.log('Pathname:', path, 'Href:', href, 'Filename:', filename);
    
    if (filename.includes('kurye-kart.html') || path.includes('kurye-kart.html') || href.includes('kurye-kart.html')) {
        return 'kurye';
    } else if (filename.includes('isletme-kart.html') || path.includes('isletme-kart.html') || href.includes('isletme-kart.html')) {
        return 'isletme';
    }
    return 'kurye'; // Varsayılan
}

/**
 * Google Sheets'ten profil verilerini çeker
 */
async function loadProfile(id, formType) {
    try {
        const url = `${PROFILE_API_URL}?id=${encodeURIComponent(id)}&formType=${formType}`;
        console.log('Profil yükleniyor:', url);
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success && result.data) {
            return result.data;
        } else {
            console.error('Profil yüklenemedi:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Profil yükleme hatası:', error);
        return null;
    }
}

/**
 * Kurye profil verilerini form alanlarına doldurur
 */
function fillKuryeProfileForm(profileData) {
    console.log('Kurye profil verileri dolduruluyor:', profileData);
    
    // raw_kayit_json'dan verileri al (form verileri burada)
    let formData = {};
    if (profileData.raw_kayit_json && typeof profileData.raw_kayit_json === 'object') {
        formData = profileData.raw_kayit_json;
        console.log('raw_kayit_json verileri:', formData);
    }
    
    // Kişisel Bilgiler - önce sheet'ten, sonra raw_kayit_json'dan
    const adSoyadValue = profileData.ad_soyad || formData.adSoyad;
    if (adSoyadValue) {
        const adSoyadInput = document.getElementById('adSoyad');
        console.log('adSoyad input bulundu:', adSoyadInput, 'Değer:', adSoyadValue);
        if (adSoyadInput) {
            adSoyadInput.value = adSoyadValue;
            console.log('adSoyad dolduruldu');
        }
        
        // Profil görünümünde de göster
        const profileName = document.getElementById('profileName');
        if (profileName) profileName.textContent = adSoyadValue;
    }
    
    // Email - önce sheet'ten, sonra raw_kayit_json'dan
    const emailValue = profileData.email || formData.email;
    if (emailValue) {
        const emailInput = document.getElementById('email');
        console.log('email input bulundu:', emailInput, 'Değer:', emailValue);
        if (emailInput) {
            emailInput.value = emailValue;
            console.log('email dolduruldu');
        }
    }
    
    // Yetkili telefon - önce sheet'ten, sonra raw_kayit_json'dan
    const yetkiliTelefonValue = profileData.yetkili_telefon || formData.yetkiliTelefon || formData.telefon;
    if (yetkiliTelefonValue) {
        const yetkiliTelefonInput = document.getElementById('yetkiliTelefon');
        console.log('yetkiliTelefon input bulundu:', yetkiliTelefonInput, 'Değer:', yetkiliTelefonValue);
        if (yetkiliTelefonInput) {
            yetkiliTelefonInput.value = yetkiliTelefonValue;
            console.log('yetkiliTelefon dolduruldu');
        }
    }
    
    // Telefon - önce sheet'ten, sonra raw_kayit_json'dan
    const telefonValue = profileData.telefon || formData.telefon;
    if (telefonValue) {
        const telefonInput = document.getElementById('telefon');
        console.log('telefon input bulundu:', telefonInput, 'Değer:', telefonValue);
        if (telefonInput) {
            telefonInput.value = telefonValue;
            console.log('telefon dolduruldu');
        }
        
        // Profil görünümünde göster
        const profileTelefon = document.getElementById('profileTelefon');
        if (profileTelefon) {
            profileTelefon.textContent = telefonValue;
            const container = document.getElementById('profileTelefonContainer');
            if (container) container.classList.remove('hidden');
        }
    }
    
    // Şehir - önce sheet'ten, sonra raw_kayit_json'dan
    const sehirValue = profileData.sehir || formData.sehir;
    if (sehirValue) {
        const sehirSelect = document.getElementById('sehir');
        console.log('sehir select bulundu:', sehirSelect, 'Değer:', sehirValue);
        if (sehirSelect) {
            sehirSelect.value = sehirValue;
            console.log('sehir dolduruldu');
        }
        
        // Profil görünümünde göster
        const profileCity = document.getElementById('profileCity');
        if (profileCity) profileCity.textContent = sehirValue;
    }
    
    // Ehliyet - önce sheet'ten, sonra raw_kayit_json'dan
    const ehliyetValue = profileData.ehliyet || formData.ehliyet;
    if (ehliyetValue) {
        const ehliyetCheckboxes = document.querySelectorAll('input[name="ehliyet"]');
        console.log('Ehliyet checkboxes bulundu:', ehliyetCheckboxes.length, 'Değer:', ehliyetValue);
        ehliyetCheckboxes.forEach(checkbox => {
            // Ehliyet string veya array olabilir
            const ehliyetArray = Array.isArray(ehliyetValue) 
                ? ehliyetValue 
                : [ehliyetValue];
            
            if (ehliyetArray.includes(checkbox.value)) {
                checkbox.checked = true;
                console.log('Ehliyet checkbox işaretlendi:', checkbox.value);
            }
        });
        
        // Profil görünümünde göster
        const profileEhliyet = document.getElementById('profileEhliyet');
        if (profileEhliyet) {
            const ehliyetDisplay = Array.isArray(ehliyetValue) 
                ? ehliyetValue.join(', ') 
                : ehliyetValue;
            profileEhliyet.textContent = ehliyetDisplay;
        }
    }
    
    // Motor - önce sheet'ten, sonra raw_kayit_json'dan
    const motorValue = profileData.motor_varmi || formData.motorVarmi;
    if (motorValue) {
        const motorRadio = document.querySelector(`input[name="motorVarmi"][value="${motorValue}"]`);
        console.log('Motor radio bulundu:', motorRadio, 'Değer:', motorValue);
        if (motorRadio) {
            motorRadio.checked = true;
            console.log('Motor radio işaretlendi');
        }
        
        // Profil görünümünde göster
        const profileMotor = document.getElementById('profileMotor');
        if (profileMotor) {
            profileMotor.textContent = motorValue === 'evet' ? 'Var' : 'Yok';
        }
    }
    
    // ID
    if (profileData.id) {
        const kuryeId = document.getElementById('kuryeId');
        if (kuryeId) kuryeId.textContent = `#${profileData.id}`;
    }
    
    // raw_kart_json varsa (profil kartı verileri)
    if (profileData.raw_kart_json && typeof profileData.raw_kart_json === 'object') {
        const kartData = profileData.raw_kart_json;
        
        // WhatsApp
        if (kartData.whatsapp) {
            const whatsappInput = document.getElementById('whatsapp');
            if (whatsappInput) whatsappInput.value = kartData.whatsapp;
        }
        
        // Motor detayları
        if (kartData.motorMarka) {
            const motorMarkaInput = document.getElementById('motorMarka');
            if (motorMarkaInput) motorMarkaInput.value = kartData.motorMarka;
        }
        
        if (kartData.motorModel) {
            const motorModelInput = document.getElementById('motorModel');
            if (motorModelInput) motorModelInput.value = kartData.motorModel;
        }
        
        // Diğer alanlar...
    }
}

/**
 * İşletme profil verilerini form alanlarına doldurur
 */
function fillIsletmeProfileForm(profileData) {
    console.log('İşletme profil verileri dolduruluyor:', profileData);
    
    // raw_kayit_json'dan verileri al
    let formData = {};
    if (profileData.raw_kayit_json) {
        if (typeof profileData.raw_kayit_json === 'string') {
            try {
                formData = JSON.parse(profileData.raw_kayit_json);
            } catch (e) {
                console.error('raw_kayit_json parse hatası:', e);
            }
        } else if (typeof profileData.raw_kayit_json === 'object') {
            formData = profileData.raw_kayit_json;
        }
    }
    console.log('Form data (raw_kayit_json):', formData);
    
    // İşletme Adı - önce sheet'ten, sonra raw_kayit_json'dan
    const isletmeAdiValue = profileData.isletme_adi || formData.isletmeAdi;
    if (isletmeAdiValue) {
        const isletmeAdiInput = document.getElementById('isletmeAdi');
        console.log('isletmeAdi input bulundu:', isletmeAdiInput, 'Değer:', isletmeAdiValue);
        if (isletmeAdiInput) {
            isletmeAdiInput.value = isletmeAdiValue;
            console.log('isletmeAdi dolduruldu');
        }
    }
    
    // Yetkili Kişi - önce sheet'ten, sonra raw_kayit_json'dan
    const yetkiliKisiValue = profileData.yetkili_kisi || formData.yetkiliKisi || formData.yetkiliAdi;
    if (yetkiliKisiValue) {
        const yetkiliAdiInput = document.getElementById('yetkiliAdi');
        console.log('yetkiliAdi input bulundu:', yetkiliAdiInput, 'Değer:', yetkiliKisiValue);
        if (yetkiliAdiInput) {
            yetkiliAdiInput.value = yetkiliKisiValue;
            console.log('yetkiliAdi dolduruldu');
        }
    }
    
    // Email - önce sheet'ten, sonra raw_kayit_json'dan
    const emailValue = profileData.email || formData.email;
    if (emailValue) {
        const emailInput = document.getElementById('email');
        console.log('email input bulundu:', emailInput, 'Değer:', emailValue);
        if (emailInput) {
            emailInput.value = emailValue;
            console.log('email dolduruldu');
        }
    }
    
    // Telefon - önce sheet'ten, sonra raw_kayit_json'dan
    const telefonValue = profileData.telefon || formData.telefon;
    if (telefonValue) {
        const telefonInput = document.getElementById('telefon');
        console.log('telefon input bulundu:', telefonInput, 'Değer:', telefonValue);
        if (telefonInput) {
            telefonInput.value = telefonValue;
            console.log('telefon dolduruldu');
        }
    }
    
    // Şehir - önce sheet'ten, sonra raw_kayit_json'dan
    const sehirValue = profileData.sehir || formData.sehir;
    if (sehirValue) {
        const sehirSelect = document.getElementById('sehir');
        console.log('sehir select bulundu:', sehirSelect, 'Değer:', sehirValue);
        if (sehirSelect) {
            sehirSelect.value = sehirValue;
            console.log('sehir dolduruldu');
        }
    }
    
    // İşletme Türü - önce sheet'ten, sonra raw_kayit_json'dan
    const isletmeTuruValue = profileData.isletme_turu || formData.isletmeTuru;
    if (isletmeTuruValue) {
        const isletmeTuruSelect = document.getElementById('isletmeTuru');
        console.log('isletmeTuru select bulundu:', isletmeTuruSelect, 'Değer:', isletmeTuruValue);
        if (isletmeTuruSelect) {
            isletmeTuruSelect.value = isletmeTuruValue;
            console.log('isletmeTuru dolduruldu');
        }
    }
    
    // ID göster
    if (profileData.id) {
        const isletmeId = document.getElementById('isletmeId');
        if (isletmeId) isletmeId.textContent = `#${profileData.id}`;
    }
    
    // raw_kart_json varsa (profil kartı verileri)
    if (profileData.raw_kart_json) {
        let kartData = {};
        if (typeof profileData.raw_kart_json === 'string') {
            try {
                kartData = JSON.parse(profileData.raw_kart_json);
            } catch (e) {
                console.error('raw_kart_json parse hatası:', e);
            }
        } else if (typeof profileData.raw_kart_json === 'object') {
            kartData = profileData.raw_kart_json;
        }
        
        console.log('Kart data (raw_kart_json):', kartData);
        
        // Adres - önce sheet'ten, sonra raw_kart_json'dan
        const adresValue = profileData.adres || kartData.adres;
        if (adresValue) {
            const adresInput = document.getElementById('adres');
            if (adresInput) adresInput.value = adresValue;
        }
        
        // WhatsApp
        const whatsappValue = profileData.whatsapp || kartData.whatsapp;
        if (whatsappValue) {
            const whatsappInput = document.getElementById('whatsapp') || document.getElementById('cep');
            if (whatsappInput) whatsappInput.value = whatsappValue;
        }
        
        // Görünürlük ayarları
        if (kartData.telefonGorunur !== undefined) {
            const telefonGorunurCheck = document.getElementById('telefonGorunur') || document.getElementById('kuryeArayabilir');
            if (telefonGorunurCheck) telefonGorunurCheck.checked = kartData.telefonGorunur === '1' || kartData.telefonGorunur === 1;
        }
        
        if (kartData.whatsappGorunur !== undefined) {
            const whatsappGorunurCheck = document.getElementById('whatsappGorunur');
            if (whatsappGorunurCheck) whatsappGorunurCheck.checked = kartData.whatsappGorunur === '1' || kartData.whatsappGorunur === 1;
        }
        
        if (kartData.iletisimYetkiliTelefon !== undefined || formData.iletisimYetkiliTelefon !== undefined) {
            const iletisimYetkiliTelefonCheck = document.getElementById('iletisimYetkiliTelefon');
            if (iletisimYetkiliTelefonCheck) {
                const shouldUseYetkili = kartData.iletisimYetkiliTelefon === '1' || kartData.iletisimYetkiliTelefon === 1 || kartData.iletisimYetkiliTelefon === true || formData.iletisimYetkiliTelefon === '1' || formData.iletisimYetkiliTelefon === 1 || formData.iletisimYetkiliTelefon === true;
                iletisimYetkiliTelefonCheck.checked = shouldUseYetkili;
                iletisimYetkiliTelefonCheck.dispatchEvent(new Event('change'));
            }
        }
        
        // Acil kurye checkbox
        if (profileData.acil_kurye !== undefined) {
            const acilKuryeCheck = document.getElementById('acilKuryeCheck');
            if (acilKuryeCheck) {
                acilKuryeCheck.checked = profileData.acil_kurye === '1' || profileData.acil_kurye === 1;
                acilKuryeCheck.dispatchEvent(new Event('change'));
            }
        }
        
        // Acil kurye parametreleri
        if (profileData.acil_kurye === '1' || profileData.acil_kurye === 1) {
            if (profileData.acil_kurye_saatlik_ucret) {
                const acilSaatlikInput = document.getElementById('acilSaatlikUcret');
                if (acilSaatlikInput) acilSaatlikInput.value = profileData.acil_kurye_saatlik_ucret;
            }
            
            if (profileData.acil_kurye_km_ucret) {
                const acilKmInput = document.getElementById('acilKmUcret');
                if (acilKmInput) acilKmInput.value = profileData.acil_kurye_km_ucret;
            }
            
            if (profileData.acil_kurye_paket_ucret) {
                const acilPaketInput = document.getElementById('acilPaketUcret');
                if (acilPaketInput) acilPaketInput.value = profileData.acil_kurye_paket_ucret;
            }
            
            if (profileData.acil_kurye_baslangic_saati) {
                const acilBaslangicSelect = document.getElementById('acilBaslangicSaati');
                if (acilBaslangicSelect) acilBaslangicSelect.value = profileData.acil_kurye_baslangic_saati;
            }
            
            if (profileData.acil_kurye_cikis_saati) {
                const acilCikisInput = document.getElementById('acilCikisSaati');
                if (acilCikisInput) acilCikisInput.value = profileData.acil_kurye_cikis_saati;
            }
            
            if (profileData.acil_kurye_otomatik_mesaj) {
                const acilOtomatikMesaj = document.getElementById('acilOtomatikMesaj');
                if (acilOtomatikMesaj) acilOtomatikMesaj.value = profileData.acil_kurye_otomatik_mesaj;
            }
            
            if (profileData.acil_kurye_ek_bilgiler) {
                const acilEkBilgiler = document.getElementById('acilEkBilgiler');
                if (acilEkBilgiler) acilEkBilgiler.value = profileData.acil_kurye_ek_bilgiler;
            }
        }
    }
    
    console.log('İşletme profil formu doldurma tamamlandı');
}

/**
 * Sayfa yüklendiğinde profili yükler
 */
async function initializeProfile() {
    const profileId = getProfileId();
    const pageType = getPageType();
    
    if (!profileId) {
        console.warn('ID bulunamadı. Profil yüklenemiyor.');
        return;
    }
    
    console.log('Profil yükleniyor - ID:', profileId, 'Tip:', pageType);
    
    // Profil verilerini yükle
    const profileData = await loadProfile(profileId, pageType);
    
    if (profileData) {
        // Formu doldur
        if (pageType === 'kurye') {
            fillKuryeProfileForm(profileData);
        } else {
            fillIsletmeProfileForm(profileData);
        }
        
        // LocalStorage'a kaydet (sonraki ziyaretler için)
        localStorage.setItem(`kuryes_${pageType}_id`, profileId);
        localStorage.setItem(`kuryes_${pageType}_profile`, JSON.stringify(profileData));
        
        console.log('Profil başarıyla yüklendi:', profileData);
    } else {
        console.error('Profil verisi yüklenemedi');
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    console.log('kuryes-profile.js DOMContentLoaded çalıştı');
    console.log('Pathname:', window.location.pathname);
    console.log('Href:', window.location.href);
    console.log('Search:', window.location.search);
    
    // URL'den ID kontrolü yap
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    // Sadece profil kartı sayfalarında ve ID varsa çalışsın
    const pathname = window.location.pathname;
    const href = window.location.href;
    const filename = pathname.split('/').pop() || href.split('/').pop();
    
    if ((filename.includes('kurye-kart.html') || filename.includes('isletme-kart.html')) && id) {
        console.log('Profil kartı sayfası tespit edildi, ID:', id, 'initializeProfile çağrılıyor');
        initializeProfile();
    } else {
        console.log('Profil kartı sayfası değil veya ID yok. Filename:', filename, 'ID:', id);
    }
});

