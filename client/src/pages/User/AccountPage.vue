<template>
    <div class="account-page">
        <!-- Tiêu đề trang -->
        <div class="page-header">
            <h1 class="page-title">Thông tin tài khoản</h1>
        </div>

        <!-- Phần tài khoản -->
        <div class="layout-container">
            <!-- Menu cột bên -->
            <aside class="tab-nav">
                <button class="tab-btn" :class="{ active: activeTab === 'profile' }" @click="switchTab('profile')">
                    <span class="material-symbols-outlined">person</span>
                    <span>Thông tin cá nhân</span>
                </button>
                <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="switchTab('history')">
                    <span class="material-symbols-outlined">menu_book</span>
                    <span>Lịch sử đơn mượn</span>
                </button>
                <button class="tab-btn" :class="{ active: activeTab === 'request_history' }"
                    @click="switchTab('request_history')">
                    <span class="material-symbols-outlined">history</span>
                    <span>Lịch sử yêu cầu</span>
                </button>
                <button class="tab-btn logout" @click="handleLogout">
                    <span class="material-symbols-outlined">logout</span>
                    <span>Đăng xuất</span>
                </button>
            </aside>

            <!-- Phần nội dung -->
            <div class="tab-content">
                <!-- Tab 1: Hồ sơ -->
                <section class="paper-card tab-pane" :class="{ active: activeTab === 'profile' }">
                    <div class="tab-header">
                        <div>
                            <h2 class="tab-title">Thông tin cá nhân</h2>
                        </div>
                    </div>

                    <form class="form-container">
                        <div class="avatar-section">
                            <div class="avatar-wrapper">
                                <div class="avatar-img-container">
                                    <img :src="userInfo.AnhBiaND ? `/images/Avatar/${userInfo.AnhBiaND}` : '/images/user_icon.jpg'"
                                        class="avatar-img" alt="Profile Avatar">
                                </div>
                                <button v-if="isEditing" type="button" class="avatar-btn"
                                    @click="showAvatarModal = true">
                                    <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
                                </button>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Họ tên:</label>
                                <input class="form-input" type="text" v-model="userInfo.HoTen" :disabled="!isEditing">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Số điện thoại:</label>
                                <input class="form-input" type="tel" v-model="userInfo.SoDienThoai"
                                    :disabled="!isEditing">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Ngày sinh:</label>
                                <input class="form-input" type="date" v-model="userInfo.NgaySinh"
                                    :disabled="!isEditing">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Giới tính:</label>
                                <select class="form-input" v-model="userInfo.GioiTinh" :disabled="!isEditing">
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>

                                </select>
                            </div>
                            <div class="form-group full-width">
                                <label class="form-label">Email:</label>
                                <input class="form-input" type="email" v-model="userInfo.Email" disabled>
                            </div>
                            <div class="form-group full-width">
                                <label class="form-label">Địa chỉ:</label>
                                <input class="form-input" type="text" v-model="userInfo.DiaChi" :disabled="!isEditing">
                            </div>
                        </div>

                        <div class="form-actions" style="gap: 12px;">
                            <button v-if="isEditing" class="btn-cancel" type="button" @click="cancelEdit">Hủy</button>
                            <button class="btn-submit" type="button" @click="toggleEdit">
                                {{ isEditing ? 'Lưu' : 'Chỉnh sửa' }}
                            </button>
                        </div>
                    </form>
                </section>

                <!-- Tab 2: Lịch sử -->
                <section class="paper-card tab-pane" :class="{ active: activeTab === 'history' }">
                    <div class="tab-header history-header">
                        <div>
                            <h2 class="tab-title">Lịch sử đơn mượn</h2>
                        </div>
                        <div class="history-stats">
                            <span>Tổng đơn mượn: {{ orders.length }}</span>
                        </div>
                    </div>

                    <div v-if="orders.length === 0" class="empty-message">
                        Bạn chưa mượn sách
                    </div>
                    <div v-else class="order-list">
                        <div v-for="order in paginatedOrders" :key="order.id" class="order-card">
                            <div class="order-header" @click="toggleOrder(order.id)">
                                <div class="order-header-left">
                                    <span class="expand-icon" :class="{ 'expanded': expandedOrderId === order.id }">
                                        ▶
                                    </span>
                                    <div class="order-title-group">
                                        <h3 class="order-title">Đơn mượn</h3>
                                        <div class="order-meta-group">
                                            <span class="order-code">Mã: {{ order.code }}</span>
                                            <span class="order-total-books">Tổng: {{ getTotalBooks(order) }}
                                                quyển</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="order-header-right">
                                    <span :class="['status-badge', order.statusClass]">{{ order.status }}</span>
                                </div>
                            </div>

                            <div class="order-content" v-if="expandedOrderId === order.id">
                                <div class="order-meta">
                                    <div class="meta-item"><strong>Ngày mượn:</strong> {{ order.borrowDate }}</div>
                                    <span class="material-symbols-outlined date-arrow">arrow_right_alt</span>
                                    <div class="meta-item"><strong>Ngày trả:</strong> {{ order.returnDate }}</div>
                                </div>
                                <div class="book-list">
                                    <div v-for="book in order.books" :key="book.id" class="book-item">
                                        <img :src="book.image" alt="Book Cover" class="book-cover-mini" />
                                        <div class="book-info">
                                            <div class="book-name">{{ book.name }}</div>
                                            <div class="book-quantity">Số lượng: {{ book.quantity }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Phân trang -->
                    <!-- Phân trang -->
                    <div class="pagination-container" v-if="totalPages > 1">
                        <div class="pagination-controls">
                            <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                                <span class="material-symbols-outlined">chevron_left</span>
                            </button>

                            <button v-for="(page, index) in visiblePages" :key="index" class="page-btn"
                                :class="{ active: page === currentPage, dots: page === '...' }"
                                :disabled="page === '...'" @click="goToPage(page)">
                                {{ page }}
                            </button>

                            <button class="page-btn" :disabled="currentPage === totalPages"
                                @click="goToPage(currentPage + 1)">
                                <span class="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Tab 3: Lịch sử yêu cầu -->
                <section class="paper-card tab-pane" :class="{ active: activeTab === 'request_history' }">
                    <div class="tab-header history-header">
                        <div>
                            <h2 class="tab-title">Lịch sử yêu cầu</h2>
                        </div>
                        <div class="history-stats">
                            <span>Tổng yêu cầu: {{ requests.length }}</span>
                        </div>
                    </div>

                    <div v-if="requests.length === 0" class="empty-message">
                        Bạn chưa có yêu cầu !!
                    </div>
                    <div v-else class="order-list">
                        <div v-for="req in paginatedRequests" :key="req.id" class="order-card">
                            <div class="order-header" @click="toggleRequest(req.id)">
                                <div class="order-header-left">
                                    <span class="expand-icon" :class="{ 'expanded': expandedRequestId === req.id }">
                                        ▶
                                    </span>
                                    <div class="order-title-group">
                                        <h3 class="order-title">Yêu cầu mượn</h3>
                                        <div class="order-meta-group">
                                            <span class="order-code">Mã: {{ req.code }}</span>
                                            <span class="order-total-books">Tổng: {{ getTotalBooks(req) }}
                                                quyển</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="order-header-right">
                                    <span :class="['status-badge', req.statusClass]">{{ req.status }}</span>
                                </div>
                            </div>

                            <div class="order-content" v-if="expandedRequestId === req.id">
                                <div class="order-meta">
                                    <div class="meta-item"><strong>Ngày tạo:</strong> {{ req.borrowDate }}</div>
                                </div>
                                <div class="book-list">
                                    <div v-for="book in req.books" :key="book.id" class="book-item">
                                        <img :src="book.image" alt="Book Cover" class="book-cover-mini" />
                                        <div class="book-info">
                                            <div class="book-name">{{ book.name }}</div>
                                            <div class="book-quantity">Số lượng: {{ book.quantity }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Phân trang yêu cầu -->
                    <div class="pagination-container" v-if="totalRequestPages > 1">
                        <div class="pagination-controls">
                            <button class="page-btn" :disabled="currentRequestPage === 1"
                                @click="goToRequestPage(currentRequestPage - 1)">
                                <span class="material-symbols-outlined">chevron_left</span>
                            </button>

                            <button v-for="(page, index) in visibleRequestPages" :key="index" class="page-btn"
                                :class="{ active: page === currentRequestPage, dots: page === '...' }"
                                :disabled="page === '...'" @click="goToRequestPage(page)">
                                {{ page }}
                            </button>

                            <button class="page-btn" :disabled="currentRequestPage === totalRequestPages"
                                @click="goToRequestPage(currentRequestPage + 1)">
                                <span class="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <!-- Popup chọn ảnh đại diện -->
        <div v-if="showAvatarModal" class="modal-overlay" @click="showAvatarModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Chọn ảnh đại diện</h3>
                    <button class="close-btn" @click="showAvatarModal = false"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="avatar-list">
                    <img v-for="avatar in availableAvatars" :key="avatar" :src="`/images/Avatar/${avatar}`"
                        class="avatar-option" :class="{ selected: userInfo.AnhBiaND === avatar }"
                        @click="selectAvatar(avatar)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import UserService from '../../services/user.service'
import LedgerService from '../../services/ledger.service'
import RequestService from '../../services/request.service'
import { toast } from 'vue3-toastify';
import { getUser, setUser, removeUser } from '@/utils/auth';

const router = useRouter()

const activeTab = ref('profile')
const isEditing = ref(false)
const userInfo = ref({})
const originalUserInfo = ref({})
const showAvatarModal = ref(false)
const availableAvatars = ['default.png', 'man.png', 'woman.png']

function selectAvatar(avatar) {
    userInfo.value.AnhBiaND = avatar;
    showAvatarModal.value = false;
}

onMounted(async () => {
    const user = getUser()
    if (user) {
        try {
            const userData = await UserService.get(user._id)
            if (userData) {
                userInfo.value = {
                    HoTen: userData.HoTen || '',
                    SoDienThoai: userData.SoDienThoai || '',
                    NgaySinh: userData.NgaySinh ? userData.NgaySinh.split('T')[0] : '',
                    GioiTinh: userData.GioiTinh || 'Nam',
                    Email: userData.Email || '',
                    DiaChi: userData.DiaChi || '',
                    AnhBiaND: userData.AnhBiaND || ''
                }
                originalUserInfo.value = { ...userInfo.value }
            }

            // Lấy lịch sử mượn
            try {
                const historyData = await LedgerService.getByUser(user._id);
                if (historyData && Array.isArray(historyData)) {
                    orders.value = historyData.map((phieu, index) => {
                        let statusClass = 'status-borrowed';
                        let displayStatus = 'Đang Mượn';

                        if (phieu.TrangThai === 'DaTra') {
                            statusClass = 'status-returned';
                            displayStatus = 'Đã Trả';
                        }
                        else if (phieu.TrangThai === 'QuaHan') {
                            statusClass = 'status-overdue';
                            displayStatus = 'Quá Hạn';
                        }
                        else if (phieu.TrangThai === 'DangMuon') {
                            statusClass = 'status-borrowed';
                            displayStatus = 'Đang Mượn';
                        } else {
                            displayStatus = phieu.TrangThai || 'Đang Mượn';
                        }

                        return {
                            id: phieu._id || phieu.MaDM || index,
                            code: phieu._id || phieu.MaDM || 'Unknown',
                            borrowDate: phieu.NgayMuon || '',
                            returnDate: phieu.NgayTra || '',
                            status: displayStatus,
                            statusClass: statusClass,
                            books: (phieu.books || []).map(b => ({
                                id: b.MaSach || b.SachId,
                                name: b.TenSach || 'Sách chưa có tên',
                                quantity: b.SoLuong || 1,
                                image: b.BiaSach ? (b.BiaSach.startsWith('/') ? b.BiaSach : `/images/Sach/${b.BiaSach}`) : '/images/user_icon.jpg'
                            }))
                        }
                    });
                    orders.value.sort((a, b) => {
                        const dateA = new Date(a.borrowDate);
                        const dateB = new Date(b.borrowDate);
                        return dateB - dateA;
                    });
                }
            } catch (err) {
                console.error("Lỗi khi tải lịch sử đơn mượn:", err);
            }

            // Lấy lịch sử yêu cầu
            try {
                const requestData = await RequestService.getRequestByUser(user._id);
                if (requestData && Array.isArray(requestData)) {
                    requests.value = requestData.map((req, index) => {
                        let statusClass = 'status-borrowed';
                        let displayStatus = 'Đang Xử Lý';

                        if (req.TrangThai === 'DaXacNhan') {
                            statusClass = 'status-returned';
                            displayStatus = 'Đã Xác Nhận';
                        }
                        else if (req.TrangThai === 'DaTuChoi') {
                            statusClass = 'status-overdue';
                            displayStatus = 'Đã Từ Chối';
                        }
                        else if (req.TrangThai === 'ChoDuyet') {
                            statusClass = 'status-borrowed';
                            displayStatus = 'Chờ Duyệt';
                        } else {
                            displayStatus = req.TrangThai || 'Chờ Duyệt';
                        }

                        return {
                            id: req._id || index,
                            code: req._id || 'Unknown',
                            borrowDate: req.NgayTao || '',
                            status: displayStatus,
                            statusClass: statusClass,
                            books: (req.details || []).map(d => ({
                                id: d.MaSach || (d.Sach && d.Sach._id),
                                name: (d.Sach && d.Sach.TenSach) || 'Sách chưa có tên',
                                quantity: d.SoLuong || 1,
                                image: (d.Sach && d.Sach.BiaSach) ? (d.Sach.BiaSach.startsWith('/') ? d.Sach.BiaSach : `/images/Sach/${d.Sach.BiaSach}`) : '/images/user_icon.jpg'
                            }))
                        }
                    });
                    requests.value.sort((a, b) => {
                        return b.id - a.id;
                    });
                }
            } catch (err) {
                console.error("Lỗi khi tải lịch sử yêu cầu:", err);
            }

        } catch (error) {
            console.error("Lỗi khi tải thông tin:", error)
        }
    }
})

async function toggleEdit() {
    if (isEditing.value) {
        const phoneRegex = /^[0-9]{10}$/;
        if (userInfo.value.SoDienThoai && !phoneRegex.test(userInfo.value.SoDienThoai)) {
            toast.error('Số điện thoại phải bao gồm đúng 10 chữ số.');
            return;
        }

        try {
            const user = getUser()
            if (user) {
                await UserService.update(user._id, userInfo.value)

                // Cập nhật localStorage
                const updatedUser = { ...user, ...userInfo.value }
                setUser(updatedUser)
                originalUserInfo.value = { ...userInfo.value }
                toast.success('Cập nhật thông tin thành công!')
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error)
            toast.error('Cập nhật thất bại. Vui lòng thử lại.')
        }
        isEditing.value = false
    } else {
        isEditing.value = true
    }
}

function cancelEdit() {
    userInfo.value = { ...originalUserInfo.value }
    isEditing.value = false
}

function handleLogout() {
    removeUser();
    toast.success('Đăng xuất thành công!');
    router.push('/login');
}

function switchTab(tab) {
    activeTab.value = tab
}

function getTotalBooks(order) {
    return order.books.reduce((sum, book) => sum + book.quantity, 0)
}

const orders = ref([])

const currentPage = ref(1)
const itemsPerPage = 5

const totalPages = computed(() => {
    return Math.ceil(orders.value.length / itemsPerPage)
})

const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return orders.value.slice(start, end)
})

