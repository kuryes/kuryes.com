// Dashboard Screen

function renderDashboard() {
  const content = document.getElementById('app-content');
  
  // Get data
  const tasks = Storage.get(STORAGE_KEYS.TASKS, []);
  const visits = Storage.get(STORAGE_KEYS.VISITS, []);
  const couriers = Storage.get(STORAGE_KEYS.COURIERS, []);
  const finances = Storage.get(STORAGE_KEYS.FINANCES, []);
  
  const today = DateUtils.today();
  
  // Calculate stats
  const todayVisits = visits.filter(v => DateUtils.isToday(v.date)).length;
  const todayCourierMeetings = couriers.reduce((count, c) => {
    const todayNotes = c.notes?.filter(n => DateUtils.isToday(n.date)) || [];
    return count + todayNotes.length;
  }, 0);
  
  const todayFinances = finances.filter(f => DateUtils.isToday(f.date));
  const todayExpense = todayFinances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
  const todayPayment = todayFinances
    .filter(f => f.type === 'payment')
    .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
  
  const openTasks = tasks.filter(t => t.status === 'open').length;
  
  content.innerHTML = `
    <div class="space-y-4">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="stat-card card p-4">
          <div class="text-sm text-gray-600 mb-1">Bugün Ziyaret</div>
          <div class="text-3xl font-black text-red-600">${todayVisits}</div>
        </div>
        <div class="stat-card card p-4">
          <div class="text-sm text-gray-600 mb-1">Kurye Görüşmesi</div>
          <div class="text-3xl font-black text-red-600">${todayCourierMeetings}</div>
        </div>
        <div class="stat-card card p-4">
          <div class="text-sm text-gray-600 mb-1">Harcama</div>
          <div class="text-2xl font-black text-red-600">₺${todayExpense.toFixed(2)}</div>
        </div>
        <div class="stat-card card p-4">
          <div class="text-sm text-gray-600 mb-1">Ödeme</div>
          <div class="text-2xl font-black text-green-600">₺${todayPayment.toFixed(2)}</div>
        </div>
      </div>
      
      <!-- Open Tasks Card -->
      <div class="card p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600 mb-1">Açık Görevler</div>
            <div class="text-3xl font-black text-red-600">${openTasks}</div>
          </div>
          <button onclick="router.navigate('tasks')" class="text-red-600 font-semibold">
            Tümünü Gör →
          </button>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="card p-4">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Hızlı İşlemler</h2>
        <div class="grid grid-cols-2 gap-3">
          <button onclick="showAddTaskModal()" class="btn-outline py-3 px-4 text-sm font-semibold">
            ✏️ Yeni Görev
          </button>
          <button onclick="showAddVisitModal()" class="btn-outline py-3 px-4 text-sm font-semibold">
            🏪 Restoran Ekle
          </button>
          <button onclick="showAddAdvanceModal()" class="btn-outline py-3 px-4 text-sm font-semibold">
            💰 Avans Kaydet
          </button>
          <button onclick="showAddCourierNoteModal()" class="btn-outline py-3 px-4 text-sm font-semibold">
            👥 Kurye Notu
          </button>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="card p-4">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Son Aktiviteler</h2>
        <div class="space-y-2">
          ${getRecentActivities(tasks, visits, finances).slice(0, 5).map(activity => `
            <div class="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
              <div class="text-2xl">${activity.icon}</div>
              <div class="flex-1">
                <div class="text-sm font-semibold text-gray-800">${activity.title}</div>
                <div class="text-xs text-gray-500">${activity.time}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Settings Link -->
      <button onclick="router.navigate('settings')" class="card p-4 w-full text-left">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-2xl">⚙️</div>
            <div>
              <div class="font-semibold text-gray-800">Ayarlar</div>
              <div class="text-xs text-gray-500">Profil ve uygulama ayarları</div>
            </div>
          </div>
          <span class="text-gray-400">→</span>
        </div>
      </button>
    </div>
  `;
}

function getRecentActivities(tasks, visits, finances) {
  const activities = [];
  
  tasks.forEach(task => {
    activities.push({
      icon: '📋',
      title: `Görev: ${task.title}`,
      time: DateUtils.formatDateTime(task.date),
      date: task.date
    });
  });
  
  visits.forEach(visit => {
    activities.push({
      icon: '🏪',
      title: `Ziyaret: ${visit.name}`,
      time: DateUtils.formatDateTime(visit.date),
      date: visit.date
    });
  });
  
  finances.forEach(finance => {
    activities.push({
      icon: '💰',
      title: `${finance.type === 'advance' ? 'Avans' : finance.type === 'payment' ? 'Ödeme' : 'Harcama'}: ₺${finance.amount}`,
      time: DateUtils.formatDateTime(finance.date),
      date: finance.date
    });
  });
  
  return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function showAddTaskModal() {
  router.navigate('tasks');
  setTimeout(() => {
    const addBtn = document.querySelector('[onclick="showTaskForm()"]');
    if (addBtn) addBtn.click();
  }, 100);
}

function showAddVisitModal() {
  router.navigate('visits');
  setTimeout(() => {
    const addBtn = document.querySelector('[onclick="showVisitForm()"]');
    if (addBtn) addBtn.click();
  }, 100);
}

function showAddAdvanceModal() {
  router.navigate('finance');
  setTimeout(() => {
    const addBtn = document.querySelector('[onclick="showFinanceForm(\'advance\')"]');
    if (addBtn) addBtn.click();
  }, 100);
}

function showAddCourierNoteModal() {
  router.navigate('couriers');
}

// Register route
router.register('dashboard', renderDashboard);
