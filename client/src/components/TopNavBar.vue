<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CartService from '@/services/cart.service';

defineEmits(['open-cart']);

const isMobileMenuOpen = ref(false);
const isLoggedIn = ref(false);
const cartItemCount = ref(0);

const fetchCartCount = async () => {
    if (isLoggedIn.value) {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const items = await CartService.get(user._id);
                cartItemCount.value = items.length;
            }
        } catch (error) {
            console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
            cartItemCount.value = 0;
        }
    } else {
        cartItemCount.value = 0;
    }
};

const checkLoginStatus = () => {
    isLoggedIn.value = !!localStorage.getItem('user');
    fetchCartCount();
};

onMounted(() => {
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('user-updated', checkLoginStatus);
    window.addEventListener('cart-updated', fetchCartCount);
});

onUnmounted(() => {
    window.removeEventListener('storage', checkLoginStatus);
    window.removeEventListener('user-updated', checkLoginStatus);
    window.removeEventListener('cart-updated', fetchCartCount);
});
</script>
<template>
    <header class="top-nav-bar">
        <div class="nav-container">
            <div class="nav-brand">
                <RouterLink active-class="active" to="/">
                    <span class="material-symbols-outlined" style="color: var(--color-secondary);">menu_book</span>
                    BookWorm
                </RouterLink>
            </div>
            <nav class="nav-links">
                <RouterLink class="nav-link" exact-active-class="active" to="/">Trang chủ</RouterLink>
                <RouterLink class="nav-link" active-class="active" to="/collection">Tủ Sách</RouterLink>
                <RouterLink class="nav-link" active-class="active" to="/contact">Liên hệ</RouterLink>
                <RouterLink v-if="isLoggedIn" class="nav-link" active-class="active" to="/account">Tài khoản
                </RouterLink>
            </nav>
            <div class="nav-actions">
                <RouterLink v-if="!isLoggedIn" to="/login" class="login-btn" title="Đăng nhập">
                    <span class="material-symbols-outlined">login</span>
                    <span class="login-text">Đăng nhập</span>
                </RouterLink>
                <a href="#" class="cart-btn" @click.prevent="$emit('open-cart')">
                    <span class="material-symbols-outlined">shopping_cart</span>
                    <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
                </a>
                <button class="menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
                    <span class="material-symbols-outlined">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
                </button>
            </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div class="mobile-menu" v-if="isMobileMenuOpen">
            <nav class="mobile-nav-links">
                <RouterLink class="mobile-nav-link" exact-active-class="active" to="/"
                    @click="isMobileMenuOpen = false">Trang chủ</RouterLink>
                <RouterLink class="mobile-nav-link" active-class="active" to="/collection"
                    @click="isMobileMenuOpen = false">Tủ Sách</RouterLink>
                <RouterLink class="mobile-nav-link" active-class="active" to="/contact"
                    @click="isMobileMenuOpen = false">Liên hệ</RouterLink>
                <RouterLink v-if="isLoggedIn" class="mobile-nav-link" active-class="active" to="/account"
                    @click="isMobileMenuOpen = false">Tài khoản</RouterLink>
                <RouterLink v-if="!isLoggedIn" class="mobile-nav-link login-mobile" to="/login"
                    @click="isMobileMenuOpen = false">
                    <span class="material-symbols-outlined"
                        style="vertical-align: middle; margin-right: 4px;">login</span>Đăng nhập
                </RouterLink>
            </nav>
        </div>
    </header>
</template>

<style scoped>
/* Top Navigation */
.top-nav-bar {
    background-color: var(--color-surface);
    border-bottom: 1px solid rgba(211, 195, 192, 0.3);
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.1);
    position: sticky;
    top: 0;
    z-index: 50;
}

.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 16px var(--margin-mobile);
    max-width: var(--max-width);
    margin: 0 auto;
}

@media (min-width: 768px) {
    .nav-container {
        padding: 16px var(--margin-desktop);
    }
}

.nav-brand {
    font-family: var(--font-playfair);
    font-size: 24px;
    font-weight: 600;
    color: var(--color-primary);
    font-style: italic;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
}

.nav-links {
    display: none;
    gap: 32px;
    align-items: center;
}

@media (min-width: 768px) {
    .nav-links {
        display: flex;
    }
}

.nav-link {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-on-surface-variant);
    transition: color 0.2s, transform 0.2s;
    letter-spacing: 0.05em;
}

.nav-link:hover {
    color: var(--color-primary);
    transform: translateY(-1px);
}

.nav-link.active {
    color: var(--color-primary);
    border-bottom: 2px solid var(--color-secondary);
    padding-bottom: 4px;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.cart-btn,
.menu-btn,
.login-btn {
    color: var(--color-on-surface-variant);
    transition: color 0.2s;
    text-decoration: none;
    display: flex;
    align-items: center;
    position: relative;
}

.cart-badge {
    position: absolute;
    top: -8px;
    right: -10px;
    background-color: crimson;
    color: white;
    font-size: 11px;
    font-weight: 700;
    height: 18px;
    min-width: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    line-height: 1;
}

.cart-btn:hover,
.menu-btn:hover,
.login-btn:hover {
    color: var(--color-primary);
}

.login-btn {
    gap: 4px;
    font-size: 14px;
    font-weight: 700;
}

.login-text {
    display: none;
}

@media (min-width: 768px) {
    .login-text {
        display: inline;
    }
}

.menu-btn {
    display: block;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    outline: none;
}

@media (min-width: 768px) {
    .menu-btn {
        display: none;
    }
}

/* Mobile Menu */
.mobile-menu {
    border-top: 1px solid rgba(211, 195, 192, 0.3);
    background-color: var(--color-surface);
    padding: 16px var(--margin-mobile, 16px);
}

.mobile-nav-links {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.mobile-nav-link {
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-on-surface-variant);
    padding: 8px 0;
    transition: color 0.2s;
    letter-spacing: 0.05em;
    text-decoration: none;
}

.mobile-nav-link:hover {
    color: var(--color-primary);
}

.mobile-nav-link.active {
    color: var(--color-primary);
    border-left: 3px solid var(--color-secondary);
    padding-left: 12px;
}

@media (min-width: 768px) {
    .mobile-menu {
        display: none;
    }
}
</style>
