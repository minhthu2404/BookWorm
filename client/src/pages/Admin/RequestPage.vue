<template>
    <div class="request-page">
        <!-- Tiêu đề -->
        <div class="page-header">
            <div>
                <h2 class="page-title">Quản Lý Yêu Cầu</h2>
                <div class="header-section">
                    <div class="search-section">
                        <span>Tìm kiếm yêu cầu</span>
                        <div class="search-wrapper">
                            <span class="material-symbols-outlined search-icon">search</span>
                            <input class="search-input" placeholder="Tìm kiếm..." type="text" v-model="searchQuery">
                        </div>
                    </div>
                    <div class="filter-section">
                        <span>Trạng thái</span>
                        <select class="filter-select" v-model="selectedStatus">
                            <option>Tất cả</option>
                            <option>Chờ duyệt</option>
                            <option>Đã xác nhận</option>
                            <option>Đã từ chối</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="status-summary">
                <span class="status-label">TỔNG ĐANG CHỜ</span>
                <span class="status-value">{{ waitRequestCount }}</span>
            </div>
        </div>

        <!-- Bố cục lưới -->
        <div class="dashboard-grid">
            <!-- Sổ mượn chính -->
            <div class="table-container">
                <div class="table-wrapper">
                    <table class="data-table" id="request-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã yêu cầu</th>
                                <th>Tên người yêu cầu</th>
                                <th>Email</th>
                                <th>Điện Thoại</th>
                                <th>Thời gian yêu cầu</th>
                                <th>Số quyển</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(request, index) in paginatedRequests" :key="request._id || index"
                                :class="{ 'alt-row': index % 2 !== 0, 'selected': selectedRow === request._id }"
                                @click="openDetail(request._id)">
                                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                                <td>{{ request._id }}</td>
                                <td class="name-text">{{ request.HoTen }}</td>
                                <td class="email-text" style="font-style: italic;">{{ request.Email }}</td>
                                <td class="phone-text">{{ request.SoDienThoai }}</td>
                                <td class="date-text">{{ request.NgayTao }}</td>
                                <td class="book-quantity">{{ request.TongSoQuyen }}</td>
                                <td><span class="status-badge" :class="getStatusClass(request.TrangThai)">{{
                                        getStatusText(request.TrangThai) }}</span></td>
                                <td>
                                    <div class="action-btns">
                                        <button class="material-symbols-outlined action-btn"
                                            title="Xem chi tiết">visibility</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- Phân trang -->
            <div class="pagination-container" v-if="totalPages > 1">
                <div class="pagination-controls">
                    <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)"
                        :style="{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }">
                        <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button class="page-btn" v-for="(page, index) in visiblePages" :key="index"
                        :class="{ active: currentPage === page, 'ellipsis': page === '...' }" :disabled="page === '...'"
                        @click="page !== '...' && changePage(page)">
                        {{ page }}
                    </button>
                    <button class="page-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)"
                        :style="{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }">
                        <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>

        <RequestDetail v-if="showDetail" :request="selectedRequest" @close="showDetail = false; selectedRow = null" @refresh="fetchRequests" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import RequestDetail from '@/components/Admin/Request/RequestDetail.vue'
import requestService from '@/services/request.service'

const selectedRow = ref(null)
const showDetail = ref(false)
const requests = ref([]);
const selectedRequest = ref(null);
const currentPage = ref(1);
const itemsPerPage = 5;
const selectedStatus = ref("Tất cả");
const searchQuery = ref("");

const filteredRequests = computed(() => {
    return requests.value.filter(req => {
        let matchStatus = true;
        if (selectedStatus.value !== "Tất cả") {
            if (selectedStatus.value === "Chờ duyệt") {
                matchStatus = req.TrangThai === 'ChoDuyet';
            } else if (selectedStatus.value === "Đã xác nhận") {
                matchStatus = req.TrangThai === 'DaXacNhan';
            } else {
                matchStatus = req.TrangThai === 'DaTuChoi';
            }
        }

        let matchSearch = true;
        if (searchQuery.value.trim() !== "") {
            const query = searchQuery.value.trim().toLowerCase();
            const name = (req.HoTen || "").toLowerCase();
            const email = (req.Email || "").toLowerCase();
            matchSearch = name.includes(query) || email.includes(query);
        }

        return matchStatus && matchSearch;
    });
});

const totalPages = computed(() => {
    return Math.ceil(filteredRequests.value.length / itemsPerPage);
});

const visiblePages = computed(() => {
    const current = currentPage.value;
    const total = totalPages.value;
    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
        return [1, 2, 3, '...', total];
    }
    if (current >= total - 2) {
        return [1, '...', total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
});

const paginatedRequests = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredRequests.value.slice(start, end);
});

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

