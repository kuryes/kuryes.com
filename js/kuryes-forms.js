// Kuryes.com - Form Submission Handler for Google Sheets
// Handles form submissions for kurye and isletme registration forms

// Google Apps Script Web App URL'leri
// TODO: Yeni Google Apps Script URL'i eklenecek
const KURYE_WEBHOOK_URL = '';
const ISLETME_WEBHOOK_URL = '';

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
        const formType = form.id === 'kurye-form' ? 'kurye' : 'isletme';
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
                        
                        // ID varsa profil kartı sayfasına yönlendir
                        if (responseData.success && responseData.id) {
                            const profileId = responseData.id;
                            const formType = form.id === 'kurye-form' ? 'kurye' : 'isletme';
                            
                            // LocalStorage'a kullanıcı bilgilerini kaydet
                            localStorage.setItem('kuryes_user_id', profileId);
                            localStorage.setItem('kuryes_user_type', formType);
                            localStorage.setItem('kuryes_logged_in', 'true');
                            console.log('Kullanıcı bilgileri localStorage\'a kaydedildi:', { id: profileId, type: formType });
                            
                            setTimeout(() => {
                                if (formType === 'kurye') {
                                    window.location.href = `kurye-kart.html?id=${profileId}`;
                                } else {
                                    window.location.href = `isletme-kart.html?id=${profileId}`;
                                }
                            }, 1500); // 1.5 saniye sonra yönlendir
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

// DOM yüklendiğinde form event'lerini bağla
document.addEventListener('DOMContentLoaded', function() {
    console.log('kuryes-forms.js yüklendi');
    
    // Kurye formu
    const kuryeForm = document.getElementById('kurye-form');
    console.log('Kurye form bulundu:', kuryeForm);
    if (kuryeForm) {
        kuryeForm.addEventListener('submit', function(event) {
            console.log('Kurye form submit event tetiklendi');
            handleFormSubmit(event, kuryeForm, KURYE_WEBHOOK_URL, 'kurye-form-message');
        });
    }
    
    // İşletme formu
    const isletmeForm = document.getElementById('isletme-form');
    console.log('İşletme form bulundu:', isletmeForm);
    if (isletmeForm) {
        isletmeForm.addEventListener('submit', function(event) {
            console.log('İşletme form submit event tetiklendi');
            handleFormSubmit(event, isletmeForm, ISLETME_WEBHOOK_URL, 'isletme-form-message');
        });
    }
});

