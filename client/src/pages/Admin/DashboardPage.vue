<template>
    <div class="dashboard-container">
        <section style="margin-bottom: 48px;">
            <div class="overview-header">
                <div>
                    <h3 class="overview-title">Báo Cáo Tổng Quan</h3>
                    <p class="overview-subtitle">{{ lastUpdatedText }}</p>
                </div>
                <div class="secondary-btn" @click="refreshData" :class="{ 'disabled': isRefreshing }">
                    <span class="material-symbols-outlined" :class="{ 'spinning': isRefreshing }">refresh</span>
                    <span>{{ isRefreshing ? 'Đang tải...' : 'Làm mới' }}</span>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <!-- Stat Card 1 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Tổng số sách</span>
                        <span class="material-symbols-outlined stat-icon">auto_stories</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value" style="color: var(--color-primary);">{{ totalBooks }}</p>
                    </div>
                </div>
                <!-- Stat Card 2 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Tổng số độc giả</span>
                        <span class="material-symbols-outlined stat-icon">person_search</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value" style="color: var(--color-primary);">{{ totalUsers }}</p>
                    </div>
                </div>
                <!-- Stat Card 3 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Tổng số đơn mượn</span>
                        <span class="material-symbols-outlined stat-icon">book_2</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value">{{ totalLedgers }}</p>
                    </div>
                </div>
                <!-- Stat Card 4 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Yêu cầu chờ duyệt</span>
                        <span class="material-symbols-outlined stat-icon">priority_high</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value" style="color: var(--color-secondary);">{{ totalPending }}</p>
                    </div>
                </div>
                <!-- Stat Card 5 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Quá hạn trả</span>
                        <span class="material-symbols-outlined stat-icon">running_with_errors</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value">{{ totalOverdue }}</p>
                    </div>
                </div>
                <!-- Stat Card 6 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Tỷ lệ trả đúng hạn</span>
                        <span class="material-symbols-outlined stat-icon">verified</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value" style="color: var(--color-tertiary);">{{ onTimeRate }}</p>
                    </div>
                </div>
            </div>

            <div class="main-grid">
                <!-- Chart Section -->
                <div class="paper-card chart-section">
                    <div class="chart-header">
                        <h4 class="chart-title">Xu Hướng Mượn Sách</h4>
                        <div class="chart-legend">
                            <span class="legend-item">
                                <div class="legend-color" style="background-color: var(--color-secondary);"></div> Sách Văn Học
                            </span>
                            <span class="legend-item">
                                <div class="legend-color" style="background-color: var(--color-tertiary);"></div> Sách Khoa Học
                            </span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <svg class="w-full h-full" style="overflow: visible; width: 100%; height: 100%;" preserveAspectRatio="none"
                            viewBox="0 0 1000 256">
                            <!-- Grid Lines -->
                            <line stroke="rgba(62,39,35,0.05)" stroke-width="1" x1="0" x2="1000" y1="0" y2="0">
                            </line>
                            <line stroke="rgba(62,39,35,0.05)" stroke-width="1" x1="0" x2="1000" y1="64" y2="64">
                            </line>
                            <line stroke="rgba(62,39,35,0.05)" stroke-width="1" x1="0" x2="1000" y1="128" y2="128">
                            </line>
                            <line stroke="rgba(62,39,35,0.05)" stroke-width="1" x1="0" x2="1000" y1="192" y2="192">
                            </line>
                            <!-- Line Chart 1 (Literature) -->
                            <path
                                d="M0,200 L100,180 L200,190 L300,140 L400,150 L500,80 L600,110 L700,60 L800,90 L900,40 L1000,50"
                                fill="none" stroke="#835425" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="3"></path>
                            <!-- Line Chart 2 (Science) -->
                            <path
                                d="M0,230 L100,210 L200,180 L300,190 L400,170 L500,160 L600,140 L700,150 L800,120 L900,130 L1000,100"
                                fill="none" stroke="#223021" stroke-dasharray="5,3" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="2"></path>
                            <!-- Points -->
                            <circle cx="500" cy="80" fill="#835425" r="5"></circle>
                            <circle cx="900" cy="40" fill="#835425" r="5"></circle>
                        </svg>
                        <div class="chart-x-axis">
                            <span>Th.1</span><span>Th.2</span><span>Th.3</span><span>Th.4</span><span>Th.5</span><span>Th.6</span><span>Th.7</span><span>Th.8</span><span>Th.9</span><span>Th.10</span><span>Th.11</span><span>Th.12</span>
                        </div>
                    </div>
                    <p class="chart-note">Lưu ý: Số liệu thống kê được tính dựa trên số lượt đăng ký tại quầy và cổng trực tuyến.</p>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import bookService from '@/services/book.service';
