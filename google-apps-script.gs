/**
 * Kuryes.com - Google Apps Script Backend
 * Google Sheets'e kayıt ve profil yönetimi
 */

// Google Sheets ID'si (URL'den alınacak)
const SPREADSHEET_ID = '1EiJ7NKJiOALghn5w6rOpbUPTn6FkCaBfTcBhhz4SnsI';

// Sheet isimleri
const SHEET_KURYE = 'KuryeKayitlar';
const SHEET_ISLETME = 'IsletmeKayitlar';
const SHEET_LOJISTIK = 'LojistikKayitlar';
const SHEET_BASVURULAR = 'Basvurular';

/**
 * HTTP GET - Profil verilerini çeker
 */
function doGet(e) {
  try {
    const id = e.parameter.id;
    const formType = e.parameter.formType || 'kurye';
    const action = e.parameter.action || 'getRecord';
    
    // İlanları listele
    if (action === 'listIlanlar') {
      return handleListIlanlar(e);
    }
    
    // Başvuruları listele
    if (action === 'getBasvurular') {
      return handleGetBasvurular(e);
    }
    
    // Kurye'nin başvurduğu ilanları listele
    if (action === 'getKuryeBasvurular') {
      return handleGetKuryeBasvurular(e);
    }
    
    if (!id) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'ID parametresi gerekli'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet;
    let data;
    
    // Form tipine göre sheet seç
    if (formType === 'kurye') {
      sheet = spreadsheet.getSheetByName(SHEET_KURYE);
    } else if (formType === 'lojistik') {
      sheet = spreadsheet.getSheetByName(SHEET_LOJISTIK);
    } else {
      sheet = spreadsheet.getSheetByName(SHEET_ISLETME);
    }
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Verileri çek
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const idColumnIndex = headers.indexOf('id');
    
    if (idColumnIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'ID kolonu bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ID'ye göre satır bul
    let foundRow = null;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idColumnIndex] === id) {
        foundRow = rows[i];
        break;
      }
    }
    
    if (!foundRow) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Kullanıcı bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Veriyi obje olarak oluştur
    const dataObj = {};
    headers.forEach((header, index) => {
      dataObj[header] = foundRow[index];
    });
    
    // Şifre hash'ini çıkar (güvenlik için)
    delete dataObj.sifreHash;
    
    // raw_kayit_json'ı parse et
    if (dataObj.raw_kayit_json) {
      try {
        dataObj.raw_kayit_json = JSON.parse(dataObj.raw_kayit_json);
      } catch (e) {
        // JSON parse hatası varsa olduğu gibi bırak
      }
    }
    
    // raw_kart_json'ı parse et
    if (dataObj.raw_kart_json) {
      try {
        dataObj.raw_kart_json = JSON.parse(dataObj.raw_kart_json);
      } catch (e) {
        // JSON parse hatası varsa olduğu gibi bırak
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: dataObj
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HTTP POST - Kayıt ve güncelleme işlemleri
 */
function doPost(e) {
  try {
    const action = e.parameter.action || 'register';
    
    if (action === 'register') {
      return handleRegister(e);
    } else if (action === 'login') {
      return handleLogin(e);
    } else if (action === 'update') {
      return handleUpdate(e);
    } else if (action === 'publishIlan') {
      return handlePublishIlan(e);
    } else if (action === 'applyToIlan') {
      return handleApplyToIlan(e);
    } else if (action === 'updateBasvuruDurum') {
      return handleUpdateBasvuruDurum(e);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Geçersiz action'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Kayıt işlemi
 */
function handleRegister(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const formType = e.parameter.formType || 'kurye';
    
    // Form tipine göre sheet seç
    let sheet;
    let sheetName;
    
    // formType parametresini kontrol et (öncelikli)
    // Eğer formType 'lojistik' ise veya lojistikFirmasi true ise lojistik sheet'ine kaydet
    if (formType === 'kurye') {
      sheetName = SHEET_KURYE;
      sheet = spreadsheet.getSheetByName(sheetName);
    } else if (formType === 'lojistik' || e.parameter.lojistikFirmasi === 'true' || e.parameter.lojistikFirmasi === true) {
      sheetName = SHEET_LOJISTIK;
      sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        // Lojistik sheet yoksa oluştur
        sheet = spreadsheet.insertSheet(sheetName);
        createLojistikHeaders(sheet);
      }
    } else {
      sheetName = SHEET_ISLETME;
      sheet = spreadsheet.getSheetByName(sheetName);
    }
    
    // Sheet yoksa oluştur
    if (!sheet) {
      if (formType === 'kurye') {
        sheet = spreadsheet.insertSheet(sheetName);
        createKuryeHeaders(sheet);
      } else if (formType === 'lojistik') {
        sheet = spreadsheet.insertSheet(sheetName);
        createLojistikHeaders(sheet);
      } else {
        sheet = spreadsheet.insertSheet(sheetName);
        createIsletmeHeaders(sheet);
      }
    }
    
    // Sheet boşsa (sadece başlıklar varsa) başlıkları oluştur
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow === 0 || lastCol === 0) {
      // Sheet tamamen boş, başlıkları oluştur
      if (formType === 'kurye') {
        createKuryeHeaders(sheet);
      } else if (formType === 'lojistik') {
        createLojistikHeaders(sheet);
      } else {
        createIsletmeHeaders(sheet);
      }
    } else {
      // Başlıklar var mı kontrol et
      const firstRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      const hasHeaders = firstRow.some(cell => cell && cell.toString().trim() !== '');
      
      if (!hasHeaders) {
        // Başlıklar yok, oluştur
        if (formType === 'kurye') {
          createKuryeHeaders(sheet);
        } else if (formType === 'lojistik') {
          createLojistikHeaders(sheet);
        } else {
          createIsletmeHeaders(sheet);
        }
      }
    }
    
    // Benzersiz ID oluştur
    const uniqueId = generateUniqueId(formType);
    
    // Şifre hash'le
    const sifre = e.parameter.sifre;
    if (!sifre) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Şifre gerekli'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    const sifreHash = hashPassword(sifre);
    
    // Tüm form verilerini JSON olarak kaydet (şifre hariç)
    const rawData = {};
    Object.keys(e.parameter).forEach(key => {
      if (key !== 'action' && key !== 'formType' && key !== 'sifre' && key !== 'sifreTekrar' && key !== 'jsonData') {
        rawData[key] = e.parameter[key];
      }
    });
    
    // jsonData varsa parse et ve birleştir (şifre hariç)
    if (e.parameter.jsonData) {
      try {
        const jsonData = JSON.parse(e.parameter.jsonData);
        // Şifre alanlarını kaldır
        delete jsonData.sifre;
        delete jsonData.sifreTekrar;
        Object.assign(rawData, jsonData);
      } catch (e) {
        // JSON parse hatası
      }
    }
    
    // Tarih bilgileri
    const now = new Date();
    const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    
    // Sheet'e eklenecek veri - başlıkları al
    const currentLastCol = sheet.getLastColumn();
    let headers = [];
    
    if (currentLastCol > 0) {
      headers = sheet.getRange(1, 1, 1, currentLastCol).getValues()[0];
    } else {
      // Başlıklar yoksa oluştur
      if (formType === 'kurye') {
        createKuryeHeaders(sheet);
        headers = ['id', 'adSoyad', 'telefon', 'email', 'sehir', 'ehliyet', 'motorVarmi', 'avatar', 'sifreHash', 'raw_kayit_json', 'raw_kart_json', 'olusturmaTarihi', 'guncellemeTarihi'];
      } else if (formType === 'lojistik') {
        createLojistikHeaders(sheet);
        headers = ['id', 'isletmeAdi', 'yetkiliAdi', 'telefon', 'email', 'sehir', 'isletmeTuru', 'avatar', 'sifreHash', 'raw_kayit_json', 'raw_kart_json', 'olusturmaTarihi', 'guncellemeTarihi'];
      } else {
        createIsletmeHeaders(sheet);
        headers = ['id', 'isletmeAdi', 'yetkiliAdi', 'telefon', 'email', 'sehir', 'isletmeTuru', 'avatar', 'sifreHash', 'raw_kayit_json', 'raw_kart_json', 'olusturmaTarihi', 'guncellemeTarihi'];
      }
    }
    
    const rowData = [];
    
    // Her kolon için değer ekle
    headers.forEach(header => {
      if (header === 'id') {
        rowData.push(uniqueId);
      } else if (header === 'sifreHash') {
        rowData.push(sifreHash);
      } else if (header === 'raw_kayit_json') {
        rowData.push(JSON.stringify(rawData));
      } else if (header === 'raw_kart_json') {
        // Kart bilgileri henüz yok, boş bırak
        rowData.push('');
      } else if (header === 'olusturmaTarihi') {
        rowData.push(timestamp);
      } else if (header === 'guncellemeTarihi') {
        rowData.push(timestamp);
      } else if (header === 'ilanYayinlandi') {
        // Yeni kayıtta ilan yayınlanmamış
        rowData.push('0');
      } else {
        // Form verilerinden al (farklı field name'leri kontrol et)
        let value = '';
        
        // Kurye için field mapping
        if (formType === 'kurye') {
          if (header === 'adSoyad') {
            value = e.parameter.adsoyad || rawData.adsoyad || '';
          } else if (header === 'telefon') {
            value = e.parameter.telefon || rawData.telefon || '';
          } else if (header === 'email') {
            value = e.parameter.eposta || rawData.eposta || '';
          } else if (header === 'sehir') {
            value = e.parameter.sehir || rawData.sehir || '';
          } else if (header === 'ehliyet') {
            value = e.parameter.ehliyet || rawData.ehliyet || '';
          } else if (header === 'motorVarmi') {
            value = e.parameter.motorunvarmi || rawData.motorunvarmi || '';
          } else {
            value = e.parameter[header] || rawData[header] || '';
          }
        }
        // İşletme/Lojistik için field mapping
        else {
          if (header === 'isletmeAdi') {
            value = e.parameter.isletmeadi || rawData.isletmeadi || '';
          } else if (header === 'yetkiliAdi') {
            value = e.parameter.yetkiliadsoyad || rawData.yetkiliadsoyad || '';
          } else if (header === 'telefon') {
            value = e.parameter.tel || rawData.tel || '';
          } else if (header === 'email') {
            value = e.parameter.eposta || rawData.eposta || '';
          } else if (header === 'sehir') {
            value = e.parameter.sehir || rawData.sehir || '';
          } else if (header === 'isletmeTuru') {
            // Lojistik kaydı için işletme türünü otomatik "Lojistik" olarak ayarla
            if (formType === 'lojistik') {
              value = 'Lojistik';
            } else {
              value = e.parameter.tur || rawData.tur || '';
            }
          } else {
            value = e.parameter[header] || rawData[header] || '';
          }
        }
        
        rowData.push(value);
      }
    });
    
    // Satır ekle
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      id: uniqueId,
      message: 'Kayıt başarılı'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Login işlemi
 */
function handleLogin(e) {
  try {
    const email = e.parameter.email;
    const sifre = e.parameter.sifre;
    
    if (!email || !sifre) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'E-posta ve şifre gerekli'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Şifreyi hash'le
    const sifreHash = hashPassword(sifre);
    
    // Önce kurye sheet'inde ara
    let sheet = spreadsheet.getSheetByName(SHEET_KURYE);
    let userType = 'kurye';
    let foundRow = null;
    let headers = [];
    
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      headers = rows[0];
      const emailColumnIndex = headers.indexOf('email');
      const sifreHashColumnIndex = headers.indexOf('sifreHash');
      
      if (emailColumnIndex !== -1 && sifreHashColumnIndex !== -1) {
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][emailColumnIndex] === email && rows[i][sifreHashColumnIndex] === sifreHash) {
            foundRow = rows[i];
            break;
          }
        }
      }
    }
    
    // Kurye'de bulunamadıysa işletme sheet'inde ara
    if (!foundRow) {
      sheet = spreadsheet.getSheetByName(SHEET_ISLETME);
      userType = 'isletme';
      
      if (sheet) {
        const rows = sheet.getDataRange().getValues();
        headers = rows[0];
        const emailColumnIndex = headers.indexOf('email');
        const sifreHashColumnIndex = headers.indexOf('sifreHash');
        
        if (emailColumnIndex !== -1 && sifreHashColumnIndex !== -1) {
          for (let i = 1; i < rows.length; i++) {
            if (rows[i][emailColumnIndex] === email && rows[i][sifreHashColumnIndex] === sifreHash) {
              foundRow = rows[i];
              break;
            }
          }
        }
      }
    }
    
    // İşletme'de bulunamadıysa lojistik sheet'inde ara
    if (!foundRow) {
      sheet = spreadsheet.getSheetByName(SHEET_LOJISTIK);
      userType = 'lojistik';
      
      if (sheet) {
        const rows = sheet.getDataRange().getValues();
        headers = rows[0];
        const emailColumnIndex = headers.indexOf('email');
        const sifreHashColumnIndex = headers.indexOf('sifreHash');
        
        if (emailColumnIndex !== -1 && sifreHashColumnIndex !== -1) {
          for (let i = 1; i < rows.length; i++) {
            if (rows[i][emailColumnIndex] === email && rows[i][sifreHashColumnIndex] === sifreHash) {
              foundRow = rows[i];
              break;
            }
          }
        }
      }
    }
    
    if (!foundRow) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'E-posta veya şifre hatalı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Kullanıcı bilgilerini oluştur
    const userData = {};
    headers.forEach((header, index) => {
      userData[header] = foundRow[index];
    });
    
    // Response hazırla
    const response = {
      success: true,
      id: userData.id,
      userType: userType
    };
    
    // Avatar (varsayılan 1)
    response.avatar = userData.avatar || 1;
    
    // Kurye için adSoyad
    if (userType === 'kurye') {
      response.adSoyad = userData.adSoyad || '';
    }
    // İşletme/Lojistik için isletmeAdi ve yetkiliAdi
    else {
      response.isletmeAdi = userData.isletmeAdi || '';
      response.yetkiliAdi = userData.yetkiliAdi || '';
    }
    
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Güncelleme işlemi
 */
function handleUpdate(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const id = e.parameter.id;
    const formType = e.parameter.formType || 'kurye';
    
    if (!id) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'ID parametresi gerekli'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Form tipine göre sheet seç
    let sheet;
    if (formType === 'kurye') {
      sheet = spreadsheet.getSheetByName(SHEET_KURYE);
    } else if (formType === 'lojistik') {
      sheet = spreadsheet.getSheetByName(SHEET_LOJISTIK);
    } else {
      sheet = spreadsheet.getSheetByName(SHEET_ISLETME);
    }
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ID'ye göre satır bul
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const idColumnIndex = headers.indexOf('id');
    
    if (idColumnIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'ID kolonu bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idColumnIndex] === id) {
        rowIndex = i + 1; // Sheet satır numarası (1-based)
        break;
      }
    }
    
    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Kullanıcı bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Güncelleme verilerini hazırla
    const now = new Date();
    const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    
    // raw_kart_json'ı oluştur
    const rawKartData = {};
    Object.keys(e.parameter).forEach(key => {
      if (key !== 'action' && key !== 'id' && key !== 'formType' && key !== 'jsonData') {
        rawKartData[key] = e.parameter[key];
      }
    });
    
    // jsonData varsa parse et ve birleştir
    if (e.parameter.jsonData) {
      try {
        const jsonData = JSON.parse(e.parameter.jsonData);
        Object.assign(rawKartData, jsonData);
      } catch (e) {
        // JSON parse hatası
      }
    }
    
    // Temel kolonlar (kayıt sırasında gerekli olanlar) - bunlar öncelikli
    let baseHeaders = [];
    if (formType === 'kurye') {
      baseHeaders = ['id', 'adSoyad', 'telefon', 'email', 'sehir', 'ehliyet', 'motorVarmi', 'avatar', 'sifreHash', 'raw_kayit_json', 'raw_kart_json', 'olusturmaTarihi', 'guncellemeTarihi'];
    } else {
      baseHeaders = ['id', 'isletmeAdi', 'yetkiliAdi', 'telefon', 'email', 'sehir', 'isletmeTuru', 'avatar', 'sifreHash', 'raw_kayit_json', 'raw_kart_json', 'olusturmaTarihi', 'guncellemeTarihi'];
    }
    
    // Mevcut headers'ı kontrol et ve yeni kolonları ekle
    const currentHeaders = headers.slice(); // Kopyala
    const newHeaders = [];
    const allDataKeys = Object.keys(rawKartData);
    
    // Önce temel kolonları ekle (zaten varsa atla)
    baseHeaders.forEach(baseHeader => {
      if (currentHeaders.indexOf(baseHeader) === -1) {
        newHeaders.push(baseHeader);
        currentHeaders.push(baseHeader);
      }
    });
    
    // Sonra yeni kolonları ekle (temel kolonlarda yoksa ve daha önce eklenmemişse)
    allDataKeys.forEach(key => {
      // Özel alanları atla
      if (key === 'action' || key === 'id' || key === 'formType' || key === 'jsonData') {
        return;
      }
      
      // Eğer bu kolon yoksa ve temel kolon değilse ekle
      if (currentHeaders.indexOf(key) === -1 && baseHeaders.indexOf(key) === -1) {
        newHeaders.push(key);
        currentHeaders.push(key);
      }
    });
    
    // Yeni kolonları sheet'e ekle
    if (newHeaders.length > 0) {
      const lastCol = sheet.getLastColumn();
      const headerRange = sheet.getRange(1, lastCol + 1, 1, newHeaders.length);
      headerRange.setValues([newHeaders]);
      
      // Yeni kolonların başlıklarını formatla
      headerRange.setFontWeight('bold');
      if (formType === 'kurye') {
        headerRange.setBackground('#4285f4');
      } else if (formType === 'lojistik') {
        headerRange.setBackground('#ea4335');
      } else {
        headerRange.setBackground('#34a853');
      }
      headerRange.setFontColor('#ffffff');
      
      // Headers'ı güncelle
      headers.push.apply(headers, newHeaders);
    }
    
    // Her kolonu güncelle
    headers.forEach((header, colIndex) => {
      const colNum = colIndex + 1;
      
      if (header === 'guncellemeTarihi') {
        sheet.getRange(rowIndex, colNum).setValue(timestamp);
      } else if (header === 'raw_kart_json') {
        sheet.getRange(rowIndex, colNum).setValue(JSON.stringify(rawKartData));
      } else if (rawKartData[header] !== undefined) {
        // rawKartData'dan değeri al (öncelikli)
        sheet.getRange(rowIndex, colNum).setValue(rawKartData[header]);
      } else if (e.parameter[header] !== undefined) {
        // Eğer rawKartData'da yoksa direkt parametreden al
        sheet.getRange(rowIndex, colNum).setValue(e.parameter[header]);
      }
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Güncelleme başarılı'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * İlan yayınlama işlemi
 */
function handlePublishIlan(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const id = e.parameter.id;
    const formType = e.parameter.formType || 'isletme';
    
    if (!id) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'ID parametresi gerekli'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Form tipine göre sheet seç
    let sheet;
    if (formType === 'lojistik') {
      sheet = spreadsheet.getSheetByName(SHEET_LOJISTIK);
    } else {
      sheet = spreadsheet.getSheetByName(SHEET_ISLETME);
    }
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ID'ye göre satır bul
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const idColumnIndex = headers.indexOf('id');
    
    if (idColumnIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'ID kolonu bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idColumnIndex] === id) {
        rowIndex = i + 1; // Sheet satır numarası (1-based)
        break;
      }
    }
    
    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Kullanıcı bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ilanYayinlandi kolonunu kontrol et ve ekle
    let ilanYayinlandiIndex = headers.indexOf('ilanYayinlandi');
    
    if (ilanYayinlandiIndex === -1) {
      // Kolon yoksa ekle
      const lastCol = sheet.getLastColumn();
      sheet.getRange(1, lastCol + 1).setValue('ilanYayinlandi');
      sheet.getRange(1, lastCol + 1).setFontWeight('bold');
      if (formType === 'lojistik') {
        sheet.getRange(1, lastCol + 1).setBackground('#ea4335');
      } else {
        sheet.getRange(1, lastCol + 1).setBackground('#34a853');
      }
      sheet.getRange(1, lastCol + 1).setFontColor('#ffffff');
      ilanYayinlandiIndex = lastCol;
      headers.push('ilanYayinlandi');
    }
    
    // İlan yayınlandı olarak işaretle
    const ilanYayinlandiCol = ilanYayinlandiIndex + 1;
    sheet.getRange(rowIndex, ilanYayinlandiCol).setValue('1');
    
    // Yayınlanma tarihini ekle
    let ilanYayinlanmaTarihiIndex = headers.indexOf('ilanYayinlanmaTarihi');
    if (ilanYayinlanmaTarihiIndex === -1) {
      const lastCol = sheet.getLastColumn();
      sheet.getRange(1, lastCol + 1).setValue('ilanYayinlanmaTarihi');
      sheet.getRange(1, lastCol + 1).setFontWeight('bold');
      if (formType === 'lojistik') {
        sheet.getRange(1, lastCol + 1).setBackground('#ea4335');
      } else {
        sheet.getRange(1, lastCol + 1).setBackground('#34a853');
      }
      sheet.getRange(1, lastCol + 1).setFontColor('#ffffff');
      ilanYayinlanmaTarihiIndex = lastCol;
      headers.push('ilanYayinlanmaTarihi');
    }
    
    const now = new Date();
    const timestamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const ilanYayinlanmaTarihiCol = ilanYayinlanmaTarihiIndex + 1;
    sheet.getRange(rowIndex, ilanYayinlanmaTarihiCol).setValue(timestamp);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'İlan başarıyla yayınlandı'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * İlanları listele (sadece yayınlanmış olanlar)
 */
function handleListIlanlar(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ilanlar = [];
    
    // İşletme ilanlarını çek
    let sheet = spreadsheet.getSheetByName(SHEET_ISLETME);
    if (sheet) {
      try {
        const rows = sheet.getDataRange().getValues();
        if (rows.length > 1) {
          const headers = rows[0];
          const ilanYayinlandiIndex = headers.indexOf('ilanYayinlandi');
          
          // Eğer ilanYayinlandi kolonu yoksa, tüm kayıtları al (geriye dönük uyumluluk)
          if (ilanYayinlandiIndex === -1) {
            // Kolon yoksa boş array döndür (henüz hiç ilan yayınlanmamış)
          } else {
            for (let i = 1; i < rows.length; i++) {
              const row = rows[i];
              if (row[ilanYayinlandiIndex] === '1' || row[ilanYayinlandiIndex] === 1 || row[ilanYayinlandiIndex] === true) {
                const ilan = {};
                headers.forEach((header, index) => {
                  ilan[header] = row[index] !== undefined && row[index] !== null ? row[index] : '';
                });
                
                // raw_kart_json'ı parse et
                if (ilan.raw_kart_json && ilan.raw_kart_json !== '') {
                  try {
                    ilan.raw_kart_json = JSON.parse(ilan.raw_kart_json);
                  } catch (parseError) {
                    // JSON parse hatası - boş obje olarak bırak
                    ilan.raw_kart_json = {};
                  }
                } else {
                  ilan.raw_kart_json = {};
                }
                
                ilan.formType = 'isletme';
                ilanlar.push(ilan);
              }
            }
          }
        }
      } catch (sheetError) {
        // Sheet okuma hatası - devam et
        console.error('İşletme sheet okuma hatası:', sheetError);
      }
    }
    
    // Lojistik ilanlarını çek
    sheet = spreadsheet.getSheetByName(SHEET_LOJISTIK);
    if (sheet) {
      try {
        const rows = sheet.getDataRange().getValues();
        if (rows.length > 1) {
          const headers = rows[0];
          const ilanYayinlandiIndex = headers.indexOf('ilanYayinlandi');
          
          // Eğer ilanYayinlandi kolonu yoksa, tüm kayıtları al (geriye dönük uyumluluk)
          if (ilanYayinlandiIndex === -1) {
            // Kolon yoksa boş array döndür (henüz hiç ilan yayınlanmamış)
          } else {
            for (let i = 1; i < rows.length; i++) {
              const row = rows[i];
              if (row[ilanYayinlandiIndex] === '1' || row[ilanYayinlandiIndex] === 1 || row[ilanYayinlandiIndex] === true) {
                const ilan = {};
                headers.forEach((header, index) => {
                  ilan[header] = row[index] !== undefined && row[index] !== null ? row[index] : '';
                });
                
                // raw_kart_json'ı parse et
                if (ilan.raw_kart_json && ilan.raw_kart_json !== '') {
                  try {
                    ilan.raw_kart_json = JSON.parse(ilan.raw_kart_json);
                  } catch (parseError) {
                    // JSON parse hatası - boş obje olarak bırak
                    ilan.raw_kart_json = {};
                  }
                } else {
                  ilan.raw_kart_json = {};
                }
                
                ilan.formType = 'lojistik';
                ilanlar.push(ilan);
              }
            }
          }
        }
      } catch (sheetError) {
        // Sheet okuma hatası - devam et
        console.error('Lojistik sheet okuma hatası:', sheetError);
      }
    }
    
    const response = ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: ilanlar,
      count: ilanlar.length
    }));
    response.setMimeType(ContentService.MimeType.JSON);
    
    return response;
    
  } catch (error) {
    const errorResponse = ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: 'İlanlar yüklenirken bir hata oluştu'
    }));
    errorResponse.setMimeType(ContentService.MimeType.JSON);
    return errorResponse;
  }
}

