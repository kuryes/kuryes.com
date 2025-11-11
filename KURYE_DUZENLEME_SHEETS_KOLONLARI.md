# Kurye Kartı Düzenleme - Google Sheets Kolonları

## Sheet Adı: `KuryeDuzenleme`

## Kolon Sıralaması:

1. **kuryeid** - Kurye ID (kayıt sayfasındaki ID ile aynı)
2. **adSoyad** - Ad Soyad
3. **telefon** - Telefon
4. **telefonGorunur** - Telefon Görünür (evet/hayır)
5. **email** - E-posta
6. **sehir** - Şehir
7. **ehliyet** - Ehliyet (B,A,A1,A2 - virgülle ayrılmış)
8. **motorVarmi** - Motor Var mı? (evet/hayır)
9. **motorMarka** - Motor Marka
10. **motorModel** - Motor Model
11. **motorYil** - Motor Yıl
12. **motorPlaka** - Motor Plaka
13. **plakaGorunur** - Plaka Görünür (evet/hayır)
14. **p1Belgesi** - P1 Belgesi (evet/hayır)
15. **srcBelgesi** - SRC Belgesi (evet/hayır)
16. **psikoteknik** - Psikoteknik (evet/hayır)
17. **deneyimler** - Deneyimler (JSON formatında veya virgülle ayrılmış)
18. **calismaModeli** - Çalışma Modeli (esnaf,sigortali - virgülle ayrılmış)
19. **acilMusaitlikCheck** - Acil Müsaitlik (evet/hayır)
20. **acilMusaitlikSaatlikCheck** - Acil Saatlik Ücret Check (evet/hayır)
21. **acilMusaitlikSaatlikUcret** - Acil Saatlik Ücret
22. **acilMusaitlikKmCheck** - Acil KM Ücreti Check (evet/hayır)
23. **acilMusaitlikKmUcret** - Acil KM Ücreti
24. **acilMusaitlikPaketCheck** - Acil Paket Ücreti Check (evet/hayır)
25. **acilMusaitlikPaketUcret** - Acil Paket Ücreti
26. **acilMusaitlikBaslangicSaati** - Acil Başlangıç Saati
27. **acilMusaitlikCikisSaati** - Acil Çıkış Saati
28. **acilMusaitlikOtomatikMesaj** - Acil Otomatik Mesaj
29. **acilMusaitlikEkBilgiler** - Acil Ek Bilgiler
30. **whatsapp** - WhatsApp
31. **whatsappGorunur** - WhatsApp Görünür (evet/hayır)
32. **telegram** - Telegram
33. **instagram** - Instagram
34. **guncellemeTarihi** - Güncelleme Tarihi (otomatik)

## Notlar:

- **kuryeid**: Kayıt sayfasındaki ID ile aynı olmalı (KUR-XXXXXXXX formatında)
- **ehliyet**: Birden fazla seçilebilir, virgülle ayrılmış olarak kaydedilecek (örn: "B,A")
- **deneyimler**: JSON array formatında veya özel format ile kaydedilebilir
- **calismaModeli**: Birden fazla seçilebilir, virgülle ayrılmış (örn: "esnaf,sigortali")
- Checkbox'lar: "evet" veya "hayır" olarak kaydedilecek
- **guncellemeTarihi**: Otomatik olarak eklenir (timestamp veya tarih formatı)


