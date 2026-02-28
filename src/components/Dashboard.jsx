import { useApp } from '../context/AppContext';
import { Flame, Droplet, Activity, TrendingUp, Plus } from 'lucide-react';
import { calculatePercentage } from '../utils/calculations';
import './Dashboard.css';

const Dashboard = ({ setCurrentView }) => {
    const { user, getTodayData } = useApp();
    const todayData = getTodayData();
    const caloriesRemaining = user.dailyCalories - todayData.netCalories;
    const caloriesProgress = Math.min((todayData.totalCalories / user.dailyCalories) * 100, 100);
    const proteinProgress = Math.min((todayData.totalProtein / user.macros.protein) * 100, 100);
    const carbsProgress = Math.min((todayData.totalCarbs / user.macros.carbs) * 100, 100);
    const fatsProgress = Math.min((todayData.totalFats / user.macros.fats) * 100, 100);
    const waterGoal = 2000; // ml
    const waterPercentage = calculatePercentage(todayData.waterIntake, waterGoal);

    const remaining = user.dailyCalories - todayData.netCalories;

    return (
        <div className="dashboard animate-fadeIn">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome back, {user.name}! 👋</h1>
                    <p>Here's your nutrition summary for today</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setCurrentView('logger')}
                >
                    <Plus size={20} />
                    Log Food
                </button>
            </div>

            {/* Main Calorie Card */}
            <div className="calorie-card card">
                <div className="calorie-ring-container">
                    <svg className="calorie-ring" viewBox="0 0 200 200">
                        <circle
                            cx="100"
                            cy="100"
                            r="85"
                            fill="none"
                            stroke="var(--bg-tertiary)"
                            strokeWidth="20"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="85"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="20"
                            strokeLinecap="round"
                            strokeDasharray={`${caloriesProgress * 5.34} 534`}
                            transform="rotate(-90 100 100)"
                            className="calorie-progress"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--primary-400)" />
                                <stop offset="100%" stopColor="var(--primary-600)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="calorie-center">
                        <Flame className="calorie-icon" size={32} />
                        <div className="calorie-numbers">
                            <span className="calorie-current">{todayData.netCalories}</span>
                            <span className="calorie-divider">/</span>
                            <span className="calorie-goal">{user.dailyCalories}</span>
                        </div>
                        <span className="calorie-label">calories</span>
                        <span className={`calorie-remaining ${remaining < 0 ? 'over' : ''}`}>
                            {remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
                        </span>
                    </div>
                </div>

                {/* Macro Breakdown */}
                <div className="macro-breakdown">
                    <div className="macro-item">
                        <div className="macro-header">
                            <span className="macro-name">Protein</span>
                            <span className="macro-value">{todayData.totalProtein}g / {user.macros.protein}g</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${proteinProgress}%`,
                                    background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                                }}
                            />
                        </div>
                    </div>

                    <div className="macro-item">
                        <div className="macro-header">
                            <span className="macro-name">Carbs</span>
                            <span className="macro-value">{todayData.totalCarbs}g / {user.macros.carbs}g</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${carbsProgress}%`,
                                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                }}
                            />
                        </div>
                    </div>

                    <div className="macro-item">
                        <div className="macro-header">
                            <span className="macro-name">Fats</span>
                            <span className="macro-value">{todayData.totalFats}g / {user.macros.fats}g</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${fatsProgress}%`,
                                    background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                        <Droplet size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Water Intake</span>
                        <span className="stat-value">{todayData.waterIntake} ml</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${waterPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Exercise</span>
                        <span className="stat-value">{todayData.exerciseCalories} cal burned</span>
                        <span className="stat-subtext">{todayData.exerciseLogs.length} activities</span>
                    </div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Meals Logged</span>
                        <span className="stat-value">{todayData.foodLogs.length}</span>
                        <span className="stat-subtext">Keep it up!</span>
                    </div>
                </div>
            </div>

            {/* Recent Meals */}
            {todayData.foodLogs.length > 0 && (
                <div className="recent-meals card">
                    <h3>Recent Meals</h3>
                    <div className="meals-list">
                        {todayData.foodLogs.slice(-5).reverse().map(log => (
                            <div key={log.id} className="meal-item">
                                <div className="meal-info">
                                    <span className="meal-name">{log.name}</span>
                                    <span className="meal-time">
                                        {new Date(log.timestamp).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="meal-macros">
                                    <span className="meal-calories">{log.calories} cal</span>
                                    <span className="meal-macro">P: {log.protein}g</span>
                                    <span className="meal-macro">C: {log.carbs}g</span>
                                    <span className="meal-macro">F: {log.fats}g</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {todayData.foodLogs.length === 0 && (
                <div className="empty-state card">
                    <div className="empty-icon">🍽️</div>
                    <h3>No meals logged yet</h3>
                    <p>Start tracking your nutrition by logging your first meal!</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setCurrentView('logger')}
                    >
                        <Plus size={20} />
                        Log Your First Meal
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
