// Kuryes.com - Form Submission Handler for Google Sheets
// Handles form submissions for kurye and isletme registration forms

// Google Apps Script Web App URL'leri
const KURYE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyP4rGbVDXG8-xli6QPv4YXaHgiCyCoCr5UvdJtYJyTi2RWfFx-rqUd-ZtTQiMsz6Hdww/exec';
const ISLETME_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyP4rGbVDXG8-xli6QPv4YXaHgiCyCoCr5UvdJtYJyTi2RWfFx-rqUd-ZtTQiMsz6Hdww/exec';

/**
 * Form verilerini FormData'dan düz JavaScript objesine çevirir
 * @param {FormData} formData - FormData objesi
 * @returns {Object} - Düz JavaScript objesi
 */
function formDataToObject(formData) {
    const obj = {};
    for (let [key, value] of formData.entries()) {
        // Honeypot alanlarını atla
        if (key === '_gotcha') {
            continue;
        }
        
        // Checkbox'lar için özel işlem
        if (obj[key]) {
            // Eğer zaten bir değer varsa, array yap
            if (Array.isArray(obj[key])) {
                obj[key].push(value);
            } else {
                obj[key] = [obj[key], value];
            }
        } else {
            obj[key] = value;
        }
    }
    return obj;
}

/**
 * Form gönderim işlemini yönetir
 * @param {Event} event - Submit event
 * @param {HTMLFormElement} form - Form elementi
 * @param {string} webhookUrl - n8n webhook URL'i
 * @param {string} messageElementId - Mesaj gösterecek element ID'si
 */
