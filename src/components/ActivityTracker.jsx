import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Search, Plus, X, TrendingUp } from 'lucide-react';
import {
    searchExercises,
    exerciseCategories,
    calculateCaloriesBurned,
    stepsToCalories,
    parseNaturalLanguageActivity,
    getAIWorkoutRecommendation
} from '../services/fitnessService';
import PageScripture from './PageScripture';
import './ActivityTracker.css';

const ActivityTracker = () => {
    const { user, addExerciseLog, getTodayData } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [duration, setDuration] = useState(30);
    const [manualSteps, setManualSteps] = useState('');
    const [showStepsInput, setShowStepsInput] = useState(false);
    
    // Modes
    const [entryMode, setEntryMode] = useState('ai'); // 'ai' or 'manual'

    // AI Features state
    const [nlpText, setNlpText] = useState('');
    const [nlpResults, setNlpResults] = useState(null);
    const [aiRecommendation] = useState(() => getAIWorkoutRecommendation());
    
    // Auto-scroll ref
    const logPanelRef = useRef(null);

    const searchResults = searchExercises(searchQuery, selectedCategory);
    const todayData = getTodayData();

    const handleSelectExercise = (exercise) => {
        setSelectedExercise(exercise);
        setDuration(30);
        setTimeout(() => logPanelRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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

    const handleNLPParse = () => {
        if (!nlpText.trim()) return;
        const results = parseNaturalLanguageActivity(nlpText);
        setNlpResults(results || []);
    };

    const handleLogNLPExercise = (exercise, duration) => {
        const caloriesBurned = calculateCaloriesBurned(
            exercise.met,
            user.weight || 150,
            duration
        );

        const exerciseLog = {
            name: exercise.name,
            category: exercise.category,
            duration: duration,
            caloriesBurned: caloriesBurned,
            met: exercise.met,
            icon: exercise.icon
        };

        addExerciseLog(exerciseLog);
        
        // Remove from results or clear if last one
        if (nlpResults.length <= 1) {
            setNlpText('');
            setNlpResults(null);
        } else {
            setNlpResults(prev => prev.filter(r => r.id !== exercise.id));
        }
    };

    const handleLogRecommended = () => {
        const ex = aiRecommendation.suggestedExercise;
        setSelectedExercise(ex);
        setDuration(aiRecommendation.duration);
        setTimeout(() => logPanelRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    return (
        <div className="activity-tracker animate-fadeIn">
            <PageScripture 
                verse="For physical training is of some value, but godliness has value for all things, holding promise for both the present life and the life to come."
                reference="1 Timothy 4:8"
            />
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

            {/* Entry Mode Toggle */}
            <div className="entry-mode-toggle" style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <button 
                    className={`btn ${entryMode === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setEntryMode('ai')}
                    style={{ flex: 1, padding: 'var(--space-md)', fontSize: '1.1rem' }}
                >
                    ✨ AI Mode
                </button>
                <button 
                    className={`btn ${entryMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setEntryMode('manual')}
                    style={{ flex: 1, padding: 'var(--space-md)', fontSize: '1.1rem' }}
                >
                    🔍 Manual Mode
                </button>
            </div>

            {/* AI Entry Mode Elements */}
            {entryMode === 'ai' && (
                <div className="ai-mode-container animate-fadeIn">
                    {/* Natural Language Logger */}
                    <div className="nlp-logger card" style={{ padding: 'var(--space-xl)', border: '2px solid var(--primary-300)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>Tell me what you did</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                            E.g., "I ran 3 miles in 25 mins and did a 10 min yoga session"
                        </p>
                        <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', background: 'var(--bg-secondary)', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-sm)' }}>
                            <span style={{ fontSize: '1.5rem', paddingLeft: 'var(--space-sm)' }}>✨</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Describe your workout..."
                                value={nlpText}
                                onChange={(e) => setNlpText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleNLPParse()}
                                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem', padding: 'var(--space-sm)', minWidth: 0 }}
                            />
                            <button className="btn btn-primary" onClick={handleNLPParse} style={{ marginRight: '4px', padding: 'var(--space-sm) var(--space-xl)' }}>
                                Find Activities
                            </button>
                        </div>

                        {nlpResults && nlpResults.length > 0 && (
                            <div className="nlp-results" style={{ marginTop: 'var(--space-lg)' }}>
                                <h4 style={{ marginBottom: 'var(--space-md)', fontSize: '1.1rem', color: 'var(--primary-700)' }}>Ready to Log:</h4>
                                {nlpResults.map(res => (
                                    <div key={res.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--primary-500)', marginBottom: 'var(--space-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <span style={{ fontSize: '2rem' }}>{res.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{res.name}</div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Based on: "{res.sourceText}"</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                            <div className="duration-input" style={{ background: 'var(--bg-primary)', border: '2px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    value={res.suggestedDuration} 
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setNlpResults(prev => prev.map(p => p.id === res.id ? { ...p, suggestedDuration: val } : p));
                                                    }}
                                                    style={{ width: '50px', textAlign: 'right', border: 'none', background: 'transparent', outline: 'none', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', padding: 0 }}
                                                />
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem', marginLeft: '6px' }}>min</span>
                                            </div>
                                            <button className="btn btn-success" onClick={() => handleLogNLPExercise(res, res.suggestedDuration)}>
                                                <Plus size={20} /> Log
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {nlpResults && nlpResults.length === 0 && (
                            <div style={{ padding: 'var(--space-md)', background: 'var(--warning)', color: 'black', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
                                Hmm, I couldn't find an exact match for that. Try adjusting your phrasing or use Manual Entry!
                            </div>
                        )}
                    </div>

                    {/* AI Workout Recommendation */}
                    <div className="ai-recommendation card" style={{ background: 'var(--primary-50)', borderColor: 'var(--primary-200)', borderWidth: '2px', borderStyle: 'solid', marginTop: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                            <div>
                                <h3 style={{ color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '1.3rem' }}>
                                    ✨ Based on Your Day
                                </h3>
                                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: 'var(--space-xs)', marginBottom: '4px' }}>{aiRecommendation.title}</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                                    {aiRecommendation.description}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <span style={{ fontSize: '2.5rem' }}>{aiRecommendation.suggestedExercise.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{aiRecommendation.suggestedExercise.name}</div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary-600)', fontWeight: 600 }}>{aiRecommendation.duration} mins</div>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={handleLogRecommended}>
                                Setup Log <TrendingUp size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Entry Mode Elements */}
            {entryMode === 'manual' && (
                <div className="manual-mode-container animate-fadeIn">
                    <div className="exercise-search card">
                        <h3>Database Search</h3>
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
                        <div className="exercise-results" style={{ maxHeight: '350px' }}>
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
                                        <Plus size={20} className="exercise-arrow" />
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>No exercises found. Try a different search.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Motivation Banner moved to manual tab so it doesn't clutter AI frame */}
                    <div className="activity-banner card" style={{
                        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--navy-900, #0C1B3A) 100%)',
                        color: 'white',
                        padding: 'var(--space-xl)',
                        borderRadius: 'var(--radius-xl)',
                        position: 'relative',
                        overflow: 'hidden',
                        marginTop: 'var(--space-xl)'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🏃‍♂️💪🔥</div>
                            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: '0 0 var(--space-sm)' }}>
                                Every Step Counts
                            </h3>
                            <p style={{ color: '#ffffff', fontSize: 'var(--font-size-sm)', maxWidth: '400px', lineHeight: 1.5 }}>
                                Log your workouts, track your calories burned, and watch your progress grow.
                                Consistency beats perfection — keep moving!
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>50+</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.9)' }}>Exercises</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>7</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.9)' }}>Categories</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>✓</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.9)' }}>Custom Entries</div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div style={{
                            position: 'absolute', top: '-30px', right: '-30px',
                            width: '150px', height: '150px', borderRadius: '50%',
                            background: 'rgba(218, 165, 32, 0.15)'
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '-20px', right: '60px',
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(59, 114, 230, 0.2)'
                        }} />
                    </div>
                </div>
            )}

            {/* Selected Exercise Panel - Anchored at the bottom when active */}
            {selectedExercise && (
                <div className="selected-exercise card" ref={logPanelRef} style={{ border: '3px solid var(--primary-500)', marginTop: 'var(--space-xl)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
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
