import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, Clock, Timer, ChevronDown } from 'lucide-react';
import './FastingTimer.css';

const PRESETS = [
    { name: '16:8', fast: 16, eat: 8, desc: 'Most popular — fast 16h, eat in 8h window' },
    { name: '18:6', fast: 18, eat: 6, desc: 'Extended — fast 18h, eat in 6h window' },
    { name: '20:4', fast: 20, eat: 4, desc: 'Warrior — fast 20h, eat in 4h window' },
    { name: '14:10', fast: 14, eat: 10, desc: 'Beginner — fast 14h, eat in 10h window' },
    { name: 'OMAD', fast: 23, eat: 1, desc: 'One Meal A Day — 23h fast' },
    { name: 'Custom', fast: 0, eat: 0, desc: 'Set your own fasting window' }
];

const FastingTimer = () => {
    const { user } = useApp();

    // Load fasting state from localStorage
    const loadState = () => {
        const saved = localStorage.getItem('fuelflow_fasting');
        return saved ? JSON.parse(saved) : null;
    };

    const savedState = loadState();

    const [selectedPreset, setSelectedPreset] = useState(savedState?.preset || PRESETS[0]);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState(savedState?.startTime || null);
    const [elapsed, setElapsed] = useState(0);
    const [customFastHours, setCustomFastHours] = useState(16);
    const [showPresets, setShowPresets] = useState(false);
    const [fastingHistory, setFastingHistory] = useState(() => {
        const saved = localStorage.getItem('fuelflow_fastingHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const intervalRef = useRef(null);

    const fastDurationSeconds = selectedPreset.fast * 3600;

    // Resume timer if it was running
    useEffect(() => {
        if (savedState?.startTime && savedState?.isRunning) {
            setStartTime(savedState.startTime);
            setIsRunning(true);
        }
    }, []);

    // Timer tick
    useEffect(() => {
        if (isRunning && startTime) {
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const elapsedMs = now - startTime;
                setElapsed(Math.floor(elapsedMs / 1000));
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, startTime]);

    // Save state
    useEffect(() => {
        localStorage.setItem('fuelflow_fasting', JSON.stringify({
            preset: selectedPreset,
            startTime,
            isRunning
        }));
    }, [selectedPreset, startTime, isRunning]);

    // Save history
    useEffect(() => {
        localStorage.setItem('fuelflow_fastingHistory', JSON.stringify(fastingHistory));
    }, [fastingHistory]);

    const startFast = () => {
        const now = Date.now();
        setStartTime(now);
        setIsRunning(true);
        setElapsed(0);
    };

    const pauseFast = () => {
        setIsRunning(false);
    };

    const resumeFast = () => {
        setIsRunning(true);
    };

    const endFast = () => {
        // Save to history
        if (startTime) {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            setFastingHistory(prev => [{
                id: Date.now(),
                preset: selectedPreset.name,
                targetHours: selectedPreset.fast,
                actualSeconds: duration,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date().toISOString(),
                completed: duration >= fastDurationSeconds
            }, ...prev].slice(0, 30)); // Keep last 30 entries
        }

        setIsRunning(false);
        setStartTime(null);
        setElapsed(0);
    };

    const selectPreset = (preset) => {
        if (preset.name === 'Custom') {
            setSelectedPreset({ ...preset, fast: customFastHours, eat: 24 - customFastHours });
        } else {
            setSelectedPreset(preset);
        }
        setShowPresets(false);
    };

    // Format time
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return {
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0')
        };
    };

    const remaining = Math.max(0, fastDurationSeconds - elapsed);
    const progress = fastDurationSeconds > 0 ? Math.min(elapsed / fastDurationSeconds, 1) : 0;
    const isComplete = elapsed >= fastDurationSeconds && fastDurationSeconds > 0;
    const elapsedFormatted = formatTime(elapsed);
    const remainingFormatted = formatTime(remaining);

    // Ring calculations
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
        <div className="fasting-timer animate-fadeIn">
            <div className="fasting-header">
                <h1>Fasting Timer ⏱️</h1>
                <p>Track your intermittent fasting windows</p>
            </div>

            {/* Preset Selector */}
            <div className="preset-selector card">
                <button
                    className="preset-dropdown-btn"
                    onClick={() => setShowPresets(!showPresets)}
                    disabled={isRunning || startTime}
                >
                    <div>
                        <span className="preset-name">{selectedPreset.name}</span>
                        <span className="preset-desc">
                            {selectedPreset.name === 'Custom'
                                ? `Custom ${customFastHours}h fast`
                                : selectedPreset.desc
                            }
                        </span>
                    </div>
                    <ChevronDown size={20} className={showPresets ? 'rotated' : ''} />
                </button>

                {showPresets && (
                    <div className="preset-list">
                        {PRESETS.map(preset => (
                            <button
                                key={preset.name}
                                className={`preset-option ${selectedPreset.name === preset.name ? 'active' : ''}`}
                                onClick={() => selectPreset(preset)}
                            >
                                <div>
                                    <span className="preset-option-name">{preset.name}</span>
                                    <span className="preset-option-desc">{preset.desc}</span>
                                </div>
                                {preset.fast > 0 && (
                                    <span className="preset-hours">{preset.fast}h</span>
                                )}
                            </button>
                        ))}

                        {selectedPreset.name === 'Custom' && (
                            <div className="custom-input-row">
                                <label>Fast duration (hours):</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={customFastHours}
                                    onChange={(e) => {
                                        const val = Math.max(1, Math.min(23, parseInt(e.target.value) || 16));
                                        setCustomFastHours(val);
                                        setSelectedPreset({ name: 'Custom', fast: val, eat: 24 - val, desc: `Custom ${val}h fast` });
                                    }}
                                    min="1"
                                    max="23"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Timer Ring */}
            <div className="timer-ring-container card">
                <div className="timer-ring">
                    <svg width="280" height="280" viewBox="0 0 280 280">
                        {/* Background ring */}
                        <circle
                            cx="140" cy="140" r={radius}
                            fill="none"
                            stroke="var(--bg-tertiary)"
                            strokeWidth="12"
                        />
                        {/* Progress ring */}
                        <circle
                            cx="140" cy="140" r={radius}
                            fill="none"
                            stroke={isComplete ? 'url(#successGradient)' : 'url(#timerGradient)'}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 140 140)"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                        <defs>
                            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(200, 95%, 50%)" />
                                <stop offset="100%" stopColor="hsl(270, 70%, 60%)" />
                            </linearGradient>
                            <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(145, 70%, 50%)" />
                                <stop offset="100%" stopColor="hsl(145, 70%, 40%)" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="timer-center">
                        {isComplete ? (
                            <>
                                <span className="timer-emoji">🎉</span>
                                <span className="timer-status success">Fast Complete!</span>
                            </>
                        ) : startTime ? (
                            <>
                                <span className="timer-label">Remaining</span>
                                <div className="timer-digits">
                                    <span>{remainingFormatted.hours}</span>
                                    <span className="timer-sep">:</span>
                                    <span>{remainingFormatted.minutes}</span>
                                    <span className="timer-sep">:</span>
                                    <span>{remainingFormatted.seconds}</span>
                                </div>
                                <span className="timer-elapsed">
                                    Elapsed: {elapsedFormatted.hours}h {elapsedFormatted.minutes}m
                                </span>
                            </>
                        ) : (
                            <>
                                <Timer size={36} />
                                <span className="timer-label">
                                    {selectedPreset.fast}h Fast
                                </span>
                                <span className="timer-hint">Tap Start to begin</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="timer-controls">
                    {!startTime ? (
                        <button className="btn btn-primary btn-lg" onClick={startFast}>
                            <Play size={22} /> Start Fast
                        </button>
                    ) : (
                        <>
                            {isRunning ? (
                                <button className="btn btn-secondary btn-lg" onClick={pauseFast}>
                                    <Pause size={22} /> Pause
                                </button>
                            ) : (
                                <button className="btn btn-primary btn-lg" onClick={resumeFast}>
                                    <Play size={22} /> Resume
                                </button>
                            )}
                            <button className="btn btn-outline btn-lg" onClick={endFast}>
                                <RotateCcw size={20} /> End Fast
                            </button>
                        </>
                    )}
                </div>

                {/* Progress percentage */}
                {startTime && (
                    <div className="timer-progress-info">
                        <span>{Math.round(progress * 100)}% complete</span>
                    </div>
                )}
            </div>

            {/* Fasting History */}
            {fastingHistory.length > 0 && (
                <div className="fasting-history card">
                    <h3><Clock size={20} /> Fasting History</h3>
                    <div className="history-list">
                        {fastingHistory.slice(0, 10).map(entry => {
                            const actual = formatTime(entry.actualSeconds);
                            return (
                                <div key={entry.id} className={`history-item ${entry.completed ? 'completed' : ''}`}>
                                    <div className="history-info">
                                        <span className="history-preset">{entry.preset}</span>
                                        <span className="history-date">
                                            {new Date(entry.startTime).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="history-stats">
                                        <span className="history-duration">
                                            {actual.hours}h {actual.minutes}m
                                        </span>
                                        <span className={`history-badge ${entry.completed ? 'badge-success' : 'badge-warning'}`}>
                                            {entry.completed ? '✅ Completed' : '⏱️ Partial'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FastingTimer;
