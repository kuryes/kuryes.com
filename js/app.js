// Kuryes.com - Main JavaScript File
// Dynamic favicon, city selector, and price calculator

// Dynamic Favicon - Color Cycling
class DynamicFavicon {
    constructor() {
        this.colors = ['red', 'yellow', 'orange', 'turquoise'];
        this.currentIndex = 0;
        this.interval = null;
        this.init();
    }
    
    init() {
        // Set initial favicon (red)
        this.updateFavicon('red');
        
        // Start color cycling every 30 seconds
        this.interval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.colors.length;
            this.updateFavicon(this.colors[this.currentIndex]);
        }, 30000);
    }
    
    updateFavicon(color) {
        const favicon32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
        const favicon64 = document.querySelector('link[rel="icon"][sizes="64x64"]');
        const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
        
        if (favicon32) favicon32.href = `/favicon/favicon-32x32-${color}.png`;
        if (favicon64) favicon64.href = `/favicon/favicon-64x64-${color}.png`;
        if (appleTouchIcon) appleTouchIcon.href = `/favicon/apple-touch-icon-${color}.png`;
    }
    
    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// City Selector
class CitySelector {
    constructor() {
        this.currentCity = localStorage.getItem('city') || 'Antalya';
        this.init();
    }
    
    init() {
        this.updateCityDisplay();
        this.bindEvents();
    }
    
    updateCityDisplay() {
        // Update city-specific content
        const cityElements = document.querySelectorAll('[data-city]');
        cityElements.forEach(element => {
            const city = element.getAttribute('data-city');
            if (city === this.currentCity) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
        
        // Update pilot badge visibility
        const pilotBadges = document.querySelectorAll('.pilot-badge');
        pilotBadges.forEach(badge => {
            if (this.currentCity === 'Antalya') {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }
    
    bindEvents() {
        // City card clicks
        document.addEventListener('click', (e) => {
            const cityCard = e.target.closest('[data-city-card]');
            if (cityCard) {
                const city = cityCard.getAttribute('data-city-card');
                this.setCity(city);
            }
        });
    }
    
    setCity(city) {
        this.currentCity = city;
        localStorage.setItem('city', city);
        this.updateCityDisplay();
    }
    
    getCurrentCity() {
        return this.currentCity;
    }
}

// Price Calculator (Haversine formula for distance calculation)
class PriceCalculator {
    constructor() {
        this.basePrice = 60;
        this.pricePerKm = 12;
        this.minTime = 10; // minutes
        this.timePerKm = 2; // minutes per km
    }
    
    // Haversine formula to calculate distance between two points
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Calculate price based on distance
    calculatePrice(distance) {
        return this.basePrice + (this.pricePerKm * distance);
    }
    
    // Calculate estimated time
    calculateTime(distance) {
        return Math.max(this.minTime, distance * this.timePerKm);
    }
    
    // Demo calculation for addresses (simplified)
    calculateDemoPrice(startAddress, endAddress) {
        // For demo purposes, generate random distance between 2-15 km
        const distance = Math.random() * 13 + 2;
        const price = this.calculatePrice(distance);
        const time = this.calculateTime(distance);
        
        return {
            distance: distance,
            price: price,
            time: time
        };
    }
}

// Form Handler
class FormHandler {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindFormEvents();
    }
    
    bindFormEvents() {
        // Handle all forms with Formspree
        const forms = document.querySelectorAll('form[action*="formspree"]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e, form);
            });
        });
    }
    
    handleFormSubmit(event, form) {
        event.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Gönderiliyor...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual Formspree handling)
        setTimeout(() => {
            this.showSuccessMessage(form);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
    
    showSuccessMessage(form) {
        const successMessage = form.parentElement.querySelector('[id*="successMessage"], [id*="SuccessMessage"]');
        if (successMessage) {
            successMessage.classList.remove('hidden');
            form.style.display = 'none';
        }
    }
}

// Mobile Menu Handler
class MobileMenuHandler {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                mobileMenu.classList.toggle('hidden');
                
                // Animate hamburger icon
                const iconSvg = mobileMenuBtn.querySelector('svg');
                if (iconSvg) {
                    const path = iconSvg.querySelector('path');
                    if (mobileMenu.classList.contains('hidden')) {
                        // Show hamburger (3 lines)
                        path.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
                    } else {
                        // Show X (close)
                        path.setAttribute('d', 'M6 18L18 6M6 6l12 12');
                    }
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                    // Reset hamburger icon
                    const iconSvg = mobileMenuBtn.querySelector('svg');
                    if (iconSvg) {
                        const path = iconSvg.querySelector('path');
                        path.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
                    }
                }
            });
            
            // Close menu when clicking on menu links
            const menuLinks = mobileMenu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    // Reset hamburger icon
                    const iconSvg = mobileMenuBtn.querySelector('svg');
                    if (iconSvg) {
                        const path = iconSvg.querySelector('path');
                        path.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
                    }
                });
            });
        }
    }
}

