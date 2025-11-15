// Tasks Screen

let currentFilter = 'all';

function renderTasks() {
  const content = document.getElementById('app-content');
  const tasks = Storage.get(STORAGE_KEYS.TASKS, []);
  
  let filteredTasks = tasks;
  if (currentFilter !== 'all') {
    filteredTasks = tasks.filter(t => t.category === currentFilter || t.status === currentFilter);
  }
  
  content.innerHTML = `
    <div class="space-y-4">
      <!-- Header with Add Button -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-black text-gray-800">Görevler</h2>
        <button onclick="showTaskForm()" class="btn-primary px-4 py-2 text-sm">
          + Yeni Görev
        </button>
      </div>
      
      <!-- Filters -->
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button onclick="filterTasks('all')" class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${currentFilter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">
          Tümü
        </button>
        <button onclick="filterTasks('open')" class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${currentFilter === 'open' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">
          Açık
        </button>
        <button onclick="filterTasks('done')" class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${currentFilter === 'done' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">
          Tamamlanan
        </button>
        <button onclick="filterTasks('restoran')" class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${currentFilter === 'restoran' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">
          Restoran
        </button>
        <button onclick="filterTasks('kurye')" class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${currentFilter === 'kurye' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">
          Kurye
        </button>
      </div>
      
      <!-- Tasks List -->
      <div class="space-y-3">
        ${filteredTasks.length === 0 ? `
          <div class="card p-8 text-center">
            <div class="text-4xl mb-2">📋</div>
            <p class="text-gray-600">Henüz görev eklenmemiş</p>
          </div>
        ` : filteredTasks.map(task => `
          <div class="card p-4 ${task.status === 'done' ? 'opacity-60' : ''}">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-bold text-gray-800 ${task.status === 'done' ? 'line-through' : ''}">${task.title}</h3>
                  <span class="badge badge-${task.priority}">${task.priority}</span>
                  <span class="badge badge-${task.status}">${task.status === 'done' ? 'Tamamlandı' : 'Açık'}</span>
                </div>
                <p class="text-sm text-gray-600 mb-1">Kategori: ${task.category}</p>
                ${task.notes ? `<p class="text-sm text-gray-700 mt-2">${task.notes}</p>` : ''}
                <p class="text-xs text-gray-500 mt-2">${DateUtils.formatDateTime(task.date)}</p>
              </div>
              <div class="flex flex-col gap-2">
                ${task.status === 'open' ? `
                  <button onclick="markTaskDone('${task.id}')" class="text-green-600 text-sm font-semibold">✓ Tamamla</button>
                ` : `
                  <button onclick="markTaskOpen('${task.id}')" class="text-blue-600 text-sm font-semibold">↻ Aç</button>
                `}
                <button onclick="deleteTask('${task.id}')" class="text-red-600 text-sm font-semibold">🗑️ Sil</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function filterTasks(filter) {
  currentFilter = filter;
  renderTasks();
}

function showTaskForm(task = null) {
  const modalContent = `
    <div class="modal-content p-6">
      <h2 class="text-xl font-black text-gray-800 mb-4">${task ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}</h2>
      <form id="task-form" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Görev Başlığı</label>
          <input type="text" id="task-title" required class="input-field w-full" value="${task?.title || ''}" placeholder="Örn: Restoran ziyareti">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
          <select id="task-category" class="input-field w-full">
            <option value="genel" ${task?.category === 'genel' ? 'selected' : ''}>Genel</option>
            <option value="restoran" ${task?.category === 'restoran' ? 'selected' : ''}>Restoran</option>
            <option value="kurye" ${task?.category === 'kurye' ? 'selected' : ''}>Kurye</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Öncelik</label>
          <select id="task-priority" class="input-field w-full">
            <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>Düşük</option>
            <option value="medium" ${task?.priority === 'medium' ? 'selected' : ''}>Orta</option>
            <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>Yüksek</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Notlar</label>
          <textarea id="task-notes" class="input-field w-full" rows="3" placeholder="Ek notlar...">${task?.notes || ''}</textarea>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1 py-3">${task ? 'Güncelle' : 'Kaydet'}</button>
          <button type="button" onclick="Modal.hide(this.closest('.modal-overlay'))" class="btn-outline flex-1 py-3">İptal</button>
        </div>
      </form>
    </div>
  `;
  
  const overlay = Modal.show(modalContent);
  
  document.getElementById('task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveTask(task?.id);
  });
}

function saveTask(taskId) {
  const tasks = Storage.get(STORAGE_KEYS.TASKS, []);
  
  const task = {
    id: taskId || Date.now().toString(),
    title: document.getElementById('task-title').value,
    category: document.getElementById('task-category').value,
    priority: document.getElementById('task-priority').value,
    notes: document.getElementById('task-notes').value,
    status: taskId ? tasks.find(t => t.id === taskId)?.status || 'open' : 'open',
    date: taskId ? tasks.find(t => t.id === taskId)?.date || DateUtils.now() : DateUtils.now()
  };
  
  if (taskId) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = task;
    }
  } else {
    tasks.push(task);
  }
  
  Storage.set(STORAGE_KEYS.TASKS, tasks);
  Modal.hide(document.querySelector('.modal-overlay'));
  renderTasks();
}

function markTaskDone(taskId) {
  const tasks = Storage.get(STORAGE_KEYS.TASKS, []);
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'done';
    Storage.set(STORAGE_KEYS.TASKS, tasks);
    renderTasks();
  }
}

function markTaskOpen(taskId) {
  const tasks = Storage.get(STORAGE_KEYS.TASKS, []);
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'open';
    Storage.set(STORAGE_KEYS.TASKS, tasks);
    renderTasks();
  }
}

function deleteTask(taskId) {
  if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
    const tasks = Storage.get(STORAGE_KEYS.TASKS, []);
    const filtered = tasks.filter(t => t.id !== taskId);
    Storage.set(STORAGE_KEYS.TASKS, filtered);
    renderTasks();
  }
}

// Register route
router.register('tasks', renderTasks);
