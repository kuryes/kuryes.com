// Kuryes.com - Authentication State Management
// Handles user authentication state across the site

const AUTH_STORAGE_KEY = 'kuryes_logged_in';
const USER_ID_KEY = 'kuryes_user_id';
const USER_TYPE_KEY = 'kuryes_user_type';
const USER_NAME_KEY = 'kuryes_user_name';
const USER_AVATAR_KEY = 'kuryes_user_avatar';

/**
 * Get current user authentication state
 */
function getAuthState() {
    const isLoggedIn = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    const userId = localStorage.getItem(USER_ID_KEY);
    const userType = localStorage.getItem(USER_TYPE_KEY);
    const userName = localStorage.getItem(USER_NAME_KEY);
    const yetkiliAdi = localStorage.getItem('kuryes_yetkili_adi');
    const userAvatar = localStorage.getItem(USER_AVATAR_KEY) || '1';
    
    return {
        isLoggedIn,
        userId,
        userType,
        userName,
        yetkiliAdi,
        userAvatar
    };
}

/**
 * Set user authentication state
 */
function setAuthState(userData) {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    localStorage.setItem(USER_ID_KEY, userData.id);
    localStorage.setItem(USER_TYPE_KEY, userData.userType);
    localStorage.setItem(USER_AVATAR_KEY, userData.avatar || '1');
    
    if (userData.userType === 'kurye') {
        localStorage.setItem(USER_NAME_KEY, userData.adSoyad || '');
    } else {
        localStorage.setItem(USER_NAME_KEY, userData.isletmeAdi || '');
        // Yetkili adını da kaydet (işletme/lojistik için)
        if (userData.yetkiliAdi) {
            localStorage.setItem('kuryes_yetkili_adi', userData.yetkiliAdi);
        }
    }
}

/**
 * Clear authentication state (logout)
 */
function clearAuthState() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_TYPE_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_AVATAR_KEY);
    localStorage.removeItem('kuryes_yetkili_adi');
}

/**
 * Mobil profil modalını güncelle
 */
function updateMobileProfileModal(authState) {
    const mobileProfileAvatar = document.getElementById('mobileProfileAvatar');
    const mobileProfileName = document.getElementById('mobileProfileName');
    const mobileProfileType = document.getElementById('mobileProfileType');
    const mobileProfileLink = document.getElementById('mobileProfileLink');
    const mobileProfileLinkText = document.getElementById('mobileProfileLinkText');
    
    if (!mobileProfileAvatar || !mobileProfileName) {
        return; // Mobil profil modalı bu sayfada yok
    }
    
    // Avatar
    const avatarImg = mobileProfileAvatar.querySelector('img');
    if (avatarImg) {
        const avatarPath = `public/img/avatars/${authState.userAvatar || '1'}.png`;
        avatarImg.src = avatarPath;
        avatarImg.alt = authState.userName || 'Avatar';
        avatarImg.onerror = function() {
            this.src = 'public/img/avatars/1.png';
            this.onerror = null;
        };
    }
    
    // Kullanıcı adı
    let displayName = authState.userName || 'Kullanıcı';
    if ((authState.userType === 'isletme' || authState.userType === 'lojistik') && authState.yetkiliAdi) {
        displayName = `${authState.userName} - ${authState.yetkiliAdi}`;
    }
    mobileProfileName.textContent = displayName;
    
    // Kullanıcı tipi
    if (mobileProfileType) {
        let typeText = '';
        if (authState.userType === 'kurye') {
            typeText = 'Kurye';
        } else if (authState.userType === 'lojistik') {
            typeText = 'Lojistik';
        } else if (authState.userType === 'isletme') {
            typeText = 'İşletme';
        }
        mobileProfileType.textContent = typeText;
    }
    
    // Profil linki
    if (mobileProfileLink) {
        if (authState.userType === 'kurye') {
            mobileProfileLink.href = `kurye-kart.html?id=${authState.userId}`;
        } else if (authState.userType === 'lojistik') {
            mobileProfileLink.href = `lojistik-kart.html?id=${authState.userId}`;
        } else {
            mobileProfileLink.href = `isletme-kart.html?id=${authState.userId}`;
        }
    }
    
    // Profil link metni
    if (mobileProfileLinkText) {
        if (authState.userType === 'kurye') {
            mobileProfileLinkText.textContent = 'Kuryes Profil Kartı';
        } else if (authState.userType === 'lojistik') {
            mobileProfileLinkText.textContent = 'Kuryes Lojistik Kartı';
        } else {
            mobileProfileLinkText.textContent = 'Kuryes İşletme Kartı';
        }
    }
}

