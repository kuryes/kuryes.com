// Finance Screen

let currentFinanceFilter = 'all';

function renderFinance() {
  const content = document.getElementById('app-content');
  const finances = Storage.get(STORAGE_KEYS.FINANCES, []);
  
  let filteredFinances = finances;
  if (currentFinanceFilter !== 'all') {
    filteredFinances = finances.filter(f => f.type === currentFinanceFilter);
  }
  
  // Sort by date (newest first)
  filteredFinances.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Calculate today's totals
  const today = DateUtils.today();
  const todayFinances = finances.filter(f => DateUtils.isToday(f.date.split('T')[0]));
  const todayTotal = todayFinances.reduce((sum, f) => {
    if (f.type === 'advance' || f.type === 'expense') {
      return sum - (parseFloat(f.amount) || 0);
    } else {
      return sum + (parseFloat(f.amount) || 0);
    }
  }, 0);
  
  const todayAdvance = todayFinances
    .filter(f => f.type === 'advance')
    .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
  const todayPayment = todayFinances
    .filter(f => f.type === 'payment')
    .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
  const todayExpense = todayFinances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
  
  content.innerHTML = `
    <div class="space-y-4">
      <!-- Header with Add Button -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-black text-gray-800">Finans</h2>
        <button onclick="showFinanceForm()" class="btn-primary px-4 py-2 text-sm">
          + İşlem Ekle
        </button>
      </div>
      
      <!-- Today Summary Card -->
      <div class="card p-4 bg-gradient-to-r from-red-50 to-white">
        <div class="text-sm text-gray-600 mb-2">Bugünkü Özet</div>
        <div class="text-2xl font-black mb-3 ${todayTotal >= 0 ? 'text-green-600' : 'text-red-600'}">
          ${todayTotal >= 0 ? '+' : ''}₺${Math.abs(todayTotal).toFixed(2)}
        </div>
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div class="text-gray-600">Avans</div>
            <div class="font-bold text-red-600">₺${todayAdvance.toFixed(2)}</div>
          </div>
          <div>
            <div class="text-gray-600">Ödeme</div>
            <div class="font-bold text-green-600">₺${todayPayment.toFixed(2)}</div>
          </div>
          <div>
            <div class="text-gray-600">Harcama</div>
            <div class="font-bold text-orange-600">₺${todayExpense.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button onclick="filterFinance('all')" class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${currentFinanceFilter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">
          Tümü
        </button>
        <button onclick="filterFinance('advance')" class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${currentFinanceFilter === 'advance' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">
          Avans
        </button>
        <button onclick="filterFinance('payment')" class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${currentFinanceFilter === 'payment' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">
          Ödeme
        </button>
        <button onclick="filterFinance('expense')" class="filter-btn px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${currentFinanceFilter === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}">
          Harcama
        </button>
      </div>
      
      <!-- Finance List -->
      <div class="space-y-3">
        ${filteredFinances.length === 0 ? `
          <div class="card p-8 text-center">
            <div class="text-4xl mb-2">💰</div>
            <p class="text-gray-600">Henüz finans kaydı yok</p>
          </div>
        ` : filteredFinances.map(finance => {
          const typeLabels = {
            advance: 'Avans',
            payment: 'Ödeme',
            expense: 'Harcama'
          };
          const typeColors = {
            advance: 'text-red-600',
            payment: 'text-green-600',
            expense: 'text-orange-600'
          };
          const typeIcons = {
            advance: '💰',
            payment: '💳',
            expense: '💸'
          };
          
          return `
            <div class="card p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">${typeIcons[finance.type]}</span>
                    <span class="badge ${finance.type === 'advance' ? 'badge-high' : finance.type === 'payment' ? 'badge-done' : 'badge-medium'}">
                      ${typeLabels[finance.type]}
                    </span>
                  </div>
                  <div class="text-lg font-black ${typeColors[finance.type]} mb-1">
                    ${finance.type === 'expense' || finance.type === 'advance' ? '-' : '+'}₺${parseFloat(finance.amount || 0).toFixed(2)}
                  </div>
                  <p class="text-sm text-gray-600">${finance.who || 'Genel'}</p>
                  ${finance.note ? `<p class="text-sm text-gray-700 mt-1">${finance.note}</p>` : ''}
                  <p class="text-xs text-gray-500 mt-2">${DateUtils.formatDateTime(finance.date)}</p>
                </div>
                <button onclick="deleteFinance('${finance.id}')" class="text-red-600 font-semibold text-sm">🗑️</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function filterFinance(filter) {
  currentFinanceFilter = filter;
  renderFinance();
}

function showFinanceForm(type = null) {
  const modalContent = `
    <div class="modal-content p-6">
      <h2 class="text-xl font-black text-gray-800 mb-4">Yeni İşlem Ekle</h2>
      <form id="finance-form" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">İşlem Tipi *</label>
          <select id="finance-type" required class="input-field w-full">
            <option value="advance" ${type === 'advance' ? 'selected' : ''}>Avans</option>
            <option value="payment" ${type === 'payment' ? 'selected' : ''}>Ödeme</option>
            <option value="expense" ${type === 'expense' ? 'selected' : ''}>Harcama</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Miktar (₺) *</label>
          <input type="number" id="finance-amount" required class="input-field w-full" placeholder="0.00" step="0.01">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Kim/Kimden</label>
          <input type="text" id="finance-who" class="input-field w-full" placeholder="Kurye, işletme veya genel">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Not</label>
          <textarea id="finance-note" class="input-field w-full" rows="2" placeholder="İşlem açıklaması..."></textarea>
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary flex-1 py-3">Kaydet</button>
          <button type="button" onclick="Modal.hide(this.closest('.modal-overlay'))" class="btn-outline flex-1 py-3">İptal</button>
        </div>
      </form>
    </div>
  `;
  
  const overlay = Modal.show(modalContent);
  
  document.getElementById('finance-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveFinance();
  });
}

function saveFinance() {
  const finances = Storage.get(STORAGE_KEYS.FINANCES, []);
  
  const finance = {
    id: Date.now().toString(),
    type: document.getElementById('finance-type').value,
    amount: parseFloat(document.getElementById('finance-amount').value),
    who: document.getElementById('finance-who').value || 'Genel',
    note: document.getElementById('finance-note').value,
    date: DateUtils.now()
  };
  
  finances.push(finance);
  Storage.set(STORAGE_KEYS.FINANCES, finances);
  Modal.hide(document.querySelector('.modal-overlay'));
  renderFinance();
}

function deleteFinance(financeId) {
  if (confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
    const finances = Storage.get(STORAGE_KEYS.FINANCES, []);
    const filtered = finances.filter(f => f.id !== financeId);
    Storage.set(STORAGE_KEYS.FINANCES, filtered);
    renderFinance();
  }
}

// Register route
router.register('finance', renderFinance);

// Make function globally accessible
window.showFinanceForm = showFinanceForm;
