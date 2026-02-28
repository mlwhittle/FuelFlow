import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Search, Plus, X, TrendingUp } from 'lucide-react';
import {
    searchExercises,
    exerciseCategories,
    calculateCaloriesBurned,
    stepsToCalories
} from '../services/fitnessService';
import './ActivityTracker.css';

const ActivityTracker = () => {
    const { user, addExerciseLog, getTodayData } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [duration, setDuration] = useState(30);
    const [manualSteps, setManualSteps] = useState('');
    const [showStepsInput, setShowStepsInput] = useState(false);

    const searchResults = searchExercises(searchQuery, selectedCategory);
    const todayData = getTodayData();

    const handleSelectExercise = (exercise) => {
        setSelectedExercise(exercise);
        setDuration(30);
    };

    const handleLogExercise = () => {
        if (!selectedExercise) return;

        const caloriesBurned = calculateCaloriesBurned(
            selectedExercise.met,
            user.weight || 150,
            duration
        );

        const exerciseLog = {
            name: selectedExercise.name,
            category: selectedExercise.category,
            duration: duration,
            caloriesBurned: caloriesBurned,
            met: selectedExercise.met,
            icon: selectedExercise.icon
        };

        addExerciseLog(exerciseLog);
        setSelectedExercise(null);
        setDuration(30);
        setSearchQuery('');
    };

    const handleLogSteps = () => {
        const steps = parseInt(manualSteps);
        if (!steps || steps <= 0) return;

        const caloriesBurned = stepsToCalories(steps, user.weight || 150);

        const exerciseLog = {
            name: `${steps.toLocaleString()} Steps`,
            category: 'daily',
            duration: Math.round(steps / 100),
            caloriesBurned: caloriesBurned,
            met: 3.5,
            icon: '👟'
        };

        addExerciseLog(exerciseLog);
        setManualSteps('');
        setShowStepsInput(false);
    };

    const estimatedCalories = selectedExercise
        ? calculateCaloriesBurned(selectedExercise.met, user.weight || 150, duration)
        : 0;

    return (
        <div className="activity-tracker animate-fadeIn">
            <div className="tracker-header">
                <div>
                    <h1>Activity Tracker 🏃</h1>
                    <p>Log your workouts and daily activities</p>
                </div>
                <div className="tracker-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowStepsInput(!showStepsInput)}
                    >
                        <Activity size={20} />
                        Log Steps
                    </button>
                </div>
            </div>

            {/* Today's Activity Summary */}
            <div className="activity-summary card">
                <h3>Today's Activity</h3>
                <div className="summary-stats">
                    <div className="summary-stat">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-content">
                            <span className="stat-label">Calories Burned</span>
                            <span className="stat-value">{todayData.exerciseCalories}</span>
                        </div>
                    </div>
                    <div className="summary-stat">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-content">
                            <span className="stat-label">Active Minutes</span>
                            <span className="stat-value">{todayData.activeMinutes || 0}</span>
                        </div>
                    </div>
                    <div className="summary-stat">
                        <div className="stat-icon">💪</div>
                        <div className="stat-content">
                            <span className="stat-label">Workouts</span>
                            <span className="stat-value">{todayData.workoutCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Input */}
            {showStepsInput && (
                <div className="steps-input card">
                    <div className="steps-header">
                        <h3>Log Steps</h3>
                        <button
                            className="btn btn-icon"
                            onClick={() => setShowStepsInput(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="steps-form">
                        <div className="form-group">
                            <label className="form-label">Number of Steps</label>
                            <input
                                type="number"
                                className="form-input"
                                value={manualSteps}
                                onChange={(e) => setManualSteps(e.target.value)}
                                placeholder="e.g., 10000"
                                min="0"
                            />
                            {manualSteps && (
                                <p className="steps-estimate">
                                    ≈ {stepsToCalories(parseInt(manualSteps) || 0, user.weight || 150)} calories burned
                                </p>
                            )}
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleLogSteps}
                            disabled={!manualSteps || parseInt(manualSteps) <= 0}
                        >
                            <Plus size={20} />
                            Log Steps
                        </button>
                    </div>
                </div>
            )}

            {/* Device Integration - Coming Soon */}
            <div className="device-integration card">
                <div className="integration-header">
                    <Activity size={24} />
                    <h4>Fitness Device Integration</h4>
                </div>
                <p>Connect your fitness tracker to automatically sync workouts and activity data.</p>
                <div className="integration-options">
                    <button className="integration-btn" disabled>
                        <img src="https://www.gstatic.com/images/branding/product/2x/google_fit_512dp.png" alt="Google Fit" className="integration-logo" />
                        <span>Google Fit</span>
                        <span className="coming-soon-badge">Coming Soon</span>
                    </button>
                    <button className="integration-btn" disabled>
                        <span className="apple-health-icon">❤️</span>
                        <span>Apple Health</span>
                        <span className="coming-soon-badge">Coming Soon</span>
                    </button>
                    <button className="integration-btn" disabled>
                        <span className="fitbit-icon">💙</span>
                        <span>Fitbit</span>
                        <span className="coming-soon-badge">Coming Soon</span>
                    </button>
                </div>
                <p className="integration-note">
                    <strong>Manual logging available now.</strong> Device sync coming in future updates.
                </p>
            </div>

            {/* Exercise Search */}
            <div className="exercise-search card">
                <h3>Find Exercise</h3>
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search 50+ exercises..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category Filter */}
                <div className="category-filter">
                    {exerciseCategories.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Exercise Results */}
                <div className="exercise-results">
                    {searchResults.length > 0 ? (
                        searchResults.map(exercise => (
                            <div
                                key={exercise.id}
                                className={`exercise-item ${selectedExercise?.id === exercise.id ? 'selected' : ''}`}
                                onClick={() => handleSelectExercise(exercise)}
                            >
                                <div className="exercise-icon">{exercise.icon}</div>
                                <div className="exercise-info">
                                    <span className="exercise-name">{exercise.name}</span>
                                    <span className="exercise-met">MET: {exercise.met}</span>
                                </div>
                                <TrendingUp size={16} className="exercise-arrow" />
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <p>No exercises found. Try a different search.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Exercise Panel */}
            {selectedExercise && (
                <div className="selected-exercise card">
                    <div className="selected-header">
                        <h3>Log Activity</h3>
                        <button
                            className="btn btn-icon"
                            onClick={() => setSelectedExercise(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="selected-details">
                        <div className="exercise-display">
                            <span className="exercise-display-icon">{selectedExercise.icon}</span>
                            <h4>{selectedExercise.name}</h4>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Duration (minutes)</label>
                            <div className="duration-input">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setDuration(Math.max(5, duration - 5))}
                                >
                                    -5
                                </button>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={duration}
                                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                />
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setDuration(duration + 5)}
                                >
                                    +5
                                </button>
                            </div>
                        </div>

                        <div className="calories-estimate">
                            <h5>Estimated Calories Burned</h5>
                            <div className="calories-display">
                                <span className="calories-number">{estimatedCalories}</span>
                                <span className="calories-label">calories</span>
                            </div>
                            <p className="estimate-note">
                                Based on {user.weight || 150} lbs body weight and MET value of {selectedExercise.met}
                            </p>
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleLogExercise}
                        >
                            <Plus size={20} />
                            Log Activity
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityTracker;