import userService from '@/services/user.service';
import requestService from '@/services/request.service';
import ledgerService from '@/services/ledger.service';

const isRefreshing = ref(false);
const lastUpdatedText = ref("Cập nhật lần cuối: Vừa xong");
const totalBooks = ref(0);
const totalUsers = ref(0);
const totalPending = ref(0); // Yêu cầu chờ duyệt
const totalLedgers = ref(0); // Tổng lượt mượn sách
const totalOverdue = ref(0); // Số đơn quá hạn
const onTimeRate = ref("0%"); //Tỷ lệ trả đúng hạn

const fetchStats = async() => {
    try {
        //Tính tổng số sách
        const responseBook = await bookService.countAll();
        if (responseBook && responseBook.total !== undefined){
            totalBooks.value = responseBook.total;
        }

        //Tính tổng số độc giả
        const responseReader = await userService.countAll();
        if(responseReader && responseReader.total !== undefined){
            totalUsers.value = responseReader.total;
        }

        //Tính số yêu cầu chờ duyệt
        const requests = await requestService.getAll();
        if(requests){
            const pendingRequests =  requests.filter(req => req.TrangThai === 'ChoDuyet');
            totalPending.value = pendingRequests.length;
        }

        //Tính tổng số đơn mượn và quá hạn trả
        const ledgers = await ledgerService.getAll();
        if(ledgers){
            //Tổng số đơn mượn
            totalLedgers.value = ledgers.length;
            //Quá hạn trả
            const overdueLedgers = ledgers.filter(req => req.TrangThai === 'QuaHan');
            totalOverdue.value = overdueLedgers.length;
            //Tỷ lệ trả đúng hạn
            const completedBorrows = ledgers.filter(req => req.TrangThai === "DaTra" || req.TrangThai === "QuaHan" );
            const onTimeBorrows = completedBorrows.filter(req => req.TrangThai === 'DaTra');
            if (completedBorrows.length > 0){
                const rate = (onTimeBorrows.length / completedBorrows.length) * 100;
                onTimeRate.value = rate.toFixed(1) + "%";
            }else{
                onTimeRate.value = "100%";
            }
        }
    }catch(error){
        console.error("Lỗi khi tải dữ liệu thống kê!", error);
    }
}

onMounted(() => {
    fetchStats();
});

const refreshData = async() => {
    if (isRefreshing.value) return;
    
    isRefreshing.value = true;
    
    try {
        await Promise.all([
            fetchStats(),
            new Promise(resolve => setTimeout(resolve, 800))
        ])
        
        // Cập nhật lại thời gian hiển thị
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        lastUpdatedText.value = `Cập nhật lần cuối: ${timeString} hôm nay`;
        
        toast.success("Đã làm mới dữ liệu hệ thống!");
    } catch (error) {
        toast.error("Có lỗi xảy ra khi làm mới dữ liệu!");
    } finally {
        isRefreshing.value = false;
    }
}
</script>

<style scoped>
.dashboard-container { 
    padding: var(--margin-desktop); 
    max-width: var(--max-width); 
    margin: 0 auto; 
    width: 100%; 
}

