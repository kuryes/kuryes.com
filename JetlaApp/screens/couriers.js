// Couriers Screen

function renderCouriers() {
  const content = document.getElementById('app-content');
  const couriers = Storage.get(STORAGE_KEYS.COURIERS, []);
  
  content.innerHTML = `
    <div class="space-y-4">
      <!-- Header with Add Button -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-black text-gray-800">Kuryeler</h2>
        <button onclick="showCourierForm()" class="btn-primary px-4 py-2 text-sm">
          + Kurye Ekle
        </button>
      </div>
      
      <!-- Couriers List -->
      <div class="space-y-3">
        ${couriers.length === 0 ? `
          <div class="card p-8 text-center">
            <div class="text-4xl mb-2">👥</div>
            <p class="text-gray-600">Henüz kurye eklenmemiş</p>
          </div>
        ` : couriers.map(courier => {
          const todayShifts = courier.shifts?.filter(s => DateUtils.isToday(s.start.split('T')[0])) || [];
          const activeShift = todayShifts.find(s => s.start && !s.end);
          
          return `
            <div class="card p-4">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-800 mb-1">${courier.name}</h3>
                  <p class="text-sm text-gray-600">📞 ${courier.phone}</p>
                  <p class="text-sm text-gray-600">📍 ${courier.region}</p>
                </div>
                ${activeShift ? `
                  <span class="badge badge-done">Aktif Vardiya</span>
                ` : ''}
              </div>
              
              <!-- Today's Shift -->
              ${todayShifts.length > 0 ? `
                <div class="bg-gray-50 rounded-lg p-3 mb-3">
                  <div class="text-sm font-semibold text-gray-700 mb-2">Bugünkü Vardiya</div>
                  ${todayShifts.map(shift => `
                    <div class="text-sm text-gray-600">
                      ${shift.start ? `Başlangıç: ${DateUtils.formatDateTime(shift.start)}` : ''}
                      ${shift.end ? ` - Bitiş: ${DateUtils.formatDateTime(shift.end)}` : ''}
                      ${!shift.end && activeShift ? `
                        <button onclick="endShift('${courier.id}', '${shift.start}')" class="ml-2 text-red-600 font-semibold text-xs">Vardiya Bitir</button>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : `
                <button onclick="startShift('${courier.id}')" class="btn-outline w-full py-2 text-sm mb-3">
                  Vardiya Başlat
                </button>
              `}
              
              <!-- Actions -->
              <div class="flex gap-2">
                <button onclick="showAvanceForm('${courier.id}')" class="flex-1 btn-outline py-2 text-xs">
                  💰 Avans
                </button>
                <button onclick="showCourierNoteForm('${courier.id}')" class="flex-1 btn-outline py-2 text-xs">
                  📝 Not
                </button>
                <button onclick="viewCourierDetails('${courier.id}')" class="flex-1 btn-outline py-2 text-xs">
                  📊 Detay
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function showCourierForm(courier = null) {
  const modalContent = `
    <div class="modal-content p-6">
      <h2 class="text-xl font-black text-gray-800 mb-4">${courier ? 'Kuryeyi Düzenle' : 'Yeni Kurye Ekle'}</h2>
      <form id="courier-form" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Ad Soyad *</label>
          <input type="text" id="courier-name" required class="input-field w-full" value="${courier?.name || ''}" placeholder="Kurye adı">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Telefon *</label>
          <input type="tel" id="courier-phone" required class="input-field w-full" value="${courier?.phone || ''}" placeholder="05XX XXX XX XX">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Bölge *</label>
          <input type="text" id="courier-region" required class="input-field w-full" value="${courier?.region || ''}" placeholder="Çalıştığı bölge">
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1 py-3">${courier ? 'Güncelle' : 'Kaydet'}</button>
          <button type="button" onclick="Modal.hide(this.closest('.modal-overlay'))" class="btn-outline flex-1 py-3">İptal</button>
        </div>
      </form>
    </div>
  `;
  
  const overlay = Modal.show(modalContent);
  
  document.getElementById('courier-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveCourier(courier?.id);
  });
}

function saveCourier(courierId) {
  const couriers = Storage.get(STORAGE_KEYS.COURIERS, []);
  
  const courier = {
    id: courierId || Date.now().toString(),
    name: document.getElementById('courier-name').value,
    phone: document.getElementById('courier-phone').value,
    region: document.getElementById('courier-region').value,
    shifts: courierId ? couriers.find(c => c.id === courierId)?.shifts || [] : [],
    payments: courierId ? couriers.find(c => c.id === courierId)?.payments || [] : [],
    notes: courierId ? couriers.find(c => c.id === courierId)?.notes || [] : []
  };
  
  if (courierId) {
    const index = couriers.findIndex(c => c.id === courierId);
    if (index !== -1) {
      couriers[index] = courier;
    }
  } else {
    couriers.push(courier);
  }
  
  Storage.set(STORAGE_KEYS.COURIERS, couriers);
  Modal.hide(document.querySelector('.modal-overlay'));
  renderCouriers();
}

function startShift(courierId) {
  const couriers = Storage.get(STORAGE_KEYS.COURIERS, []);
  const courier = couriers.find(c => c.id === courierId);
  if (courier) {
    if (!courier.shifts) courier.shifts = [];
    courier.shifts.push({
      start: DateUtils.now(),
      end: null
    });
    Storage.set(STORAGE_KEYS.COURIERS, couriers);
    renderCouriers();
  }
}

function endShift(courierId, startTime) {
  const couriers = Storage.get(STORAGE_KEYS.COURIERS, []);
  const courier = couriers.find(c => c.id === courierId);
  if (courier) {
    const shift = courier.shifts.find(s => s.start === startTime);
    if (shift) {
      shift.end = DateUtils.now();
      Storage.set(STORAGE_KEYS.COURIERS, couriers);
      renderCouriers();
    }
  }
}

function showAvanceForm(courierId) {
  const modalContent = `
    <div class="modal-content p-6">
      <h2 class="text-xl font-black text-gray-800 mb-4">Avans Ekle</h2>
      <form id="avance-form" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Miktar (₺) *</label>
          <input type="number" id="avance-amount" required class="input-field w-full" placeholder="0.00" step="0.01">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Not</label>
          <textarea id="avance-note" class="input-field w-full" rows="2" placeholder="Avans nedeni..."></textarea>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1 py-3">Kaydet</button>
          <button type="button" onclick="Modal.hide(this.closest('.modal-overlay'))" class="btn-outline flex-1 py-3">İptal</button>
        </div>
      </form>
    </div>
  `;
  
  const overlay = Modal.show(modalContent);
  
  document.getElementById('avance-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('avance-amount').value);
    const note = document.getElementById('avance-note').value;
    
    const couriers = Storage.get(STORAGE_KEYS.COURIERS, []);
    const courier = couriers.find(c => c.id === courierId);
    if (courier) {
      if (!courier.payments) courier.payments = [];
      courier.payments.push({
        amount: amount,
        reason: note || 'Avans',
        date: DateUtils.now()
      });
      Storage.set(STORAGE_KEYS.COURIERS, couriers);
      
      // Also add to finances
      const finances = Storage.get(STORAGE_KEYS.FINANCES, []);
      finances.push({
        id: Date.now().toString(),
        type: 'advance',
        amount: amount,
        who: courier.name,
        note: note || 'Avans',
        date: DateUtils.now()
      });
      Storage.set(STORAGE_KEYS.FINANCES, finances);
      
      Modal.hide(document.querySelector('.modal-overlay'));
      renderCouriers();
    }
  });
}

function showCourierNoteForm(courierId) {
  const modalContent = `
    <div class="modal-content p-6">
      <h2 class="text-xl font-black text-gray-800 mb-4">Kurye Notu Ekle</h2>
      <form id="note-form" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Not *</label>
          <textarea id="note-text" required class="input-field w-full" rows="4" placeholder="Notunuzu yazın..."></textarea>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1 py-3">Kaydet</button>
          <button type="button" onclick="Modal.hide(this.closest('.modal-overlay'))" class="btn-outline flex-1 py-3">İptal</button>
        </div>
      </form>
    </div>
  `;
  
  const overlay = Modal.show(modalContent);
  
  document.getElementById('note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const noteText = document.getElementById('note-text').value;
    
    const couriers = Storage.get(STORAGE_KEYS.COURIERS, []);
    const courier = couriers.find(c => c.id === courierId);
    if (courier) {
      if (!courier.notes) courier.notes = [];
      courier.notes.push({
        text: noteText,
        date: DateUtils.now()
      });
      Storage.set(STORAGE_KEYS.COURIERS, couriers);
      Modal.hide(document.querySelector('.modal-overlay'));
      renderCouriers();
    }
  });
}

function viewCourierDetails(courierId) {
  const couriers = Storage.get(STORAGE_KEYS.COURIERS, []);
  const courier = couriers.find(c => c.id === courierId);
  if (!courier) return;
  
  const totalPayments = courier.payments?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0;
  
  const modalContent = `
    <div class="modal-content p-6">
      <h2 class="text-xl font-black text-gray-800 mb-4">${courier.name} - Detaylar</h2>
      <div class="space-y-4">
        <div>
          <div class="text-sm font-semibold text-gray-700 mb-1">Toplam Avans</div>
          <div class="text-2xl font-black text-red-600">₺${totalPayments.toFixed(2)}</div>
        </div>
        ${courier.notes && courier.notes.length > 0 ? `
          <div>
            <div class="text-sm font-semibold text-gray-700 mb-2">Notlar</div>
            <div class="space-y-2">
              ${courier.notes.map(note => `
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-sm text-gray-800">${note.text}</p>
                  <p class="text-xs text-gray-500 mt-1">${DateUtils.formatDateTime(note.date)}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <button onclick="Modal.hide(this.closest('.modal-overlay'))" class="btn-primary w-full py-3">Kapat</button>
      </div>
    </div>
  `;
  
  Modal.show(modalContent);
}

// Register route
router.register('couriers', renderCouriers);

// Make functions globally accessible
window.showCourierNoteForm = showCourierNoteForm;
