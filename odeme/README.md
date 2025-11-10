# JetlaApp - Ödeme Demo

Bu klasör, JetlaApp için bağımsız bir PWA ödeme demo sayfası içerir.

## Dosyalar

- `odeme.html` - Ana ödeme sayfası (tek dosya, HTML+CSS+JS)
- `manifest.json` - PWA manifest dosyası
- `service-worker.js` - PWA service worker (sadece bu sayfa için)
- `icon-generator.html` - Icon dosyalarını oluşturmak için tarayıcı aracı
- `generate-icons.js` - Icon dosyalarını oluşturmak için Node.js scripti (opsiyonel)
- `favicon-16x16.png` - 16x16 favicon (oluşturulması gerekiyor)
- `favicon-32x32.png` - 32x32 favicon (oluşturulması gerekiyor)
- `favicon-64x64.png` - 64x64 favicon (oluşturulması gerekiyor)
- `icon-192.png` - 192x192 PWA icon (oluşturulması gerekiyor)
- `icon-512.png` - 512x512 PWA icon (oluşturulması gerekiyor)

## Kurulum

1. **Icon Dosyalarını Oluşturma:**
   
   **Yöntem 1: Tarayıcı ile (Önerilen)**
   - `icon-generator.html` dosyasını tarayıcıda açın
   - Favicon bölümünden: "16x16 İndir", "32x32 İndir", "64x64 İndir" butonlarına tıklayın
   - PWA Icons bölümünden: "192x192 İndir" ve "512x512 İndir" butonlarına tıklayın
   - İndirilen tüm dosyaları `odeme` klasörüne kaydedin
   
   **Yöntem 2: Node.js ile (Opsiyonel)**
   - `npm install canvas` komutu ile canvas paketini yükleyin
   - `node generate-icons.js` komutunu çalıştırın
   - Icon dosyaları otomatik olarak oluşturulacaktır

2. **Test Etme:**
   - `odeme.html` dosyasını bir web sunucusunda açın (localhost veya GitHub Pages)
   - HTTPS gereklidir (PWA için)
   - Tarayıcıda "Masaüstüne Ekle" seçeneği görünecektir

## Özellikler

- ✅ Tamamen mobil uyumlu
- ✅ PWA desteği (offline çalışabilir)
- ✅ Bağımsız uygulama (Kuryes ile bağlantısız)
- ✅ Demo modu (Başarılı/Başarısız simülasyonu)
- ✅ QR kod ve ödeme linki gösterimi
- ✅ Animasyonlu geçişler

## GitHub'a Yükleme

Tüm `odeme` klasörünü GitHub'a yükleyebilirsiniz. GitHub Pages ile yayınlamak için:

1. Repository Settings > Pages
2. Source: `main` branch, `/odeme` folder
3. URL: `https://yourusername.github.io/repo-name/odeme/odeme.html`

## Notlar

- Service Worker sadece `/odeme/` klasörü için çalışır
- Manifest.json bağımsız bir uygulama olarak görünmesini sağlar
- Masaüstüne eklerken "JetlaApp" olarak görünecektir