// Utility Functions
class Utils {
    static formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    static formatNumber(number) {
        return new Intl.NumberFormat('tr-TR').format(number);
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// PWA Service Worker Registration
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }
    
    init() {
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
            this.setupInstallPrompt();
        }
    }
    
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });
            
            console.log('Service Worker registered:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker available
                        this.showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
    
    setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Show install button
            this.showInstallButton();
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.deferredPrompt = null;
            this.hideInstallButton();
        });
    }
    
    async installPWA() {
        if (!this.deferredPrompt) {
            return false;
        }
        
        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for the user to respond
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        
        // Clear the deferredPrompt
        this.deferredPrompt = null;
        this.hideInstallButton();
        
        return outcome === 'accepted';
    }
    
    showInstallButton() {
        let installButton = document.getElementById('installPWA');
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'installPWA';
            installButton.className = 'fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 transition-all z-50 flex items-center gap-2';
            installButton.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Ana Ekrana Ekle';
            installButton.addEventListener('click', () => this.installPWA());
            
            // Add to body
            document.body.appendChild(installButton);
            
            // Animate in
            setTimeout(() => {
                installButton.classList.add('animate-fadeInUp');
            }, 100);
        }
        installButton.classList.remove('hidden');
    }
    
    hideInstallButton() {
        const installButton = document.getElementById('installPWA');
        if (installButton) {
            installButton.classList.add('hidden');
        }
    }
    
    showUpdateNotification() {
        // You can add a notification banner here
        console.log('New version available! Refresh to update.');
    }
    
    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }
}

// Initialize PWA Manager
let pwaManager = null;

// Page-specific initialization
function initializePageSpecificFeatures() {
    const currentPage = window.location.pathname;
    
    // Freelance page specific features
    if (currentPage.includes('freelance.html')) {
        initializeFreelancePage();
    }
    
    // Kazanç page specific features
    if (currentPage.includes('kazanc.html')) {
        initializeKazancPage();
    }
}

// Freelance page initialization
function initializeFreelancePage() {
    const startInput = document.getElementById('baslangic');
    const endInput = document.getElementById('teslim');
    
    if (startInput && endInput) {
        const debouncedCalculate = Utils.debounce(() => {
            if (startInput.value && endInput.value) {
                const result = window.priceCalculator.calculateDemoPrice(startInput.value, endInput.value);
                
                // Update UI elements
                const distanceEl = document.getElementById('mesafe');
                const timeEl = document.getElementById('sure');
                const priceEl = document.getElementById('ucret');
                
                if (distanceEl) distanceEl.textContent = result.distance.toFixed(1) + ' km';
                if (timeEl) timeEl.textContent = Math.round(result.time) + ' dk';
                if (priceEl) priceEl.textContent = Math.round(result.price) + ' TL';
            }
        }, 500);
        
        startInput.addEventListener('input', debouncedCalculate);
        endInput.addEventListener('input', debouncedCalculate);
    }
}

// Kazanç page initialization
function initializeKazancPage() {
    // This is handled by the inline script in kazanc.html
    // But we can add additional functionality here if needed
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize PWA Manager first (for service worker registration)
    if ('serviceWorker' in navigator) {
        pwaManager = new PWAManager();
        window.pwaManager = pwaManager;
    }
    
    // Initialize all components
    window.dynamicFavicon = new DynamicFavicon();
    window.citySelector = new CitySelector();
    window.priceCalculator = new PriceCalculator();
    window.formHandler = new FormHandler();
    window.mobileMenuHandler = new MobileMenuHandler();
    
    // Initialize page-specific functionality
    initializePageSpecificFeatures();
});

// Export for use in other scripts
window.KuryesApp = {
    DynamicFavicon,
    CitySelector,
    PriceCalculator,
    FormHandler,
    MobileMenuHandler,
    Utils,
    PWAManager
};
