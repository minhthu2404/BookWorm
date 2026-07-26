<template>
    <div class="modal-overlay" :class="{ active: isOpen }" @click="closeModal">
        <div class="modal-backdrop"></div>
        <div class="modal-content custom-scrollbar" @click.stop>
            <div class="modal-header">
                <h3 class="modal-title">Chi tiết đơn mượn</h3>
                <button class="modal-close material-symbols-outlined" @click="closeModal">close</button>
            </div>
            <div class="modal-body custom-scrollbar">

                <div class="info-cards">
                    <div class="info-card">
                        <div class="card-header">
                            <span class="material-symbols-outlined">receipt_long</span>
                            <h4>Thông tin đơn mượn</h4>
                        </div>
                        <div class="info-list">
                            <div class="info-row">
                                <span class="detail-label">Mã đơn mượn:</span>
                                <span class="detail-value">{{ ledger?._id || '---' }}</span>
                            </div>
                            <div class="info-row">
                                <span class="detail-label">Trạng thái:</span>
                                <span class="status-badge" :class="getStatusClass(getComputedStatus(ledger))">{{
                                    getStatusText(getComputedStatus(ledger)) }}</span>
                            </div>
                            <div class="info-row">
                                <span class="detail-label">Thời gian:</span>
                                <div class="date-range">
                                    <span class="detail-value date-badge">{{ ledger?.NgayMuon || '--/--/----' }}</span>
                                    <span class="material-symbols-outlined icon-arrow">arrow_forward</span>
                                    <span class="detail-value date-badge">{{ ledger?.NgayTra === 'Chưa xác định' ? calculateExpectedReturnDate(ledger?.NgayMuon) : (ledger?.NgayTra || '--/--/----') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="card-header">
                            <span class="material-symbols-outlined">person</span>
                            <h4>Thông tin độc giả</h4>
                        </div>
                        <div class="info-list">
                            <div class="info-row">
                                <span class="detail-label">Mã độc giả:</span>
                                <span class="detail-value">{{ ledger?.MaND || '---' }}</span>
                            </div>
                            <div class="info-row">
                                <span class="detail-label">Tên độc giả:</span>
                                <span class="detail-value">{{ ledger?.HoTen || '---' }}</span>
                            </div>
                            <div class="info-row">
                                <span class="detail-label">Email:</span>
                                <span class="detail-value italic">{{ ledger?.Email || '---' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="books-section">
                    <h4 class="section-title">Danh sách sách mượn</h4>
                    <div class="mini-table-wrapper">
                        <table class="mini-table">
                            <thead>
                                <tr>
                                    <th>Tên sách</th>
                                    <th>Tác giả</th>
                                    <th>Số lượng</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(detail, index) in ledger?.details || []" :key="index">
                                    <td class="book-cell">
                                        <div class="mini-book-cover-wrapper">
                                            <img class="mini-book-cover" :alt="detail.Sach?.TenSach || 'Sách'"
                                                :src="detail.Sach?.BiaSach ? '/images/Sach/' + detail.Sach.BiaSach : '/images/default-book.png'">
                                        </div>
                                        <span class="book-title">{{ detail.Sach?.TenSach || detail.MaSach || 'Không rõ'
                                            }}</span>
                                    </td>
                                    <td class="book-author">{{ detail.Sach?.TenTG || 'Không rõ' }}</td>
                                    <td class="center">{{ detail.SoLuong < 10 ? '0' + detail.SoLuong : detail.SoLuong
                                            }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary sticker-shadow pressed-state" @click="closeModal">Đóng</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    ledger: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['close']);

function closeModal() {
    emit('close');
}

const getStatusClass = (status) => {
    switch (status) {
        case 'DaTra': return 'status-returned';
        case 'DangMuon': return 'status-borrowed';
        case 'QuaHan': return 'status-overdue';
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
    if (!ledger) return 'Chưa rõ';
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
            today.setHours(0, 0, 0, 0);
            if (rDate < today) {
                return 'QuaHan';
            }
        }
    }
    
    return ledger.TrangThai;
};
</script>

<style scoped>
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
    max-width: 750px;
    max-height: 95vh;
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
    margin: 0;
}

.modal-close {
    color: var(--color-on-surface-variant);
    transition: color 0.2s;
    border: none;
    background: transparent;
    cursor: pointer;
}

.modal-close:hover {
    color: var(--color-primary);
}

.modal-body {
    padding: 12px 24px;
    overflow-y: auto;
    flex: 1;
}

.modal-footer {
    padding: 8px 20px;
    border-top: 1px solid rgba(211, 195, 192, 0.3);
    background-color: var(--color-surface-container-low);
    display: flex;
    justify-content: flex-end;
}

.info-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 24px;
}

@media (min-width: 768px) {
    .info-cards {
        grid-template-columns: 1fr 1fr;
    }
}

.info-card {
    background-color: var(--color-surface-container-lowest);
    border: 1px solid rgba(211, 195, 192, 0.4);
    border-radius: 5px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid rgba(211, 195, 192, 0.2);
    padding-bottom: 12px;
}

.card-header span {
    color: var(--color-primary);
    font-size: 20px;
}

.card-header h4 {
    margin: 0;
    font-family: var(--font-playfair);
    font-size: 16px;
    color: var(--color-primary);
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.detail-label {
    font-size: 13px;
    color: var(--color-on-surface-variant);
    font-weight: 600;
    white-space: nowrap;
}

.detail-value {
    font-family: var(--font-merriweather, serif);
    font-size: 14px;
    color: var(--color-primary);
    text-align: right;
    word-break: break-word;
}

.date-range {
    display: flex;
    align-items: center;
    gap: 6px;
}

.icon-arrow {
    font-size: 16px;
    color: var(--color-on-surface-variant);
}

.date-badge {
    background-color: var(--color-surface-container-low);
    border: 1px solid rgba(211, 195, 192, 0.3);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    white-space: nowrap;
}

.detail-value.italic {
    font-style: italic;
    font-weight: 400;
}

.books-section {
    margin-top: 24px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    font-family: var(--font-playfair);
    color: var(--color-primary);
    letter-spacing: 0.05em;
    border-bottom: 2px solid rgba(211, 195, 192, 0.3);
    padding-bottom: 12px;
    margin-bottom: 20px;
    margin-top: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.mini-table-wrapper {
    border: 1px solid rgba(211, 195, 192, 0.5);
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--color-surface-container-lowest);
}

.mini-table {
    width: 100%;
    border-collapse: separate;
    text-align: left;
}

.mini-table th {
    background-color: var(--color-surface-container-low);
    font-size: 13px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-primary);
    border-bottom: 1px solid rgba(211, 195, 192, 0.4);
    padding: 8px 16px;
    font-weight: 700;
}

.mini-table td {
    font-size: 15px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(211, 195, 192, 0.2);
    color: var(--color-on-surface);
}

.mini-table td:last-child {
    color: var(--color-secondary);
    font-weight: 700;
    font-size: 14px;
}

.mini-table td.center {
    text-align: center;
}

.mini-book-cover-wrapper {
    width: 44px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.1);
    border: 1px solid rgba(211, 195, 192, 0.5);
    margin: 0;
    flex-shrink: 0;
}

.mini-book-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.book-cell {
    display: flex;
    align-items: center;
    gap: 15px;
}

.book-title {
    text-align: left;
    font-family: var(--font-playfair);
    font-size: 16px;
    font-weight: 600;
    color: var(--color-primary);
    line-height: 1.2;
}

.book-author {
    font-size: 13px;
    color: var(--color-on-surface-variant);
    font-style: italic;
    text-align: center;
}

.btn-primary {
    border-radius: 5px;
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    padding: 8px 32px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background-color 0.2s;
    white-space: nowrap;
    border: none;
    cursor: pointer;
}

.btn-primary:hover {
    background-color: var(--color-primary-container);
}

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

.status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.05em;
    max-width: 120px;
}

.status-returned {
    background-color: rgba(234, 154, 114, 0.15);
    color: var(--color-secondary);
    border: 1px solid rgba(234, 154, 114, 0.3);
}

.status-borrowed {
    background-color: rgba(9, 170, 9, 0.1);
    color: rgb(9, 170, 9);
    border: 1px solid rgba(9, 170, 9, 0.2);
}

.status-overdue {
    background-color: rgba(220, 53, 69, 0.1);
    color: var(--color-error);
    border: 1px solid rgba(220, 53, 69, 0.2);
}
</style>
