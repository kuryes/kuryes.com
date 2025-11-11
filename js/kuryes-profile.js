// Kuryes.com - Profile Data Handler
// Google Sheets'ten profil verilerini çeker ve formu doldurur

// Google Apps Script Web App URL'i
const PROFILE_API_URL = 'https://script.google.com/macros/s/AKfycbyP4rGbVDXG8-xli6QPv4YXaHgiCyCoCr5UvdJtYJyTi2RWfFx-rqUd-ZtTQiMsz6Hdww/exec';

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
    } else if (filename.includes('lojistik-kart.html') || path.includes('lojistik-kart.html') || href.includes('lojistik-kart.html')) {
        return 'lojistik';
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
    const adSoyadValue = profileData.adSoyad || profileData.ad_soyad || formData.adsoyad || formData.adSoyad;
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
    const emailValue = profileData.email || formData.eposta || formData.email;
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
                : (typeof ehliyetValue === 'string' ? ehliyetValue.split(',') : [ehliyetValue]);
            
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
                : (typeof ehliyetValue === 'string' ? ehliyetValue : String(ehliyetValue));
            profileEhliyet.textContent = ehliyetDisplay;
        }
    }
    
    // Motor - önce sheet'ten, sonra raw_kayit_json'dan
    const motorValue = profileData.motorVarmi || profileData.motor_varmi || formData.motorunvarmi || formData.motorVarmi;
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
    
    // raw_kart_json varsa (profil kartı verileri) - TÜM ALANLARI DOLDUR
    let kartData = {};
    if (profileData.raw_kart_json) {
        if (typeof profileData.raw_kart_json === 'string') {
            try {
                kartData = JSON.parse(profileData.raw_kart_json);
            } catch (e) {
                console.error('raw_kart_json parse hatası:', e);
            }
        } else if (typeof profileData.raw_kart_json === 'object') {
            kartData = profileData.raw_kart_json;
        }
    }
    
    console.log('Kart data (raw_kart_json):', kartData);
    
    // Tüm kart verilerini form alanlarına doldur
    Object.keys(kartData).forEach(key => {
        // Özel alanları atla
        if (key === 'action' || key === 'id' || key === 'formType' || key === 'jsonData' || key === 'kuryeid') {
            return;
        }
        
        const value = kartData[key];
        if (value === null || value === undefined || value === '') {
            return;
        }
        
        // Checkbox'lar için özel işlem
        if (key.toLowerCase().includes('check') || key.toLowerCase().includes('gorunur') || key.toLowerCase().includes('evet') || key.toLowerCase().includes('hayir')) {
            const checkbox = document.getElementById(key) || document.querySelector(`input[name="${key}"]`);
            if (checkbox && checkbox.type === 'checkbox') {
                checkbox.checked = value === 'evet' || value === '1' || value === 1 || value === true || value === 'true';
                console.log(`Checkbox dolduruldu: ${key} = ${checkbox.checked}`);
            }
            return;
        }
        
        // Radio button'lar için özel işlem
        const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
        if (radio && radio.type === 'radio') {
            radio.checked = true;
            console.log(`Radio dolduruldu: ${key} = ${value}`);
            return;
        }
        
        // Select elementleri için
        const select = document.getElementById(key) || document.querySelector(`select[name="${key}"]`);
        if (select && select.tagName === 'SELECT') {
            select.value = value;
            console.log(`Select dolduruldu: ${key} = ${value}`);
            return;
        }
        
        // Textarea için
        const textarea = document.getElementById(key) || document.querySelector(`textarea[name="${key}"]`);
        if (textarea && textarea.tagName === 'TEXTAREA') {
            textarea.value = value;
            console.log(`Textarea dolduruldu: ${key} = ${value}`);
            return;
        }
        
        // Input alanları için
        const input = document.getElementById(key) || document.querySelector(`input[name="${key}"]`);
        if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
            // Checkbox ve radio'ları atla (zaten yukarıda işlendi)
            if (input.type === 'checkbox' || input.type === 'radio') {
                return;
            }
            input.value = value;
            console.log(`Input dolduruldu: ${key} = ${value}`);
        }
    });
    
    // Özel alanlar için manuel doldurma (eğer yukarıdaki otomatik doldurma çalışmadıysa)
        
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
        
    // Plaka
    if (kartData.plaka || kartData.motorPlaka) {
        const plakaInput = document.getElementById('plaka') || document.getElementById('motorPlaka');
        if (plakaInput) plakaInput.value = kartData.plaka || kartData.motorPlaka;
    }
    
    // Görünürlük checkbox'ları
    if (kartData.plakaGorunur !== undefined) {
        const plakaGorunurCheck = document.getElementById('plakaGorunur');
        if (plakaGorunurCheck) {
            plakaGorunurCheck.checked = kartData.plakaGorunur === 'evet' || kartData.plakaGorunur === '1' || kartData.plakaGorunur === 1 || kartData.plakaGorunur === true;
        }
    }
    
    if (kartData.telefonGorunur !== undefined) {
        const telefonGorunurCheck = document.getElementById('telefonGorunur');
        if (telefonGorunurCheck) {
            telefonGorunurCheck.checked = kartData.telefonGorunur === 'evet' || kartData.telefonGorunur === '1' || kartData.telefonGorunur === 1 || kartData.telefonGorunur === true;
        }
    }
    
    if (kartData.whatsappGorunur !== undefined) {
        const whatsappGorunurCheck = document.getElementById('whatsappGorunur');
        if (whatsappGorunurCheck) {
            whatsappGorunurCheck.checked = kartData.whatsappGorunur === 'evet' || kartData.whatsappGorunur === '1' || kartData.whatsappGorunur === 1 || kartData.whatsappGorunur === true;
        }
    }
    
    // Ehliyet checkbox'ları (virgülle ayrılmış string)
    if (kartData.ehliyet) {
        const ehliyetArray = typeof kartData.ehliyet === 'string' ? kartData.ehliyet.split(',') : (Array.isArray(kartData.ehliyet) ? kartData.ehliyet : [kartData.ehliyet]);
        const ehliyetCheckboxes = document.querySelectorAll('input[name="ehliyet"]');
        ehliyetCheckboxes.forEach(checkbox => {
            checkbox.checked = ehliyetArray.includes(checkbox.value.trim());
        });
    }
    
    // Çalışma modeli checkbox'ları
    if (kartData.calismaModeli) {
        const calismaModeliArray = typeof kartData.calismaModeli === 'string' ? kartData.calismaModeli.split(',') : (Array.isArray(kartData.calismaModeli) ? kartData.calismaModeli : [kartData.calismaModeli]);
        const calismaModeliCheckboxes = document.querySelectorAll('input[name="calismaModeli"]');
        calismaModeliCheckboxes.forEach(checkbox => {
            checkbox.checked = calismaModeliArray.includes(checkbox.value.trim());
        });
    }
    
    // Deneyimler (JSON string)
    if (kartData.deneyimler) {
        try {
            const deneyimlerArray = typeof kartData.deneyimler === 'string' ? JSON.parse(kartData.deneyimler) : kartData.deneyimler;
            if (Array.isArray(deneyimlerArray) && window.deneyimler !== undefined) {
                window.deneyimler = deneyimlerArray;
                // Deneyim listesini güncelle (eğer fonksiyon varsa)
                if (typeof updateDeneyimlerListesi === 'function') {
                    updateDeneyimlerListesi();
                }
            }
        } catch (e) {
            console.error('Deneyimler parse hatası:', e);
        }
    }
    
    // Acil müsaitlik
    if (kartData.acilMusaitlikCheck !== undefined || kartData.acilMusaitlik !== undefined) {
        const acilMusaitlikCheck = document.getElementById('acilMusaitlikCheck');
        if (acilMusaitlikCheck) {
            const checked = kartData.acilMusaitlikCheck === 'evet' || kartData.acilMusaitlikCheck === '1' || kartData.acilMusaitlik === '1' || kartData.acilMusaitlik === 1;
            acilMusaitlikCheck.checked = checked;
            if (checked) {
                acilMusaitlikCheck.dispatchEvent(new Event('change'));
            }
        }
    }
    
    // Acil müsaitlik detayları
    if (kartData.acilMusaitlikSaatlikCheck) {
        const acilMusaitlikSaatlikCheck = document.getElementById('acilMusaitlikSaatlikCheck');
        if (acilMusaitlikSaatlikCheck) {
            acilMusaitlikSaatlikCheck.checked = kartData.acilMusaitlikSaatlikCheck === 'evet' || kartData.acilMusaitlikSaatlikCheck === '1';
        }
    }
    
    if (kartData.acilMusaitlikSaatlikUcret) {
        const acilMusaitlikSaatlikUcret = document.getElementById('acilMusaitlikSaatlikUcret');
        if (acilMusaitlikSaatlikUcret) acilMusaitlikSaatlikUcret.value = kartData.acilMusaitlikSaatlikUcret;
    }
    
    if (kartData.acilMusaitlikKmCheck) {
        const acilMusaitlikKmCheck = document.getElementById('acilMusaitlikKmCheck');
        if (acilMusaitlikKmCheck) {
            acilMusaitlikKmCheck.checked = kartData.acilMusaitlikKmCheck === 'evet' || kartData.acilMusaitlikKmCheck === '1';
        }
    }
    
    if (kartData.acilMusaitlikKmUcret) {
        const acilMusaitlikKmUcret = document.getElementById('acilMusaitlikKmUcret');
        if (acilMusaitlikKmUcret) acilMusaitlikKmUcret.value = kartData.acilMusaitlikKmUcret;
    }
    
    if (kartData.acilMusaitlikPaketCheck) {
        const acilMusaitlikPaketCheck = document.getElementById('acilMusaitlikPaketCheck');
        if (acilMusaitlikPaketCheck) {
            acilMusaitlikPaketCheck.checked = kartData.acilMusaitlikPaketCheck === 'evet' || kartData.acilMusaitlikPaketCheck === '1';
        }
    }
    
    if (kartData.acilMusaitlikPaketUcret) {
        const acilMusaitlikPaketUcret = document.getElementById('acilMusaitlikPaketUcret');
        if (acilMusaitlikPaketUcret) acilMusaitlikPaketUcret.value = kartData.acilMusaitlikPaketUcret;
    }
    
    if (kartData.acilMusaitlikBaslangicSaati) {
        const acilMusaitlikBaslangicSaati = document.getElementById('acilMusaitlikBaslangicSaati');
        if (acilMusaitlikBaslangicSaati) acilMusaitlikBaslangicSaati.value = kartData.acilMusaitlikBaslangicSaati;
    }
    
    if (kartData.acilMusaitlikCikisSaati) {
        const acilMusaitlikCikisSaati = document.getElementById('acilMusaitlikCikisSaati');
        if (acilMusaitlikCikisSaati) acilMusaitlikCikisSaati.value = kartData.acilMusaitlikCikisSaati;
    }
    
    if (kartData.acilMusaitlikOtomatikMesaj) {
        const acilMusaitlikOtomatikMesaj = document.getElementById('acilMusaitlikOtomatikMesaj');
        if (acilMusaitlikOtomatikMesaj) acilMusaitlikOtomatikMesaj.value = kartData.acilMusaitlikOtomatikMesaj;
    }
    
    if (kartData.acilMusaitlikEkBilgiler) {
        const acilMusaitlikEkBilgiler = document.getElementById('acilMusaitlikEkBilgiler');
        if (acilMusaitlikEkBilgiler) acilMusaitlikEkBilgiler.value = kartData.acilMusaitlikEkBilgiler;
    }
    
    // Belge checkbox'ları
    if (kartData.p1Belgesi !== undefined) {
        const p1Belgesi = document.querySelector('input[name="p1Belgesi"]');
        if (p1Belgesi) p1Belgesi.checked = kartData.p1Belgesi === 'evet' || kartData.p1Belgesi === '1' || kartData.p1Belgesi === 1;
    }
    
    if (kartData.srcBelgesi !== undefined) {
        const srcBelgesi = document.querySelector('input[name="srcBelgesi"]');
        if (srcBelgesi) srcBelgesi.checked = kartData.srcBelgesi === 'evet' || kartData.srcBelgesi === '1' || kartData.srcBelgesi === 1;
    }
    
    if (kartData.psikoteknik !== undefined) {
        const psikoteknik = document.querySelector('input[name="psikoteknik"]');
        if (psikoteknik) psikoteknik.checked = kartData.psikoteknik === 'evet' || kartData.psikoteknik === '1' || kartData.psikoteknik === 1;
    }
    
    // Avatar
    if (kartData.avatar || profileData.avatar) {
        const avatarValue = kartData.avatar || profileData.avatar;
        const selectedAvatar = document.getElementById('selectedAvatar');
        if (selectedAvatar) selectedAvatar.value = avatarValue;
        
        // Avatar görselini güncelle
        const avatarButtons = document.querySelectorAll('[data-avatar]');
        avatarButtons.forEach(btn => {
            btn.classList.remove('border-primary', 'border-2');
            if (btn.getAttribute('data-avatar') === String(avatarValue)) {
                btn.classList.add('border-primary', 'border-2');
            }
        });
    }
    
    console.log('Kurye profil formu doldurma tamamlandı');
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
    const isletmeAdiValue = profileData.isletmeAdi || profileData.isletme_adi || formData.isletmeadi || formData.isletmeAdi;
    if (isletmeAdiValue) {
        const isletmeAdiInput = document.getElementById('isletmeAdi');
        console.log('isletmeAdi input bulundu:', isletmeAdiInput, 'Değer:', isletmeAdiValue);
        if (isletmeAdiInput) {
            isletmeAdiInput.value = isletmeAdiValue;
            console.log('isletmeAdi dolduruldu');
        }
        
        // Profil görünümünde göster
        const businessName = document.getElementById('businessName');
        if (businessName) businessName.textContent = isletmeAdiValue;
    }
    
    // Yetkili Kişi - önce sheet'ten, sonra raw_kayit_json'dan
    const yetkiliKisiValue = profileData.yetkiliAdi || profileData.yetkili_kisi || formData.yetkiliadsoyad || formData.yetkiliKisi || formData.yetkiliAdi;
    if (yetkiliKisiValue) {
        const yetkiliAdiInput = document.getElementById('yetkiliAdi');
        console.log('yetkiliAdi input bulundu:', yetkiliAdiInput, 'Değer:', yetkiliKisiValue);
        if (yetkiliAdiInput) {
            yetkiliAdiInput.value = yetkiliKisiValue;
            console.log('yetkiliAdi dolduruldu');
        }
    }
    
    // Email - önce sheet'ten, sonra raw_kayit_json'dan
    const emailValue = profileData.email || formData.eposta || formData.email;
    if (emailValue) {
        const emailInput = document.getElementById('email');
        console.log('email input bulundu:', emailInput, 'Değer:', emailValue);
        if (emailInput) {
            emailInput.value = emailValue;
            console.log('email dolduruldu');
        }
    }
    
    // Telefon - önce sheet'ten, sonra raw_kayit_json'dan
    const telefonValue = profileData.telefon || formData.tel || formData.telefon;
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
        
        // Profil görünümünde göster
        const profileSehir = document.getElementById('profileSehir');
        if (profileSehir) profileSehir.textContent = sehirValue;
    }
    
    // İşletme Türü - önce sheet'ten, sonra raw_kayit_json'dan
    const isletmeTuruValue = profileData.isletmeTuru || profileData.isletme_turu || formData.tur || formData.isletmeTuru;
    if (isletmeTuruValue) {
        const isletmeTuruSelect = document.getElementById('isletmeTuru');
        console.log('isletmeTuru select bulundu:', isletmeTuruSelect, 'Değer:', isletmeTuruValue);
        if (isletmeTuruSelect) {
            isletmeTuruSelect.value = isletmeTuruValue;
            console.log('isletmeTuru dolduruldu');
        }
        
        // Profil görünümünde göster
        const businessType = document.getElementById('businessType');
        if (businessType) businessType.textContent = isletmeTuruValue;
    }
    
    // ID göster
    if (profileData.id) {
        const isletmeId = document.getElementById('isletmeId');
        if (isletmeId) isletmeId.textContent = `#${profileData.id}`;
    }
    
    // raw_kart_json varsa (profil kartı verileri) - TÜM ALANLARI DOLDUR
    let kartData = {};
    if (profileData.raw_kart_json) {
        if (typeof profileData.raw_kart_json === 'string') {
            try {
                kartData = JSON.parse(profileData.raw_kart_json);
            } catch (e) {
                console.error('raw_kart_json parse hatası:', e);
            }
        } else if (typeof profileData.raw_kart_json === 'object') {
            kartData = profileData.raw_kart_json;
        }
    }
    
    console.log('Kart data (raw_kart_json):', kartData);
    
    // Tüm kart verilerini form alanlarına doldur
    Object.keys(kartData).forEach(key => {
        // Özel alanları atla
        if (key === 'action' || key === 'id' || key === 'formType' || key === 'jsonData' || key === 'isletmeid' || key === 'lojistikid') {
            return;
        }
        
        const value = kartData[key];
        if (value === null || value === undefined || value === '') {
            return;
        }
        
        // Checkbox'lar için özel işlem
        if (key.toLowerCase().includes('check') || key.toLowerCase().includes('gorunur') || key.toLowerCase().includes('evet') || key.toLowerCase().includes('hayir')) {
            const checkbox = document.getElementById(key) || document.querySelector(`input[name="${key}"]`);
            if (checkbox && checkbox.type === 'checkbox') {
                checkbox.checked = value === 'evet' || value === '1' || value === 1 || value === true || value === 'true';
                console.log(`Checkbox dolduruldu: ${key} = ${checkbox.checked}`);
            }
            return;
        }
        
        // Radio button'lar için özel işlem
        const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
        if (radio && radio.type === 'radio') {
            radio.checked = true;
            console.log(`Radio dolduruldu: ${key} = ${value}`);
            return;
        }
        
        // Select elementleri için
        const select = document.getElementById(key) || document.querySelector(`select[name="${key}"]`);
        if (select && select.tagName === 'SELECT') {
            select.value = value;
            console.log(`Select dolduruldu: ${key} = ${value}`);
            return;
        }
        
        // Textarea için
        const textarea = document.getElementById(key) || document.querySelector(`textarea[name="${key}"]`);
        if (textarea && textarea.tagName === 'TEXTAREA') {
            textarea.value = value;
            console.log(`Textarea dolduruldu: ${key} = ${value}`);
            return;
        }
        
        // Input alanları için
        const input = document.getElementById(key) || document.querySelector(`input[name="${key}"]`);
        if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
            // Checkbox ve radio'ları atla (zaten yukarıda işlendi)
            if (input.type === 'checkbox' || input.type === 'radio') {
                return;
            }
            input.value = value;
            console.log(`Input dolduruldu: ${key} = ${value}`);
        }
    });
    
    // Özel alanlar için manuel doldurma
    
    // Adres
    if (kartData.adres || profileData.adres) {
        const adresInput = document.getElementById('adres');
        if (adresInput) adresInput.value = kartData.adres || profileData.adres;
    }
    
    // WhatsApp
    if (kartData.whatsapp || profileData.whatsapp) {
        const whatsappInput = document.getElementById('whatsapp') || document.getElementById('cep');
        if (whatsappInput) whatsappInput.value = kartData.whatsapp || profileData.whatsapp;
    }
    
    // Görünürlük ayarları
    if (kartData.telefonGorunur !== undefined) {
        const telefonGorunurCheck = document.getElementById('telefonGorunur') || document.getElementById('kuryeArayabilir');
        if (telefonGorunurCheck) {
            telefonGorunurCheck.checked = kartData.telefonGorunur === 'evet' || kartData.telefonGorunur === '1' || kartData.telefonGorunur === 1 || kartData.telefonGorunur === true;
        }
    }
    
    if (kartData.whatsappGorunur !== undefined) {
        const whatsappGorunurCheck = document.getElementById('whatsappGorunur');
        if (whatsappGorunurCheck) {
            whatsappGorunurCheck.checked = kartData.whatsappGorunur === 'evet' || kartData.whatsappGorunur === '1' || kartData.whatsappGorunur === 1 || kartData.whatsappGorunur === true;
        }
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
    if (kartData.acilKuryeCheck !== undefined || profileData.acil_kurye !== undefined) {
        const acilKuryeCheck = document.getElementById('acilKuryeCheck');
        if (acilKuryeCheck) {
            const checked = kartData.acilKuryeCheck === 'evet' || kartData.acilKuryeCheck === '1' || profileData.acil_kurye === '1' || profileData.acil_kurye === 1;
            acilKuryeCheck.checked = checked;
            if (checked) {
                acilKuryeCheck.dispatchEvent(new Event('change'));
            }
        }
    }
    
    // Acil kurye parametreleri (kartData'dan veya profileData'dan)
    const acilKuryeData = kartData.acilKuryeCheck === 'evet' || kartData.acilKuryeCheck === '1' || profileData.acil_kurye === '1' || profileData.acil_kurye === 1;
    if (acilKuryeData) {
        if (kartData.acilKuryeSaatlikUcret || profileData.acil_kurye_saatlik_ucret) {
            const acilSaatlikInput = document.getElementById('acilSaatlikUcret') || document.getElementById('acilKuryeSaatlikUcret');
            if (acilSaatlikInput) acilSaatlikInput.value = kartData.acilKuryeSaatlikUcret || profileData.acil_kurye_saatlik_ucret;
        }
        
        if (kartData.acilKuryeKmUcret || profileData.acil_kurye_km_ucret) {
            const acilKmInput = document.getElementById('acilKmUcret') || document.getElementById('acilKuryeKmUcret');
            if (acilKmInput) acilKmInput.value = kartData.acilKuryeKmUcret || profileData.acil_kurye_km_ucret;
        }
        
        if (kartData.acilKuryePaketUcret || profileData.acil_kurye_paket_ucret) {
            const acilPaketInput = document.getElementById('acilPaketUcret') || document.getElementById('acilKuryePaketUcret');
            if (acilPaketInput) acilPaketInput.value = kartData.acilKuryePaketUcret || profileData.acil_kurye_paket_ucret;
        }
        
        if (kartData.acilKuryeBaslangicSaati || profileData.acil_kurye_baslangic_saati) {
            const acilBaslangicSelect = document.getElementById('acilBaslangicSaati') || document.getElementById('acilKuryeBaslangicSaati');
            if (acilBaslangicSelect) acilBaslangicSelect.value = kartData.acilKuryeBaslangicSaati || profileData.acil_kurye_baslangic_saati;
        }
        
        if (kartData.acilKuryeCikisSaati || profileData.acil_kurye_cikis_saati) {
            const acilCikisInput = document.getElementById('acilCikisSaati') || document.getElementById('acilKuryeCikisSaati');
            if (acilCikisInput) acilCikisInput.value = kartData.acilKuryeCikisSaati || profileData.acil_kurye_cikis_saati;
        }
        
        if (kartData.acilKuryeOtomatikMesaj || profileData.acil_kurye_otomatik_mesaj) {
            const acilOtomatikMesaj = document.getElementById('acilOtomatikMesaj') || document.getElementById('acilKuryeOtomatikMesaj');
            if (acilOtomatikMesaj) acilOtomatikMesaj.value = kartData.acilKuryeOtomatikMesaj || profileData.acil_kurye_otomatik_mesaj;
        }
        
        if (kartData.acilKuryeEkBilgiler || profileData.acil_kurye_ek_bilgiler) {
            const acilEkBilgiler = document.getElementById('acilEkBilgiler') || document.getElementById('acilKuryeEkBilgiler');
            if (acilEkBilgiler) acilEkBilgiler.value = kartData.acilKuryeEkBilgiler || profileData.acil_kurye_ek_bilgiler;
        }
    }
    
    // Avatar
    if (kartData.avatar || profileData.avatar) {
        const avatarValue = kartData.avatar || profileData.avatar;
        const selectedAvatar = document.getElementById('selectedAvatar');
        if (selectedAvatar) selectedAvatar.value = avatarValue;
        
        // Avatar görselini güncelle
        const avatarButtons = document.querySelectorAll('[data-avatar]');
        avatarButtons.forEach(btn => {
            btn.classList.remove('border-primary', 'border-2');
            if (btn.getAttribute('data-avatar') === String(avatarValue)) {
                btn.classList.add('border-primary', 'border-2');
            }
        });
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
        } else if (pageType === 'lojistik') {
            fillIsletmeProfileForm(profileData); // Lojistik de işletme formunu kullanır
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
    
    if ((filename.includes('kurye-kart.html') || filename.includes('isletme-kart.html') || filename.includes('lojistik-kart.html')) && id) {
        console.log('Profil kartı sayfası tespit edildi, ID:', id, 'initializeProfile çağrılıyor');
        initializeProfile();
    } else {
        console.log('Profil kartı sayfası değil veya ID yok. Filename:', filename, 'ID:', id);
    }
});