const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    if (current <= 3) {
        return [1, 2, 3, 4, '...', total]
    }

    if (current >= total - 2) {
        return [1, '...', total - 3, total - 2, total - 1, total]
    }

    return [1, '...', current - 1, current, current + 1, '...', total]
})

function goToPage(page) {
    if (page === '...' || page < 1 || page > totalPages.value) return
    currentPage.value = page
}

const expandedOrderId = ref(null)

function toggleOrder(id) {
    if (expandedOrderId.value === id) {
        expandedOrderId.value = null
    } else {
        expandedOrderId.value = id
    }
}

// Trạng thái và phân trang lịch sử yêu cầu
const requests = ref([])
const currentRequestPage = ref(1)

const totalRequestPages = computed(() => {
    return Math.ceil(requests.value.length / itemsPerPage)
})

const paginatedRequests = computed(() => {
    const start = (currentRequestPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return requests.value.slice(start, end)
})

const visibleRequestPages = computed(() => {
    const total = totalRequestPages.value
    const current = currentRequestPage.value

    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    if (current <= 3) {
        return [1, 2, 3, 4, '...', total]
    }

    if (current >= total - 2) {
        return [1, '...', total - 3, total - 2, total - 1, total]
    }

    return [1, '...', current - 1, current, current + 1, '...', total]
})

function goToRequestPage(page) {
    if (page === '...' || page < 1 || page > totalRequestPages.value) return
    currentRequestPage.value = page
}

const expandedRequestId = ref(null)

function toggleRequest(id) {
    if (expandedRequestId.value === id) {
        expandedRequestId.value = null
    } else {
        expandedRequestId.value = id
    }
}
</script>

<style scoped>
ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

button,
input {
    border: none;
    background: none;
    font-family: inherit;
}

button {
    cursor: pointer;
}

input {
    cursor: text;
}

.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    vertical-align: middle;
}

