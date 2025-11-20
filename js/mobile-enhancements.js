// Kuryes.com - Mobile Enhancements
// Bottom Navigation, FAB Button, Pull-to-Refresh

class MobileEnhancements {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }
    
    init() {
        this.initBottomNav();
        this.initFAB();
        this.initPullToRefresh();
        this.updateActiveNavItem();
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('index.html') || path === '/' || path.endsWith('/')) return 'index';
        if (path.includes('ilanlar.html')) return 'ilanlar';
        if (path.includes('forum.html')) return 'forum';
        if (path.includes('kazanc.html')) return 'kazanc';
        if (path.includes('kurye-kart.html') || path.includes('isletme-kart.html') || path.includes('lojistik-kart.html')) return 'profil';
        return 'index';
    }
    
    initBottomNav() {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
                
                // Update profile link if needed
                const page = item.getAttribute('data-page');
                if (page === 'profil') {
                    e.preventDefault();
                    this.navigateToProfile();
                }
            });
        });
        
        // Update profile link based on auth state
        this.updateProfileLink();
    }
    
    updateProfileLink() {
        const profileLink = document.getElementById('bottomNavProfile');
        if (!profileLink) return;
        
        // Check if user is logged in
        const userData = localStorage.getItem('kuryes_user_data');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                const userType = user.userType || user.user_type;
                
                if (userType === 'kurye') {
                    profileLink.href = 'kurye-kart.html';
                } else if (userType === 'isletme') {
                    profileLink.href = 'isletme-kart.html';
                } else if (userType === 'lojistik') {
                    profileLink.href = 'lojistik-kart.html';
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        } else {
            profileLink.href = '#';
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Trigger login modal
                const loginBtn = document.querySelector('[data-login-btn]');
                if (loginBtn) loginBtn.click();
            });
        }
    }
    
    navigateToProfile() {
        const userData = localStorage.getItem('kuryes_user_data');
        if (!userData) {
            // Show login modal
            const loginBtn = document.querySelector('[data-login-btn]');
            if (loginBtn) loginBtn.click();
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            const userType = user.userType || user.user_type;
            
            if (userType === 'kurye') {
                window.location.href = 'kurye-kart.html';
            } else if (userType === 'isletme') {
                window.location.href = 'isletme-kart.html';
            } else if (userType === 'lojistik') {
                window.location.href = 'lojistik-kart.html';
            }
        } catch (e) {
            console.error('Error navigating to profile:', e);
        }
    }
    
    updateActiveNavItem() {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page === this.currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    initFAB() {
        const fabButton = document.getElementById('fabButton');
        if (!fabButton) return;
        
        // Check user type and show/hide FAB accordingly
        this.updateFAB();
        
        // FAB click handler
        fabButton.addEventListener('click', () => {
            this.handleFABClick();
        });
        
        // Listen for auth state changes
        window.addEventListener('storage', () => {
            this.updateFAB();
        });
        
        // Also check on page load
        if (window.KuryesAuth) {
            setTimeout(() => this.updateFAB(), 500);
        }
    }
    
    updateFAB() {
        const fabButton = document.getElementById('fabButton');
        const fabIcon = document.getElementById('fabIcon');
        if (!fabButton || !fabIcon) return;
        
        const userData = localStorage.getItem('kuryes_user_data');
        if (!userData) {
            fabButton.style.display = 'none';
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            const userType = user.userType || user.user_type;
            const currentPage = this.getCurrentPage();
            
            // Show FAB for:
            // - İşletme/Lojistik on ilanlar page (to post job)
            // - Kurye on ilanlar page (to apply - but this might redirect to app)
            
            if ((userType === 'isletme' || userType === 'lojistik') && currentPage === 'ilanlar') {
                fabButton.style.display = 'flex';
                fabIcon.textContent = '+';
                fabButton.title = 'İlan Yayınla';
            } else if (userType === 'kurye' && currentPage === 'ilanlar') {
                // For couriers, FAB might be used for quick apply
                // But since they need to use the app, we can hide it or show a message
                fabButton.style.display = 'none';
            } else {
                fabButton.style.display = 'none';
            }
        } catch (e) {
            console.error('Error updating FAB:', e);
            fabButton.style.display = 'none';
        }
    }
    
    handleFABClick() {
        const userData = localStorage.getItem('kuryes_user_data');
        if (!userData) return;
        
        try {
            const user = JSON.parse(userData);
            const userType = user.userType || user.user_type;
            const currentPage = this.getCurrentPage();
            
            if ((userType === 'isletme' || userType === 'lojistik') && currentPage === 'ilanlar') {
                // Navigate to job posting page or show modal
                // For now, redirect to a job posting page if it exists
                window.location.href = 'ilan-yayinla.html';
            }
        } catch (e) {
            console.error('Error handling FAB click:', e);
        }
    }
    
    initPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        let pullDistance = 0;
        const threshold = 80; // pixels to trigger refresh
        const indicator = document.getElementById('pullToRefreshIndicator');
        
        if (!indicator) return;
        
        // Touch events
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            currentY = e.touches[0].clientY;
            pullDistance = currentY - startY;
            
            if (pullDistance > 0 && window.scrollY === 0) {
                // Show indicator
                if (pullDistance > threshold) {
                    indicator.classList.add('show');
                    indicator.textContent = 'Yenilemek için bırakın';
                } else {
                    indicator.textContent = 'Yenileniyor...';
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            if (!isPulling) return;
            
            if (pullDistance > threshold) {
                // Trigger refresh
                this.refreshPage();
            } else {
                // Hide indicator
                indicator.classList.remove('show');
            }
            
            // Reset
            isPulling = false;
            pullDistance = 0;
            startY = 0;
            currentY = 0;
        }, { passive: true });
    }
    
    refreshPage() {
        const indicator = document.getElementById('pullToRefreshIndicator');
        if (indicator) {
            indicator.classList.add('show');
            indicator.textContent = 'Yenileniyor...';
        }
        
        // Haptic feedback (if available)
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Reload page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.MobileEnhancements = new MobileEnhancements();
    });
} else {
    window.MobileEnhancements = new MobileEnhancements();
}

// Update FAB when auth state changes
if (window.KuryesAuth) {
    const originalSetAuthState = window.KuryesAuth.setAuthState;
    window.KuryesAuth.setAuthState = function(...args) {
        originalSetAuthState.apply(this, args);
        if (window.MobileEnhancements) {
            setTimeout(() => window.MobileEnhancements.updateFAB(), 100);
            setTimeout(() => window.MobileEnhancements.updateProfileLink(), 100);
        }
    };
}



