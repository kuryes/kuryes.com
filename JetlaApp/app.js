// Main Application Logic for Jatla Operations

// Data Storage Keys
const STORAGE_KEYS = {
  TASKS: 'jetla_tasks',
  VISITS: 'jetla_visits',
  COURIERS: 'jetla_couriers',
  FINANCES: 'jetla_finances',
  SETTINGS: 'jetla_settings'
};

// Utility Functions
const Storage = {
  get(key, defaultValue = []) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  clear() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

// Date Utilities
const DateUtils = {
  today() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  },

  now() {
    return new Date().toISOString();
  },

  formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  formatDateTime(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  isToday(dateString) {
    return dateString === this.today();
  }
};

// Modal Utility
const Modal = {
  show(content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = content;
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hide(overlay);
      }
    });

    document.body.appendChild(overlay);
    return overlay;
  },

  hide(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.remove();
    }
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('Jatla Operations initialized');
});