async function handleFormSubmit(event, form, webhookUrl, messageElementId) {
    event.preventDefault();
    event.stopPropagation(); // Event'in yayılmasını durdur
    
    // Form zaten gönderildiyse tekrar gönderme
    if (form.dataset.submitting === 'true') {
        console.log('Form zaten gönderiliyor, tekrar gönderme engellendi');
        return;
    }
    
    console.log('Form submit başladı', form.id);
    
    // Form gönderiliyor flag'i
    form.dataset.submitting = 'true';
    
    // Submit butonunu bul ve disable et
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Gönder';
    const originalDisabled = submitBtn ? submitBtn.disabled : false;
    
    // Butonu disable et ve gönderiliyor mesajını göster
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Gönderiliyor...';
    }
    
    // Mesaj alanını temizle ve gizle
    const messageElement = document.getElementById(messageElementId);
    if (messageElement) {
        messageElement.classList.add('hidden');
        messageElement.textContent = '';
        messageElement.className = 'hidden mb-6 p-4 rounded-lg';
    }
    
    // Form validasyonu
    if (!form.checkValidity()) {
        form.reportValidity();
        // Form flag'ini kaldır
        form.dataset.submitting = 'false';
        // Butonu tekrar aktif et
        if (submitBtn) {
            submitBtn.disabled = originalDisabled;
            submitBtn.textContent = originalText;
        }
        return;
    }
    
    // Şifre doğrulaması (eğer şifre alanları varsa)
    const sifreInput = form.querySelector('#sifre');
    const sifreTekrarInput = form.querySelector('#sifreTekrar');
    
    if (sifreInput && sifreTekrarInput) {
        const sifre = sifreInput.value;
        const sifreTekrar = sifreTekrarInput.value;
        
        if (sifre !== sifreTekrar) {
            // Form flag'ini kaldır
            form.dataset.submitting = 'false';
            // Hata mesajını göster
            if (messageElement) {
                messageElement.textContent = 'Şifreler eşleşmiyor!';
                messageElement.className = 'mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700';
                messageElement.classList.remove('hidden');
            }
            // Butonu tekrar aktif et
            if (submitBtn) {
                submitBtn.disabled = originalDisabled;
                submitBtn.textContent = originalText;
            }
            return;
        }
    }
    
    try {
        console.log('Form verileri okunuyor...');
        
        // Form verilerini oku
        const formData = new FormData(form);
        const formDataObj = formDataToObject(formData);
        
        // Şifre tekrar alanını JSON'dan çıkar (sadece şifre gönderilsin)
        if (formDataObj.sifreTekrar) {
            delete formDataObj.sifreTekrar;
        }
        
        // Şifre alanını ekle (eğer varsa)
        if (sifreInput && sifreInput.value) {
            formDataObj.sifre = sifreInput.value;
        }
        
        // Konsola log yaz
        console.log(`${form.id} formu gönderildi`, formDataObj);
        
        // JSON'a çevir
        const jsonPayload = JSON.stringify(formDataObj);
        
        // Google Apps Script Web App'e POST isteği gönder
        // Google Apps Script CORS sorununu çözmek için form-urlencoded kullanıyoruz
        const formDataUrlEncoded = new URLSearchParams();
        Object.keys(formDataObj).forEach(key => {
            formDataUrlEncoded.append(key, formDataObj[key]);
        });
        
        // JSON verisini de ayrı bir parametre olarak gönder (raw_kayit_json için)
        formDataUrlEncoded.append('jsonData', jsonPayload);
        
        // Form tipini ekle (kurye veya isletme)
        let formType = 'kurye';
        if (form.id === 'kurye-form' || form.id === 'kuryeForm') {
            formType = 'kurye';
        } else if (form.id === 'isletme-form' || form.id === 'isletmeForm') {
            // Lojistik kontrolü
            const lojistikCheckbox = form.querySelector('#lojistikFirmasi');
            if (lojistikCheckbox && lojistikCheckbox.checked) {
                formType = 'lojistik';
                formDataUrlEncoded.append('lojistikFirmasi', 'true');
                // Lojistik kaydı için işletme türünü otomatik "Lojistik" olarak ayarla
                formDataUrlEncoded.set('tur', 'Lojistik');
                console.log('Lojistik kaydı: İşletme türü otomatik olarak "Lojistik" olarak ayarlandı');
            } else {
                formType = 'isletme';
            }
        }
        
        formDataUrlEncoded.append('action', 'register');
        formDataUrlEncoded.append('formType', formType);
        
        console.log('Google Apps Script\'e istek gönderiliyor...', webhookUrl, 'Form tipi:', formType);
        
        // Google Apps Script'e gönder
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formDataUrlEncoded
        })
        .then(async (response) => {
            console.log('Response alındı:', response.status);
            // Response'u oku
            try {
                const responseText = await response.text();
                console.log('Response text:', responseText);
                
                if (responseText) {
                    try {
                        const responseData = JSON.parse(responseText);
                        console.log(`${form.id} formu response:`, responseData);
                        
                        // Hata kontrolü
                        if (!responseData.success) {
                            console.error(`${form.id} formu hatası:`, responseData.error || responseData.message);
                            
                            // Form flag'ini kaldır
                            form.dataset.submitting = 'false';
                            
                            // Butonu aktif et
                            if (submitBtn) {
                                submitBtn.disabled = originalDisabled;
                                submitBtn.textContent = originalText;
                            }
                            
                            // Hata mesajını göster
                            if (messageElement) {
                                messageElement.textContent = 'Kayıt sırasında hata oluştu: ' + (responseData.error || responseData.message || 'Bilinmeyen hata');
                                messageElement.className = 'mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700';
                                messageElement.classList.remove('hidden');
                            }
                            return;
                        }
                        
                        // Başarılı mesajı göster
                        if (messageElement) {
                            messageElement.textContent = 'Kaydınız başarıyla alındı! Yönlendiriliyorsunuz...';
                            messageElement.className = 'mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700';
                            messageElement.classList.remove('hidden');
                        }
                        
                        // Butonu "Kayıt Başarılı" yap ve disabled tut
                        if (submitBtn) {
                            submitBtn.textContent = 'Kayıt Başarılı ✓';
                            submitBtn.disabled = true;
                            submitBtn.classList.add('bg-green-600', 'cursor-not-allowed');
                            submitBtn.classList.remove('hover:bg-red-600');
                        }
                        
                        // Formu disable et (tekrar gönderilmesini önle)
                        const formInputs = form.querySelectorAll('input, select, textarea');
                        formInputs.forEach(input => {
                            input.disabled = true;
                        });
                        
                        // ID varsa başarı modalını göster ve yönlendir
                        if (responseData.success && responseData.id) {
                            const profileId = responseData.id;
                            
                            // Form tipini tekrar belirle (lojistik kontrolü ile)
                            // Önce daha önce belirlenen formType'ı kullan, yoksa tekrar kontrol et
                            let finalFormType = formType; // handleFormSubmit içinde belirlenen formType'ı kullan
                            
                            // Eğer formType belirlenmemişse veya isletme formuysa lojistik kontrolü yap
                            if (form.id === 'isletme-form' || form.id === 'isletmeForm') {
                                const lojistikCheckbox = form.querySelector('#lojistikFirmasi');
                                if (lojistikCheckbox && lojistikCheckbox.checked) {
                                    finalFormType = 'lojistik';
                                } else {
                                    finalFormType = 'isletme';
                                }
                            } else if (form.id === 'kurye-form' || form.id === 'kuryeForm') {
                                finalFormType = 'kurye';
                            }
                            
                            console.log('=== KAYIT BAŞARILI ===');
                            console.log('Form ID:', form.id);
                            console.log('Form Tipi:', finalFormType);
                            console.log('Profile ID:', profileId);
                            console.log('Yönlendirme URL:', finalFormType === 'kurye' ? `kurye-kart.html?id=${profileId}` : (finalFormType === 'lojistik' ? `lojistik-kart.html?id=${profileId}` : `isletme-kart.html?id=${profileId}`));
                            
                            // LocalStorage'a kullanıcı bilgilerini kaydet
                            localStorage.setItem('kuryes_user_id', profileId);
                            localStorage.setItem('kuryes_user_type', finalFormType);
                            localStorage.setItem('kuryes_logged_in', 'true');
                            console.log('Kullanıcı bilgileri localStorage\'a kaydedildi:', { id: profileId, type: finalFormType });
                            
                            // Başarı modalını göster
                            showSuccessModal(profileId, finalFormType);
                        }
                    } catch (parseError) {
                        console.error(`${form.id} formu JSON parse hatası:`, parseError, 'Response:', responseText);
                        
                        // Form flag'ini kaldır
                        form.dataset.submitting = 'false';
                        
                        // Butonu aktif et
                        if (submitBtn) {
                            submitBtn.disabled = originalDisabled;
                            submitBtn.textContent = originalText;
                        }
                        
                        // Hata mesajını göster
                        if (messageElement) {
                            messageElement.textContent = 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.';
                            messageElement.className = 'mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700';
                            messageElement.classList.remove('hidden');
                        }
                    }
                } else {
                    console.error(`${form.id} formu: Response boş`);
                    
                    // Form flag'ini kaldır
                    form.dataset.submitting = 'false';
                    
                    // Butonu aktif et
                    if (submitBtn) {
                        submitBtn.disabled = originalDisabled;
                        submitBtn.textContent = originalText;
                    }
                }
            } catch (e) {
                console.error(`${form.id} formu gönderilirken hata oluştu:`, e);
                
                // Form flag'ini kaldır
                form.dataset.submitting = 'false';
                
                // Butonu aktif et
                if (submitBtn) {
                    submitBtn.disabled = originalDisabled;
                    submitBtn.textContent = originalText;
                }
                
                // Hata mesajını göster
                if (messageElement) {
                    messageElement.textContent = 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.';
                    messageElement.className = 'mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700';
                    messageElement.classList.remove('hidden');
                }
            }
        })
        .catch((error) => {
            console.error(`${form.id} formu gönderilirken hata oluştu:`, error);
            
            // Form flag'ini kaldır
            form.dataset.submitting = 'false';
            
            // Butonu aktif et
            if (submitBtn) {
                submitBtn.disabled = originalDisabled;
                submitBtn.textContent = originalText;
            }
            
            // Hata mesajını göster
            if (messageElement) {
                messageElement.textContent = 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.';
                messageElement.className = 'mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700';
                messageElement.classList.remove('hidden');
            }
        });
        
    } catch (error) {
        console.error(`${form.id} formu gönderilirken hata oluştu:`, error);
        
        // Form flag'ini kaldır
        form.dataset.submitting = 'false';
        
        // Butonu aktif et
        if (submitBtn) {
            submitBtn.disabled = originalDisabled;
            submitBtn.textContent = originalText;
        }
        
        // Hata mesajını göster
        if (messageElement) {
            messageElement.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin veya daha sonra tekrar deneyin.';
            messageElement.className = 'mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700';
            messageElement.classList.remove('hidden');
        }
    }
}

