import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Droplet, Activity, TrendingUp, Plus, Check, X, Edit2 } from 'lucide-react';
import { calculatePercentage } from '../utils/calculations';
import DailyBread from './DailyBread';
import './Dashboard.css';

const Dashboard = ({ setCurrentView }) => {
    const { user, setUser, getTodayData, addWater, resetWater } = useApp();
    const [isEditingCalories, setIsEditingCalories] = useState(false);
    const [tempCalories, setTempCalories] = useState(user.dailyCalories.toString());
    
    const todayData = getTodayData();
    const caloriesRemaining = user.dailyCalories - todayData.netCalories;
    const caloriesProgress = Math.min((todayData.totalCalories / user.dailyCalories) * 100, 100);
    const proteinProgress = Math.min((todayData.totalProtein / user.macros.protein) * 100, 100);
    const carbsProgress = Math.min((todayData.totalCarbs / user.macros.carbs) * 100, 100);
    const fatsProgress = Math.min((todayData.totalFats / user.macros.fats) * 100, 100);
    // Science-based water intake: ~0.5 oz of water per pound of body weight
    // user.weight is currently stored in kg, convert to lbs first (1 kg = 2.20462 lbs)
    const weightInLbs = user.weight * 2.20462;
    const waterGoal = Math.round(weightInLbs * 0.5); // oz
    const waterPercentage = calculatePercentage(todayData.waterIntake, waterGoal);

    // Spiritual Stats
    const spiritualLogs = todayData.spiritualLogs || [];
    const meditationMinutes = spiritualLogs
        .filter(log => log.type === 'meditation' || log.type === 'prayer')
        .reduce((sum, log) => sum + (log.duration || 0), 0);
    const actsOfKindness = spiritualLogs.filter(log => log.type === 'kindness').length;
    const scripturesRead = spiritualLogs.filter(log => log.type === 'scripture').length;

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

            <DailyBread />

            {/* Main Calorie Card */}
            <div className="calorie-card card">
                <div className="calorie-ring-container">
                    <svg className="calorie-ring" viewBox="0 0 200 200" style={{ pointerEvents: 'none' }}>
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
                    <div className="calorie-center" style={{ zIndex: 10, pointerEvents: 'auto' }}>
                        <Flame className="calorie-icon" size={32} />
                        <div className="calorie-numbers">
                            <span className="calorie-current">{todayData.netCalories}</span>
                            <span className="calorie-divider">/</span>
                            {isEditingCalories ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 20 }}>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        className="calorie-goal-input"
                                        value={tempCalories}
                                        onChange={(e) => setTempCalories(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const parsedValue = parseInt(tempCalories.toString().replace(/\D/g, '')) || 0;
                                                if (parsedValue >= 100 && parsedValue <= 15000) {
                                                    setUser(prev => ({ ...prev, dailyCalories: parsedValue }));
                                                } else {
                                                    setTempCalories(user.dailyCalories.toString());
                                                }
                                                setIsEditingCalories(false);
                                            }
                                            if (e.key === 'Escape') {
                                                setTempCalories(user.dailyCalories.toString());
                                                setIsEditingCalories(false);
                                            }
                                        }}
                                        autoFocus
                                        style={{
                                            width: '80px',
                                            background: 'var(--bg-secondary)',
                                            border: '2px solid var(--primary-500)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            fontSize: '20px',
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            outline: 'none',
                                            padding: '4px'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const parsedValue = parseInt(tempCalories.toString().replace(/\D/g, '')) || 0;
                                                if (parsedValue >= 100 && parsedValue <= 15000) {
                                                    setUser(prev => ({ ...prev, dailyCalories: parsedValue }));
                                                } else {
                                                    setTempCalories(user.dailyCalories.toString());
                                                }
                                                setIsEditingCalories(false);
                                            }}
                                            style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTempCalories(user.dailyCalories.toString());
                                                setIsEditingCalories(false);
                                            }}
                                            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => {
                                        setTempCalories(user.dailyCalories.toString());
                                        setIsEditingCalories(true);
                                    }}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '4px', 
                                        cursor: 'pointer', 
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        background: 'var(--bg-tertiary)',
                                        transition: 'background 0.2s ease',
                                        pointerEvents: 'auto',
                                        zIndex: 30
                                    }}
                                    title="Click to edit daily goal"
                                >
                                    <span className="calorie-goal">{user.dailyCalories}</span>
                                    <Edit2 size={14} style={{ color: 'var(--text-tertiary)' }} />
                                </div>
                            )}
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
                        <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span>{todayData.waterIntake}</span>
                            <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>
                                / {waterGoal} oz
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${waterPercentage}%` }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button 
                                className="btn btn-primary btn-sm" 
                                style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}
                                onClick={() => addWater(8)}
                            >
                                + 1 Cup (8 oz)
                            </button>
                            {todayData.waterIntake > 0 && (
                                <button 
                                    className="btn btn-outline btn-sm" 
                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                    onClick={resetWater}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
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

                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--gold-400) 0%, var(--gold-600) 100%)' }}>
                        <span style={{color: 'white', fontSize: '1.2rem'}}>✨</span>
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Spiritual Focus</span>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            <div><strong>{meditationMinutes}m</strong> Prayer/Meditation</div>
                            <div><strong>{actsOfKindness}</strong> Kindness Acts</div>
                            <div><strong>{scripturesRead}</strong> Scriptures</div>
                        </div>
                        <button 
                            className="btn btn-outline btn-sm" 
                            style={{ marginTop: '12px', width: '100%' }}
                            onClick={() => setCurrentView('spirit')}
                        >
                            Log Spirit
                        </button>
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
                                    <span className="meal-name">
                                        {log.servings && log.servings !== 1 ? `${log.servings}x ` : ''}{log.name}
                                    </span>
                                    <div className="meal-time" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {log.mealType && (
                                            <span style={{ 
                                                textTransform: 'capitalize', 
                                                backgroundColor: 'var(--bg-tertiary)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '500'
                                            }}>
                                                {log.mealType}
                                            </span>
                                        )}
                                        <span>
                                            {new Date(log.timestamp).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
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
