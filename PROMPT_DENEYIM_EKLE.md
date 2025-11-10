# Deneyim Ekle Checkbox Sorunu - Çözüm Prompt'u

## Sorun
`kurye-kart.html` dosyasında "Deneyim Ekle" checkbox'ı çalışmıyor. Checkbox işaretlendiğinde form görünmüyor/gizlenmiyor.

## Mevcut Durum

### HTML Yapısı
```html
<!-- Deneyim Ekle -->
<div>
    <label for="deneyimEkleCheck" class="flex items-center mb-3 cursor-pointer">
        <input type="checkbox" id="deneyimEkleCheck" class="mr-2 w-4 h-4">
        <span class="text-sm font-medium">Deneyim Ekle</span>
    </label>
    
    <!-- Deneyim Formu (Checkbox işaretliyse gösterilir) -->
    <div id="deneyimForm" class="hidden mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
        <!-- Form içeriği -->
    </div>
</div>
```

### Mevcut JavaScript Kodu
```javascript
// Deneyim Ekle checkbox ve form elementleri
const deneyimEkleCheck = document.getElementById('deneyimEkleCheck');
const deneyimForm = document.getElementById('deneyimForm');
const deneyimKaydet = document.getElementById('deneyimKaydet');

// Deneyim formunu göster/gizle fonksiyonu
function toggleDeneyimForm() {
    if (!deneyimEkleCheck || !deneyimForm) {
        console.error('Deneyim Ekle elementi bulunamadı!');
        return;
    }
    
    const isChecked = deneyimEkleCheck.checked;
    
    if (isChecked) {
        deneyimForm.classList.remove('hidden');
        setTimeout(() => {
            const sirketInput = document.getElementById('deneyimSirket');
            if (sirketInput) sirketInput.focus();
        }, 50);
    } else {
        deneyimForm.classList.add('hidden');
        const sirketInput = document.getElementById('deneyimSirket');
        const sureSelect = document.getElementById('deneyimSure');
        const gorevInput = document.getElementById('deneyimGorev');
        if (sirketInput) sirketInput.value = '';
        if (sureSelect) sureSelect.value = '';
        if (gorevInput) gorevInput.value = '';
    }
}

// Deneyim Ekle checkbox event listener'ları
if (deneyimEkleCheck && deneyimForm) {
    deneyimEkleCheck.addEventListener('change', toggleDeneyimForm);
    toggleDeneyimForm();
} else {
    console.error('Deneyim Ekle checkbox veya form bulunamadı!', {
        checkbox: deneyimEkleCheck,
        form: deneyimForm
    });
}
```

## Gereksinimler

1. **Checkbox işaretlendiğinde:**
   - `deneyimForm` div'i görünür olmalı (Tailwind `hidden` class'ı kaldırılmalı)
   - İlk input alanına (`deneyimSirket`) otomatik odaklanmalı

2. **Checkbox işareti kaldırıldığında:**
   - `deneyimForm` div'i gizlenmeli (`hidden` class'ı eklenmeli)
   - Tüm form alanları temizlenmeli

3. **Label'a tıklandığında da çalışmalı:**
   - Label `for="deneyimEkleCheck"` ile checkbox'a bağlı
   - Label tıklaması checkbox'ı tetiklemeli ve form görünmeli/gizlenmeli

4. **Sayfa yüklendiğinde:**
   - Checkbox işaretsizse form gizli olmalı
   - Checkbox işaretliyse form görünür olmalı

## Teknik Detaylar

- **Framework:** Vanilla JavaScript (jQuery yok)
- **CSS Framework:** Tailwind CSS
- **DOM Ready:** `DOMContentLoaded` event listener içinde çalışıyor
- **Form ID:** `deneyimForm`
- **Checkbox ID:** `deneyimEkleCheck`
- **Tailwind Class:** `hidden` class'ı ile görünürlük kontrol ediliyor

## Test Senaryoları

1. ✅ Checkbox'a tıklama → Form görünmeli
2. ✅ Label'a tıklama → Form görünmeli
3. ✅ Checkbox işareti kaldırma → Form gizlenmeli
4. ✅ Form gizlendikten sonra tekrar açma → Form alanları temiz olmalı
5. ✅ Sayfa yüklendiğinde checkbox işaretsiz → Form gizli olmalı

## Beklenen Çözüm

Checkbox'ın hem kendisine hem de label'a tıklandığında çalışan, güvenilir bir JavaScript kodu. Mümkünse:
- Hem `change` hem de `click` event'lerini kullan
- Label click event'ini de handle et
- Console'da hata kontrolü yap
- `toggleDeneyimForm` fonksiyonunu optimize et

## Önemli Notlar

- Kod `DOMContentLoaded` event listener içinde çalışıyor
- `deneyimler` array'i var ve `updateDeneyimListesi()` fonksiyonu var
- Form içinde: `deneyimSirket`, `deneyimSure`, `deneyimGorev` input'ları var
- `deneyimKaydet` butonu var ve çalışıyor (bu sorun değil)

## Dosya Yolu
`kurye-kart.html` dosyasının içinde, `DOMContentLoaded` event listener'ı içinde bu kod bulunuyor.

---

**Lütfen bu sorunu çöz ve çalışan bir kod sağla. Test ettiğinde checkbox'a tıklandığında formun görünür/gizli olması gerekiyor.**