.paper-card {
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.15);
    border: 1px solid rgba(130, 116, 114, 0.2);
    border-radius: 5px;
    position: relative;
}


.page-header {
    margin-bottom: 48px;
    text-align: center;
}

@media (min-width: 768px) {
    .page-header {
        text-align: left;
    }
}

.page-title {
    font-family: var(--font-playfair);
    font-size: 40px;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 8px;
    line-height: 1.1;
}

/* Bố cục Tab */
.layout-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

@media (min-width: 768px) {
    .layout-container {
        flex-direction: row;
    }
}

.tab-nav {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

@media (min-width: 768px) {
    .tab-nav {
        width: 256px;
        flex-shrink: 0;
    }
}

.tab-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    color: var(--color-on-surface-variant);
    font-size: 14px;
    font-weight: 700;
    transition: all 0.2s;
    text-align: left;
}

.tab-btn:hover {
    background-color: var(--color-surface-container);
}

.tab-btn.active {
    background-color: var(--color-surface-container-high);
    color: var(--color-primary);
    border-left: 4px solid var(--color-secondary);
    border-radius: 0 8px 8px 0;
}

.tab-btn.logout {
    margin-top: 32px;
}

.tab-content {
    flex-grow: 1;
}

.tab-pane {
    display: none;
    background-color: #ffffff;
    padding: 16px;
    margin-bottom: 48px;
}