.overview-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-end; 
    margin-bottom: 32px; 
    border-bottom: 1px solid color-mix(in srgb, var(--color-outline-variant) 50%, transparent); 
    padding-bottom: 8px; 
}

.overview-title { 
    font-size: 32px; 
    font-weight: 700; 
    color: var(--color-primary); 
    font-family: var(--font-playfair); 
    margin: 0; 
}

.overview-subtitle { 
    font-size: 12px; 
    color: var(--color-on-surface-variant); 
    margin-top: 4px; 
}

.secondary-btn { 
    background-color: var(--color-surface-container); 
    padding: 8px 12px; 
    font-size: 12px; 
    font-weight: 700; 
    letter-spacing: 0.05em; 
    transition: all 0.15s; 
    border: 1px solid rgba(62, 39, 35, 0.15); 
    border-radius: 5px;
    text-transform: uppercase; 
    cursor: pointer;
    display: flex;
    gap: 5px;
}

.secondary-btn:hover { 
    background-color: var(--color-surface-container-high); 
}

.secondary-btn:active { 
    transform: scale(0.95); 
}

.material-symbols-outlined {
    font-size: 1.1rem;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    100% { transform: rotate(360deg); }
}

.secondary-btn.disabled {
    opacity: 0.7;
    cursor: wait;
    pointer-events: none;
}

/* Cards Base */
.paper-card { 
    background-color: #ffffff; 
    padding: 8px 24px; 
    border: 1px solid rgba(62, 39, 35, 0.15); 
    border-radius: 3px;
    box-shadow: 4px 4px 0px 0px rgba(62, 39, 35, 0.15); 
    position: relative; 
    overflow: hidden; 
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    gap: 12px;
}

/* Stats Grid */
.stats-grid { 
    display: grid; 
    gap: var(--gutter); 
    margin-bottom: var(--gutter); 
}

@media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }

.stat-card { 
    height: 160px; 
}

.stat-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-start; 
}
.stat-title { 
    font-size: 16px; 
    font-weight: 700; 
    color: var(--color-on-surface-variant); 
    text-transform: uppercase; 
}
.stat-icon { 
    color: var(--color-primary); 
    opacity: 0.3; 
}
.stat-body { 
    margin-top: 16px; 
}
.stat-value { 
    font-family: var(--font-merriweather); 
    font-size: 36px; 
    font-weight: 700; 
    line-height: 1; 
    letter-spacing: -0.02em; 
    margin: 0;
}

/* Main Grid */
.main-grid { display: grid; gap: var(--gutter); }
@media (min-width: 1024px) { .main-grid { grid-template-columns: repeat(3, 1fr); } }

/* Chart Section */
.chart-section { 
    padding: 32px; 
    display: flex; 
    flex-direction: column; 
}
@media (min-width: 1024px) { 
    .chart-section { 
        grid-column: span 2; 
    } 
}
.chart-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 48px; 
}
.chart-title { 
    font-family: var(--font-playfair); 
    font-size: 24px; 
    font-weight: 600; 
    color: var(--color-primary); 
    margin: 0;
}
.chart-legend { 
    display: flex; 
    gap: 16px; 
}
.legend-item { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    font-size: 12px; 
    font-weight: 700; 
}
.legend-color { 
    width: 12px; 
    height: 12px; 
}
.chart-container { 
    flex: 1; 
    position: relative; 
    height: 256px; 
    border-left: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent); 
    border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent); 
}
.chart-x-axis { 
    display: flex; 
    justify-content: space-between; 
    margin-top: 16px; 
    font-size: 10px; 
    font-weight: 700; 
    color: var(--color-on-surface-variant); 
    opacity: 0.6; 
    text-transform: uppercase; 
}
.chart-note { 
    font-size: 12px; 
    text-align: center; 
    color: var(--color-on-surface-variant); 
    margin-top: 40px; 
    font-style: italic; 
}
</style>
