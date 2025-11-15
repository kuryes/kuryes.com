// Settings Screen

function renderSettings() {
  const content = document.getElementById('app-content');
  const settings = Storage.get(STORAGE_KEYS.SETTINGS, {});
  
  content.innerHTML = `
    <div class="space-y-4">
      <h2 class="text-xl font-black text-gray-800">Ayarlar</h2>
      
      <!-- Profile Card -->
      <div class="card p-4">
        <h3 class="font-bold text-gray-800 mb-4">Profil Bilgileri</h3>
        <form id="profile-form" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Adınız</label>
            <input type="text" id="profile-name" class="input-field w-full" value="${settings.name || ''}" placeholder="Adınız">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Bölge</label>
            <input type="text" id="profile-region" class="input-field w-full" value="${settings.region || ''}" placeholder="Çalıştığınız bölge">
          </div>
          <button type="submit" class="btn-primary w-full py-3">Kaydet</button>
        </form>
      </div>
      
      <!-- App Info -->
      <div class="card p-4">
        <h3 class="font-bold text-gray-800 mb-3">Uygulama Bilgisi</h3>
        <div class="space-y-2 text-sm text-gray-600">
          <div class="flex justify-between">
            <span>Versiyon</span>
            <span class="font-semibold">1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span>Geliştirici</span>
            <span class="font-semibold">Jatla Operations</span>
          </div>
        </div>
      </div>
      
      <!-- Data Management -->
      <div class="card p-4">
        <h3 class="font-bold text-gray-800 mb-3">Veri Yönetimi</h3>
        <div class="space-y-2">
          <button onclick="exportData()" class="btn-outline w-full py-3">
            📥 Verileri Dışa Aktar
          </button>
          <button onclick="importData()" class="btn-outline w-full py-3">
            📤 Verileri İçe Aktar
          </button>
        </div>
      </div>
      
      <!-- Danger Zone -->
      <div class="card p-4 border-2 border-red-200">
        <h3 class="font-bold text-red-600 mb-3">Tehlikeli Bölge</h3>
        <button onclick="confirmLogout()" class="btn-primary w-full py-3 bg-red-600 hover:bg-red-700">
          🚪 Çıkış Yap (Tüm Verileri Sil)
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfile();
  });
}

function saveProfile() {
  const settings = {
    name: document.getElementById('profile-name').value,
    region: document.getElementById('profile-region').value
  };
  Storage.set(STORAGE_KEYS.SETTINGS, settings);
  alert('Profil bilgileri kaydedildi!');
  renderSettings();
}

function confirmLogout() {
  if (confirm('Tüm veriler silinecek. Emin misiniz?')) {
    Storage.clear();
    alert('Tüm veriler silindi. Sayfa yenilenecek.');
    location.reload();
  }
}

function exportData() {
  const data = {
    tasks: Storage.get(STORAGE_KEYS.TASKS, []),
    visits: Storage.get(STORAGE_KEYS.VISITS, []),
    couriers: Storage.get(STORAGE_KEYS.COURIERS, []),
    finances: Storage.get(STORAGE_KEYS.FINANCES, []),
    settings: Storage.get(STORAGE_KEYS.SETTINGS, {}),
    exportDate: DateUtils.now()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jatla-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.tasks) Storage.set(STORAGE_KEYS.TASKS, data.tasks);
          if (data.visits) Storage.set(STORAGE_KEYS.VISITS, data.visits);
          if (data.couriers) Storage.set(STORAGE_KEYS.COURIERS, data.couriers);
          if (data.finances) Storage.set(STORAGE_KEYS.FINANCES, data.finances);
          if (data.settings) Storage.set(STORAGE_KEYS.SETTINGS, data.settings);
          alert('Veriler başarıyla içe aktarıldı!');
          location.reload();
        } catch (error) {
          alert('Dosya okunamadı: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

// Register route
router.register('settings', renderSettings);