/**
 * Benzersiz ID oluştur (güvenli, tahmin edilemez)
 */
function generateUniqueId(formType) {
  const prefix = formType === 'kurye' ? 'KUR' : (formType === 'lojistik' ? 'LOJ' : 'ISL');
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const random2 = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${random}${random2}`.toUpperCase();
}

/**
 * Şifre hash'leme (SHA-256)
 */
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  return rawHash.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Kurye sheet başlıklarını oluştur
 */
function createKuryeHeaders(sheet) {
  const headers = [
    'id',
    'adSoyad',
    'telefon',
    'email',
    'sehir',
    'ehliyet',
    'motorVarmi',
    'avatar',
    'sifreHash',
    'raw_kayit_json',
    'raw_kart_json',
    'olusturmaTarihi',
    'guncellemeTarihi'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Başlık satırını formatla
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
}

/**
 * İşletme sheet başlıklarını oluştur
 */
function createIsletmeHeaders(sheet) {
  const headers = [
    'id',
    'isletmeAdi',
    'yetkiliAdi',
    'telefon',
    'email',
    'sehir',
    'isletmeTuru',
    'avatar',
    'sifreHash',
    'raw_kayit_json',
    'raw_kart_json',
    'olusturmaTarihi',
    'guncellemeTarihi',
    'ilanYayinlandi',
    'ilanYayinlanmaTarihi'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Başlık satırını formatla
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#34a853');
  headerRange.setFontColor('#ffffff');
}

/**
 * Lojistik sheet başlıklarını oluştur
 */
function createLojistikHeaders(sheet) {
  const headers = [
    'id',
    'isletmeAdi',
    'yetkiliAdi',
    'telefon',
    'email',
    'sehir',
    'isletmeTuru',
    'avatar',
    'sifreHash',
    'raw_kayit_json',
    'raw_kart_json',
    'olusturmaTarihi',
    'guncellemeTarihi',
    'ilanYayinlandi',
    'ilanYayinlanmaTarihi'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Başlık satırını formatla
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#ea4335');
  headerRange.setFontColor('#ffffff');
}

/**
 * Başvuru yapma işlemi
 * 
 * LOG AÇIKLAMALARI:
 * - Bu fonksiyon kuryelerin ilanlara başvuru yapmasını sağlar
 * - Tüm kurye bilgileri (avatar dahil) kuryeData kolonunda JSON olarak saklanır
 * - Başvuru durumu: 'beklemede' (varsayılan), 'kabul', 'red'
 * - Aynı kurye aynı ilana birden fazla başvuru yapamaz (kontrol edilir)
 * 
 * PARAMETRELER:
 * - ilanId: Başvuru yapılacak ilanın ID'si (zorunlu)
 * - kuryeId: Başvuru yapan kuryenin ID'si (zorunlu)
 * - ilanFormType: İlan tipi ('isletme' veya 'lojistik', varsayılan: 'isletme')
 * 
 * DÖNÜŞ DEĞERİ:
 * - success: true/false
 * - basvuruId: Oluşturulan başvuru ID'si (başarılıysa)
 * - message: İşlem mesajı
 * - error: Hata mesajı (başarısızsa)
 */
function handleApplyToIlan(e) {
  try {
    console.log('=== BAŞVURU YAPMA İŞLEMİ BAŞLADI ===');
    console.log('Zaman:', new Date().toISOString());
    
    const ilanId = e.parameter.ilanId;
    const kuryeId = e.parameter.kuryeId;
    const ilanFormType = e.parameter.ilanFormType || 'isletme';
    
    console.log('Gelen Parametreler:');
    console.log('- İlan ID:', ilanId);
    console.log('- Kurye ID:', kuryeId);
    console.log('- İlan Form Tipi:', ilanFormType);
    
    if (!ilanId || !kuryeId) {
      console.error('HATA: İlan ID veya Kurye ID eksik!');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'İlan ID ve Kurye ID gerekli'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('Google Sheets açılıyor...');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('Google Sheets başarıyla açıldı');
    
    // Başvurular sheet'ini al veya oluştur
    console.log('Başvurular sheet\'i kontrol ediliyor...');
    let basvuruSheet = spreadsheet.getSheetByName(SHEET_BASVURULAR);
    if (!basvuruSheet) {
      console.log('Başvurular sheet\'i bulunamadı, yeni sheet oluşturuluyor...');
      basvuruSheet = spreadsheet.insertSheet(SHEET_BASVURULAR);
      // Başlıkları oluştur
      const headers = [
        'id',
        'ilanId',
        'ilanFormType',
        'kuryeId',
        'basvuruTarihi',
        'durum', // 'beklemede', 'kabul', 'red'
        'notlar',
        'kuryeAdi',
        'kuryeTelefon',
        'kuryeEmail',
        'kuryeSehir',
        'kuryeData' // Tüm kurye bilgileri JSON formatında (avatar dahil)
      ];
      basvuruSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      const headerRange = basvuruSheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      console.log('Başvurular sheet\'i oluşturuldu ve başlıklar eklendi');
    } else {
      console.log('Başvurular sheet\'i mevcut');
    }
    
    // Kurye bilgilerini çek
    console.log('Kurye bilgileri çekiliyor...');
    const kuryeSheet = spreadsheet.getSheetByName(SHEET_KURYE);
    if (!kuryeSheet) {
      console.error('HATA: Kurye sheet bulunamadı!');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Kurye sheet bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const kuryeRows = kuryeSheet.getDataRange().getValues();
    const kuryeHeaders = kuryeRows[0];
    const kuryeIdIndex = kuryeHeaders.indexOf('id');
    console.log('Kurye sheet\'inde toplam', kuryeRows.length - 1, 'kayıt var');
    
    let kuryeData = null;
    for (let i = 1; i < kuryeRows.length; i++) {
      if (kuryeRows[i][kuryeIdIndex] === kuryeId) {
        kuryeData = {};
        kuryeHeaders.forEach((header, index) => {
          kuryeData[header] = kuryeRows[i][index] !== undefined && kuryeRows[i][index] !== null ? kuryeRows[i][index] : '';
        });
        console.log('Kurye bulundu:', kuryeData.adSoyad || kuryeData.ad_soyad || 'İsimsiz');
        console.log('- Avatar:', kuryeData.avatar || 'Yok');
        console.log('- Telefon:', kuryeData.telefon || kuryeData.tel || 'Yok');
        console.log('- Email:', kuryeData.email || 'Yok');
        console.log('- Şehir:', kuryeData.sehir || 'Yok');
        break;
      }
    }
    
    if (!kuryeData) {
      console.error('HATA: Kurye ID ile eşleşen kayıt bulunamadı!');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Kurye bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Aynı ilana daha önce başvuru yapılmış mı kontrol et
    console.log('Daha önce başvuru yapılmış mı kontrol ediliyor...');
    const basvuruRows = basvuruSheet.getDataRange().getValues();
    const basvuruHeaders = basvuruRows[0];
    const basvuruIlanIdIndex = basvuruHeaders.indexOf('ilanId');
    const basvuruKuryeIdIndex = basvuruHeaders.indexOf('kuryeId');
    console.log('Mevcut başvuru sayısı:', basvuruRows.length - 1);
    
    for (let i = 1; i < basvuruRows.length; i++) {
      if (basvuruRows[i][basvuruIlanIdIndex] === ilanId && 
          basvuruRows[i][basvuruKuryeIdIndex] === kuryeId) {
        console.warn('UYARI: Bu kurye bu ilana zaten başvuru yapmış!');
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Bu ilana zaten başvuru yapılmış'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    console.log('Daha önce başvuru yapılmamış, devam ediliyor...');
    
    // Benzersiz başvuru ID'si oluştur
    const basvuruId = 'BASV-' + generateUniqueId();
    console.log('Yeni başvuru ID oluşturuldu:', basvuruId);
    
    // Başvuru tarihi
    const basvuruTarihi = new Date().toISOString();
    console.log('Başvuru tarihi:', basvuruTarihi);
    
    // Yeni başvuru satırı ekle
    // NOT: kuryeData kolonunda TÜM kurye bilgileri JSON olarak saklanır (avatar dahil)
    // Bu sayede işletme/lojistik başvuru panelinde kurye kartı tam olarak gösterilebilir
    const newRow = [
      basvuruId,
      ilanId,
      ilanFormType,
      kuryeId,
      basvuruTarihi,
      'beklemede', // Durum: beklemede (varsayılan)
      '', // Notlar (işletme/lojistik tarafından eklenebilir)
      kuryeData.adSoyad || kuryeData.ad_soyad || '',
      kuryeData.telefon || kuryeData.tel || '',
      kuryeData.email || '',
      kuryeData.sehir || '',
      JSON.stringify(kuryeData) // Tüm kurye verileri JSON olarak (avatar, raw_kart_json dahil)
    ];
    
    console.log('Başvuru satırı sheet\'e ekleniyor...');
    basvuruSheet.appendRow(newRow);
    console.log('Başvuru başarıyla eklendi!');
    console.log('=== BAŞVURU YAPMA İŞLEMİ TAMAMLANDI ===');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      basvuruId: basvuruId,
      message: 'Başvuru başarıyla gönderildi'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('=== BAŞVURU YAPMA İŞLEMİ HATASI ===');
    console.error('Hata mesajı:', error.toString());
    console.error('Hata detayı:', error);
    console.error('Stack trace:', error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * İlan sahibi için başvuruları listeleme
 * 
 * LOG AÇIKLAMALARI:
 * - Bu fonksiyon bir ilana yapılan tüm başvuruları listeler
 * - Her başvuru için kurye bilgileri (kuryeData) JSON'dan parse edilir
 * - kuryeData içinde avatar, raw_kart_json ve tüm kurye bilgileri bulunur
 * - İşletme/lojistik bu bilgilerle kurye kartını tam olarak gösterebilir
 * 
 * PARAMETRELER:
 * - ilanId: Başvuruları listelenecek ilanın ID'si (zorunlu)
 * 
 * DÖNÜŞ DEĞERİ:
 * - success: true/false
 * - data: Başvuru listesi (her başvuru kuryeData içerir)
 * - count: Başvuru sayısı
 */
function handleGetBasvurular(e) {
  try {
    console.log('=== BAŞVURULARI LİSTELEME İŞLEMİ BAŞLADI ===');
    console.log('Zaman:', new Date().toISOString());
    
    const ilanId = e.parameter.ilanId;
    console.log('İlan ID:', ilanId);
    
    if (!ilanId) {
      console.error('HATA: İlan ID eksik!');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'İlan ID gerekli'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('Google Sheets açılıyor...');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const basvuruSheet = spreadsheet.getSheetByName(SHEET_BASVURULAR);
    
    if (!basvuruSheet) {
      console.log('Başvurular sheet\'i bulunamadı, boş liste döndürülüyor');
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: [],
        count: 0
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = basvuruSheet.getDataRange().getValues();
    console.log('Toplam satır sayısı:', rows.length);
    
    if (rows.length <= 1) {
      console.log('Başvuru yok, boş liste döndürülüyor');
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: [],
        count: 0
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = rows[0];
    const ilanIdIndex = headers.indexOf('ilanId');
    console.log('İlan ID kolonu indeksi:', ilanIdIndex);
    
    const basvurular = [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][ilanIdIndex] === ilanId) {
        const basvuru = {};
        headers.forEach((header, index) => {
          basvuru[header] = rows[i][index] !== undefined && rows[i][index] !== null ? rows[i][index] : '';
        });
        
        // kuryeData'yı parse et (avatar ve tüm kurye bilgileri burada)
        console.log('Başvuru bulundu, kuryeData parse ediliyor...');
        if (basvuru.kuryeData && basvuru.kuryeData !== '') {
          try {
            basvuru.kuryeData = JSON.parse(basvuru.kuryeData);
            console.log('- Kurye adı:', basvuru.kuryeData.adSoyad || basvuru.kuryeData.ad_soyad || 'İsimsiz');
            console.log('- Avatar:', basvuru.kuryeData.avatar || 'Yok');
          } catch (parseError) {
            console.error('kuryeData parse hatası:', parseError);
            basvuru.kuryeData = {};
          }
        } else {
          basvuru.kuryeData = {};
        }
        
        basvurular.push(basvuru);
      }
    }
    
    console.log('Bulunan başvuru sayısı:', basvurular.length);
    console.log('=== BAŞVURULARI LİSTELEME İŞLEMİ TAMAMLANDI ===');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: basvurular,
      count: basvurular.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('=== BAŞVURULARI LİSTELEME İŞLEMİ HATASI ===');
    console.error('Hata mesajı:', error.toString());
    console.error('Hata detayı:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Kurye'nin başvurduğu ilanları listeleme
 */
function handleGetKuryeBasvurular(e) {
  try {
    const kuryeId = e.parameter.kuryeId;
    
    if (!kuryeId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Kurye ID gerekli'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const basvuruSheet = spreadsheet.getSheetByName(SHEET_BASVURULAR);
    
    if (!basvuruSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: [],
        count: 0
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = basvuruSheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: [],
        count: 0
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = rows[0];
    const kuryeIdIndex = headers.indexOf('kuryeId');
    
    const basvurular = [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][kuryeIdIndex] === kuryeId) {
        const basvuru = {};
        headers.forEach((header, index) => {
          basvuru[header] = rows[i][index] !== undefined && rows[i][index] !== null ? rows[i][index] : '';
        });
        
        // İlan bilgilerini çek
        const ilanId = basvuru.ilanId;
        const ilanFormType = basvuru.ilanFormType || 'isletme';
        
        let ilanSheet;
        if (ilanFormType === 'lojistik') {
          ilanSheet = spreadsheet.getSheetByName(SHEET_LOJISTIK);
        } else {
          ilanSheet = spreadsheet.getSheetByName(SHEET_ISLETME);
        }
        
        if (ilanSheet) {
          const ilanRows = ilanSheet.getDataRange().getValues();
          const ilanHeaders = ilanRows[0];
          const ilanIdIndex = ilanHeaders.indexOf('id');
          
          for (let j = 1; j < ilanRows.length; j++) {
            if (ilanRows[j][ilanIdIndex] === ilanId) {
              basvuru.ilanData = {};
              ilanHeaders.forEach((header, index) => {
                basvuru.ilanData[header] = ilanRows[j][index] !== undefined && ilanRows[j][index] !== null ? ilanRows[j][index] : '';
              });
              
              // raw_kart_json'ı parse et
              if (basvuru.ilanData.raw_kart_json && basvuru.ilanData.raw_kart_json !== '') {
                try {
                  basvuru.ilanData.raw_kart_json = JSON.parse(basvuru.ilanData.raw_kart_json);
                } catch (parseError) {
                  basvuru.ilanData.raw_kart_json = {};
                }
              } else {
                basvuru.ilanData.raw_kart_json = {};
              }
              
              break;
            }
          }
        }
        
        basvurular.push(basvuru);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: basvurular,
      count: basvurular.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Başvuru durumunu güncelleme (kabul/red)
 * 
 * LOG AÇIKLAMALARI:
 * - Bu fonksiyon işletme/lojistik tarafından başvuru durumunu günceller
 * - Durum: 'beklemede' (varsayılan), 'kabul', 'red'
 * - Notlar: İşletme/lojistik tarafından eklenebilir (opsiyonel)
 * 
 * PARAMETRELER:
 * - basvuruId: Güncellenecek başvurunun ID'si (zorunlu)
 * - durum: Yeni durum ('kabul' veya 'red', zorunlu)
 * - notlar: Ek notlar (opsiyonel)
 * 
 * DÖNÜŞ DEĞERİ:
 * - success: true/false
 * - message: İşlem mesajı
 * - error: Hata mesajı (başarısızsa)
 */
function handleUpdateBasvuruDurum(e) {
  try {
    console.log('=== BAŞVURU DURUMU GÜNCELLEME İŞLEMİ BAŞLADI ===');
    console.log('Zaman:', new Date().toISOString());
    
    const basvuruId = e.parameter.basvuruId;
    const durum = e.parameter.durum; // 'kabul' veya 'red'
    const notlar = e.parameter.notlar || '';
    
    console.log('Gelen Parametreler:');
    console.log('- Başvuru ID:', basvuruId);
    console.log('- Durum:', durum);
    console.log('- Notlar:', notlar || 'Yok');
    
    if (!basvuruId || !durum) {
      console.error('HATA: Başvuru ID veya durum eksik!');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Başvuru ID ve durum gerekli'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (durum !== 'kabul' && durum !== 'red') {
      console.error('HATA: Geçersiz durum değeri!');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Durum "kabul" veya "red" olmalı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('Google Sheets açılıyor...');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const basvuruSheet = spreadsheet.getSheetByName(SHEET_BASVURULAR);
    
    if (!basvuruSheet) {
      console.error('HATA: Başvurular sheet bulunamadı!');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Başvurular sheet bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = basvuruSheet.getDataRange().getValues();
    const headers = rows[0];
    const idIndex = headers.indexOf('id');
    const durumIndex = headers.indexOf('durum');
    const notlarIndex = headers.indexOf('notlar');
    const kuryeIdIndex = headers.indexOf('kuryeId');
    const kuryeEmailIndex = headers.indexOf('kuryeEmail');
    const ilanIdIndex = headers.indexOf('ilanId');
    const ilanFormTypeIndex = headers.indexOf('ilanFormType');
    
    console.log('Başvuru aranıyor...');
    let foundRowIndex = -1;
    let kuryeId = '';
    let kuryeEmail = '';
    let ilanId = '';
    let ilanFormType = '';
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === basvuruId) {
        foundRowIndex = i + 1; // Sheet satır numarası (1-based)
        console.log('Başvuru bulundu, satır:', foundRowIndex);
        console.log('Mevcut durum:', rows[i][durumIndex]);
        
        // Kurye bilgilerini al
        if (kuryeIdIndex !== -1) {
          kuryeId = rows[i][kuryeIdIndex] || '';
        }
        if (kuryeEmailIndex !== -1) {
          kuryeEmail = rows[i][kuryeEmailIndex] || '';
        }
        if (ilanIdIndex !== -1) {
          ilanId = rows[i][ilanIdIndex] || '';
        }
        if (ilanFormTypeIndex !== -1) {
          ilanFormType = rows[i][ilanFormTypeIndex] || '';
        }
        
        break;
      }
    }
    
    if (foundRowIndex === -1) {
      console.error('HATA: Başvuru bulunamadı!');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Başvuru bulunamadı'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Durum ve notları güncelle
    console.log('Durum güncelleniyor:', durum);
    basvuruSheet.getRange(foundRowIndex, durumIndex + 1).setValue(durum);
    if (notlarIndex !== -1 && notlar) {
      console.log('Notlar güncelleniyor...');
      basvuruSheet.getRange(foundRowIndex, notlarIndex + 1).setValue(notlar);
    }
    
    // İlan bilgilerini al (bildirim için)
    let ilanAdi = '';
    let ilanSehir = '';
    if (ilanId && ilanFormType) {
      try {
        let ilanSheet;
        if (ilanFormType === 'lojistik') {
          ilanSheet = spreadsheet.getSheetByName(SHEET_LOJISTIK);
        } else {
          ilanSheet = spreadsheet.getSheetByName(SHEET_ISLETME);
        }
        
        if (ilanSheet) {
          const ilanRows = ilanSheet.getDataRange().getValues();
          const ilanHeaders = ilanRows[0];
          const ilanIdColIndex = ilanHeaders.indexOf('id');
          const ilanAdiColIndex = ilanHeaders.indexOf('isletmeAdi');
          const ilanSehirColIndex = ilanHeaders.indexOf('sehir');
          
          for (let i = 1; i < ilanRows.length; i++) {
            if (ilanRows[i][ilanIdColIndex] === ilanId) {
              if (ilanAdiColIndex !== -1) {
                ilanAdi = ilanRows[i][ilanAdiColIndex] || '';
              }
              if (ilanSehirColIndex !== -1) {
                ilanSehir = ilanRows[i][ilanSehirColIndex] || '';
              }
              break;
            }
          }
        }
      } catch (error) {
        console.error('İlan bilgileri alınırken hata:', error);
      }
    }
    
    // Kuryeye email bildirimi gönder
    if (kuryeEmail) {
      try {
        const durumText = durum === 'kabul' ? 'Kabul Edildi' : 'Reddedildi';
        const durumMesaj = durum === 'kabul' 
          ? 'Tebrikler! Başvurunuz kabul edildi. İşletme/Lojistik firması ile iletişime geçebilirsiniz.'
          : 'Maalesef başvurunuz reddedildi. Başka ilanlara başvurabilirsiniz.';
        
        const emailKonu = `Kuryes - Başvuru Durumu: ${durumText}`;
        const emailIcerik = `
Merhaba,

${durumMesaj}

Başvuru Detayları:
- İlan: ${ilanAdi || 'Bilinmiyor'}
- Şehir: ${ilanSehir || 'Bilinmiyor'}
- Başvuru ID: ${basvuruId}
${notlar ? `- Notlar: ${notlar}` : ''}

${durum === 'kabul' ? 'İyi çalışmalar dileriz!' : 'Başka ilanlara başvurmayı unutmayın!'}

Kuryes Ekibi
        `.trim();
        
        MailApp.sendEmail({
          to: kuryeEmail,
          subject: emailKonu,
          body: emailIcerik
        });
        
        console.log('Email bildirimi gönderildi:', kuryeEmail);
      } catch (emailError) {
        console.error('Email gönderilirken hata oluştu:', emailError);
        // Email hatası işlemi durdurmaz, sadece log'a yazılır
      }
    } else {
      console.log('Kurye email adresi bulunamadı, bildirim gönderilmedi.');
    }
    
    console.log('Başvuru durumu başarıyla güncellendi!');
    console.log('=== BAŞVURU DURUMU GÜNCELLEME İŞLEMİ TAMAMLANDI ===');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Başvuru durumu güncellendi' + (kuryeEmail ? ' ve kuryeye bildirim gönderildi' : '')
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('=== BAŞVURU DURUMU GÜNCELLEME İŞLEMİ HATASI ===');
    console.error('Hata mesajı:', error.toString());
    console.error('Hata detayı:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
