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

/**
 * HTTP GET - Profil verilerini çeker
 */
function doGet(e) {
  try {
    const id = e.parameter.id;
    const formType = e.parameter.formType || 'kurye';
    
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
    
    // Tüm form verilerini JSON olarak kaydet
    const rawData = {};
    Object.keys(e.parameter).forEach(key => {
      if (key !== 'action' && key !== 'formType' && key !== 'sifre' && key !== 'sifreTekrar' && key !== 'jsonData') {
        rawData[key] = e.parameter[key];
      }
    });
    
    // jsonData varsa parse et ve birleştir
    if (e.parameter.jsonData) {
      try {
        const jsonData = JSON.parse(e.parameter.jsonData);
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
    'guncellemeTarihi'
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
    'guncellemeTarihi'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Başlık satırını formatla
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#ea4335');
  headerRange.setFontColor('#ffffff');
}

