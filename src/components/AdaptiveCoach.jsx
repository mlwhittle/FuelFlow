import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Brain, TrendingUp, TrendingDown, Target, Lightbulb, ChevronRight, Zap } from 'lucide-react';
import './AdaptiveCoach.css';

const AdaptiveCoach = () => {
    const { user, getHistoricalData, getWeightHistory, foodLogs, exerciseLogs } = useApp();
    const [timeRange, setTimeRange] = useState(7);

    const historicalData = getHistoricalData(timeRange);
    const weightHistory = getWeightHistory(timeRange);

    // Calculate averages
    const daysWithData = historicalData.filter(d => d.totalCalories > 0);
    const avgCalories = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((s, d) => s + d.totalCalories, 0) / daysWithData.length)
        : 0;
    const avgProtein = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((s, d) => s + d.totalProtein, 0) / daysWithData.length)
        : 0;
    const avgCarbs = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((s, d) => s + d.totalCarbs, 0) / daysWithData.length)
        : 0;
    const avgFats = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((s, d) => s + d.totalFats, 0) / daysWithData.length)
        : 0;
    const avgExerciseCals = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((s, d) => s + d.exerciseCalories, 0) / daysWithData.length)
        : 0;

    // Weight trend analysis
    const weightChange = weightHistory.length >= 2
        ? weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
        : null;
    const weeklyWeightChange = weightChange !== null && timeRange > 0
        ? (weightChange / timeRange * 7).toFixed(2)
        : null;

    // Generate adaptive recommendations
    const getRecommendations = () => {
        const recs = [];
        const goalCalories = user.dailyCalories;
        const goalProtein = user.macros?.protein || 150;
        const calorieDiff = avgCalories - goalCalories;

        // Calorie analysis
        if (avgCalories > 0) {
            if (calorieDiff > 200) {
                recs.push({
                    type: 'warning',
                    icon: '🔴',
                    title: 'Calorie Surplus Detected',
                    detail: `You're averaging ${avgCalories} cal/day, which is ${Math.abs(calorieDiff)} cal above your ${goalCalories} cal goal.`,
                    action: user.goal === 'gain' ? 'This aligns with your gain goal. Monitor weight gain rate.' : `Consider reducing portions by ~${Math.round(calorieDiff / 3)} cal per meal.`
                });
            } else if (calorieDiff < -300) {
                recs.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: 'Large Calorie Deficit',
                    detail: `Averaging ${avgCalories} cal/day — ${Math.abs(calorieDiff)} cal below your ${goalCalories} cal goal.`,
                    action: user.goal === 'lose' ? 'Deficit is steep. Ensure adequate protein to preserve muscle.' : 'Increase intake to meet your target. Try adding nutrient-dense snacks.'
                });
            } else if (Math.abs(calorieDiff) <= 200) {
                recs.push({
                    type: 'success',
                    icon: '✅',
                    title: 'Calories On Track',
                    detail: `Averaging ${avgCalories} cal/day — within ${Math.abs(calorieDiff)} cal of your ${goalCalories} cal goal.`,
                    action: 'Keep it up! Consistency is key.'
                });
            }
        }

        // Protein analysis
        if (avgProtein > 0) {
            if (avgProtein < goalProtein * 0.8) {
                recs.push({
                    type: 'tip',
                    icon: '💪',
                    title: 'Increase Protein Intake',
                    detail: `Averaging ${avgProtein}g protein/day vs. your ${goalProtein}g goal.`,
                    action: 'Add a protein source to each meal: eggs, chicken, Greek yogurt, or a protein shake.'
                });
            } else if (avgProtein >= goalProtein * 0.9) {
                recs.push({
                    type: 'success',
                    icon: '🥩',
                    title: 'Protein Goal Met',
                    detail: `Great job! Averaging ${avgProtein}g protein/day (goal: ${goalProtein}g).`,
                    action: 'Protein is dialed in. Maintain this intake.'
                });
            }
        }

        // Weight trend
        if (weeklyWeightChange !== null) {
            const change = parseFloat(weeklyWeightChange);
            if (user.goal === 'lose' && change > 0.2) {
                recs.push({
                    type: 'warning',
                    icon: '📈',
                    title: 'Weight Trending Up',
                    detail: `You're gaining ~${Math.abs(change)} kg/week while trying to lose weight.`,
                    action: 'Review your calorie intake or increase activity. Consider reducing portions slightly.'
                });
            } else if (user.goal === 'lose' && change < -0.5) {
                recs.push({
                    type: 'tip',
                    icon: '⚡',
                    title: 'Rapid Weight Loss',
                    detail: `Losing ~${Math.abs(change)} kg/week. Aim for 0.2-0.5 kg/week for sustainable loss.`,
                    action: 'Don\'t cut too aggressively. Consider increasing calories by 200-300.'
                });
            } else if (user.goal === 'gain' && change < 0) {
                recs.push({
                    type: 'warning',
                    icon: '📉',
                    title: 'Not Gaining Weight',
                    detail: `You're losing weight (~${Math.abs(change)} kg/week) while trying to gain.`,
                    action: 'Increase calorie intake by 300-500 cal/day. Add calorie-dense foods like nuts, olive oil, avocado.'
                });
            }
        }

        // Exercise
        if (avgExerciseCals < 100 && daysWithData.length >= 3) {
            recs.push({
                type: 'tip',
                icon: '🏃',
                title: 'Increase Activity',
                detail: `Averaging only ${avgExerciseCals} exercise calories/day.`,
                action: 'Try adding 30 min of walking daily — that\'s ~150 extra calories burned.'
            });
        }

        // Consistency
        const consistency = daysWithData.length / timeRange;
        if (consistency < 0.5 && timeRange >= 7) {
            recs.push({
                type: 'tip',
                icon: '📝',
                title: 'Log More Consistently',
                detail: `You've logged ${daysWithData.length} out of ${timeRange} days (${Math.round(consistency * 100)}%).`,
                action: 'Consistent logging leads to better insights. Try to log every meal, even quick snacks.'
            });
        }

        // If no data
        if (avgCalories === 0) {
            recs.push({
                type: 'info',
                icon: '🌟',
                title: 'Start Logging to Get Insights',
                detail: 'The Adaptive Coach needs at least a few days of food log data to provide personalized recommendations.',
                action: 'Log your meals in the Food Logger and check back in a few days!'
            });
        }

        return recs;
    };

    // Suggested calorie adjustment
    const suggestedAdjustment = (() => {
        if (!weeklyWeightChange || avgCalories === 0) return null;
        const actualWeeklyChange = parseFloat(weeklyWeightChange);

        if (user.goal === 'lose') {
            const targetWeeklyChange = -0.35; // ~0.35 kg/week loss
            const diff = actualWeeklyChange - targetWeeklyChange;
            if (Math.abs(diff) > 0.15) {
                const calAdjust = Math.round(diff * 7700 / 7); // 7700 cal ≈ 1 kg
                return {
                    direction: calAdjust > 0 ? 'decrease' : 'increase',
                    amount: Math.abs(calAdjust),
                    newTarget: user.dailyCalories - calAdjust
                };
            }
        } else if (user.goal === 'gain') {
            const targetWeeklyChange = 0.25; // ~0.25 kg/week gain
            const diff = actualWeeklyChange - targetWeeklyChange;
            if (Math.abs(diff) > 0.1) {
                const calAdjust = Math.round(diff * 7700 / 7);
                return {
                    direction: calAdjust > 0 ? 'decrease' : 'increase',
                    amount: Math.abs(calAdjust),
                    newTarget: user.dailyCalories - calAdjust
                };
            }
        }
        return null;
    })();

    const recommendations = getRecommendations();

    return (
        <div className="adaptive-coach animate-fadeIn">
            <div className="coach-header">
                <div>
                    <h1>Adaptive Coach 🧠</h1>
                    <p>AI-powered insights based on your data</p>
                </div>
            </div>

            {/* Time Range */}
            <div className="coach-range">
                {[7, 14, 30].map(days => (
                    <button
                        key={days}
                        className={`range-btn ${timeRange === days ? 'active' : ''}`}
                        onClick={() => setTimeRange(days)}
                    >
                        {days} Days
                    </button>
                ))}
            </div>

            {/* Weekly Summary Cards */}
            <div className="coach-stats">
                <div className="coach-stat card">
                    <span className="coach-stat-label">Avg Calories</span>
                    <span className="coach-stat-value">{avgCalories || '—'}</span>
                    <span className="coach-stat-vs">
                        Goal: {user.dailyCalories}
                        {avgCalories > 0 && (
                            <span className={avgCalories > user.dailyCalories ? 'over' : 'under'}>
                                {avgCalories > user.dailyCalories ? ' ▲' : ' ▼'}
                                {Math.abs(avgCalories - user.dailyCalories)}
                            </span>
                        )}
                    </span>
                </div>
                <div className="coach-stat card">
                    <span className="coach-stat-label">Avg Protein</span>
                    <span className="coach-stat-value">{avgProtein || '—'}g</span>
                    <span className="coach-stat-vs">Goal: {user.macros?.protein || 150}g</span>
                </div>
                <div className="coach-stat card">
                    <span className="coach-stat-label">Weight Trend</span>
                    <span className="coach-stat-value">
                        {weeklyWeightChange !== null
                            ? `${parseFloat(weeklyWeightChange) > 0 ? '+' : ''}${weeklyWeightChange} kg/wk`
                            : '—'
                        }
                    </span>
                    <span className="coach-stat-vs">
                        {user.goal === 'lose' ? 'Goal: Lose' : user.goal === 'gain' ? 'Goal: Gain' : 'Goal: Maintain'}
                    </span>
                </div>
                <div className="coach-stat card">
                    <span className="coach-stat-label">Avg Exercise</span>
                    <span className="coach-stat-value">{avgExerciseCals || '—'} cal</span>
                    <span className="coach-stat-vs">Per day burned</span>
                </div>
            </div>

            {/* Suggested Calorie Adjustment */}
            {suggestedAdjustment && (
                <div className="calorie-adjustment card">
                    <div className="adjust-header">
                        <Zap size={24} />
                        <h3>Suggested Calorie Adjustment</h3>
                    </div>
                    <p>
                        Based on your weight trend, consider <strong>{suggestedAdjustment.direction}ing</strong> your
                        daily calories by <strong>{suggestedAdjustment.amount} cal</strong>.
                    </p>
                    <div className="adjust-visual">
                        <div className="adjust-from">
                            <span>Current</span>
                            <strong>{user.dailyCalories} cal</strong>
                        </div>
                        <ChevronRight size={24} />
                        <div className="adjust-to">
                            <span>Suggested</span>
                            <strong>{suggestedAdjustment.newTarget} cal</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="coach-recommendations">
                <h2><Lightbulb size={24} /> Personalized Insights</h2>
                <div className="recs-list">
                    {recommendations.map((rec, index) => (
                        <div key={index} className={`rec-card card ${rec.type}`}>
                            <div className="rec-icon">{rec.icon}</div>
                            <div className="rec-content">
                                <h4>{rec.title}</h4>
                                <p className="rec-detail">{rec.detail}</p>
                                <p className="rec-action"><strong>💡 Tip:</strong> {rec.action}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdaptiveCoach;
