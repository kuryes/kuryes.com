// Hash-based Router for Jatla Operations

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.init();
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  register(route, handler) {
    this.routes[route] = handler;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const route = hash.split('/')[0];
    
    if (this.routes[route]) {
      this.currentRoute = route;
      this.updateNavigation(route);
      this.routes[route]();
    } else {
      // Default to dashboard
      window.location.hash = 'dashboard';
    }
  }

  updateNavigation(activeRoute) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const route = item.getAttribute('data-route');
      if (route === activeRoute) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  navigate(route) {
    window.location.hash = route;
  }
}

// Initialize router
const router = new Router();

// Navigation button handlers
document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const route = button.getAttribute('data-route');
      router.navigate(route);
    });
  });
});
