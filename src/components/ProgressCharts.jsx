import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Scale, Plus, Target, Calendar, Award } from 'lucide-react';
import './ProgressCharts.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ProgressCharts = () => {
    const { user, getWeightHistory, getHistoricalData, addWeightEntry, getTodayData } = useApp();
    const [timeRange, setTimeRange] = useState(7);
    const [activeChart, setActiveChart] = useState('calories');
    const [newWeight, setNewWeight] = useState('');
    const [showWeightInput, setShowWeightInput] = useState(false);

    const weightData = getWeightHistory(timeRange);
    const historicalData = getHistoricalData(timeRange);
    const todayData = getTodayData();

    const handleAddWeight = () => {
        if (!newWeight || parseFloat(newWeight) <= 0) return;
        addWeightEntry(parseFloat(newWeight));
        setNewWeight('');
        setShowWeightInput(false);
    };

    // Weight Trend Chart
    const weightChartData = {
        labels: weightData.map(e => {
            const d = new Date(e.date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
            label: 'Weight (kg)',
            data: weightData.map(e => e.weight),
            borderColor: 'hsl(200, 95%, 50%)',
            backgroundColor: 'hsla(200, 95%, 50%, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'hsl(200, 95%, 50%)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };

    const weightChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (ctx) => `${ctx.parsed.y} kg`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'var(--text-tertiary)', font: { size: 11 } }
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.06)' },
                ticks: {
                    color: 'var(--text-tertiary)',
                    font: { size: 11 },
                    callback: (v) => `${v} kg`
                }
            }
        }
    };

    // Calorie Trend Chart
    const calorieChartData = {
        labels: historicalData.map(d => d.label),
        datasets: [
            {
                label: 'Calories Consumed',
                data: historicalData.map(d => d.totalCalories),
                backgroundColor: 'hsla(200, 95%, 50%, 0.7)',
                borderRadius: 6,
                borderSkipped: false
            },
            {
                label: 'Calories Burned',
                data: historicalData.map(d => d.exerciseCalories),
                backgroundColor: 'hsla(145, 70%, 50%, 0.7)',
                borderRadius: 6,
                borderSkipped: false
            }
        ]
    };

    const calorieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { usePointStyle: true, padding: 20, font: { size: 12 } }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'var(--text-tertiary)', font: { size: 11 }, maxRotation: 45 }
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.06)' },
                ticks: {
                    color: 'var(--text-tertiary)',
                    font: { size: 11 },
                    callback: (v) => `${v} cal`
                },
                beginAtZero: true
            }
        }
    };

    // Macro Distribution Chart
    const macroChartData = {
        labels: ['Protein', 'Carbs', 'Fats'],
        datasets: [{
            data: [todayData.totalProtein * 4, todayData.totalCarbs * 4, todayData.totalFats * 9],
            backgroundColor: [
                'hsla(40, 95%, 55%, 0.85)',
                'hsla(145, 70%, 50%, 0.85)',
                'hsla(270, 70%, 60%, 0.85)'
            ],
            borderColor: [
                'hsl(40, 95%, 55%)',
                'hsl(145, 70%, 50%)',
                'hsl(270, 70%, 60%)'
            ],
            borderWidth: 2,
            hoverOffset: 8
        }]
    };

    const macroChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true, padding: 20, font: { size: 13 } }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
                        return `${ctx.label}: ${Math.round(ctx.parsed)} cal (${pct}%)`;
                    }
                }
            }
        },
        cutout: '65%'
    };

    // Macro Trend Chart (line)
    const macroTrendData = {
        labels: historicalData.map(d => d.label),
        datasets: [
            {
                label: 'Protein (g)',
                data: historicalData.map(d => d.totalProtein),
                borderColor: 'hsl(40, 95%, 55%)',
                backgroundColor: 'hsla(40, 95%, 55%, 0.1)',
                tension: 0.4,
                pointRadius: 3,
                fill: false
            },
            {
                label: 'Carbs (g)',
                data: historicalData.map(d => d.totalCarbs),
                borderColor: 'hsl(145, 70%, 50%)',
                backgroundColor: 'hsla(145, 70%, 50%, 0.1)',
                tension: 0.4,
                pointRadius: 3,
                fill: false
            },
            {
                label: 'Fats (g)',
                data: historicalData.map(d => d.totalFats),
                borderColor: 'hsl(270, 70%, 60%)',
                backgroundColor: 'hsla(270, 70%, 60%, 0.1)',
                tension: 0.4,
                pointRadius: 3,
                fill: false
            }
        ]
    };

    const macroTrendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { usePointStyle: true, padding: 20, font: { size: 12 } }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'var(--text-tertiary)', font: { size: 11 }, maxRotation: 45 }
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.06)' },
                ticks: {
                    color: 'var(--text-tertiary)',
                    font: { size: 11 },
                    callback: (v) => `${v}g`
                },
                beginAtZero: true
            }
        }
    };

    // Stats calculations
    const avgCalories = historicalData.length > 0
        ? Math.round(historicalData.reduce((sum, d) => sum + d.totalCalories, 0) / historicalData.filter(d => d.totalCalories > 0).length || 0)
        : 0;
    const totalMeals = historicalData.reduce((sum, d) => sum + d.mealsLogged, 0);
    const daysLogged = historicalData.filter(d => d.mealsLogged > 0).length;
    const streakDays = (() => {
        let streak = 0;
        for (let i = historicalData.length - 1; i >= 0; i--) {
            if (historicalData[i].mealsLogged > 0) streak++;
            else break;
        }
        return streak;
    })();

    const weightChange = weightData.length >= 2
        ? (weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)
        : null;

    return (
        <div className="progress-charts animate-fadeIn">
            <div className="charts-header">
                <div>
                    <h1>Progress Charts 📊</h1>
                    <p>Track your nutrition and fitness trends over time</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowWeightInput(!showWeightInput)}
                    >
                        <Scale size={20} />
                        Log Weight
                    </button>
                </div>
            </div>

            {/* Weight Input */}
            {showWeightInput && (
                <div className="weight-input-card card">
                    <h3>Log Today's Weight</h3>
                    <div className="weight-input-row">
                        <input
                            type="number"
                            className="form-input"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            placeholder="Enter weight in kg"
                            step="0.1"
                            min="20"
                            max="300"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddWeight()}
                        />
                        <button className="btn btn-primary" onClick={handleAddWeight} disabled={!newWeight}>
                            <Plus size={20} />
                            Save
                        </button>
                    </div>
                </div>
            )}

            {/* Time Range Selector */}
            <div className="time-range-selector">
                {[
                    { value: 7, label: '7 Days' },
                    { value: 14, label: '14 Days' },
                    { value: 30, label: '30 Days' },
                    { value: 90, label: '90 Days' }
                ].map(range => (
                    <button
                        key={range.value}
                        className={`range-btn ${timeRange === range.value ? 'active' : ''}`}
                        onClick={() => setTimeRange(range.value)}
                    >
                        <Calendar size={14} />
                        {range.label}
                    </button>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="stats-row">
                <div className="quick-stat card">
                    <div className="stat-icon-wrap" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                        <TrendingUp size={22} />
                    </div>
                    <div>
                        <span className="stat-label">Avg Calories</span>
                        <span className="stat-val">{avgCalories || '—'}</span>
                    </div>
                </div>
                <div className="quick-stat card">
                    <div className="stat-icon-wrap" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <Target size={22} />
                    </div>
                    <div>
                        <span className="stat-label">Days Logged</span>
                        <span className="stat-val">{daysLogged}/{timeRange}</span>
                    </div>
                </div>
                <div className="quick-stat card">
                    <div className="stat-icon-wrap" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <Award size={22} />
                    </div>
                    <div>
                        <span className="stat-label">Streak</span>
                        <span className="stat-val">{streakDays} day{streakDays !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div className="quick-stat card">
                    <div className="stat-icon-wrap" style={{ background: weightChange > 0 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)' }}>
                        {weightChange > 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                    </div>
                    <div>
                        <span className="stat-label">Weight Change</span>
                        <span className="stat-val">
                            {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange} kg` : '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart Type Selector */}
            <div className="chart-tabs">
                {[
                    { id: 'calories', label: '🔥 Calories' },
                    { id: 'macros', label: '🥗 Macros' },
                    { id: 'macroTrend', label: '📈 Macro Trends' },
                    { id: 'weight', label: '⚖️ Weight' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`chart-tab ${activeChart === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveChart(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Chart Display */}
            <div className="chart-container card">
                {activeChart === 'calories' && (
                    <div className="chart-wrapper">
                        <h3>Calorie Intake vs Burned</h3>
                        <p>Daily calorie balance over the past {timeRange} days</p>
                        <div className="chart-area">
                            <Bar data={calorieChartData} options={calorieChartOptions} />
                        </div>
                    </div>
                )}

                {activeChart === 'macros' && (
                    <div className="chart-wrapper">
                        <h3>Today's Macro Distribution</h3>
                        <p>Caloric breakdown by macronutrient</p>
                        <div className="chart-area chart-area-doughnut">
                            <Doughnut data={macroChartData} options={macroChartOptions} />
                        </div>
                        <div className="macro-summary">
                            <div className="macro-stat">
                                <span className="macro-dot" style={{ background: 'hsl(40, 95%, 55%)' }}></span>
                                <span>Protein: {todayData.totalProtein}g ({todayData.totalProtein * 4} cal)</span>
                            </div>
                            <div className="macro-stat">
                                <span className="macro-dot" style={{ background: 'hsl(145, 70%, 50%)' }}></span>
                                <span>Carbs: {todayData.totalCarbs}g ({todayData.totalCarbs * 4} cal)</span>
                            </div>
                            <div className="macro-stat">
                                <span className="macro-dot" style={{ background: 'hsl(270, 70%, 60%)' }}></span>
                                <span>Fats: {todayData.totalFats}g ({todayData.totalFats * 9} cal)</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeChart === 'macroTrend' && (
                    <div className="chart-wrapper">
                        <h3>Macro Intake Trends</h3>
                        <p>Protein, carbs, and fats over the past {timeRange} days</p>
                        <div className="chart-area">
                            <Line data={macroTrendData} options={macroTrendOptions} />
                        </div>
                    </div>
                )}

                {activeChart === 'weight' && (
                    <div className="chart-wrapper">
                        <h3>Weight Trend</h3>
                        <p>
                            {weightData.length > 0
                                ? `Tracking ${weightData.length} entries over the past ${timeRange} days`
                                : 'No weight entries yet. Click "Log Weight" to start tracking!'
                            }
                        </p>
                        {weightData.length > 0 ? (
                            <div className="chart-area">
                                <Line data={weightChartData} options={weightChartOptions} />
                            </div>
                        ) : (
                            <div className="empty-chart">
                                <Scale size={64} />
                                <h4>Start Tracking Your Weight</h4>
                                <p>Log your weight regularly to see trends over time</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowWeightInput(true)}
                                >
                                    <Plus size={20} />
                                    Log Weight Now
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Goal Progress */}
            <div className="goal-progress card">
                <h3>Goal Progress</h3>
                <div className="goal-items">
                    <div className="goal-item">
                        <div className="goal-info">
                            <span className="goal-label">Daily Calorie Goal</span>
                            <span className="goal-value">{todayData.netCalories} / {user.dailyCalories} cal</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${Math.min((todayData.netCalories / user.dailyCalories) * 100, 100)}%`,
                                    background: todayData.netCalories > user.dailyCalories
                                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                        : 'linear-gradient(90deg, hsl(200, 95%, 50%), hsl(200, 95%, 40%))'
                                }}
                            />
                        </div>
                    </div>
                    <div className="goal-item">
                        <div className="goal-info">
                            <span className="goal-label">Protein Goal</span>
                            <span className="goal-value">{todayData.totalProtein}g / {user.macros.protein}g</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${Math.min((todayData.totalProtein / user.macros.protein) * 100, 100)}%`,
                                    background: 'linear-gradient(90deg, #f59e0b, #d97706)'
                                }}
                            />
                        </div>
                    </div>
                    <div className="goal-item">
                        <div className="goal-info">
                            <span className="goal-label">Carbs Goal</span>
                            <span className="goal-value">{todayData.totalCarbs}g / {user.macros.carbs}g</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${Math.min((todayData.totalCarbs / user.macros.carbs) * 100, 100)}%`,
                                    background: 'linear-gradient(90deg, #10b981, #059669)'
                                }}
                            />
                        </div>
                    </div>
                    <div className="goal-item">
                        <div className="goal-info">
                            <span className="goal-label">Fats Goal</span>
                            <span className="goal-value">{todayData.totalFats}g / {user.macros.fats}g</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${Math.min((todayData.totalFats / user.macros.fats) * 100, 100)}%`,
                                    background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressCharts;