/**
 * Update header based on authentication state
 */
function updateHeaderForAuth() {
    const authState = getAuthState();
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnMobile = document.getElementById('loginBtnMobile');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    const userMenu = document.getElementById('userMenu');
    const userMenuMobile = document.getElementById('userMenuMobile');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userNameDisplayMobile = document.getElementById('userNameDisplayMobile');
    const userAvatarDisplay = document.getElementById('userAvatarDisplay');
    const userAvatarDisplayMobile = document.getElementById('userAvatarDisplayMobile');
    const profileLink = document.getElementById('profileLink');
    const profileLinkMobile = document.getElementById('profileLinkMobile');
    
    // Tüm "Kayıt Ol" butonlarını bul (data-register-btn attribute'u olan)
    const registerButtons = document.querySelectorAll('[data-register-btn]');
    
    // Ana sayfadaki "Kurye Ol" ve "İşletme Ol" butonlarını bul
    const heroRegisterButtons = document.getElementById('heroRegisterButtons');
    const heroUserInfo = document.getElementById('heroUserInfo');
    const heroProfileLink = document.getElementById('heroProfileLink');
    const heroUserAvatar = document.getElementById('heroUserAvatar');
    const heroUserName = document.getElementById('heroUserName');
    const heroLogoutBtn = document.getElementById('heroLogoutBtn');
    
    if (authState.isLoggedIn) {
        // Hide login buttons
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
        if (loginBtnMobile) {
            loginBtnMobile.style.display = 'none';
        }
        
        // Hide register buttons
        registerButtons.forEach(btn => {
            if (btn) {
                btn.style.display = 'none';
            }
        });
        
        // Hide hero register buttons (Kurye Ol, İşletme Ol)
        if (heroRegisterButtons) {
            heroRegisterButtons.style.display = 'none';
        }
        
        // Show hero user info
        if (heroUserInfo) {
            heroUserInfo.classList.remove('hidden');
            heroUserInfo.style.display = 'flex';
        }
        
        // Update hero user info
        if (heroUserName) {
            let displayName = authState.userName || 'Kullanıcı';
            if ((authState.userType === 'isletme' || authState.userType === 'lojistik') && authState.yetkiliAdi) {
                displayName = `${authState.userName} - ${authState.yetkiliAdi}`;
            }
            heroUserName.textContent = displayName;
        }
        
        if (heroUserAvatar) {
            const avatarImg = heroUserAvatar.querySelector('img');
            if (avatarImg) {
                const avatarPath = `public/img/avatars/${authState.userAvatar || '1'}.png`;
                avatarImg.src = avatarPath;
                avatarImg.alt = authState.userName || 'Avatar';
                avatarImg.onerror = function() {
                    this.src = 'public/img/avatars/1.png';
                    this.onerror = null;
                };
            }
        }
        
        if (heroProfileLink) {
            if (authState.userType === 'kurye') {
                heroProfileLink.href = `kurye-kart.html?id=${authState.userId}`;
            } else if (authState.userType === 'lojistik') {
                heroProfileLink.href = `lojistik-kart.html?id=${authState.userId}`;
            } else {
                heroProfileLink.href = `isletme-kart.html?id=${authState.userId}`;
            }
        }
        
        // Hero logout button listener
        if (heroLogoutBtn && !heroLogoutBtn.hasAttribute('data-listener-added')) {
            heroLogoutBtn.setAttribute('data-listener-added', 'true');
            heroLogoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
        
        // Show "Kuryes.com Hakkında" section for logged in users
        const hakkimizdaSection = document.getElementById('hakkimizdaSection');
        if (hakkimizdaSection) {
            hakkimizdaSection.classList.remove('hidden');
        }
        
        // Show logout buttons and user menus
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }
        if (logoutBtnMobile) {
            logoutBtnMobile.style.display = 'block';
        }
        
        if (userMenu) {
            userMenu.style.display = 'flex';
        }
        // Mobile menu removed - user menu now in bottom navigation
        if (userMenuMobile) {
            userMenuMobile.style.display = 'block';
        }
        
        // Update user name - Kurye: sadece isim, İşletme/Lojistik: işletme adı + yetkili
        let displayName = authState.userName || 'Kullanıcı';
        
        // Eğer işletme/lojistik ise ve yetkili adı varsa ekle
        if ((authState.userType === 'isletme' || authState.userType === 'lojistik') && authState.yetkiliAdi) {
            displayName = `${authState.userName} - ${authState.yetkiliAdi}`;
        }
        
        // Kurye: Sadece avatar göster, İşletme/Lojistik: Avatar + isim göster
        if (userNameDisplay) {
            if (authState.userType === 'kurye') {
                userNameDisplay.classList.add('hidden');
            } else {
                userNameDisplay.classList.remove('hidden');
                userNameDisplay.textContent = displayName;
            }
        }
        if (userNameDisplayMobile) {
            userNameDisplayMobile.textContent = displayName;
        }
        
        // Update dropdown menu text based on user type
        const profileLinkText = document.getElementById('profileLinkText');
        if (profileLinkText) {
            if (authState.userType === 'kurye') {
                profileLinkText.textContent = 'Kuryes Profil Kartı';
            } else if (authState.userType === 'lojistik') {
                profileLinkText.textContent = 'Kuryes Lojistik Kartı';
            } else {
                profileLinkText.textContent = 'Kuryes İşletme Kartı';
            }
        }
        
        // Update avatar
        const avatarPath = `public/img/avatars/${authState.userAvatar || '1'}.png`;
        if (userAvatarDisplay) {
            const avatarImg = userAvatarDisplay.querySelector('img');
            if (avatarImg) {
                avatarImg.src = avatarPath;
                avatarImg.alt = authState.userName || 'Avatar';
                // Avatar yüklenemezse varsayılan avatar göster
                avatarImg.onerror = function() {
                    this.src = 'public/img/avatars/1.png';
                    this.onerror = null; // Sonsuz döngüyü önle
                };
            }
        }
        if (userAvatarDisplayMobile) {
            const avatarImg = userAvatarDisplayMobile.querySelector('img');
            if (avatarImg) {
                avatarImg.src = avatarPath;
                avatarImg.alt = authState.userName || 'Avatar';
                // Avatar yüklenemezse varsayılan avatar göster
                avatarImg.onerror = function() {
                    this.src = 'public/img/avatars/1.png';
                    this.onerror = null; // Sonsuz döngüyü önle
                };
            }
        }
        
        // Mobil profil modalını güncelle
        updateMobileProfileModal(authState);
        
        // Update profile links
        const profileLinkDropdown = document.getElementById('profileLinkDropdown');
        if (profileLinkDropdown) {
            if (authState.userType === 'kurye') {
                profileLinkDropdown.href = `kurye-kart.html?id=${authState.userId}`;
            } else if (authState.userType === 'lojistik') {
                profileLinkDropdown.href = `lojistik-kart.html?id=${authState.userId}`;
            } else {
                profileLinkDropdown.href = `isletme-kart.html?id=${authState.userId}`;
            }
        }
        
        if (profileLink) {
            if (authState.userType === 'kurye') {
                profileLink.href = `kurye-kart.html?id=${authState.userId}`;
            } else if (authState.userType === 'lojistik') {
                profileLink.href = `lojistik-kart.html?id=${authState.userId}`;
            } else {
                profileLink.href = `isletme-kart.html?id=${authState.userId}`;
            }
        }
        if (profileLinkMobile) {
            if (authState.userType === 'kurye') {
                profileLinkMobile.href = `kurye-kart.html?id=${authState.userId}`;
            } else if (authState.userType === 'lojistik') {
                profileLinkMobile.href = `lojistik-kart.html?id=${authState.userId}`;
            } else {
                profileLinkMobile.href = `isletme-kart.html?id=${authState.userId}`;
            }
        }
    } else {
        // Show login buttons
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }
        if (loginBtnMobile) {
            loginBtnMobile.style.display = 'block';
        }
        
        // Show register buttons
        registerButtons.forEach(btn => {
            if (btn) {
                btn.style.display = 'block';
            }
        });
        
        // Show hero register buttons (Kurye Ol, İşletme Ol)
        if (heroRegisterButtons) {
            heroRegisterButtons.style.display = 'flex';
        }
        
        // Hide hero user info
        if (heroUserInfo) {
            heroUserInfo.classList.add('hidden');
            heroUserInfo.style.display = 'none';
        }
        
        // Hide logout buttons and user menus
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        if (logoutBtnMobile) {
            logoutBtnMobile.style.display = 'none';
        }
        
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        if (userMenuMobile) {
            userMenuMobile.style.display = 'none';
        }
        
        // Hide "Kuryes.com Hakkında" section for non-logged in users
        const hakkimizdaSection = document.getElementById('hakkimizdaSection');
        if (hakkimizdaSection) {
            hakkimizdaSection.classList.add('hidden');
        }
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    clearAuthState();
    updateHeaderForAuth();
    
    // Redirect to yakinda.html
    window.location.href = 'yakinda.html';
}

