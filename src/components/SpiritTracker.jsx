import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Heart, Activity } from 'lucide-react';
import PageScripture from './PageScripture';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './SpiritTracker.css';

const SpiritTracker = () => {
    const { user, getTodayData, addSpiritualLog } = useApp();
    const [logType, setLogType] = useState('meditation');
    const [duration, setDuration] = useState(15);
    const [actDescription, setActDescription] = useState('');
    const [scripture, setScripture] = useState('');

    const todayData = getTodayData();

    // Default the spiritual logs if they don't exist yet
    const spiritualLogs = todayData.spiritualLogs || [];
    const totalMeditationMinutes = spiritualLogs
        .filter(log => log.type === 'meditation' || log.type === 'prayer')
        .reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalActs = spiritualLogs
        .filter(log => log.type === 'kindness')
        .length;
    const totalScriptures = spiritualLogs
        .filter(log => log.type === 'scripture')
        .length;

    const handleLog = async () => {
        let entry = {
            id: Date.now().toString(),
            type: logType,
            timestamp: new Date().toISOString()
        };

        if (logType === 'meditation' || logType === 'prayer') {
            entry.duration = duration;
            entry.name = logType === 'meditation' ? 'Meditation' : 'Prayer';
        } else if (logType === 'kindness') {
            if (!actDescription.trim()) return;
            entry.description = actDescription;
            entry.name = 'Act of Kindness';
        } else if (logType === 'scripture') {
            if (!scripture.trim()) return;
            entry.description = scripture;
            entry.name = 'Scripture Reading';
        }

        if (addSpiritualLog) {
            addSpiritualLog(entry);
        }

        // Push to Firebase Firestore so the AI Shepherd Agent can process it
        try {
            await addDoc(collection(db, 'spiritualLogs'), {
                userId: user?.uid || 'anonymous',
                ...entry,
                createdAt: serverTimestamp()
            });
            console.log("Logged spiritual activity to Firestore triggers.");
        } catch (error) {
            console.error("Error writing spiritual log to Firebase: ", error);
        }
        
        // Reset form
        setDuration(15);
        setActDescription('');
        setScripture('');
    };

    return (
        <div className="spirit-tracker animate-fadeIn">
            <PageScripture 
                verse="Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."
                reference="Psalm 46:10"
            />
            <div className="tracker-header">
                <div>
                    <h1>Spiritual Diary Tracker ✨</h1>
                    <p>Nourish your mind and soul</p>
                </div>
            </div>

            {/* Spiritual Summary */}
            <div className="spiritual-summary card">
                <h3>Today's Spiritual Macros</h3>
                <div className="summary-stats">
                    <div className="summary-stat">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))' }}>
                            <Activity size={24} color="white" />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Prayer/Meditation</span>
                            <span className="stat-value">{totalMeditationMinutes} min</span>
                        </div>
                    </div>
                    <div className="summary-stat">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))' }}>
                            <Heart size={24} color="white" />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Acts of Kindness</span>
                            <span className="stat-value">{totalActs}</span>
                        </div>
                    </div>
                    <div className="summary-stat">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                            <BookOpen size={24} color="white" />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Scriptures Read</span>
                            <span className="stat-value">{totalScriptures}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logger Entry */}
            <div className="spirit-logger card" style={{ marginTop: 'var(--space-xl)' }}>
                <h3>Log Activity</h3>
                
                <div className="log-type-selector">
                    <button 
                        className={`btn ${logType === 'prayer' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setLogType('prayer')}
                    >
                        Prayer
                    </button>
                    <button 
                        className={`btn ${logType === 'meditation' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setLogType('meditation')}
                    >
                        Meditation
                    </button>
                    <button 
                        className={`btn ${logType === 'kindness' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setLogType('kindness')}
                    >
                        Kindness
                    </button>
                    <button 
                        className={`btn ${logType === 'scripture' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setLogType('scripture')}
                    >
                        Scripture
                    </button>
                </div>

                <div className="log-form" style={{ marginTop: 'var(--space-md)' }}>
                    {(logType === 'prayer' || logType === 'meditation') && (
                        <div className="form-group">
                            <label className="form-label">Duration (minutes)</label>
                            <input 
                                type="number" 
                                className="form-input" 
                                value={duration} 
                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                min="1"
                            />
                        </div>
                    )}
                    
                    {logType === 'kindness' && (
                        <div className="form-group">
                            <label className="form-label">What did you do?</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="E.g., Helped a neighbor with groceries"
                                value={actDescription} 
                                onChange={(e) => setActDescription(e.target.value)}
                            />
                        </div>
                    )}

                    {logType === 'scripture' && (
                        <div className="form-group">
                            <label className="form-label">Passage Read</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="E.g., Psalm 23"
                                value={scripture} 
                                onChange={(e) => setScripture(e.target.value)}
                            />
                        </div>
                    )}

                    <button 
                        className="btn btn-primary btn-lg" 
                        style={{ width: '100%', marginTop: 'var(--space-md)' }}
                        onClick={handleLog}
                    >
                        Save Entry
                    </button>
                </div>
            </div>

            {/* Recent Spiritual Logs */}
            {spiritualLogs.length > 0 && (
                <div className="recent-logs card" style={{ marginTop: 'var(--space-xl)' }}>
                    <h3>Recent Entries</h3>
                    <div className="logs-list">
                        {spiritualLogs.slice(-5).reverse().map(log => (
                            <div key={log.id} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: 'var(--space-md)', 
                                borderBottom: '1px solid var(--border-color)' 
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{log.name}</div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        {log.description || `${log.duration} minutes`}
                                    </div>
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                                    {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpiritTracker;
