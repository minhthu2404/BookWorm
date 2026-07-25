<template>
    <div class="container">
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">Quản Lý Độc Giả</h1>
            <div class="header-actions">
                <div class="search-section">
                    <span>Tìm kiếm độc giả</span>
                    <div class="search-wrapper">
                        <span class="material-symbols-outlined search-icon">search</span>
                        <input class="search-input" placeholder="Tìm kiếm..." type="text" v-model="searchQuery">
                    </div>
                </div>
                <div class="filter-section">
                    <span>Loại tài khoản</span>
                    <select class="filter-select" v-model="selectedStatus">
                        <option>Tất cả</option>
                        <option>Quản trị viên</option>
                        <option>Người dùng</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Main Registry Table -->
        <div class="table-and-pagination-wrapper">
            <div class="table-container">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã độc giả</th>
                                <th>Tên người dùng</th>
                                <th>Email</th>
                                <th>Ngày sinh</th>
                                <th>Giới tính</th>
                                <th>Địa chỉ</th>
                                <th>Điện thoại</th>
                                <th>Loại Tài Khoản</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, index) in paginatedUsers" :key="user._id || index" 
                                @click="openProfile(user)">
                                <td>{{ (currentPage - 1)*itemsPerPage + index + 1 }}</td>
                                <td class="col-id">{{ user._id }}</td>
                                <td class="col-name">{{ user.HoTen }}</td>
                                <td class="col-email">{{user.Email}}</td>
                                <td>{{ user.NgaySinh }}</td>
                                <td>{{ user.GioiTinh }}</td>
                                <td class="col-address">{{ user.DiaChi }}</td>
                                <td class="col-phone">{{ user.SoDienThoai }}</td>
                                <td>
                                    <span :class="user.LoaiTaiKhoan === 'QuanTri' ? 'type-badge' : 'badge'">
                                        {{ user.LoaiTaiKhoan !== 'QuanTri' ? 'Người dùng' : 'Quản trị viên' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-btns">
                                        <button class="action-btn material-symbols-outlined" title="Xem chi tiết"
                                            @click.stop="openProfile(user)">visibility</button>
                                        <button class="action-btn delete material-symbols-outlined" title="Xóa hồ sơ"
                                            @click.stop>delete</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" v-if="totalPages > 1">
            <div class="pagination-controls">
                <button class="page-btn"
                    :disabled="currentPage === 1"
                    @click="changePage(currentPage - 1)"
                    :style="{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <button class="page-btn"
                    v-for="(page, index) in visiblePages"
                    :key="index" :class="{active: currentPage === page, 'ellipsis': page === '...'}"
                    :disabled="page === '...'"
                    @click="page !== '...' && changePage(page)">
                    {{ page }}
                </button>
                <button class="page-btn"
                    :disabled="currentPage === totalPages"
                    @click="changePage(currentPage + 1)"
                    :style="{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>

        <!-- Profile Detail Modal -->
        <div class="modal-overlay" :class="{ active: isModalOpen }" @click="closeProfile">
            <div class="modal-backdrop"></div>
            <div class="modal-content" @click.stop v-if="selectedProfile">
                <div class="modal-header">
                    <h3 class="modal-title">Thông tin chi tiết người dùng</h3>
                    <button class="modal-close material-symbols-outlined" @click="closeProfile">close</button>
                </div>
                <div class="modal-body">
                    <div class="profile-layout">
                        <div class="profile-avatar-wrapper">
                            <img class="profile-avatar" alt="Reader Avatar" :src="selectedProfile.avatar" />
                        </div>
                        <table class="profile-table">
                            <tbody>
                                <tr>
                                    <td class="profile-label">Mã độc giả</td>
                                    <td class="profile-val-id">{{ selectedProfile._id }}</td>
                                </tr>
                                <tr>
                                    <td class="profile-label">Tên người dùng</td>
                                    <td class="profile-val-name">{{ selectedProfile.HoTen || 'Chưa cập nhật'}}</td>
                                </tr>
                                <tr>
                                    <td class="profile-label">Email</td>
                                    <td class="profile-val-email">{{ selectedProfile.Email || 'Chưa cập nhật' }}</td>
                                </tr>
                                <tr>
                                    <td class="profile-label">Ngày sinh</td>
                                    <td class="profile-val-text">{{ selectedProfile.NgaySinh || 'Chưa cập nhật' }}</td>
                                </tr>
                                <tr>
                                    <td class="profile-label">Giới tính</td>
                                    <td class="profile-val-text">{{ selectedProfile.GioiTinh || 'Chưa cập nhật' }}</td>
                                </tr>
                                <tr>
                                    <td class="profile-label">Địa chỉ</td>
                                    <td class="profile-val-text">{{ selectedProfile.DiaChi || 'Chưa cập nhật' }}</td>
                                </tr>
                                <tr>
                                    <td class="profile-label">Số điện thoại</td>
                                    <td class="profile-val-text">{{ selectedProfile.SoDienThoai || 'Chưa cập nhật' }}</td>
                                </tr>
                                <tr>
                                    <td class="profile-label">Loại tài khoản</td>
                                    <td>{{ selectedProfile.LoaiTaiKhoan !== 'QuanTri' ? 'Người dùng' : 'Quản trị viên'}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-modal-close" @click="closeProfile">Đóng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import userService from '@/services/user.service';

const isModalOpen = ref(false);
const selectedProfile = ref(null);

const users = ref([]);
const currentPage = ref(1);
const itemsPerPage = 5;
const selectedStatus = ref("Tất cả");
const searchQuery = ref("");

const filteredUsers = computed(() => {
    return users.value.filter(user => {
        let matchSearch = true;
        if (searchQuery.value.trim().toLowerCase() !== ""){
            const query = searchQuery.value.trim().toLowerCase();
            const name = (user.HoTen || "").toLowerCase();
            const email = (user.Email || "").toLowerCase();
            matchSearch = name.includes(query) || email.includes(query);
        }
        let matchStatus = true;
        if (selectedStatus.value !== "Tất cả"){
            if (selectedStatus.value === "Quản trị viên"){
                matchStatus = user.LoaiTaiKhoan === 'QuanTri';
            }else if(selectedStatus.value === "Người dùng"){
                matchStatus = user.LoaiTaiKhoan !== 'QuanTri';
            }
        }

        return matchSearch && matchStatus;
    });
});

const totalPages = computed(() => {
    return Math.ceil(filteredUsers.value.length / itemsPerPage);
});

const visiblePages = computed(() => {
    const current = currentPage.value;
    const total = totalPages.value;
    if (total <= 5){
        return Array.from({length: total}, (_, i) => i+1);
    }
    if (current <= 3){
        return [1, 2, 3, '...', total];
    }
    if (current >= total - 2){
        return [1, '...', total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
});

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1)*itemsPerPage;
    const end = start + itemsPerPage;
    return filteredUsers.value.slice(start, end);
});

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

const fetchUsers = async() => {
    try {
        users.value = await userService.getAll();
    } catch (error) {
        console.error("Đã xảy ra lỗi khi lấy danh sách độc giả!", error);
    }
}

onMounted(() => {
    fetchUsers();
});

watch ([searchQuery, selectedStatus], () => {
    currentPage.value = 1;
})

const avatars = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?q=80&w=300&h=400&auto=format&fit=crop'
];

function openProfile(user) {
    selectedProfile.value = {
        ...user,
        avatar: user.HinhAnh || avatars[Math.floor(Math.random() * avatars.length)]
    };
    isModalOpen.value = true;
    document.body.style.overflow = 'hidden';
}

function closeProfile() {
    isModalOpen.value = false;
    document.body.style.overflow = 'auto';
}
</script>

<style scoped>
.container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding-bottom: 80px;
}

