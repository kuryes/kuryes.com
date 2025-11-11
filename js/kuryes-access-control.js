/**
 * Kuryes.com Access Control
 * Handles access restrictions for different user types
 */

/**
 * Check if user can apply to job listings
 * Only couriers (kurye) can apply
 */
function canApplyToJob() {
    const authState = window.KuryesAuth ? window.KuryesAuth.getAuthState() : { isLoggedIn: false, userType: null };
    
    if (!authState.isLoggedIn) {
        return false; // Not logged in
    }
    
    return authState.userType === 'kurye'; // Only couriers can apply
}

/**
 * Check if user can access WhatsApp/Phone numbers
 * Only couriers (kurye) can access
 */
function canAccessContactInfo() {
    const authState = window.KuryesAuth ? window.KuryesAuth.getAuthState() : { isLoggedIn: false, userType: null };
    
    if (!authState.isLoggedIn) {
        return false; // Not logged in
    }
    
    return authState.userType === 'kurye'; // Only couriers can access
}

/**
 * Handle job application button click
 * Redirects to registration if not logged in or not a courier
 */
function handleJobApplication(type, cardId) {
    const authState = window.KuryesAuth ? window.KuryesAuth.getAuthState() : { isLoggedIn: false, userType: null };
    
    if (!authState.isLoggedIn) {
        // Not logged in - show registration modal
        const registerButtons = document.querySelectorAll('[data-register-btn]');
        if (registerButtons.length > 0) {
            registerButtons[0].click();
        }
        return false;
    }
    
    if (authState.userType !== 'kurye') {
        // Not a courier - show message
        alert('İş ilanlarına sadece kuryeler başvurabilir.');
        return false;
    }
    
    // Open detail modal for application
    if (typeof openDetailModal === 'function') {
        openDetailModal(type, cardId, true);
    }
    
    return true;
}

/**
 * Handle contact info click (WhatsApp/Phone)
 * Redirects to registration if not logged in or not a courier
 */
function handleContactClick(event, contactType, contactValue) {
    const authState = window.KuryesAuth ? window.KuryesAuth.getAuthState() : { isLoggedIn: false, userType: null };
    
    if (!authState.isLoggedIn || authState.userType !== 'kurye') {
        event.preventDefault();
        event.stopPropagation();
        
        // Show registration modal
        const registerButtons = document.querySelectorAll('[data-register-btn]');
        if (registerButtons.length > 0) {
            registerButtons[0].click();
        }
        return false;
    }
    
    return true; // Allow the link to proceed
}

/**
 * Initialize access controls for ilanlar page
 */
function initializeIlanlarAccessControls() {
    // Override all "Başvur" buttons
    document.addEventListener('click', function(e) {
        const target = e.target.closest('button[onclick*="openDetailModal"]');
        if (target && target.textContent.trim() === 'Başvur') {
            const onclick = target.getAttribute('onclick');
            if (onclick && onclick.includes('openDetailModal')) {
                // Extract parameters
                const match = onclick.match(/openDetailModal\(['"]([^'"]+)['"],\s*(\d+),\s*true\)/);
                if (match) {
                    e.preventDefault();
                    e.stopPropagation();
                    const type = match[1];
                    const cardId = parseInt(match[2]);
                    handleJobApplication(type, cardId);
                }
            }
        }
    });
    
    // Override WhatsApp and Phone links
    document.addEventListener('click', function(e) {
        const whatsappLink = e.target.closest('a[href^="https://wa.me"]');
        const phoneLink = e.target.closest('a[href^="tel:"]');
        
        if (whatsappLink || phoneLink) {
            const link = whatsappLink || phoneLink;
            const href = link.getAttribute('href');
            
            if (!canAccessContactInfo()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Show registration modal
                const registerButtons = document.querySelectorAll('[data-register-btn]');
                if (registerButtons.length > 0) {
                    registerButtons[0].click();
                }
            }
        }
    });
    
    // Hide/show application buttons based on user type
    const authState = window.KuryesAuth ? window.KuryesAuth.getAuthState() : { isLoggedIn: false, userType: null };
    
    if (authState.isLoggedIn && authState.userType !== 'kurye') {
        // Hide all "Başvur" buttons for non-courier users
        const basvurButtons = document.querySelectorAll('button[onclick*="openDetailModal"]');
        basvurButtons.forEach(btn => {
            if (btn.textContent.trim() === 'Başvur') {
                btn.style.display = 'none';
            }
        });
    }
    
    // Hide/show contact info based on user type
    if (!canAccessContactInfo()) {
        const whatsappLinks = document.querySelectorAll('a[href^="https://wa.me"]');
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        
        whatsappLinks.forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
            link.title = 'Erişim için kayıt olun';
        });
        
        phoneLinks.forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
            link.title = 'Erişim için kayıt olun';
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIlanlarAccessControls);
} else {
    initializeIlanlarAccessControls();
}