/**
 * Başarı modalını gösterir ve yönlendirme yapar
 */
function showSuccessModal(profileId, formType) {
    // Modal elementlerini bul veya oluştur
    let modal = document.getElementById('kayitModal');
    if (!modal) {
        // Modal yoksa oluştur
        modal = document.createElement('div');
        modal.id = 'kayitModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeInUp">
                <div class="text-center">
                    <div id="kayitModalSpinner" class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 id="kayitModalTitle" class="text-2xl font-bold text-text mb-2">Kaydınız Yükleniyor</h3>
                    <p id="kayitModalMessage" class="text-muted">Lütfen bekleyin...</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const spinner = document.getElementById('kayitModalSpinner');
    const title = document.getElementById('kayitModalTitle');
    const message = document.getElementById('kayitModalMessage');
    
    // Modal'ı göster
    modal.classList.remove('hidden');
    
    // Başarı mesajını göster
    setTimeout(() => {
        if (spinner) spinner.classList.add('hidden');
        if (title) title.textContent = 'Kayıt Başarılı! ✓';
        if (title) title.className = 'text-2xl font-bold text-green-600 mb-2';
        if (message) message.textContent = 'Profil kartınıza yönlendiriliyorsunuz...';
        if (message) message.className = 'text-muted';
        
        // Yönlendirme
        setTimeout(() => {
            let redirectUrl = '';
            console.log('Yönlendirme yapılıyor, formType:', formType, 'profileId:', profileId);
            
            if (formType === 'kurye') {
                redirectUrl = `kurye-kart.html?id=${profileId}`;
            } else if (formType === 'lojistik') {
                redirectUrl = `lojistik-kart.html?id=${profileId}`;
            } else if (formType === 'isletme') {
                redirectUrl = `isletme-kart.html?id=${profileId}`;
            } else {
                // Fallback: varsayılan olarak işletme kartına yönlendir
                redirectUrl = `isletme-kart.html?id=${profileId}`;
            }
            
            console.log('Yönlendirme URL:', redirectUrl);
            window.location.href = redirectUrl;
        }, 2000);
    }, 500);
}

// DOM yüklendiğinde form event'lerini bağla
document.addEventListener('DOMContentLoaded', function() {
    console.log('kuryes-forms.js yüklendi');
    
    // Kurye formu (hem kurye-form hem kuryeForm ID'leri için)
    const kuryeForm = document.getElementById('kurye-form') || document.getElementById('kuryeForm');
    console.log('Kurye form bulundu:', kuryeForm);
    if (kuryeForm) {
        kuryeForm.addEventListener('submit', function(event) {
            console.log('Kurye form submit event tetiklendi');
            handleFormSubmit(event, kuryeForm, KURYE_WEBHOOK_URL, 'kurye-form-message');
        });
    }
    
    // İşletme formu (hem isletme-form hem isletmeForm ID'leri için)
    const isletmeForm = document.getElementById('isletme-form') || document.getElementById('isletmeForm');
    console.log('İşletme form bulundu:', isletmeForm);
    if (isletmeForm) {
        isletmeForm.addEventListener('submit', function(event) {
            console.log('İşletme form submit event tetiklendi');
            handleFormSubmit(event, isletmeForm, ISLETME_WEBHOOK_URL, 'isletme-form-message');
        });
    }
});