@media (min-width: 768px) {
    .tab-pane {
        padding: 48px;
    }
}

.tab-pane.active {
    display: block;
}

/* Tab hồ sơ */
.tab-header {
    margin-bottom: 32px;
    border-bottom: 1px solid rgba(211, 195, 192, 0.3);
    padding-bottom: 16px;
}

.tab-title {
    font-family: var(--font-playfair);
    font-size: 24px;
    font-weight: 600;
    color: var(--color-primary);
}

.form-container {
    max-width: 672px;
    margin-left: 2rem;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
}

@media (min-width: 768px) {
    .avatar-section {
        align-items: flex-start;
    }
}

.avatar-wrapper {
    position: relative;
}

.avatar-img-container {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    border: 2px solid var(--color-secondary);
    padding: 3px;
    background-color: var(--color-surface-container-low);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    transition: filter 0.3s;
}

.avatar-wrapper:hover .avatar-img {
    filter: grayscale(0%);
}

.avatar-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: var(--color-secondary);
    color: var(--color-on-secondary);
    border-radius: 50%;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-surface-container);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px 32px;
}

@media (min-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-label {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-on-surface-variant);
    margin-bottom: 4px;
}

.form-input {
    background-color: var(--color-surface-container-low);
    border: 1px solid var(--color-secondary);
    border-radius: 5px;
    padding: 6px 8px;
    font-family: var(--font-merriweather);
    font-size: 16px;
    width: 100%;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-bottom-color: var(--color-secondary);
}

