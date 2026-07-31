<template>
    <div style="display: flex; min-height: 100vh; width: 100%;">
        <AdminSidebar />

        <div class="main-wrapper">
            <main class="page-content">
                <RouterView />
            </main>
        </div>
    </div>
</template>

<script setup>
import AdminSidebar from '../components/Admin/AdminSidebar.vue'
</script>

<style scoped>
/* Style bao bọc nội dung chính */
.main-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.page-content {
    padding: 16px;
    max-width: var(--max-width);
    margin: 0 auto;
    width: 100%;
    padding-bottom: 80px;
    /* Khoảng trống cho menu di động */
}

@media (min-width: 768px) {
    .page-content {
        padding: 24px;
    }
}
</style>