@media (min-width: 768px) {
    .container {
        padding-bottom: 0;
    }
}

/* Page Header */
.page-header {
    display: flex;
    gap: 22px;
    border-bottom: 2px solid rgba(39, 19, 16, 0.2);
    padding-bottom: 16px;
    margin-bottom: var(--gutter);
}

.page-title {
    font-family: var(--font-playfair);
    font-size: 32px;
    font-weight: 700;
    color: var(--color-primary);
    margin-top: 4px;
}

.search-section,
.filter-section {
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-wrapper {
    display: none;
    align-items: center;
    background-color: var(--color-surface-container-lowest);
    border: 1px solid rgba(211, 195, 192, 0.5);
    border-radius: 5px;
    padding: 6px 12px;
}

@media (min-width: 768px) {
    .search-wrapper {
        display: flex;
    }
}

.search-input {
    width: 256px;
    font-size: 16px;
    padding: 0 8px;
    color: var(--color-on-surface);
}

.search-input::placeholder {
    font-size: 14px;
}

.search-icon {
    color: var(--color-outline);
}

@media (min-width: 768px) {
    .page-header {
        flex-direction: column;
        justify-content: space-between;
        /* align-items: flex-end;  */
    }
}

.header-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    flex-direction: row;
    font-size: 15px;
    font-weight: 600;
}

.filter-select {
    border: 1px solid rgba(211, 195, 192, 0.5);
    border-radius: 5px;
    padding: 8px 16px;
    font-family: var(--font-merriweather);
    font-size: 14px;
    color: var(--color-on-surface-variant);
    transition: border-color 0.2s;
}

/* Table Area */
.table-and-pagination-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 280px;
}

.table-container {
    background-color: var(--color-surface-container-lowest);
    border: 1px solid rgba(211, 195, 192, 0.3);
    border-radius: 5px;
    position: relative;
    overflow: hidden;
    margin-bottom: 32px;
}

