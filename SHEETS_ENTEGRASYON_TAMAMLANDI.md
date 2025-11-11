# Kuryes.com - Google Sheets Entegrasyonu Tamamlandı ✅

## Yapılan Değişiklikler

### 1. Google Apps Script Kodu (`google-apps-script.gs`)
✅ Benzersiz ID oluşturma (tahmin edilemez)
✅ Şifre hash'leme (SHA-256)
✅ Kurye, İşletme ve Lojistik kayıtları için ayrı sheet'ler
✅ Otomatik sheet oluşturma
✅ Profil verilerini çekme (doGet)
✅ Profil güncelleme (doPost)

### 2. Frontend Güncellemeleri

#### `js/kuryes-forms.js`
✅ Kayıt sonrası başarı modalı
✅ Otomatik yönlendirme
✅ Lojistik kontrolü
✅ Form ID uyumluluğu (kuryeForm ve kurye-form)

#### `js/kuryes-profile.js`
✅ Field mapping düzeltmeleri
✅ Lojistik kart desteği
✅ Veri yükleme iyileştirmeleri

#### `js/kuryes-profile-save.js`
✅ URL yorumları güncellendi

## Kurulum Adımları

### 1. Google Apps Script Kurulumu

1. [Google Apps Script](https://script.google.com/) sayfasına gidin
2. Yeni proje oluşturun
3. `google-apps-script.gs` dosyasındaki kodu kopyalayıp yapıştırın
4. **SPREADSHEET_ID** değişkenini güncelleyin:
   ```javascript
   const SPREADSHEET_ID = '1EiJ7NKJiOALghn5w6rOpbUPTn6FkCaBfTcBhhz4SnsI';
   ```

### 2. Web App Olarak Yayınlama

1. **Deploy** > **New deployment**
2. **Type**: Web app
3. **Execute as**: Me
4. **Who has access**: Anyone
5. **Deploy** ve URL'yi kopyalayın

### 3. Frontend'e URL Ekleme

Kopyaladığınız Web App URL'ini şu dosyalara ekleyin:

**`js/kuryes-forms.js`** (Satır 7-8):
```javascript
const KURYE_WEBHOOK_URL = 'YOUR_WEB_APP_URL';
const ISLETME_WEBHOOK_URL = 'YOUR_WEB_APP_URL';
```

**`js/kuryes-profile.js`** (Satır 7):
```javascript
const PROFILE_API_URL = 'YOUR_WEB_APP_URL';
```

**`js/kuryes-profile-save.js`** (Satır 7):
```javascript
const PROFILE_UPDATE_URL = 'YOUR_WEB_APP_URL';
```

## Özellikler

### ✅ Güvenlik
- **Benzersiz ID**: Her kullanıcı için tahmin edilemez ID (örn: `KUR-l8k2m9x1-a3b4c5d6`)
- **Şifre Hash**: SHA-256 ile şifre hash'leme
- **ID Güvenliği**: Rastgele karakterler içeren ID'ler

### ✅ Veri Yapısı
- **raw_kayit_json**: Tüm form verileri JSON olarak saklanır
- **raw_kart_json**: Kart düzenleme verileri JSON olarak saklanır
- **Otomatik Tarih**: Oluşturma ve güncelleme tarihleri otomatik

### ✅ Sheet Yapısı
- **KuryeKayitlar**: Kurye kayıtları
- **IsletmeKayitlar**: İşletme kayıtları  
- **LojistikKayitlar**: Lojistik kayıtları

Her sheet otomatik olarak oluşturulur ve başlıklar eklenir.

## Kullanım Akışı

1. **Kayıt**: Kullanıcı formu doldurur → Google Sheets'e kaydedilir → Benzersiz ID döner
2. **Modal**: Başarı modalı gösterilir → "Kayıt Başarılı!" mesajı
3. **Yönlendirme**: 2 saniye sonra ilgili kart sayfasına yönlendirilir (`kurye-kart.html?id=KUR-...`)
4. **Profil Yükleme**: Kart sayfası açıldığında ID ile veriler Google Sheets'ten çekilir
5. **Güncelleme**: Kullanıcı kartı düzenler → Google Sheets'e güncellenir

## Test Senaryoları

### Test 1: Kurye Kaydı
1. `kurye-kayit.html` sayfasına gidin
2. Formu doldurun
3. Gönder butonuna tıklayın
4. Başarı modalını kontrol edin
5. `kurye-kart.html?id=KUR-...` sayfasına yönlendirildiğini kontrol edin
6. Verilerin yüklendiğini kontrol edin
7. Google Sheets'te kaydın oluştuğunu kontrol edin

### Test 2: İşletme Kaydı
1. `isletme-kayit.html` sayfasına gidin
2. Formu doldurun (Lojistik checkbox'ı işaretlemeyin)
3. Gönder butonuna tıklayın
4. `isletme-kart.html?id=ISL-...` sayfasına yönlendirildiğini kontrol edin

### Test 3: Lojistik Kaydı
1. `isletme-kayit.html` sayfasına gidin
2. "Lojistik Firması mısınız?" checkbox'ını işaretleyin
3. Formu doldurun
4. Gönder butonuna tıklayın
5. `lojistik-kart.html?id=LOJ-...` sayfasına yönlendirildiğini kontrol edin

## Sorun Giderme

### CORS Hatası
- Web App'in "Anyone" erişimine açık olduğundan emin olun
- URL'nin doğru olduğundan emin olun

### Sheet Bulunamadı
- Script ilk çalıştığında otomatik oluşturur
- Manuel olarak sheet oluşturmak isterseniz, script'teki `createKuryeHeaders`, `createIsletmeHeaders`, `createLojistikHeaders` fonksiyonlarını çalıştırın

### Veri Kaydedilmiyor
- Web App URL'inin doğru olduğundan emin olun
- Browser console'da hata mesajlarını kontrol edin
- Google Apps Script execution log'larını kontrol edin

### ID Tahmin Edilebilir mi?
Hayır! ID'ler şu formatta oluşturulur:
- Timestamp (base36): `l8k2m9x1`
- Random string 1: `a3b4c5`
- Random string 2: `d6e7f8`

Toplam: `KUR-l8k2m9x1-a3b4c5d6e7f8` (tahmin edilemez)

## Sonraki Adımlar

1. ✅ Google Apps Script'i kurun ve deploy edin
2. ✅ Frontend'e URL'leri ekleyin
3. ✅ Test kayıtları yapın
4. ⏭️ QR kod sistemi (sonraki adım)
5. ⏭️ Kart indirme özelliği (sonraki adım)

## Notlar

- Tüm form verileri `raw_kayit_json` kolonunda JSON olarak saklanır
- Kart düzenleme verileri `raw_kart_json` kolonunda JSON olarak saklanır
- Şifreler hash'lenir ve `sifreHash` kolonunda saklanır
- ID'ler benzersizdir ve tahmin edilemez