const fetchRequests = async () => {
    try {
        requests.value = await requestService.getAll();
    } catch (error) {
        console.error("Đã xảy ra lỗi khi lấy danh sách yêu cầu!", error);
    }
}

onMounted(() => {
    fetchRequests();
});

watch([searchQuery, selectedStatus], () => {
    currentPage.value = 1;
});

const getStatusClass = (status) => {
    switch (status) {
        case 'ChoDuyet': return 'status-wait';
        case 'DaXacNhan': return 'status-approve';
        case 'DaTuChoi': return 'status-reject';
        default: return 'status-wait';
    }
}

const getStatusText = (status) => {
    switch (status) {
        case 'ChoDuyet': return 'Chờ duyệt';
        case 'DaXacNhan': return 'Đã xác nhận';
        case 'DaTuChoi': return 'Đã từ chối';
        default: return status || 'Chưa rõ';
    }
}

const waitRequestCount = computed(() => {
    return requests.value.filter(req => req.TrangThai === 'ChoDuyet').length;
});

const openDetail = (id) => {
    selectedRow.value = id;
    selectedRequest.value = requests.value.find(req => req._id === id);
    showDetail.value = true;
}
</script>

<style scoped>
.paper-card {
    background-color: var(--color-surface-container-lowest);
    border: 1px solid rgba(211, 195, 192, 0.5);
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.15);
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 2px;
    font-size: 14px;
    letter-spacing: -0.05em;
}

.status-approve {
    background-color: var(--secondary-fixed);
    color: rgb(9, 170, 9);
}

.status-reject {
    color: var(--color-error);
}

.status-wait {
    color: var(--color-secondary);
}

.page-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: var(--gutter);
    border-bottom: 2px solid rgba(39, 19, 16, 0.2);
    padding-bottom: 8px;
}

.page-header>div {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.page-title {
    font-family: var(--font-playfair);
    font-size: 32px;
    font-weight: 700;
    color: var(--color-primary);
    line-height: 1.1;
}

/* Tiêu đề */
.header-section {
    display: flex;
    gap: 35px;
    flex-wrap: wrap;
    flex-direction: row;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
}

.search-section,
.filter-section {
    display: flex;
    gap: 10px;
    align-items: center;
}

.search-wrapper {
    display: flex;
    align-items: center;
    background-color: var(--color-surface-container-lowest);
    border: 1px solid rgba(211, 195, 192, 0.5);
    border-radius: 5px;
    padding: 6px 12px;
}

.search-input {
    width: 256px;
    font-size: 14px;
    padding: 0 8px;
    color: var(--color-on-surface);
}

.search-input::placeholder {
    font-size: 14px;
}

.search-icon {
    color: var(--color-outline);
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

.filter-select:focus {
    border-color: var(--color-secondary);
}

.status-summary {
    text-align: center;
}

@media (min-width: 768px) {
    .status-summary {
        text-align: center;
    }
}

.status-label {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-secondary);
    display: block;
    margin: 0;
}

.status-value {
    font-family: var(--font-merriweather);
    font-size: 40px;
    font-weight: 700;
    color: var(--color-primary);
}

/* Bố cục lưới */
.dashboard-grid {
    display: block;
}

/* Phần mượn trả */
.table-container {
    background-color: var(--color-surface-container-lowest);
    border: 1px solid rgba(211, 195, 192, 0.3);
    border-radius: 5px;
    overflow: hidden;
    width: 100%;
}

.table-wrapper {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: separate;
    text-align: center;
    font-size: 14px;
}

.data-table th {
    background-color: var(--color-surface-container-high);
    color: rgba(39, 19, 16, 0.8);
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 9px;
    text-align: center;
    border-bottom: 1px solid rgba(62, 39, 35, 0.1);
}

.data-table td {
    padding: 8px;
    border-bottom: 1px solid rgba(211, 195, 192, 0.3);
    border-right: 1px solid rgba(211, 195, 192, 0.2);
    transition: background-color 0.2s;
}

.data-table tr:hover td {
    background-color: var(--color-surface-container-low);
    cursor: pointer;
}

.data-table tr.alt-row td {
    background-color: var(--color-surface-container-lowest);
}

.data-table tr.alt-row:hover td {
    background-color: var(--color-surface-container-low);
}

.data-table tr.selected td {
    background-color: rgba(255, 191, 135, 0.2);
}

.email-text,
.name-text {
    text-align: left;
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

.action-btn:hover {
    color: var(--color-primary);
}

/* Phân trang */
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
</style>