.form-input:disabled {
    border-color: transparent transparent rgba(130, 116, 114, 0.3) transparent;
    background-color: transparent;
    padding-left: 0;
    border-radius: 0;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 24px;
    margin-top: 24px;
}

.btn-submit {
    background-color: var(--color-secondary);
    color: var(--color-on-secondary);
    padding: 8px 32px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 2px 2px 0px 0px rgba(131, 84, 37, 0.3);
    border-radius: 5px;
    transition: transform 0.2s;
}

.btn-submit:hover {
    transform: translateY(-1px);
}

.btn-cancel {
    background-color: var(--color-surface-container-high);
    color: var(--color-on-surface);
    padding: 8px 32px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 5px;
    transition: transform 0.2s;
    border: 1px solid var(--color-outline-variant);
}

.btn-cancel:hover {
    transform: translateY(-1px);
    background-color: var(--color-surface-variant);
}

/* Tab lịch sử */
.history-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

@media (min-width: 576px) {
    .history-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
    }
}

.history-stats {
    text-align: right;
    font-size: 14px;
    font-weight: 700;
    margin-top: 8px;
}

.empty-message {
    text-align: center;
    padding: 32px;
    color: var(--color-on-surface-variant);
    font-style: italic;
    background-color: var(--color-surface-container-low);
    border-radius: 8px;
    border: 1px dashed rgba(211, 195, 192, 0.5);
    margin-top: 16px;
}

