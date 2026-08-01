<template>
    <div v-if="isOpen" class="cart-modal-wrapper">
        <!-- Lớp phủ -->
        <div class="backdrop-overlay" @click="$emit('close')"></div>

        <!-- Ngăn kéo / Popup -->
        <div class="drawer-container">
            <!-- Tiêu đề -->
            <div class="drawer-header">
                <h2 class="drawer-title">Giỏ hàng</h2>
                <button class="btn-close" aria-label="Close drawer" @click="$emit('close')">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Danh sách giỏ hàng -->
            <div class="drawer-body">
                <div v-if="!isLoggedIn" class="empty-cart-msg login-prompt">
                    <span class="material-symbols-outlined prompt-icon">lock</span>
                    <p>Vui lòng đăng nhập để xem giỏ hàng và mượn sách.</p>
                    <button class="btn-login-prompt" @click="goToLogin">Đăng Nhập Ngay</button>
                </div>
                <div class="items-list" v-else-if="cartItems.length > 0">
                    <div class="cart-item" v-for="item in cartItems" :key="item._id">
                        <div class="item-image-container">
                            <img v-if="item.bookInfo?.BiaSach" :src="`/images/Sach/${item.bookInfo?.BiaSach}`"
                                :alt="item.bookInfo?.TenSach" class="book-cover-img" />
                            <div v-else class="item-spine">
                                <div class="spine-shadow"></div>
                                <span class="spine-text">Vol</span>
                            </div>
                        </div>
                        <div class="item-details">
                            <div class="item-info">
                                <h3 class="item-title">{{ item.bookInfo?.TenSach }}</h3>
                                <p class="item-author">{{ item.bookInfo?.TenTG }}</p>
                                <div class="item-price">{{ item.bookInfo?.DonGia?.toLocaleString('vi-VN') }}đ</div>
                            </div>

                            <div class="item-quantity">
                                <button class="qty-btn" @click="changeQuantity(item, -1)"><span
                                        class="material-symbols-outlined">remove</span></button>
                                <span class="qty-value">{{ item.SoLuong }}</span>
                                <button class="qty-btn" @click="changeQuantity(item, 1)"><span
                                        class="material-symbols-outlined">add</span></button>
                            </div>
                        </div>
                        <button class="btn-remove" @click="removeItem(item._id)">
                            <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                        </button>
                    </div>
                </div>
                <div v-else class="empty-cart-msg">
                    <p>Giỏ hàng của bạn đang trống.</p>
                </div>
            </div>

            <!-- Chân trang -->
            <div class="drawer-footer" v-if="isLoggedIn">
                <div class="footer-info">
                    <div class="footer-total">
                        <span class="total-label">Tổng số lượng: <span class="total-value">{{ totalQuantity
                                }}</span></span>
                    </div>
                    <div class="footer-input-group">
                        <div class="date-display">
                            <span class="date-label">Thời hạn mượn</span>
                            <div class="date-range">
                                <span class="date-box">{{ todayStr }}</span>
                                <span class="material-symbols-outlined">arrow_forward</span>
                                <span class="date-box">{{ dueStr }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="btn-submit" @click="submitRequest">
                    Yêu Cầu Mượn
                    <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import CartService from '@/services/cart.service';
import RequestService from '@/services/request.service';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';
import { getUser } from '@/utils/auth';
import { formatDate } from '@/utils/format';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close']);
const cartItems = ref([]);
const router = useRouter();
const isLoggedIn = ref(false);

 
const todayStr = ref(formatDate(new Date()));
const dueStr = ref(formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)));

const fetchCartData = async () => {
    const user = getUser();
    if (user) {
        isLoggedIn.value = true;
        try {
            cartItems.value = await CartService.get(user._id);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
        }
    } else {
        isLoggedIn.value = false;
        cartItems.value = [];
    }
};

const goToLogin = () => {
    emit('close');
    router.push('/login');
};

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        fetchCartData();
    }
});

onMounted(() => {
    if (props.isOpen) {
        fetchCartData();
    }
});

const totalQuantity = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.SoLuong, 0);
});

const submitRequest = async () => {
    if (cartItems.value.length === 0) {
        toast.error("Giỏ hàng của bạn đang trống!");
        return;
    }
    const user = getUser();
    if (!user) {
        toast.error("Vui lòng đăng nhập để tiếp tục!");
        return;
    }

    try {
        const res = await RequestService.checkout(user._id);
        toast.success(res.message || "Gửi yêu cầu mượn sách thành công!");
        cartItems.value = [];
        emit('close');
        window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu mượn:", error);
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo yêu cầu mượn.");
    }
};

const removeItem = async (itemId) => {
    await CartService.removeItem(itemId);
    toast.info("Đã xoá sản phẩm khỏi giỏ hàng.");
    fetchCartData();
};

