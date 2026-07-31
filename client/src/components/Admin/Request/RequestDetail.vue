<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="detail-wrapper modal-content">
            <div class="detail-header">
                <div>
                    <span class="detail-header-title">Chi tiết yêu cầu</span>
                </div>
                <button class="material-symbols-outlined btn-close-modal" @click="$emit('close')"
                    title="Đóng">close</button>
            </div>

            <div class="detail-body custom-scrollbar" v-if="request">
                <div class="info-section">
                    <div class="info-list">
                        <div class="info-row">
                            <span class="detail-label">Mã yêu cầu:</span>
                            <span class="detail-value">{{ request._id }}</span>
                        </div>
                        <div class="info-row">
                            <span class="detail-label">Tên người yêu cầu:</span>
                            <span class="detail-value">{{ request.HoTen }}</span>
                        </div>
                        <div class="info-row">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value italic">{{ request.Email }}</span>
                        </div>
                        <div class="info-row">
                            <span class="detail-label">Số điện thoại:</span>
                            <span class="detail-value">{{ request.SoDienThoai }}</span>
                        </div>
                        <div class="info-row">
                            <span class="detail-label">Thời gian yêu cầu:</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span class="detail-value">{{ request.NgayTao }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="books-section">
                    <div class="section-header">
                        <h3 class="section-title no-border">Danh sách sách yêu cầu</h3>
                        <div class="total-books-highlight">
                            <span class="detail-label">Tổng số sách: </span>
                            <span class="highlight-value">{{ request?.TongSoQuyen < 10 ? '0' + request?.TongSoQuyen :
                                request?.TongSoQuyen }} quyển</span>
                        </div>
                    </div>
                    <div class="table-container">
                        <table class="vintage-table">
                            <thead>
                                <tr>
                                    <th>Tên sách</th>
                                    <th>Tác giả</th>
                                    <th>Trạng thái</th>
                                    <th class="text-center">Số lượng</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(detail, index) in request?.details || []" :key="index">
                                    <td>
                                        <div class="book-cell">
                                            <div class="book-cover-mini">

                                                <img :alt="detail.Sach?.TenSach || 'Sách'"
                                                    :src="detail.Sach?.BiaSach ? '/images/Sach/' + detail.Sach.BiaSach : '/images/default-book.png'">
                                            </div>
                                            <span class="book-title">{{ detail.Sach?.TenSach || detail.MaSach ||
                                                'Khôngrõ' }}</span>
                                        </div>
                                    </td>
                                    <td><span class="book-author">{{ detail.Sach?.TenTG || 'Không rõ' }}</span></td>
                                    <td>
                                        <span v-if="(detail.Sach?.SoQuyen ?? 1) > 0" class="status-available">Sẵn
                                            Có</span>
                                        <span v-else class="status-outofstock">Hết Hàng</span>
                                    </td>
                                    <td class="text-center"><span class="book-qty">{{ detail.SoLuong < 10 ? '0' +
                                        detail.SoLuong : detail.SoLuong }}</span>
                                    </td>
                                </tr>
                                <tr v-if="!request?.details || request.details.length === 0">
                                    <td colspan="4" class="text-center">Chưa có thông tin chi tiết sách</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="detail-footer">
                <template v-if="request.TrangThai === 'ChoDuyet'">
                    <button class="btn-large btn-outline-action" @click="promptConfirm('reject')" :disabled="isLoading">Từ Chối</button>
                    <button class="btn-large btn-primary-action" @click="promptConfirm('approve')" :disabled="isLoading">Phê Duyệt</button>
                </template>
                <template v-else>
                    <button class="btn-large btn-primary-action" @click="$emit('close')">Đóng</button>
                </template>
            </div>
        </div>

        <!-- Popup xác nhận -->
        <div class="confirm-overlay" v-if="confirmAction">
            <div class="confirm-box">
                <div class="confirm-icon" :class="confirmAction === 'approve' ? 'icon-success' : 'icon-danger'">
                    <span class="material-symbols-outlined">
                        {{ confirmAction === 'approve' ? 'check_circle' : 'warning' }}
                    </span>
                </div>
                <p class="confirm-message">{{ confirmMessage }}</p>
                <div class="confirm-buttons">
                    <button class="btn-confirm-cancel" @click="cancelConfirm" :disabled="isLoading">Hủy</button>
                    <button class="btn-confirm-submit" 
                        :class="confirmAction === 'approve' ? 'btn-success' : 'btn-danger'" 
                        @click="executeConfirm" :disabled="isLoading">
                        {{ isLoading ? 'Đang xử lý...' : 'Xác nhận' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import requestService from '@/services/request.service';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const props = defineProps({
    request: {
        type: Object,
        required: true,
        default: () => ({})
    }
});

const emit = defineEmits(['close', 'refresh']);
const isLoading = ref(false);

const confirmAction = ref(null);
const confirmMessage = ref('');

const promptConfirm = (action) => {
    confirmAction.value = action;
    confirmMessage.value = action === 'approve' 
        ? "Bạn có chắc chắn muốn phê duyệt yêu cầu mượn sách này không?" 
        : "Bạn có chắc chắn muốn từ chối yêu cầu mượn sách này không?";
}

const cancelConfirm = () => {
    confirmAction.value = null;
}

const executeConfirm = async () => {
    if (confirmAction.value === 'approve') {
        await handleApprove();
    } else if (confirmAction.value === 'reject') {
        await handleReject();
    }
}

const handleApprove = async () => {
    try {
        isLoading.value = true;
        const res = await requestService.approve(props.request._id);
        toast.success(res.message || "Phê duyệt thành công!");
        emit('refresh');
        emit('close');
    } catch (error) {
        toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi phê duyệt!");
    } finally {
        isLoading.value = false;
        confirmAction.value = null;
    }
}

const handleReject = async () => {
    try {
        isLoading.value = true;
        const res = await requestService.reject(props.request._id);
        toast.success(res.message || "Đã từ chối yêu cầu!");
        emit('refresh');
        emit('close');
    } catch (error) {
        toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi từ chối!");
    } finally {
        isLoading.value = false;
        confirmAction.value = null;
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(62, 39, 35, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
}

.modal-content {
    width: 100%;
    max-width: 750px;
    max-height: 90vh;
    border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f5f3ef;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d3c3c0;
    border-radius: 10px;
}

.btn-close-modal {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.btn-close-modal:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.detail-wrapper {
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface-container);
    border: 1px solid var(--color-outline-variant);
    height: 100%;
    overflow: hidden;
    position: relative;
}

.detail-header {
    padding: 12px 24px;
    background-color: var(--color-surface-container-low);
    border-bottom: 1px solid rgba(211, 195, 192, 0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-header-title {
    font-family: var(--font-playfair);
    font-size: 24px;
    font-weight: 600;
    display: block;
}

.detail-header-id {
    font-size: 16px;
}

.detail-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
}

.books-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.section-title {
    font-family: var(--font-playfair);
    font-size: 18px;
    font-weight: 700;
    color: var(--color-primary);
    border-bottom: 1px dashed rgba(211, 195, 192, 0.6);
    padding-bottom: 8px;
    margin: 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid rgba(211, 195, 192, 0.3);
    padding-bottom: 8px;
}

.section-title.no-border {
    border-bottom: none;
    padding-bottom: 0;
}



.total-books-highlight .highlight-value {
    font-family: var(--font-merriweather, serif);
    font-size: 16px;
    font-weight: 700;
    color: var(--color-secondary);
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 0;
}

.info-row {
    display: grid;
    grid-template-columns: 180px 1fr;
    align-items: center;
    gap: 16px;
    padding-bottom: 12px;
    border-bottom: 1px dashed rgba(211, 195, 192, 0.3);
}

.info-row:last-child {
    padding-bottom: 0;
    border-bottom: none;
}

.detail-label {
    font-size: 13px;
    letter-spacing: 0.1em;
    color: var(--color-on-surface-variant);
    font-weight: 600;
    font-style: bold;
}

.detail-value {
    font-family: var(--font-merriweather, serif);
    font-size: 15px;
    color: var(--color-primary);
}

.detail-value.italic {
    font-style: italic;
    font-weight: 400;
}

.table-container {
    width: 100%;
    overflow-x: auto;
    border: 1px solid rgba(211, 195, 192, 0.5);
    border-radius: 4px;
    background-color: var(--color-surface-container-lowest);
}

.vintage-table {
    width: 100%;
    border-collapse: separate;
    text-align: left;
}

.vintage-table th {
    font-family: var(--font-merriweather);
    font-size: 13px;
    font-weight: 700;
    color: var(--color-primary);
    background-color: var(--color-surface-container-low);
    padding: 8px 16px;
    border-bottom: 1px solid rgba(211, 195, 192, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 1;
}

.vintage-table td {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(211, 195, 192, 0.3);
    vertical-align: middle;
}

.vintage-table tr {
    text-align: center;
}

.book-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.book-cover-mini {
    width: 48px;
    height: 64px;
    background-color: #ffffff;
    border: 1px solid rgba(39, 19, 16, 0.2);
    padding: 2px;
    flex-shrink: 0;
}

.book-cover-mini img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
    font-size: 14px;
    color: var(--color-on-surface-variant);
    font-style: italic;
}

.book-qty {
    font-family: var(--font-merriweather, serif);
    font-size: 14px;
    font-weight: 700;
    color: var(--color-secondary);
}

.text-center {
    text-align: center;
}

.detail-footer {
    padding: 8px 24px;
    background-color: var(--color-surface-container-low);
    border-top: 1px solid rgba(211, 195, 192, 0.3);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: auto;
}

.btn-large {
    width: 25%;
    height: 40px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    transition: transform 0.2s;
    text-align: center;
    border: none;
    cursor: pointer;
    border-radius: 4px;
}

.btn-large:hover {
    transform: translateY(-2px);
}

.btn-large:active {
    transform: translateY(0);
}

.btn-primary-action {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
}

.btn-outline-action {
    background-color: var(--color-surface);
    color: var(--color-error);
    border: 1px solid var(--color-error);
}

.status-outofstock {
    background-color: rgba(220, 53, 69, 0.1);
    color: var(--color-error);
    border: 1.5px solid var(--color-error);
    border-radius: 3px;
    display: inline-block;
    padding: 3px 10px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.05em;
}

.status-available {
    border: 1.5px solid rgb(9, 170, 9);
    border-radius: 3px;
    color: rgb(9, 170, 9);
    background-color: rgba(9, 170, 9, 0.1);
    display: inline-block;
    padding: 3px 10px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.05em;
}

/* Style popup xác nhận */
.confirm-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(62, 39, 35, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    border-radius: 8px;
}

.confirm-box {
    background-color: var(--color-surface);
    border: 1px solid var(--color-outline-variant);
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 360px;
    width: 90%;
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.confirm-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
}

.confirm-icon span {
    font-size: 32px;
}

.icon-success {
    background-color: rgba(9, 170, 9, 0.1);
    color: rgb(9, 170, 9);
}

.icon-danger {
    background-color: rgba(220, 53, 69, 0.1);
    color: var(--color-error);
}

.confirm-message {
    font-size: 15px;
    color: var(--color-on-surface-variant);
    margin-bottom: 24px;
    line-height: 1.5;
}

.confirm-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.btn-confirm-cancel, .btn-confirm-submit {
    padding: 10px 24px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-confirm-cancel {
    background-color: var(--color-surface-container-high);
    color: var(--color-on-surface);
}

.btn-confirm-cancel:hover {
    background-color: var(--color-surface-container-highest);
}

.btn-success {
    background-color: rgb(9, 170, 9);
    color: white;
}

.btn-success:hover {
    background-color: rgb(7, 140, 7);
}

.btn-danger {
    background-color: var(--color-error);
    color: white;
}

.btn-danger:hover {
    background-color: #c82333;
}

.btn-confirm-submit:disabled, .btn-confirm-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
