// Node.js ile icon dosyalarını oluşturmak için script
// Kullanım: node generate-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, filename = null) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Kırmızı kare arka plan (#e53935)
    ctx.fillStyle = '#e53935';
    ctx.fillRect(0, 0, size, size);
    
    // Beyaz daire (ortada)
    const centerX = size / 2;
    const centerY = size / 2;
    const circleRadius = size * 0.35;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Kırmızı J harfi
    ctx.fillStyle = '#e53935';
    ctx.font = `bold ${size * 0.45}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('J', centerX, centerY);
    
    // PNG olarak kaydet
    const buffer = canvas.toBuffer('image/png');
    const outputFilename = filename || `icon-${size}.png`;
    fs.writeFileSync(outputFilename, buffer);
    console.log(`✓ ${outputFilename} oluşturuldu`);
}

// Icon'ları oluştur
createIcon(16, 'favicon-16x16.png');
createIcon(32, 'favicon-32x32.png');
createIcon(64, 'favicon-64x64.png');
createIcon(192);
createIcon(512);

console.log('\n✅ Tüm icon dosyaları oluşturuldu!');

