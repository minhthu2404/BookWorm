<template>
    <div class="modal-overlay" :class="{ active: show }" @click="close">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h2>Thông tin cá nhân</h2>
                <button class="close-btn material-symbols-outlined" @click="close">close</button>
            </div>

            <div class="modal-body">
                <div class="avatar-section">
                    <div class="avatar-wrapper">
                        <img :src="`/images/Avatar/${profile.AnhBiaND || 'default.png'}`" class="avatar-img" />
                        <button v-if="isEditing" class="change-avatar-btn" @click="showAvatarModal = true">
                            <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
                        </button>
                    </div>
                </div>

                <div class="profile-details">
                    <template v-if="!isEditing">
                        <div class="info-row">
                            <span class="info-label">Họ và tên:</span>
                            <span class="info-value">{{ profile.HoTen }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ profile.Email }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Ngày sinh:</span>
                            <span class="info-value">{{ formatDate(profile.NgaySinh) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Giới tính:</span>
                            <span class="info-value">{{ profile.GioiTinh }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Điện thoại:</span>
                            <span class="info-value">{{ profile.SoDienThoai }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Địa chỉ:</span>
                            <span class="info-value">{{ profile.DiaChi }}</span>
                        </div>
                    </template>

                    <template v-else>
                        <div class="form-group">
                            <label>Họ và tên</label>
                            <input type="text" v-model="profile.HoTen" class="form-input" />
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" v-model="profile.Email" class="form-input" disabled style="background-color: #f5f5f5;" />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Ngày sinh</label>
                                <input type="date" v-model="profile.NgaySinh" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label>Giới tính</label>
                                <select v-model="profile.GioiTinh" class="form-input">
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Điện thoại</label>
                            <input type="text" v-model="profile.SoDienThoai" class="form-input" />
                        </div>
                        <div class="form-group">
                            <label>Địa chỉ</label>
                            <input type="text" v-model="profile.DiaChi" class="form-input" />
                        </div>
                    </template>
                </div>
            </div>

            <div class="modal-footer">
                <template v-if="!isEditing">
                    <button class="btn-cancel" @click="close">Đóng</button>
                    <button class="btn-save" @click="isEditing = true">Chỉnh sửa</button>
                </template>
                <template v-else>
                    <button class="btn-cancel" @click="cancelEdit">Hủy</button>
                    <button class="btn-save" @click="save" :disabled="isLoading">
                        {{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
                    </button>
                </template>
            </div>
        </div>

        <!-- Popup chọn ảnh đại diện -->
        <div v-if="showAvatarModal" class="avatar-modal-overlay" @click="showAvatarModal = false">
            <div class="avatar-modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Chọn ảnh đại diện</h3>
                    <button class="close-btn" @click="showAvatarModal = false"><span
                            class="material-symbols-outlined">close</span></button>
                </div>
                <div class="avatar-list">
                    <img v-for="avatar in availableAvatars" :key="avatar" :src="`/images/Avatar/${avatar}`"
                        class="avatar-option" :class="{ selected: profile.AnhBiaND === avatar }"
                        @click="selectAvatar(avatar)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import UserService from '@/services/user.service';
import { toast } from 'vue3-toastify';
import { getUser, setUser } from '@/utils/auth';
import { formatDate } from '@/utils/format';

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['update:show', 'save']);

const isEditing = ref(false);
const isLoading = ref(false);
const showAvatarModal = ref(false);
const availableAvatars = ['default.png', 'man.png', 'woman.png'];

const profile = ref({
    HoTen: '',
    Email: '',
    NgaySinh: '',
    GioiTinh: 'Nam',
    SoDienThoai: '',
    DiaChi: '',
    AnhBiaND: 'default.png'
});

const originalProfile = ref({});

const selectAvatar = (avatar) => {
    profile.value.AnhBiaND = avatar;
    showAvatarModal.value = false;
};

 

const fetchProfile = async () => {
    const user = getUser();
    if (user) {
        try {
            const userData = await UserService.get(user._id);
            if (userData) {
                profile.value = {
                    HoTen: userData.HoTen || '',
                    Email: userData.Email || '',
                    NgaySinh: userData.NgaySinh ? userData.NgaySinh.split('T')[0] : '',
                    GioiTinh: userData.GioiTinh || 'Nam',
                    SoDienThoai: userData.SoDienThoai || '',
                    DiaChi: userData.DiaChi || '',
                    AnhBiaND: userData.AnhBiaND || 'default.png'
                };
                originalProfile.value = { ...profile.value };
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin admin:", error);
        }
    }
};

watch(() => props.show, (newVal) => {
    if (newVal) {
        isEditing.value = false;
        fetchProfile();
    }
});

const close = () => {
    emit('update:show', false);
};

const cancelEdit = () => {
    profile.value = { ...originalProfile.value };
    isEditing.value = false;
};

const save = async () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (profile.value.SoDienThoai && !phoneRegex.test(profile.value.SoDienThoai)) {
        toast.error('Số điện thoại phải bao gồm đúng 10 chữ số.');
        return;
    }

    const user = getUser();
    if (user) {
        try {
            isLoading.value = true;
            await UserService.update(user._id, profile.value);
            
            // Cập nhật lại localStorage
            const updatedUser = { ...user, ...profile.value };
            setUser(updatedUser);
            
            originalProfile.value = { ...profile.value };
            toast.success('Cập nhật thông tin thành công!');
            emit('save', profile.value);
            isEditing.value = false;
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            toast.error('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            isLoading.value = false;
        }
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}

.modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
}

.modal-content {
    background-color: var(--color-surface, #fff);
    border-radius: 5px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-header h2 {
    font-family: var(--font-playfair);
    margin: 0;
    font-size: 20px;
    color: var(--color-on-surface, #333);
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;
    color: var(--color-on-surface-variant, #666);
}

.modal-body {
    padding: 16px;
    overflow-y: auto;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
}

.avatar-icon {
    font-size: 80px;
    color: var(--color-primary, #6200ee);
}

.avatar-img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}

.change-avatar-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-primary);
    border-radius: 50%;
    padding: 3px;
    color: var(--color-primary, #6200ee);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.change-avatar-btn:hover {
    border: 1px solid var(--color-secondary);
    color: var(--color-secondary);
}

.profile-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-row {
    display: flex;
    font-size: 15px;
    padding: 10px 0;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.info-label {
    font-weight: 600;
    color: var(--color-primary);
    width: 110px;
    flex-shrink: 0;
}

.info-value {
    font-weight: 400;
    color: var(--color-on-surface-variant, #555);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-primary);
}

.form-input {
    color: var(--color-on-surface-variant, #555);
    padding: 8px 12px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.form-input:focus {
    border-color: var(--color-primary);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 10px 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-cancel {
    padding: 8px 16px;
    background: none;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    color: var(--color-on-surface-variant, #555);
}

.btn-save {
    padding: 8px 16px;
    background-color: var(--color-primary, #6200ee);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.btn-save:hover {
    opacity: 0.9;
}

.form-row {
    display: flex;
    gap: 16px;
}

.form-row .form-group {
    flex: 1;
    margin-bottom: 0;
}

/* Style popup ảnh đại diện */
.avatar-modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(39, 19, 16, 0.4);
    backdrop-filter: blur(2px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.avatar-modal-content {
    background-color: var(--color-surface);
    border-radius: 5px;
    width: 100%;
    max-width: 400px;
    padding: 24px;
    box-shadow: 2px 2px 0px 0px rgba(62, 39, 35, 0.15);
}

.avatar-list {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 16px;
}

.avatar-option {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
}

.avatar-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.avatar-option.selected {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary);
}
</style>