.order-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
}

.order-card {
    background: #fff;
    border: 1px solid rgba(211, 195, 192, 0.4);
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.order-header {
    background-color: var(--color-surface-container);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    gap: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    flex-wrap: wrap;
}

.order-header:hover {
    background-color: #f5eedc;
}

.order-header-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    min-width: 0;
}

@media (min-width: 576px) {
    .order-header-left {
        align-items: center;
    }
}

.expand-icon {
    transition: transform 0.3s ease;
    color: var(--color-on-surface-variant);
    font-size: 15px !important;
    margin-top: 2px;
}

@media (min-width: 576px) {
    .expand-icon {
        margin-top: 0;
    }
}

.expand-icon.expanded {
    transform: rotate(90deg);
}

.order-title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.order-title {
    margin: 0;
    font-family: inherit;
    font-size: 16px;
    font-weight: 700;
    color: #8c5b35;
}

.order-code {
    font-size: 12px;
    color: var(--color-on-surface-variant);
}

.order-meta-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.order-total-books {
    font-size: 12px;
    font-weight: 700;
    color: #8c5b35;
    background-color: #fbf5ee;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #e6d3c0;
}

.status-badge {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid currentColor;
    background-color: #fff;
}

.status-borrowed {
    color: #1e8e3e;
}

.status-returned {
    color: #e6a23c;
    /* Màu vàng */
}

.status-overdue {
    color: #d93025;
}

.order-content {
    padding: 16px;
    border-top: 1px solid rgba(211, 195, 192, 0.2);
    background-color: var(--color-surface-container-low);
}

.order-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--color-on-surface);
}

.meta-item {
    white-space: nowrap;
}

.date-arrow {
    color: var(--color-on-surface-variant);
    font-size: 20px !important;
}

.book-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

@media (min-width: 768px) {
    .book-list {
        grid-template-columns: repeat(2, 1fr);
    }
}

.book-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background-color: #ffffff;
    border-radius: 8px;
    border: 1px solid rgba(211, 195, 192, 0.3);
}

.book-cover-mini {
    width: 96px;
    height: 144px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid rgba(130, 116, 114, 0.2);
}

.book-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.book-name {
    font-weight: 700;
    font-size: 15px;
    color: var(--color-on-surface);
}

.book-quantity {
    font-size: 14px;
    color: var(--color-on-surface-variant);
}

/* Phân trang */
.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 10px 0;
}

.pagination-controls {
    display: flex;
    gap: 8px;
}

.page-btn {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(211, 195, 192, 0.5);
    border-radius: 5px;
    transition: all 0.2s;
}

.page-btn:not(:disabled):hover {
    background-color: var(--color-surface-container-high);
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-btn.dots {
    border: none;
    background: transparent;
    cursor: default;
    opacity: 1;
}

.page-btn.active {
    background-color: var(--color-secondary);
    color: var(--color-on-secondary);
    font-weight: 700;
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.15);
    border-color: transparent;
}

/* Style popup ảnh đại diện */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 24px;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.modal-header h3 {
    margin: 0;
    color: var(--color-primary);
    font-family: var(--font-playfair);
}

.close-btn {
    font-size: 20px;
    color: var(--color-on-surface-variant);
    background: none;
    border: none;
    cursor: pointer;
}

.avatar-list {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}

.avatar-option {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid transparent;
    transition: transform 0.2s, border-color 0.2s;
    object-fit: cover;
}

.avatar-option:hover {
    transform: scale(1.05);
}

.avatar-option.selected {
    border-color: var(--color-secondary);
}
</style>