.table-wrapper {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: separate;
    text-align: center;
    font-size: 13px;
}

.data-table th {
    background-color: var(--color-surface-container-high);
    color: rgba(39, 19, 16, 0.8);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 9px;
    text-align: center;
    border-bottom: 1px solid rgba(62, 39, 35, 0.1);
}

.data-table td {
    padding: 10px;
    border-bottom: 1px solid rgba(211, 195, 192, 0.3);
    border-right: 1px solid rgba(211, 195, 192, 0.2);
    transition: background-color 0.2s;
}

.data-table tr {
    transition: background-color 0.2s;
}

.data-table tr:hover td {
    background-color: var(--color-surface-container-low);
}

.col-name, .col-id, .col-email, .col-address {
    text-align: left;
}

.col-email {
    font-style: italic;
}

.type-badge {
    color: var(--color-secondary);
    font-weight: bold;
}

.action-btns {
    display: flex;
    justify-content: center;
    gap: 4px;
}

.action-btn {
    color: var(--color-secondary);
    transition: color 0.2s;
    font-size: 21px;
}

.action-btn.delete {
    color: var(--color-error);
}

.action-btn.edit {
    color: rgba(0, 0, 255, 0.668);
}

.action-btn:hover {
    color: var(--color-primary);
}

/* Pagination */
.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
}

.pagination-controls {
    display: flex;
    gap: 8px;
}

.page-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(211, 195, 192, 0.5);
    transition: all 0.2s;
}

.page-btn:hover {
    background-color: var(--color-surface-container-high);
}

.page-btn.active {
    background-color: var(--color-secondary);
    color: var(--color-on-secondary);
    font-weight: 700;
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.15);
    border-color: transparent;
}

.page-btn.ellipsis {
    border: none;
    background: transparent;
    cursor: default;
    pointer-events: none;
    font-weight: 700;
    color: var(--color-on-surface-variant);
}


/* Detail Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(39, 19, 16, 0.4);
    backdrop-filter: blur(4px);
    z-index: 50;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

@media (min-width: 640px) {
    .modal-overlay {
        padding: 24px;
    }
}

.modal-overlay.active {
    display: flex;
}

.modal-backdrop {
    position: absolute;
    inset: 0;
}

.modal-content {
    position: relative;
    background-color: var(--color-surface);
    border: 1px solid var(--color-outline-variant);
    width: 100%;
    max-width: 672px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 5px;
}

.modal-header {
    padding: 12px 20px;
    border-bottom: 1px solid rgba(211, 195, 192, 0.3);
    background-color: var(--color-surface-container-low);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-family: var(--font-playfair);
    font-size: 24px;
    font-weight: 600;
    color: var(--color-primary);
}

.modal-close {
    color: var(--color-on-surface-variant);
    transition: color 0.2s;
}

.modal-close:hover {
    color: var(--color-primary);
}

.modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}

.profile-layout {
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin-bottom: 32px;
}

@media (min-width: 768px) {
    .profile-layout {
        flex-direction: row;
        align-items: flex-start;
    }
}

.profile-avatar-wrapper {
    width: 128px;
    height: 160px;
    flex-shrink: 0;
    border: 2px solid rgba(39, 19, 16, 0.2);
    padding: 4px;
    background-color: #ffffff;
    border-radius: 5px;
}

.profile-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(100%);
}

.profile-table {
    flex: 1;
    width: 100%;
    border-collapse: collapse;
}

.profile-table td {
    padding: 12px 0;
    border-bottom: 1px dashed rgba(211, 195, 192, 0.4);
    vertical-align: middle;
}

.profile-table tr:last-child td {
    border-bottom: none;
}

.profile-table .profile-label {
    position: relative;
}

.profile-table .profile-label::after {
    content: ":";
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-on-surface-variant);
    font-size: 16px;
}

.profile-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-on-surface-variant);
    font-weight: 700;
}

.profile-val-id {
    font-size: 14px;
    color: var(--color-primary);
}

.profile-val-name {
    font-size: 14px;
    color: var(--color-primary);

}

.profile-val-email {
    font-size: 14px;
    font-style: italic;
    color: var(--color-primary);
}

.profile-val-text {
    font-size: 14px;
    color: var(--color-primary);
}
.modal-footer {
    padding: 8px 20px;
    border-top: 1px solid rgba(211, 195, 192, 0.3);
    background-color: var(--color-surface-container-low);
    display: flex;
    justify-content: flex-end;
}

.btn-modal-close {
    padding: 8px 32px;
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.1);
    transition: all 0.1s;
    border-radius: 5px;
}

.btn-modal-close:hover {
    background-color: var(--color-primary-container);
}

.btn-modal-close:active {
    transform: translateY(1px);
    box-shadow: none;
}
</style>
