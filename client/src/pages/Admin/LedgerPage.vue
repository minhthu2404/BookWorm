<template>
    <div class="container custom-scrollbar">
        <div class="page-header">
            <h1 class="page-title">Quản Lý Mượn - Trả</h1>
            <div class="header-actions">
                <div class="search-section">
                    <span>Tìm kiếm sách</span>
                    <div class="search-wrapper">
                        <span class="material-symbols-outlined search-icon">search</span>
                        <input class="search-input" placeholder="Tìm kiếm..." type="text" v-model="searchQuery">
                    </div>
                </div>
                <div class="filter-section">
                    <span>Trạng thái</span>
                    <select class="filter-select" v-model="selectedStatus">
                        <option>Tất cả</option>
                        <option>Đã trả</option>
                        <option>Đang mượn</option>
                        <option>Quá hạn</option>
                    </select>
                </div>
                <div class="filter-section">
                    <span>Ngày mượn</span>
                    <div class="search-wrapper">
                        <input class="search-input" type="date" v-model="filterNgayMuon">
                    </div>
                </div>
                <div class="filter-section">
                    <span>Ngày trả</span>
                    <div class="search-wrapper">
                        <input class="search-input" type="date" v-model="filterNgayTra">
                    </div>
                </div>
            </div>
        </div>

        <!-- Bảng sổ mượn -->
        <div class="table-container">
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã độc giả</th>
                            <th>Tên độc giả</th>
                            <th>Email</th>
                            <th>Ngày Mượn</th>
                            <th>Ngày Trả</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(ledger, index) in paginatedLedgers" :key="ledger._id || index"
                            :class="{ 'alt-row': index % 2 !== 0, 'selected': selectedRow === ledger._id }"
                            @click="openModal(ledger._id)">
                            <td class="col-id">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                            <td class="left">{{ ledger.MaND }}</td>
                            <td class="left">{{ ledger.HoTen }}</td>
                            <td class="italic left">{{ ledger.Email }}</td>
                            <td>{{ ledger.NgayMuon }}</td>
                            <td>{{ ledger.NgayTra === 'Chưa xác định' ? calculateExpectedReturnDate(ledger.NgayMuon) : ledger.NgayTra }}</td>
                            <td><span class="status-badge" :class="getStatusClass(getComputedStatus(ledger))">
                                {{ getStatusText(getComputedStatus(ledger)) }}</span></td>
                            <td class="td-center">
                                <a class="action-link" href="#" @click.stop.prevent="openModal(ledger._id)">
                                    <span class="material-symbols-outlined" style="font-size: 20px;">visibility</span>
                                </a>
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

        <!-- Popup chi tiết -->
        <ViewLedgerModal :isOpen="isModalOpen" :ledger="selectedLedger" @close="closeModal" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import ViewLedgerModal from '../../components/Admin/Ledger/ViewLedgerModal.vue';
import ledgerService from '@/services/ledger.service.js';

const isModalOpen = ref(false);
const ledgers = ref([]);
const selectedRow = ref(null);
const selectedLedger = ref(null);
const currentPage = ref(1);
const itemsPerPage = 5;
const selectedStatus = ref("Tất cả");
const searchQuery = ref("");
const filterNgayMuon = ref("");
const filterNgayTra = ref("");

const fetchLedgers = async () => {
    try {
        ledgers.value = await ledgerService.getAll();
    } catch (error) {
        console.error("Đã xảy ra lỗi khi lấy danh sách đơn mượn!", error);
    }
}

const getStatusClass = (status) => {
    switch (status) {
        case 'DaTra': return 'status-wait';
        case 'DangMuon': return 'status-approve';
        case 'QuaHan': return 'status-reject';
        default: return 'status-wait';
    }
}

const getStatusText = (status) => {
    switch (status) {
        case 'DaTra': return 'Đã trả';
        case 'DangMuon': return 'Đang mượn';
        case 'QuaHan': return 'Quá hạn';
        default: return status || 'Chưa rõ';
    }
}

const calculateExpectedReturnDate = (ngayMuonStr) => {
    if (!ngayMuonStr) return "Chưa xác định";
    const parts = ngayMuonStr.split('/');
    if (parts.length === 3) {
        const date = new Date(parts[2], parts[1] - 1, parts[0]);
        date.setDate(date.getDate() + 14);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    }
    return "Chưa xác định";
}

