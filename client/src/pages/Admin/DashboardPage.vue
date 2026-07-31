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

            <!-- Lưới thống kê -->
            <div class="stats-grid">
                <!-- Thẻ thống kê 1 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Tổng số sách</span>
                        <span class="material-symbols-outlined stat-icon">auto_stories</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value" style="color: var(--color-primary);">{{ totalBooks }}</p>
                    </div>
                </div>
                <!-- Thẻ thống kê 2 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Tổng số độc giả</span>
                        <span class="material-symbols-outlined stat-icon">person_search</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value" style="color: var(--color-primary);">{{ totalUsers }}</p>
                    </div>
                </div>
                <!-- Thẻ thống kê 3 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Tổng số đơn mượn</span>
                        <span class="material-symbols-outlined stat-icon">book_2</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value">{{ totalLedgers }}</p>
                    </div>
                </div>
                <!-- Thẻ thống kê 4 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Yêu cầu chờ duyệt</span>
                        <span class="material-symbols-outlined stat-icon">priority_high</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value" style="color: var(--color-secondary);">{{ totalPending }}</p>
                    </div>
                </div>
                <!-- Thẻ thống kê 5 -->
                <div class="paper-card stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Quá hạn trả</span>
                        <span class="material-symbols-outlined stat-icon">running_with_errors</span>
                    </div>
                    <div class="stat-body">
                        <p class="stat-value">{{ totalOverdue }}</p>
                    </div>
                </div>
                <!-- Thẻ thống kê 6 -->
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
                <div class="paper-card chart-section chart-section-large">
                    <div class="chart-header">
                        <h4 class="chart-title">Tổng Lượt Mượn Sách Theo Tháng</h4>
                    </div>
                    <div class="chart-container">
                        <Line :data="lineChartData" :options="lineChartOptions"
                            v-if="lineChartData.datasets.length > 0" />
                        <div v-else
                            style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-on-surface-variant);">
                            Đang tải dữ liệu biểu đồ...
                        </div>
                    </div>
                    <p class="chart-note">Lưu ý: Thống kê dựa trên số lượt mượn trong các Đơn Mượn.</p>
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
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const isRefreshing = ref(false);
const lastUpdatedText = ref("Cập nhật lần cuối: Vừa xong");
const totalBooks = ref(0);
const totalUsers = ref(0);
const totalPending = ref(0); // Yêu cầu chờ duyệt
const totalLedgers = ref(0); // Tổng lượt mượn sách
const totalOverdue = ref(0); // Số đơn quá hạn
const onTimeRate = ref("0%"); //Tỷ lệ trả đúng hạn

const lineChartData = ref({
    labels: ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'],
    datasets: []
});

const lineChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1
            },
            grid: {
                color: 'rgba(62,39,35,0.05)'
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
});

const fetchStats = async () => {
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

        // Tổng đơn và quá hạn
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

        const trendData = await ledgerService.getStatsTrend();
        if (trendData && trendData.length > 0) {
            const totalBorrowsPerMonth = Array(12).fill(0);

            trendData.forEach(item => {
                const monthIndex = item._id.month - 1;

                if (monthIndex >= 0 && monthIndex < 12) {
                    totalBorrowsPerMonth[monthIndex] += item.totalBorrows;
                }
            });

            // Dữ liệu biểu đồ
            lineChartData.value = {
                labels: ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'],
                datasets: [{
                    label: 'Tổng lượt mượn',
                    data: totalBorrowsPerMonth,
                    borderColor: '#835425',
                    backgroundColor: '#835425',
                    tension: 0,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            };
        }
    }catch (error){
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
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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
    100% {
        transform: rotate(360deg);
    }
}

.secondary-btn.disabled {
    opacity: 0.7;
    cursor: wait;
    pointer-events: none;
}

/* Nền thẻ */
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

/* Lưới thống kê */
.stats-grid {
    display: grid;
    gap: var(--gutter);
    margin-bottom: var(--gutter);
}

@media (min-width: 640px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

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

/* Lưới chính */
.main-grid {
    display: grid;
    gap: var(--gutter);
}

@media (min-width: 1024px) {
    .main-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Biểu đồ */
.chart-section {
    padding: 32px;
    display: flex;
    flex-direction: column;
}

@media (min-width: 1024px) {
    .chart-section-large {
        grid-column: span 3;
    }

    .chart-section-small {
        grid-column: span 1;
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

.chart-container {
    flex: 1;
    position: relative;
    height: 420px;
    width: 100%;
}

.chart-note {
    font-size: 12px;
    text-align: center;
    color: var(--color-on-surface-variant);
    margin-top: 40px;
    font-style: italic;
}
</style>
