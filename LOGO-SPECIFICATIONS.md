# KURYΕS Logo - Format ve Kullanım Rehberi

## 📐 Önerilen Format: **SVG** (Öncelikli)

### ✅ SVG Avantajları:
- **Scalable**: Her boyutta keskin görünüm
- **Küçük dosya**: ~2-3 KB
- **CSS ile kontrol**: Renk değişikliği yapılabilir
- **Modern web standardı**: Tüm modern tarayıcılar destekler
- **Responsive**: Mobil/Desktop için ayrı dosya gerekmez

### 📁 Dosya Konumu:
```
public/img/logo.svg
```

### 🎨 Logo Özellikleri:
- **Metin**: "KURYΕS.com"
- **Font**: Poppins Bold (700)
- **Boyut**: 32px
- **Renkler**:
  - KURYΕS: `#FF3131` (Primary Red)
  - .com: `#00C8FF` (Accent Turquoise)

---

## 📐 Alternatif Format: **PNG** (İhtiyaç durumunda)

### PNG Kullanım Senaryoları:
- Favicon olarak kullanım
- Email signature
- Sosyal medya profil fotoğrafları
- Basılı materyaller

### 📏 PNG Boyutları (Önerilen):
1. **logo.png** - 200x60px (Normal kullanım)
2. **logo@2x.png** - 400x120px (Retina ekranlar)
3. **logo@4x.png** - 800x240px (Yüksek çözünürlük, print)

### 🎨 PNG Özellikleri:
- **Format**: PNG-24 (şeffaf arka plan)
- **Renk profili**: sRGB
- **Kalite**: 100% (lossless)

---

## 💻 HTML'de Kullanım

### SVG Kullanımı (Önerilen):
```html
<!-- Basit kullanım -->
<img src="public/img/logo.svg" alt="KURYΕS.com" class="h-8">

<!-- Inline SVG (daha fazla kontrol) -->
<a href="index.html" class="logo">
  <svg width="200" height="60" viewBox="0 0 200 60">
    <text x="0" y="42" class="text-primary font-bold text-2xl">KURYΕS</text>
    <text x="115" y="42" class="text-accent font-bold text-2xl">.com</text>
  </svg>
</a>
```

### PNG Kullanımı:
```html
<!-- Normal ekran -->
<img src="public/img/logo.png" 
     srcset="public/img/logo@2x.png 2x" 
     alt="KURYΕS.com" 
     class="h-8">

<!-- Responsive -->
<img src="public/img/logo.png" 
     srcset="public/img/logo@2x.png 2x, public/img/logo@4x.png 4x"
     alt="KURYΕS.com">
```

---

## 🎯 Site Yapısına Uygun Format Seçimi

### Mevcut Site Özellikleri:
- ✅ Static HTML site
- ✅ Tailwind CSS
- ✅ Mobile-first responsive
- ✅ PWA (Progressive Web App)
- ✅ SEO optimized

### Önerilen Format: **SVG**
Neden SVG?
1. **Performans**: Daha küçük dosya, hızlı yükleme
2. **Kalite**: Zoom'da bile keskin
3. **Responsive**: CSS ile boyut kontrolü kolay
4. **Modern**: 2025 web standartı
5. **Erişilebilirlik**: Screen reader uyumlu

---

## 📦 Logo Dosyaları

### Oluşturulması Gereken Dosyalar:

1. **SVG** (Zorunlu):
   - `public/img/logo.svg` ✅ (Oluşturuldu)

2. **PNG** (Opsiyonel - farklı kullanımlar için):
   - `public/img/logo.png` (200x60px)
   - `public/img/logo@2x.png` (400x120px)
   - `public/img/logo@4x.png` (800x240px)

3. **Favicon** (İsteğe bağlı):
   - `public/favicon/logo-16x16.png`
   - `public/favicon/logo-32x32.png`

---

## 🛠️ PNG Oluşturma Yöntemleri

### 1. Browser Converter (Hazır):
`logo-to-png.html` dosyasını tarayıcıda açın ve PNG indirin.

### 2. Online Tools:
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com/
- https://convertio.co/svg-png/

### 3. Design Software:
- **Figma**: SVG'yi aç → Export → PNG
- **Inkscape**: File → Export PNG Image
- **Adobe Illustrator**: File → Export → Export for Screens

---

## 📋 Checklist

- [x] SVG logo oluşturuldu (`public/img/logo.svg`)
- [ ] PNG logo oluşturuldu (200x60)
- [ ] PNG @2x oluşturuldu (400x120)
- [ ] HTML'de logo entegrasyonu yapıldı (opsiyonel)
- [ ] Favicon versiyonları oluşturuldu (opsiyonel)

---

## 💡 Sonuç

**Önerilen format: SVG**
- En uygun: Modern web, responsive, performanslı
- Dosya: `public/img/logo.svg` ✅

**PNG ne zaman gerekli?**
- Favicon olarak
- Email signature
- Sosyal medya
- Basılı materyaller

