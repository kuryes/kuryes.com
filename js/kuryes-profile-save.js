// Kuryes.com - Profile Save Handler
// Profil kartındaki değişiklikleri Google Sheets'e kaydeder

// Google Apps Script Web App URL'i (güncelleme için)
const PROFILE_UPDATE_URL = 'https://script.google.com/macros/s/AKfycbyP4rGbVDXG8-xli6QPv4YXaHgiCyCoCr5UvdJtYJyTi2RWfFx-rqUd-ZtTQiMsz6Hdww/exec';

/**
 * Form verilerini FormData'dan düz JavaScript objesine çevirir
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
 * Profil kartı verilerini Google Sheets'e kaydeder
 */
async function saveProfileToSheet(profileId, formData, formType) {
    try {
        // Form verilerini objeye çevir
        const formDataObj = formDataToObject(formData);
        
        // JSON verisini hazırla
        const jsonPayload = JSON.stringify(formDataObj);
        
        // Form-urlencoded olarak hazırla
        const formDataUrlEncoded = new URLSearchParams();
        formDataUrlEncoded.append('action', 'update'); // Güncelleme işlemi
        formDataUrlEncoded.append('id', profileId);
        formDataUrlEncoded.append('formType', formType);
        formDataUrlEncoded.append('jsonData', jsonPayload);
        
        // Tüm form verilerini de ekle
        Object.keys(formDataObj).forEach(key => {
            formDataUrlEncoded.append(key, formDataObj[key]);
        });
        
        console.log('Profil güncelleniyor:', profileId, formType);
        
        // Google Apps Script'e gönder
        const response = await fetch(PROFILE_UPDATE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formDataUrlEncoded
        });
        
        const responseText = await response.text();
        console.log('Güncelleme response:', responseText);
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = { success: true, message: responseText };
        }
        
        return responseData;
        
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        throw error;
    }
}