const changeQuantity = async (item, delta) => {
    const newQuantity = item.SoLuong + delta;
    if (newQuantity <= 0) {
        removeItem(item._id);
        return;
    }

    if (delta > 0 && totalQuantity.value >= 10) {
        toast.warning("Bạn chỉ được mượn tối đa 10 quyển.");
        return;
    }

    try {
        // Cập nhật giao diện trước cho nhanh
        item.SoLuong = newQuantity;
        await CartService.updateQuantity(item._id, newQuantity);
    } catch (error) {
        console.error("Lỗi khi cập nhật số lượng:", error);
        toast.error("Có lỗi xảy ra khi cập nhật số lượng.");
        item.SoLuong -= delta;
        fetchCartData();
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Manrope:wght@200..800&display=swap');

.cart-modal-wrapper {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Lớp phủ & Nền */
.backdrop-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 40;
    transition: opacity 0.3s;
}

/* Ngăn kéo / Popup */
.drawer-container {
    font-family: var(--font-merriweather);
    position: relative;
    width: 90%;
    max-width: 950px;
    max-height: 90vh;
    background-color: #fbf9f4;
    border: 1px solid #e8e2d6;
    border-radius: 5px;
    box-shadow: -2px 0 0 0 rgba(44, 46, 53, 0.05);
    z-index: 50;
    display: flex;
    flex-direction: column;
    background-image:
        linear-gradient(to right, rgba(232, 226, 214, 0.1), rgba(232, 226, 214, 0.05)),
        repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(209, 201, 186, 0.02) 2px, rgba(209, 201, 186, 0.02) 4px);
}

/* Tiêu đề */
.drawer-header {
    padding: 16px;
    border-bottom: 1px solid #e8e2d6;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-shrink: 0;
}

.drawer-title {
    font-family: var(--font-playfair);
    font-size: 32px;
    font-weight: 600;
    line-height: 1.3;
    color: #171920;
    margin-bottom: 8px;
}

.drawer-subtitle {
    font-size: 16px;
    color: #46464b;
    margin: 0;
}

.btn-close {
    color: #46464b;
    padding: 8px;
    transition: color 0.2s;
    background: none;
    border: none;
    cursor: pointer;
}

.btn-close:hover {
    color: #171920;
}

/* Giỏ hàng */
.drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 32px 24px;
}

.items-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.cart-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px;
    background: #ffffff;
    border: 1px solid #e8e2d6;
    border-radius: 5px;
    position: relative;
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.05);
    transition: transform 0.2s;
}

@media (min-width: 768px) {
    .cart-item {
        gap: 24px;
        align-items: center;
        padding: 16px;
    }
}

.cart-item:hover {
    transform: translateY(-2px);
}

.item-image-container {
    width: 56px;
    height: 84px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.book-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-spine {
    width: 56px;
    height: 84px;
    background-color: #eae8e3;
    border: 1px solid #c7c6cb;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.05);
}

.spine-shadow {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.2), transparent);
}

.spine-text {
    font-family: 'EB Garamond', serif;
    font-size: 20px;
    font-weight: 500;
    color: rgba(70, 70, 75, 0.4);
    font-style: italic;
    transform: rotate(-90deg);
    white-space: nowrap;
}

.item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
}

@media (min-width: 768px) {
    .item-details {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
    }
}

.item-info {
    flex: 1;
    min-width: 0;
}

.item-title {
    font-family: 'Manrope', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #171920;
    margin: 0 0 4px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-author {
    font-size: 14px;
    color: #46464b;
    margin: 0;
}

.item-price {
    font-size: 16px;
    font-weight: 600;
    color: crimson;
}

@media (max-width: 767px) {
    .item-price {
        display: none;
    }
}

.item-quantity {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #fbf9f4;
    padding: 4px;
    border-radius: 6px;
    border: 1px solid #e8e2d6;
}

.qty-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: #ffffff;
    border-radius: 4px;
    cursor: pointer;
    color: #46464b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
}

.qty-btn:hover {
    background-color: #f0f0f0;
    color: #171920;
}

.qty-btn .material-symbols-outlined {
    font-size: 16px;
}

.qty-value {
    font-size: 15px;
    font-weight: 600;
    color: #171920;
    min-width: 24px;
    text-align: center;
}

.btn-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #46464b;
    padding: 8px;
    background: #fbf9f4;
    border: 1px solid #e8e2d6;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-remove:hover {
    background: #ffdad6;
    color: #93000a;
    border-color: #ffdad6;
}

/* Chân trang / CTA */
.drawer-footer {
    padding: 24px;
    border-top: 1px solid #e8e2d6;
    background-color: #fbf9f4;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

@media (min-width: 768px) {
    .drawer-footer {
        flex-direction: row;
        align-items: center;
        gap: 37px;
        justify-content: space-between;
    }
}

.footer-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.footer-total {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.total-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #46464b;
}

.footer-input-group {
    position: relative;
    width: 100%;
    max-width: 450px;
    display: flex;
    justify-content: flex-start;
}

.date-display {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
}

@media (min-width: 768px) {
    .date-display {
        flex-direction: row;
        align-items: center;
        gap: 12px;
    }
}

.date-label {
    font-size: 14px;
    font-weight: 600;
    color: #46464b;
    letter-spacing: 0.05em;
}

.date-range {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #171920;
}

.date-box {
    font-family: 'merriweather', sans-serif;
    font-size: 15px;
    font-weight: 700;
    background: #ffffff;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #e8e2d6;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.input-date {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid #171920;
    color: #171920;
    font-size: 16px;
    padding: 8px 0;
    transition: border-color 0.2s;
    outline: none;
}

.input-date:focus {
    border-bottom-color: #6e5c37;
}

.input-date::placeholder {
    color: rgba(70, 70, 75, 0.5);
}

.input-label {
    position: absolute;
    top: -16px;
    left: 0;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.03em;
    color: #46464b;
}

.btn-submit {
    width: 100%;
    max-width: 320px;
    background-color: #171920;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s;
    border-radius: 5px;
    cursor: pointer;
}

.empty-cart-msg {
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #46464b;
}

.login-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
}

.prompt-icon {
    font-size: 48px !important;
    color: #6e5c37;
}

.btn-login-prompt {
    background-color: #171920;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
}

.btn-login-prompt:hover {
    background-color: #333333;
}
</style>
