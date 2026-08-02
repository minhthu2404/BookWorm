<template>
    <div class="modal-overlay" :class="{ active: isOpen }">
        <div class="modal-backdrop" @click="closeModal"></div>
        <div class="modal-content modal-lg">
            <button class="modal-close material-symbols-outlined" @click="closeModal">close</button>
            <div class="book-detail-layout custom-scrollbar" v-if="book">
                <!-- Hình ảnh -->
                <div class="book-visual">
                    <div class="book-cover-frame">
                        <img class="book-cover-img" :src="getImageUrl(book.BiaSach)" :alt="book.TenSach">
                    </div>
                    <div style="text-align: center;">
                        <div class="book-status-chip"
                            :class="book.SoQuyen > 0 ? 'status-available' : 'status-outofstock'">
                            {{ book.SoQuyen > 0 ? 'Sẵn có' : 'Hết hàng' }}
                        </div>
                    </div>
                </div>
                <!-- Nội dung -->
                <div class="book-info custom-scrollbar">
                    <span class="book-genre">{{ book.TheLoai }}</span>
                    <h2 class="book-detail-title">{{ book.TenSach }}</h2>
                    <p class="book-detail-author">{{ book.TenTG }}</p>

                    <div class="book-meta-grid">
                        <div>
                            <p class="meta-item-label">Mã Sách</p>
                            <p class="meta-item-value">{{ book._id }}</p>
                        </div>
                        <div>
                            <p class="meta-item-label">Đơn giá</p>
                            <p class="meta-item-value">{{ book.DonGia }}</p>
                        </div>
                        <div>
                            <p class="meta-item-label">Nhà xuất bản</p>
                            <p class="meta-item-value">{{ book.NXB }}</p>
                        </div>
                        <div>
                            <p class="meta-item-label">Năm xuất bản</p>
                            <p class="meta-item-value">{{ book.NamSanXuat || book.NamXB }}</p>
                        </div>
                    </div>

                    <div>
                        <p class="book-desc-label">Mô tả</p>
                        <p class="book-desc-text">
                            {{ book.MoTa }}
                        </p>
                    </div>
                </div>
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
    book: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close'])

const getImageUrl = (imageStr) => {
    if (!imageStr) return '';
    if (imageStr.startsWith('data:image') || imageStr.startsWith('http')) return imageStr;
    return `/images/Sach/${imageStr}`;
};

const closeModal = () => {
    emit('close')
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
    padding: 16px;
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
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 10;
}

.modal-lg {
    max-width: 896px;
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

/* Style popup chi tiết sách */
.book-detail-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
}

@media (min-width: 768px) {
    .book-detail-layout {
        flex-direction: row;
        overflow-y: hidden;
    }
}

.book-visual {
    background-color: var(--color-surface-container-high);
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid rgba(211, 195, 192, 0.5);
    width: 100%;
}

@media (min-width: 768px) {
    .book-visual {
        width: 33.333%;
        border-bottom: none;
        border-right: 1px solid rgba(211, 195, 192, 0.5);
    }
}

.book-cover-frame {
    width: 100%;
    aspect-ratio: 3/4;
    border: 2px solid #ffffff;
    margin-bottom: 24px;
    overflow: hidden;
}

.book-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 2px;
}

.book-status-chip {
    display: inline-block;
    padding: 4px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
}

.status-available {
    background-color: rgba(9, 170, 9, 0.1);
    color: rgb(9, 170, 9);
    border: 1.5px solid rgb(9, 170, 9);
}

.status-outofstock {
    background-color: rgba(220, 53, 69, 0.1);
    color: var(--color-error);
    border: 1.5px solid var(--color-error);
}

.book-info {
    padding: 40px;
    display: flex;
    flex-direction: column;
    position: relative;
    flex: 1;
    overflow-y: auto;
}


.book-genre {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 4px;
}

.book-detail-title {
    font-family: var(--font-playfair);
    font-size: 32px;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 4px;
}

.book-detail-author {
    font-family: var(--font-playfair);
    font-size: 20px;
    font-style: italic;
    color: var(--color-on-surface-variant);
    margin-bottom: 24px;
}

.book-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 24px 0;
    border-top: 1px solid rgba(211, 195, 192, 0.3);
    border-bottom: 1px solid rgba(211, 195, 192, 0.3);
    margin-bottom: 32px;
}

.meta-item-label {
    font-size: 12px;
    font-weight: 700;
    color: rgba(80, 68, 66, 0.7);
    text-transform: uppercase;
    margin-bottom: 4px;
}

.meta-item-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-primary);
}

.book-desc-label {
    font-size: 12px;
    font-weight: 700;
    color: rgba(80, 68, 66, 0.7);
    text-transform: uppercase;
    margin-bottom: 8px;
}

.book-desc-text {
    font-size: 13px;
    line-height: 1.6;
    font-style: italic;
    color: rgba(39, 19, 16, 0.9);
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
</style>