// Kurye kartı için kaydetme işlevi
function setupKuryeProfileSave() {
    const form = document.getElementById('kuryeKartForm');
    const confirmSaveBtn = document.getElementById('confirmSaveBtn');
    
    if (!form || !confirmSaveBtn) {
        console.log('Kurye form veya confirmSaveBtn bulunamadı');
        return;
    }
    
    // Mevcut click handler'ını almak için bir flag kullan
    let originalHandler = null;
    let handlerAttached = false;
    
    // Butona yeni bir event listener ekle (öncelikli)
    confirmSaveBtn.addEventListener('click', async function(e) {
        // Eğer zaten işlem yapılıyorsa, mevcut handler'ı çalıştırma
        if (handlerAttached) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        // ID'yi URL'den al
        const urlParams = new URLSearchParams(window.location.search);
        const profileId = urlParams.get('id');
        const kuryeEditorSaveBtn = document.getElementById('kuryeEditorSaveBtn');
        const kuryeEditorSaveBtnOriginalText = kuryeEditorSaveBtn ? kuryeEditorSaveBtn.textContent : '';
        
        if (!profileId) {
            alert('Profil ID bulunamadı!');
            return;
        }
        
        // Form validasyonu
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Flag'i set et (çift tıklamayı önle)
        handlerAttached = true;
        
        // Butonu disable et
        confirmSaveBtn.disabled = true;
        const originalText = confirmSaveBtn.textContent;
        confirmSaveBtn.textContent = 'Kaydediliyor...';
        if (kuryeEditorSaveBtn) {
            kuryeEditorSaveBtn.disabled = true;
            kuryeEditorSaveBtn.textContent = 'Kaydediliyor...';
        }
        
        try {
            // Form verilerini topla (mevcut handler'daki gibi)
            const formData = new FormData(form);
            
            // Kurye ID'yi ekle
            formData.append('kuryeId', profileId);
            
            // Acil müsaitlik durumunu ekle
            const acilMusaitlikCheck = document.getElementById('acilMusaitlikCheck');
            if (acilMusaitlikCheck) {
                formData.append('acilMusaitlik', acilMusaitlikCheck.checked ? '1' : '0');
                
                if (acilMusaitlikCheck.checked) {
                    const acilMusaitlikSaatlikCheck = document.getElementById('acilMusaitlikSaatlikCheck');
                    const acilMusaitlikSaatlikInput = document.getElementById('acilMusaitlikSaatlikUcret');
                    const acilMusaitlikKmCheck = document.getElementById('acilMusaitlikKmCheck');
                    const acilMusaitlikKmInput = document.getElementById('acilMusaitlikKmUcret');
                    const acilMusaitlikPaketCheck = document.getElementById('acilMusaitlikPaketCheck');
                    const acilMusaitlikPaketInput = document.getElementById('acilMusaitlikPaketUcret');
                    
                    if (acilMusaitlikSaatlikCheck && acilMusaitlikSaatlikCheck.checked && acilMusaitlikSaatlikInput) {
                        formData.append('acilMusaitlikSaatlikUcret', acilMusaitlikSaatlikInput.value || '');
                    }
                    if (acilMusaitlikKmCheck && acilMusaitlikKmCheck.checked && acilMusaitlikKmInput) {
                        formData.append('acilMusaitlikKmUcret', acilMusaitlikKmInput.value || '');
                    }
                    if (acilMusaitlikPaketCheck && acilMusaitlikPaketCheck.checked && acilMusaitlikPaketInput) {
                        formData.append('acilMusaitlikPaketUcret', acilMusaitlikPaketInput.value || '');
                    }
                    
                    const acilMusaitlikBaslangicSaati = document.getElementById('acilMusaitlikBaslangicSaati');
                    const acilMusaitlikCikisSaati = document.getElementById('acilMusaitlikCikisSaati');
                    if (acilMusaitlikBaslangicSaati) {
                        formData.append('acilMusaitlikBaslangicSaati', acilMusaitlikBaslangicSaati.value || '');
                    }
                    if (acilMusaitlikCikisSaati) {
                        formData.append('acilMusaitlikCikisSaati', acilMusaitlikCikisSaati.value || '');
                    }
                    
                    const acilMusaitlikOtomatikMesaj = document.getElementById('acilMusaitlikOtomatikMesaj');
                    if (acilMusaitlikOtomatikMesaj) {
                        formData.append('acilMusaitlikOtomatikMesaj', acilMusaitlikOtomatikMesaj.value || '');
                    }
                    
                    const acilMusaitlikEkBilgiler = document.getElementById('acilMusaitlikEkBilgiler');
                    if (acilMusaitlikEkBilgiler) {
                        formData.append('acilMusaitlikEkBilgiler', acilMusaitlikEkBilgiler.value || '');
                    }
                }
            }
            
            // Plaka bilgisini ekle (motorPlaka veya plaka ID'si olabilir)
            const plakaInput = document.getElementById('plaka') || document.getElementById('motorPlaka');
            if (plakaInput) {
                const plakaValue = plakaInput.value || '';
                formData.append('plaka', plakaValue);
                console.log('Plaka eklendi:', plakaValue);
            } else {
                console.log('Plaka input bulunamadı');
            }
            
            // Görünürlük checkbox'larını ekle
            const plakaGorunur = document.getElementById('plakaGorunur');
            const telefonGorunur = document.getElementById('telefonGorunur');
            const whatsappGorunur = document.getElementById('whatsappGorunur');
            if (plakaGorunur) {
                formData.append('plakaGorunur', plakaGorunur.checked ? '1' : '0');
            }
            if (telefonGorunur) {
                formData.append('telefonGorunur', telefonGorunur.checked ? '1' : '0');
            }
            if (whatsappGorunur) {
                formData.append('whatsappGorunur', whatsappGorunur.checked ? '1' : '0');
            }
            
            // Deneyimleri JSON olarak ekle (window.deneyimler veya deneyimler değişkeni varsa)
            const deneyimlerArray = window.deneyimler || (typeof deneyimler !== 'undefined' ? deneyimler : []);
            // Deneyimler boş olsa bile gönder (kullanıcı deneyim eklememiş olabilir ama yine de kaydedilmeli)
            if (deneyimlerArray && Array.isArray(deneyimlerArray)) {
                formData.append('deneyimler', JSON.stringify(deneyimlerArray));
                console.log('Deneyimler eklendi:', deneyimlerArray.length, 'adet');
            } else {
                // Boş array gönder
                formData.append('deneyimler', JSON.stringify([]));
                console.log('Deneyimler bulunamadı, boş array gönderiliyor');
            }
            
            // Profil verilerini Google Sheets'e kaydet
            const result = await saveProfileToSheet(profileId, formData, 'kurye');
            
            if (result.success) {
                // Başarı mesajı göster
                const successMessage = document.getElementById('successMessage');
                if (successMessage) {
                    successMessage.classList.remove('hidden');
                }
                
                // Modal'ı kapat
                const kuryePreviewModal = document.getElementById('kuryePreviewModal');
                if (kuryePreviewModal) {
                    kuryePreviewModal.classList.add('hidden');
                }
                
                const kuryeEditorModal = document.getElementById('kuryeEditorModal');
                if (kuryeEditorModal) {
                    kuryeEditorModal.classList.add('hidden');
                    document.body.classList.remove('overflow-hidden');
                    document.documentElement.classList.remove('overflow-hidden');
                }
                
                // Profil görünümünü güncelle (eğer fonksiyon varsa)
                if (typeof updateProfileDisplay === 'function') {
                    updateProfileDisplay();
                }
                
                console.log('Profil başarıyla güncellendi:', result);
                
                // Success message'ı 3 saniye sonra gizle
                setTimeout(() => {
                    if (successMessage) {
                        successMessage.classList.add('hidden');
                    }
                }, 3000);
            } else {
                alert('Profil güncellenirken hata oluştu: ' + (result.error || result.message));
            }
            
        } catch (error) {
            console.error('Profil kaydetme hatası:', error);
            alert('Profil kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            // Flag'i sıfırla
            handlerAttached = false;
            // Butonu tekrar aktif et
            confirmSaveBtn.disabled = false;
            confirmSaveBtn.textContent = originalText;
            if (kuryeEditorSaveBtn) {
                kuryeEditorSaveBtn.disabled = false;
                kuryeEditorSaveBtn.textContent = kuryeEditorSaveBtnOriginalText || 'Kaydet';
            }
        }
    }, true); // capture phase'de çalıştır (öncelikli)
    
    console.log('Kurye profil kaydetme işlevi kuruldu');
}

// İşletme kartı için kaydetme işlevi
function setupIsletmeProfileSave() {
    const form = document.getElementById('isletmeKartForm');
    const confirmSaveBtn = document.getElementById('confirmSaveBtn');
    
    if (!form || !confirmSaveBtn) {
        console.log('İşletme form veya confirmSaveBtn bulunamadı');
        return;
    }
    
    // Flag for preventing double clicks
    let handlerAttached = false;
    
    // Butona yeni bir event listener ekle (öncelikli)
    confirmSaveBtn.addEventListener('click', async function(e) {
        // Eğer zaten işlem yapılıyorsa, mevcut handler'ı çalıştırma
        if (handlerAttached) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        // ID'yi URL'den al
        const urlParams = new URLSearchParams(window.location.search);
        const profileId = urlParams.get('id');
        
        if (!profileId) {
            alert('Profil ID bulunamadı!');
            return;
        }
        
        // Form validasyonu
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Flag'i set et (çift tıklamayı önle)
        handlerAttached = true;
        
        // Butonu disable et
        confirmSaveBtn.disabled = true;
        const originalText = confirmSaveBtn.textContent;
        confirmSaveBtn.textContent = 'Kaydediliyor...';
        
        try {
            // Form verilerini topla
            const cepInput = document.getElementById('cep');
            const iletisimYetkiliTelefon = document.getElementById('iletisimYetkiliTelefon');
            const wasCepDisabled = cepInput ? cepInput.disabled : false;
            if (cepInput && wasCepDisabled) {
                cepInput.disabled = false;
            }
            
            const formData = new FormData(form);
            
            if (cepInput && wasCepDisabled) {
                cepInput.disabled = true;
            }
            
            // İşletme ID'yi ekle
            formData.append('isletmeId', profileId);
            
            // Acil kurye durumunu ekle
            const acilKuryeCheck = document.getElementById('acilKuryeCheck');
            if (acilKuryeCheck) {
                formData.append('acilKurye', acilKuryeCheck.checked ? '1' : '0');
                
                if (acilKuryeCheck.checked) {
                    // Acil kurye ücret parametreleri
                    const acilSaatlikCheck = document.getElementById('acilSaatlikCheck');
                    const acilSaatlikInput = document.getElementById('acilSaatlikUcret');
                    const acilKmCheck = document.getElementById('acilKmCheck');
                    const acilKmInput = document.getElementById('acilKmUcret');
                    const acilPaketCheck = document.getElementById('acilPaketCheck');
                    const acilPaketInput = document.getElementById('acilPaketUcret');
                    
                    if (acilSaatlikCheck && acilSaatlikCheck.checked && acilSaatlikInput) {
                        formData.append('acilSaatlikUcret', acilSaatlikInput.value || '');
                    }
                    if (acilKmCheck && acilKmCheck.checked && acilKmInput) {
                        formData.append('acilKmUcret', acilKmInput.value || '');
                    }
                    if (acilPaketCheck && acilPaketCheck.checked && acilPaketInput) {
                        formData.append('acilPaketUcret', acilPaketInput.value || '');
                    }
                    
                    // Acil kurye saatleri
                    const acilBaslangicSaati = document.getElementById('acilBaslangicSaati');
                    const acilCikisSaati = document.getElementById('acilCikisSaati');
                    if (acilBaslangicSaati) {
                        formData.append('acilBaslangicSaati', acilBaslangicSaati.value || '');
                    }
                    if (acilCikisSaati) {
                        formData.append('acilCikisSaati', acilCikisSaati.value || '');
                    }
                    
                    // Acil kurye mesaj ve ek bilgiler
                    const acilOtomatikMesaj = document.getElementById('acilOtomatikMesaj');
                    if (acilOtomatikMesaj) {
                        formData.append('acilOtomatikMesaj', acilOtomatikMesaj.value || '');
                    }
                    
                    const acilEkBilgiler = document.getElementById('acilEkBilgiler');
                    if (acilEkBilgiler) {
                        formData.append('acilEkBilgiler', acilEkBilgiler.value || '');
                    }
                }
            }
            
            // WhatsApp ve görünürlük ayarları
            const whatsappInput = document.getElementById('whatsapp') || document.getElementById('cep');
            if (whatsappInput) {
                formData.append('whatsapp', whatsappInput.value || '');
            }
            
            const telefonGorunur = document.getElementById('telefonGorunur') || document.getElementById('kuryeArayabilir');
            if (telefonGorunur) {
                formData.append('telefonGorunur', telefonGorunur.checked ? '1' : '0');
            }
            
            if (iletisimYetkiliTelefon) {
                formData.set('iletisimYetkiliTelefon', iletisimYetkiliTelefon.checked ? '1' : '0');
            }
            
            const whatsappGorunur = document.getElementById('whatsappGorunur');
            if (whatsappGorunur) {
                formData.append('whatsappGorunur', whatsappGorunur.checked ? '1' : '0');
            }
            
            // Profil verilerini Google Sheets'e kaydet
            const result = await saveProfileToSheet(profileId, formData, 'isletme');
            
            if (result.success) {
                // Başarı mesajı göster
                const successMessage = document.getElementById('successMessage');
                if (successMessage) {
                    successMessage.classList.remove('hidden');
                }
                
                // Modal'ı kapat
                const ilanPreviewModal = document.getElementById('ilanPreviewModal');
                if (ilanPreviewModal) {
                    ilanPreviewModal.classList.add('hidden');
                }
                
                const kartEditorModal = document.getElementById('kartEditorModal');
                if (kartEditorModal) {
                    kartEditorModal.classList.add('hidden');
                    document.body.classList.remove('overflow-hidden');
                    document.documentElement.classList.remove('overflow-hidden');
                }
                
                // Profil görünümünü güncelle (eğer fonksiyon varsa)
                if (typeof updateProfileDisplay === 'function') {
                    updateProfileDisplay();
                }
                
                console.log('Profil başarıyla güncellendi:', result);
                
                // Success message'ı 3 saniye sonra gizle
                setTimeout(() => {
                    if (successMessage) {
                        successMessage.classList.add('hidden');
                    }
                }, 3000);
            } else {
                alert('Profil güncellenirken hata oluştu: ' + (result.error || result.message));
            }
            
        } catch (error) {
            console.error('Profil kaydetme hatası:', error);
            alert('Profil kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            // Flag'i sıfırla
            handlerAttached = false;
            // Butonu tekrar aktif et
            confirmSaveBtn.disabled = false;
            confirmSaveBtn.textContent = originalText;
        }
    }, true); // capture phase'de çalıştır (öncelikli)
    
    console.log('İşletme profil kaydetme işlevi kuruldu');
}

// Sayfa yüklendiğinde kaydetme işlevlerini kur
document.addEventListener('DOMContentLoaded', function() {
    // Biraz gecikme ile çalıştır (diğer script'lerin yüklenmesi için)
    setTimeout(() => {
        if (window.location.pathname.includes('kurye-kart.html') || 
            window.location.href.includes('kurye-kart.html')) {
            setupKuryeProfileSave();
        } else if (window.location.pathname.includes('isletme-kart.html') || 
                   window.location.href.includes('isletme-kart.html')) {
            setupIsletmeProfileSave();
        }
    }, 500);
});

