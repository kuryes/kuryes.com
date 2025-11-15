// Visits Screen

function renderVisits() {
  const content = document.getElementById('app-content');
  const visits = Storage.get(STORAGE_KEYS.VISITS, []);
  
  // Group by date
  const groupedVisits = {};
  visits.forEach(visit => {
    const date = visit.date.split('T')[0];
    if (!groupedVisits[date]) {
      groupedVisits[date] = [];
    }
    groupedVisits[date].push(visit);
  });
  
  const sortedDates = Object.keys(groupedVisits).sort((a, b) => new Date(b) - new Date(a));
  
  content.innerHTML = `
    <div class="space-y-4">
      <!-- Header with Add Button -->
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-black text-gray-800">Ziyaret Edilen Restoranlar</h2>
        <button onclick="showVisitForm()" class="btn-primary px-4 py-2 text-sm">
          + Yeni Ziyaret
        </button>
      </div>
      
      <!-- Quick Link to Couriers -->
      <button onclick="router.navigate('couriers')" class="card p-3 mb-4 w-full text-left bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-xl">👥</div>
            <div>
              <div class="font-semibold text-gray-800">Kurye Yönetimi</div>
              <div class="text-xs text-gray-500">Kuryeler ve vardiya takibi</div>
            </div>
          </div>
          <span class="text-gray-400">→</span>
        </div>
      </button>
      
      <!-- Visits List -->
      <div class="space-y-4">
        ${visits.length === 0 ? `
          <div class="card p-8 text-center">
            <div class="text-4xl mb-2">🏪</div>
            <p class="text-gray-600">Henüz ziyaret kaydı yok</p>
          </div>
        ` : sortedDates.map(date => `
          <div>
            <h3 class="text-sm font-bold text-gray-600 mb-2">${DateUtils.formatDate(date)}</h3>
            <div class="space-y-3">
              ${groupedVisits[date].map(visit => `
                <div class="card p-4 visit-card" data-visit-id="${visit.id}">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                      <h3 class="font-bold text-gray-800 mb-1">${visit.name}</h3>
                      <p class="text-sm text-gray-600 mb-1">
                        ${visit.coordinates ? `
                          <a href="https://www.google.com/maps?q=${visit.coordinates.lat},${visit.coordinates.lng}" target="_blank" class="text-red-600 hover:underline flex items-center gap-1">
                            📍 ${visit.location}
                          </a>
                        ` : `📍 ${visit.location}`}
                      </p>
                      ${visit.contactName ? `<p class="text-sm text-gray-600 mb-1">👤 ${visit.contactName} - ${visit.phone}</p>` : ''}
                      <div class="flex items-center gap-2 mt-2">
                        <span class="badge ${visit.result === 'positive' ? 'badge-done' : visit.result === 'negative' ? 'badge-high' : 'badge-medium'}">
                          ${visit.result === 'positive' ? 'Olumlu' : visit.result === 'negative' ? 'Olumsuz' : 'Teklif Verildi'}
                        </span>
                        ${visit.offerPrice ? `<span class="text-sm font-semibold text-red-600">₺${visit.offerPrice}</span>` : ''}
                      </div>
                      ${visit.notes ? `<p class="text-sm text-gray-700 mt-2 visit-notes" style="display: none;">${visit.notes}</p>` : ''}
                    </div>
                    <button onclick="toggleVisitDetails('${visit.id}')" class="text-red-600 font-semibold text-sm">
                      Detay
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleVisitDetails(visitId) {
  const card = document.querySelector(`[data-visit-id="${visitId}"]`);
  const notes = card.querySelector('.visit-notes');
  if (notes) {
    notes.style.display = notes.style.display === 'none' ? 'block' : 'none';
  }
}

function showVisitForm(visit = null) {
  const modalContent = `
    <div class="modal-content p-6">
      <h2 class="text-xl font-black text-gray-800 mb-4">${visit ? 'Ziyareti Düzenle' : 'Yeni Ziyaret Ekle'}</h2>
      <form id="visit-form" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Restoran Adı *</label>
          <input type="text" id="visit-name" required class="input-field w-full" value="${visit?.name || ''}" placeholder="Restoran adı">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Konum *</label>
          <div class="flex gap-2">
            <input type="text" id="visit-location" required class="input-field flex-1" value="${visit?.location || ''}" placeholder="Adres veya bölge">
            <button type="button" onclick="getCurrentLocation()" class="btn-primary px-4 py-3 whitespace-nowrap" title="Mevcut konumu al">
              📍 GPS
            </button>
          </div>
          <div id="location-status" class="text-xs text-gray-500 mt-1"></div>
          <input type="hidden" id="visit-lat" value="${visit?.coordinates?.lat || ''}">
          <input type="hidden" id="visit-lng" value="${visit?.coordinates?.lng || ''}">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">İletişim Kişisi</label>
          <input type="text" id="visit-contact" class="input-field w-full" value="${visit?.contactName || ''}" placeholder="İsim">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
          <input type="tel" id="visit-phone" class="input-field w-full" value="${visit?.phone || ''}" placeholder="05XX XXX XX XX">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Görüşme Sonucu</label>
          <select id="visit-result" class="input-field w-full">
            <option value="positive" ${visit?.result === 'positive' ? 'selected' : ''}>Olumlu</option>
            <option value="negative" ${visit?.result === 'negative' ? 'selected' : ''}>Olumsuz</option>
            <option value="offer" ${visit?.result === 'offer' ? 'selected' : ''}>Teklif Verildi</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Teklif Fiyatı (₺)</label>
          <input type="number" id="visit-offer" class="input-field w-full" value="${visit?.offerPrice || ''}" placeholder="0.00" step="0.01">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Notlar</label>
          <textarea id="visit-notes" class="input-field w-full" rows="3" placeholder="Ek notlar...">${visit?.notes || ''}</textarea>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1 py-3">${visit ? 'Güncelle' : 'Kaydet'}</button>
          <button type="button" onclick="Modal.hide(this.closest('.modal-overlay'))" class="btn-outline flex-1 py-3">İptal</button>
        </div>
      </form>
    </div>
  `;
  
  const overlay = Modal.show(modalContent);
  
  document.getElementById('visit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveVisit(visit?.id);
  });
}

function saveVisit(visitId) {
  const visits = Storage.get(STORAGE_KEYS.VISITS, []);
  
  const lat = document.getElementById('visit-lat').value;
  const lng = document.getElementById('visit-lng').value;
  
  const visit = {
    id: visitId || Date.now().toString(),
    name: document.getElementById('visit-name').value,
    location: document.getElementById('visit-location').value,
    coordinates: (lat && lng) ? {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    } : null,
    contactName: document.getElementById('visit-contact').value,
    phone: document.getElementById('visit-phone').value,
    result: document.getElementById('visit-result').value,
    offerPrice: document.getElementById('visit-offer').value ? parseFloat(document.getElementById('visit-offer').value) : null,
    notes: document.getElementById('visit-notes').value,
    date: visitId ? visits.find(v => v.id === visitId)?.date || DateUtils.now() : DateUtils.now()
  };
  
  if (visitId) {
    const index = visits.findIndex(v => v.id === visitId);
    if (index !== -1) {
      visits[index] = visit;
    }
  } else {
    visits.push(visit);
  }
  
  Storage.set(STORAGE_KEYS.VISITS, visits);
  Modal.hide(document.querySelector('.modal-overlay'));
  renderVisits();
}

// GPS konum alma fonksiyonu
function getCurrentLocation() {
  const statusDiv = document.getElementById('location-status');
  const locationInput = document.getElementById('visit-location');
  const latInput = document.getElementById('visit-lat');
  const lngInput = document.getElementById('visit-lng');
  
  if (!navigator.geolocation) {
    statusDiv.textContent = '❌ Tarayıcınız konum özelliğini desteklemiyor';
    statusDiv.className = 'text-xs text-red-600 mt-1';
    return;
  }
  
  statusDiv.textContent = '📍 Konum alınıyor...';
  statusDiv.className = 'text-xs text-blue-600 mt-1';
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      // Koordinatları kaydet
      latInput.value = lat;
      lngInput.value = lng;
      
      // Reverse geocoding ile adres al (opsiyonel)
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        
        if (data && data.display_name) {
          locationInput.value = data.display_name;
          statusDiv.textContent = '✅ Konum alındı: ' + data.display_name.split(',')[0];
          statusDiv.className = 'text-xs text-green-600 mt-1';
        } else {
          locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          statusDiv.textContent = '✅ Konum alındı';
          statusDiv.className = 'text-xs text-green-600 mt-1';
        }
      } catch (error) {
        // Geocoding başarısız olursa sadece koordinatları göster
        locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        statusDiv.textContent = '✅ Konum alındı (koordinatlar)';
        statusDiv.className = 'text-xs text-green-600 mt-1';
      }
    },
    (error) => {
      let errorMsg = 'Konum alınamadı: ';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMsg += 'Konum izni reddedildi';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg += 'Konum bilgisi alınamadı';
          break;
        case error.TIMEOUT:
          errorMsg += 'İstek zaman aşımına uğradı';
          break;
        default:
          errorMsg += 'Bilinmeyen hata';
          break;
      }
      statusDiv.textContent = '❌ ' + errorMsg;
      statusDiv.className = 'text-xs text-red-600 mt-1';
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// Register route
router.register('visits', renderVisits);

// Make getCurrentLocation globally accessible
window.getCurrentLocation = getCurrentLocation;