/**
 * Toggle user dropdown menu
 */
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

/**
 * Close user dropdown menu when clicking outside
 */
function setupUserDropdown() {
    const trigger = document.getElementById('userMenuTrigger');
    const dropdown = document.getElementById('userDropdownMenu');
    
    if (trigger && dropdown) {
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleUserDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }
}

/**
 * Check if user is logged in and redirect if needed
 */
function requireAuth(redirectUrl = 'index.html') {
    const authState = getAuthState();
    
    if (!authState.isLoggedIn) {
        // Open login modal if available
        if (typeof openLoginModal === 'function') {
            openLoginModal();
        } else {
            // Otherwise redirect
            window.location.href = redirectUrl;
        }
        return false;
    }
    
    return true;
}

/**
 * Initialize authentication on page load
 */
function initializeAuth() {
    // Update header
    updateHeaderForAuth();
    
    // Setup user dropdown menu
    setupUserDropdown();
    
    // Add logout button listeners
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Check if we're on a profile page and verify user has access
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');
    
    // Kart sayfaları kontrolü - Üye olmayanlar erişemez
    if (currentPath.includes('kart.html')) {
        const authState = getAuthState();
        
        if (!authState.isLoggedIn) {
            // Üye değilse login modalını aç ve sayfayı engelle
            console.log('Kart sayfasına erişim için giriş yapmanız gerekiyor');
            
            // Sayfa içeriğini gizle
            document.body.style.opacity = '0';
            document.body.style.pointerEvents = 'none';
            
            // Login modalını aç
            setTimeout(() => {
                if (typeof openLoginModal === 'function') {
                    openLoginModal();
                } else {
                    // Modal yoksa ana sayfaya yönlendir
                    window.location.href = 'index.html';
                }
            }, 100);
            
            return;
        }
        
        // Üye ise sayfayı göster
        document.body.style.opacity = '1';
        document.body.style.pointerEvents = 'auto';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}

// Export functions for use in other scripts
window.KuryesAuth = {
    getAuthState,
    setAuthState,
    clearAuthState,
    updateHeaderForAuth,
    handleLogout,
    requireAuth,
    initializeAuth
};