const getComputedStatus = (ledger) => {
    if (ledger.TrangThai === 'DaTra') return 'DaTra';
    
    let returnDateStr = ledger.NgayTra;
    if (returnDateStr === 'Chưa xác định' || !returnDateStr) {
        returnDateStr = calculateExpectedReturnDate(ledger.NgayMuon);
    }
    
    if (ledger.TrangThai === 'DangMuon' && returnDateStr !== 'Chưa xác định') {
        const parts = returnDateStr.split('/');
        if (parts.length === 3) {
            const rDate = new Date(parts[2], parts[1] - 1, parts[0]);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đầu ngày
            if (rDate < today) {
                return 'QuaHan';
            }
        }
    }
    
    return ledger.TrangThai;
};

const filteredLedgers = computed(() => {
    return ledgers.value.filter(req => {
        const computedStatus = getComputedStatus(req);
        let matchStatus = true;
        if (selectedStatus.value !== "Tất cả") {
            if (selectedStatus.value === "Đã trả") {
                matchStatus = computedStatus === "DaTra";
            } else if (selectedStatus.value === "Đang mượn") {
                matchStatus = computedStatus === "DangMuon";
            } else {
                matchStatus = computedStatus === "QuaHan";
            }
        }

        let matchSearch = true;
        if (searchQuery.value.trim() !== "") {
            const query = searchQuery.value.trim().toLowerCase();
            const name = (req.HoTen || "").toLowerCase();
            const email = (req.Email || "").toLowerCase();
            matchSearch = name.includes(query) || email.includes(query);
        }
        let matchNgayMuon = true;
        if (filterNgayMuon.value) {
            const dateDDMMYYYY = filterNgayMuon.value.split('-').reverse().join('/');
            matchNgayMuon = req.NgayMuon && (req.NgayMuon.includes(filterNgayMuon.value) || req.NgayMuon.includes(dateDDMMYYYY));
        }

        let matchNgayTra = true;
        if (filterNgayTra.value) {
            const dateDDMMYYYY = filterNgayTra.value.split('-').reverse().join('/');
            matchNgayTra = req.NgayTra && (req.NgayTra.includes(filterNgayTra.value) || req.NgayTra.includes(dateDDMMYYYY));
        }

        return matchStatus && matchSearch && matchNgayMuon && matchNgayTra;
    });
});

const totalPages = computed(() => {
    return Math.ceil(filteredLedgers.value.length / itemsPerPage);
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

const paginatedLedgers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredLedgers.value.slice(start, end);
});

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function openModal(id) {
    selectedRow.value = id;
    selectedLedger.value = ledgers.value.find(l => l._id === id);
    isModalOpen.value = true;
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    isModalOpen.value = false;
    selectedRow.value = null;
    document.body.style.overflow = 'auto';
}

onMounted(() => {
    fetchLedgers();
});

watch([searchQuery, selectedStatus, filterNgayMuon, filterNgayTra], () => {
    currentPage.value = 1;
});
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

/* Tiêu đề trang */
.page-header {
    display: flex;
    flex-direction: column;
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
    display: flex;
    align-items: center;
    background-color: var(--color-surface-container-lowest);
    border: 1px solid rgba(211, 195, 192, 0.5);
    border-radius: 5px;
    padding: 6px 12px;
}

.search-input {
    width: 156px;
    font-size: 14px;
    padding: 0 8px;
    color: var(--color-on-surface);
}

.search-input::placeholder {
    font-size: 14px;
}

.search-input[type="date"] {
    font-size: 14px;
    color: var(--color-on-surface-variant);
}

.search-icon {
    color: var(--color-outline);
}

.header-actions {
    display: flex;
    gap: 20px;
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

/* Bảng dữ liệu */
.table-container {
    background-color: var(--color-surface-container-lowest);
    border: 1px solid rgba(211, 195, 192, 0.3);
    border-radius: 5px;
    overflow: hidden;
    width: 100%;
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

.data-table tr {
    transition: background-color 0.2s;
}

.data-table tr:hover {
    background-color: var(--color-surface-container-low);
}

.col-id {
    color: var(--color-on-surface-variant);
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

.action-link {
    color: var(--color-secondary);
    transition: color 0.2s;
    text-decoration: none;
    display: inline-flex;
}

.action-link:hover {
    color: var(--color-primary);
}

.table-footer {
    padding: 16px 24px;
    background-color: var(--color-surface-container);
    border-top: 1px solid var(--color-outline);
    display: flex;
    justify-content: space-between;
    align-items: center;
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

/* Tiện ích */
.sticker-shadow {
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.1);
}

.pressed-state {
    transition: transform 0.1s, box-shadow 0.1s;
}

.pressed-state:active {
    transform: translate(1px, 1px);
    box-shadow: 0px 0px 0px 0px rgba(62, 39, 35, 0.1);
}

.italic {
    font-style: italic;
}

.left {
    text-align: left;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f5f3ef;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d3c3c0;
    border-radius: 10px;
}
</style>
