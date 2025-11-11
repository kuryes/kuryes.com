# Google Apps Script Kurulum Rehberi

## 1. Google Apps Script'e Kod Ekleme

1. [Google Apps Script](https://script.google.com/) sayfasına gidin
2. Yeni proje oluşturun
3. `google-apps-script.gs` dosyasındaki kodu kopyalayıp yapıştırın
4. **SPREADSHEET_ID** değişkenini güncelleyin:
   ```javascript
   const SPREADSHEET_ID = '1EiJ7NKJiOALghn5w6rOpbUPTn6FkCaBfTcBhhz4SnsI';
   ```

## 2. Web App Olarak Yayınlama

1. **Deploy** > **New deployment** seçin
2. **Type**: Web app seçin
3. **Execute as**: Me (kendi hesabınız)
4. **Who has access**: Anyone (herkes erişebilir)
5. **Deploy** butonuna tıklayın
6. Web App URL'ini kopyalayın

## 3. Frontend'e URL Ekleme

Kopyaladığınız Web App URL'ini şu dosyalara ekleyin:

### `js/kuryes-forms.js`
```javascript
const KURYE_WEBHOOK_URL = 'YOUR_WEB_APP_URL';
const ISLETME_WEBHOOK_URL = 'YOUR_WEB_APP_URL'; // Aynı URL
```

### `js/kuryes-profile.js`
```javascript
const PROFILE_API_URL = 'YOUR_WEB_APP_URL';
```

### `js/kuryes-profile-save.js`
```javascript
const PROFILE_UPDATE_URL = 'YOUR_WEB_APP_URL';
```

## 4. Google Sheets Yapısı

Script otomatik olarak şu sheet'leri oluşturur:
- **KuryeKayitlar**: Kurye kayıtları
- **IsletmeKayitlar**: İşletme kayıtları
- **LojistikKayitlar**: Lojistik kayıtları

Her sheet için otomatik başlıklar oluşturulur.

## 5. Güvenlik Özellikleri

✅ **Benzersiz ID**: Her kullanıcı için tahmin edilemez benzersiz ID
✅ **Şifre Hash**: Şifreler SHA-256 ile hash'lenir
✅ **ID Güvenliği**: ID'ler rastgele karakterler içerir (tahmin edilemez)
✅ **JSON Veri**: Tüm form verileri JSON olarak saklanır

## 6. ID Formatı

- **Kurye**: `KUR-XXXXXXXX-XXXXXXXX`
- **İşletme**: `ISL-XXXXXXXX-XXXXXXXX`
- **Lojistik**: `LOJ-XXXXXXXX-XXXXXXXX`

## 7. Test Etme

1. Kayıt formunu doldurun
2. Başarı modalını kontrol edin
3. Yönlendirme sonrası kart sayfasında verilerin yüklendiğini kontrol edin
4. Google Sheets'te verilerin kaydedildiğini kontrol edin

## 8. Sorun Giderme

- **CORS Hatası**: Web App'in "Anyone" erişimine açık olduğundan emin olun
- **Sheet Bulunamadı**: Script ilk çalıştığında otomatik oluşturur
- **Veri Kaydedilmiyor**: Web App URL'inin doğru olduğundan emin olun

