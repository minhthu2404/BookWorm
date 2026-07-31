<template>
    <div class="modal-overlay" :class="{ active: isOpen }">
        <div class="modal-backdrop" @click="closeModal"></div>
        <div class="modal-content modal-md" style="padding: 24px;">
            <button class="modal-close material-symbols-outlined" @click="closeModal">close</button>
            <div class="add-book-header">
                <h2 class="add-book-title">Cập Nhật Sách</h2>
            </div>
            <form @submit.prevent="submitForm" style="overflow-y: auto;">
                <div class="add-book-layout">
                    <!-- Ảnh bìa (Trái) -->
                    <div class="cover-upload-section">
                        <label class="form-label">Ảnh bìa</label>
                        <div class="upload-area" @click="triggerFileInput" v-if="!bookForm.BiaSach">
                            <span class="material-symbols-outlined upload-icon"
                                style="font-size: 32px;">add_photo_alternate</span>
                            <span class="upload-text">Tải lên ảnh bìa</span>
                        </div>
                        <div class="preview-area" v-else @click="triggerFileInput">
                            <img :src="getImageUrl(bookForm.BiaSach)" class="cover-preview" />
                            <div class="preview-overlay">
                                <span class="material-symbols-outlined">edit</span>
                            </div>
                        </div>
                        <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none;" />
                    </div>
                    <!-- Form Inputs (Phải) -->
                    <div class="form-grid">
                        <div class="form-group col-span-2">
                            <label class="form-label">Tên sách</label>
                            <input class="form-control" placeholder="Nhập tên sách..." type="text" v-model="bookForm.TenSach" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tác giả</label>
                            <input class="form-control" placeholder="Nhập tên tác giả..." type="text" v-model="bookForm.TenTG" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Thể loại</label>
                            <select class="form-control" v-model="bookForm.TheLoai">
                                <option>Văn học/Tiểu thuyết</option>
                                <option>Kỹ năng sống/Phát triển bản thân</option>
                                <option>Tâm lý học</option>
                                <option>Kinh dị/Giật gân</option>
                                <option>Khoa học viễn tưởng</option>
                                <option>Lịch sử</option>
                                <option>Kinh doanh/Tài chính</option>
                                <option>Thiếu nhi</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Đơn giá (VNĐ)</label>
                            <input class="form-control" type="number" v-model="bookForm.DonGia">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Số lượng</label>
                            <input class="form-control" type="number" v-model="bookForm.SoQuyen">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Năm sản xuất</label>
                            <input class="form-control" type="number" v-model="bookForm.NamSanXuat">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nhà xuất bản</label>
                            <input class="form-control" placeholder="Nhập tên NXB..." type="text" v-model="bookForm.NXB">
                        </div>
                    </div>
                </div>
                <!-- Mô tả (Full width) -->
                <div class="form-group" style="margin-top: 24px;">
                    <label class="form-label">Mô tả</label>
                    <textarea class="form-control" placeholder="Tóm tắt nội dung..." v-model="bookForm.MoTa"></textarea>
                </div>
                <div class="form-actions">
                    <button class="btn-save sticker-shadow" type="submit" :disabled="isLoading">
                        {{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import bookService from '@/services/book.service';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css'
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    book: {
        type: Object,
        default: null
    }
})
const emit = defineEmits(['close', 'refresh'])
const fileInput = ref(null)
const isLoading = ref(false)
const bookForm = ref({
    TenSach: '',
    TenTG: '',
    TheLoai: 'Văn học/Tiểu thuyết',
    DonGia: 0,
    SoQuyen: 1,
    NamSanXuat: new Date().getFullYear(),
    NXB: '',
    MoTa: '',
    BiaSach: ''
})
watch(() => props.isOpen, (newVal) => {
    if (newVal && props.book) {
        bookForm.value = {
            TenSach: props.book.TenSach || '',
            TenTG: props.book.TenTG || '',
            TheLoai: props.book.TheLoai || 'Văn học/Tiểu thuyết',
            DonGia: props.book.DonGia || 0,
            SoQuyen: props.book.SoQuyen || 0,
            NamSanXuat: props.book.NamSanXuat || new Date().getFullYear(),
            NXB: props.book.NXB || '',
            MoTa: props.book.MoTa || '',
            BiaSach: props.book.BiaSach || ''
        }
    }
});
const getImageUrl = (imageStr) => {
    if (!imageStr) return '';
    if (imageStr.startsWith('data:image') || imageStr.startsWith('http')) return imageStr;
    return `/images/Sach/${imageStr}`;
};
const triggerFileInput = () => {
    fileInput.value.click()
}
const handleFileChange = (event) => {
    const file = event.target.files[0]
    if(file){
        const reader = new FileReader()
        reader.onload = (e) => {
            bookForm.value.BiaSach = e.target.result
        }
        reader.readAsDataURL(file)
    }
}
const closeModal = () => {
    emit('close')
}
const submitForm = async() => {
    if(!bookForm.value.TenSach || !bookForm.value.TenTG) {
        toast.error("Vui lòng điền đầy đủ Tên sách và Tác giả!");
        return;
    }
    try{
        isLoading.value = true;
        await bookService.update(props.book._id, bookForm.value);
        toast.success("Cập nhật thông tin sách thành công!");
        emit('refresh');
        closeModal();
    }catch(error){
        toast.error("Đã xảy ra lỗi khi cập nhật sách!");
        console.error(error);
    }finally{
        isLoading.value = false;
    }
}
</script>
<style scoped>
/* Popup */
.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(39, 19, 16, 0.4);
    backdrop-filter: blur(2px);
    z-index: 50;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
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
    background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
    border: 1px solid rgba(39, 19, 16, 0.3);
    border-radius: 5px;
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.15);
    width: 100%;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 10;
}
.modal-md {
    max-width: 850px;
}
.modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 20;
    color: var(--color-on-surface-variant);
    transition: color 0.2s;
    padding: 8px;
}
.modal-close:hover {
    color: var(--color-primary);
}
/* Style popup thêm sách */
.add-book-header {
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(39, 19, 16, 0.2);
    padding-bottom: 8px;
}
.add-book-title {
    font-family: var(--font-playfair);
    font-size: 30px;
    font-weight: 700;
    color: var(--color-primary);
}
.add-book-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
}
@media (min-width: 768px) {
    .add-book-layout {
        flex-direction: row;
        align-items: stretch;
    }
}
.cover-upload-section {
    flex: 0 0 220px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.form-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
}
@media (min-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr 1fr;
    }
}
.col-span-2 {
    grid-column: 1 / -1;
}
.form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.form-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-secondary);
    text-transform: uppercase;
}
.form-control {
    font-family: var(--font-merriweather);
    background-color: var(--color-surface-container-lowest);
    border: 1px solid rgba(211, 195, 192, 0.5);
    border-radius: 3px;
    padding: 8px 16px;
    font-size: 15px;
    transition: border-color 0.2s;
    width: 100%;
}
.form-control:focus {
    border-color: var(--color-secondary);
}
textarea.form-control {
    min-height: 100px;
    resize: vertical;
}
.upload-area {
    flex: 1;
    border: 2px dashed rgba(211, 195, 192, 0.5);
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 4px;
    min-height: 200px;
}
.upload-area:hover {
    background-color: var(--color-surface-container-high);
}
.upload-icon {
    color: var(--color-outline);
}
.upload-text {
    color: rgba(80, 68, 66, 0.5);
}
.form-actions {
    margin-top: 24px;
    padding-top: 16px;
    display: flex;
    justify-content: flex-end;
}
.preview-area {
    flex: 1;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid rgba(211, 195, 192, 0.5);
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-surface-container-low);
}
.cover-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.preview-overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
}
.preview-overlay .material-symbols-outlined {
    color: white;
    font-size: 32px;
}
.preview-area:hover .preview-overlay {
    opacity: 1;
}
.btn-save {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    border-radius: 5px;
    padding: 8px 28px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: transform 0.2s;
}
.btn-save:hover {
    transform: translateY(-2px);
}
.sticker-shadow {
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.15);
}
</style>
