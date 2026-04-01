import { useState, useEffect } from 'react';
import { Shield, Sparkles, Activity, MessageSquare, Terminal, Send, CheckCircle2, AlertTriangle, Users, ShieldAlert } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { subscribeToWarRoom, getTimeAgo } from '../services/socialService';
import './Dashboard.css'; // Inheriting foundational styles

const PastorDashboard = () => {
    const [directive, setDirective] = useState('');
    const [activationDate, setActivationDate] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [warRoomRequests, setWarRoomRequests] = useState([]);

    useEffect(() => {
        const unsub = subscribeToWarRoom((requests) => {
            setWarRoomRequests(requests);
        });
        return () => unsub();
    }, []);

    const handleSendDirective = async () => {
        if (!directive.trim()) return;
        setIsSending(true);

        try {
            if (activationDate) {
                // Schedule it for the Scribe later
                await addDoc(collection(db, 'scheduledDirectives'), {
                    theme: directive,
                    activationDate: activationDate,
                    isActive: false,
                    createdAt: serverTimestamp()
                });
                setSuccessMsg('Directive scheduled for ' + activationDate);
            } else {
                // Drop an event in the ledger for The Scribe to execute immediately
                await addDoc(collection(db, 'agentLedger'), {
                    eventType: 'GLOBAL_DIRECTIVE',
                    payload: { message: directive },
                    processed: false,
                    createdAt: serverTimestamp()
                });
                setSuccessMsg('Directive dispatched to The Scribe immediately.');
            }
            
            setDirective('');
            setActivationDate('');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="dashboard animate-fadeIn" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="dashboard-header" style={{ marginBottom: 'var(--space-xl)' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)', color: 'var(--gold-500)' }}>Master Control Board</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Oversee the Digital Staff and shepherd your 10,000+ users.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                {/* Community Vibe Meter */}
                <div className="card" style={{ gridColumn: '1 / -1', background: 'var(--surface-50)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <Activity color="var(--primary-500)" />
                        <h3 style={{ margin: 0 }}>Community Vibe Meter</h3>
                        <span style={{ marginLeft: 'auto', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary-600)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>Updated 10m ago</span>
                    </div>
                    <div style={{ padding: 'var(--space-lg)', background: 'white', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--primary-400)' }}>
                        <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                            "The collective mood indicates heightened anxiety around <strong style={{color:'var(--gold-600)'}}>financial stress</strong> and <strong style={{color:'var(--gold-600)'}}>time management</strong> this week, based on 142 recent prayer requests. However, physical discipline (water/calories) remains remarkably consistent at 82% adherence."
                        </p>
                    </div>
                </div>

                {/* Staff Performance */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                        <Users color="var(--gold-500)" />
                        <h3 style={{ margin: 0 }}>Digital Staff Performance (Today)</h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{fontSize:'1.2rem'}}>🙏</span> <strong>The Shepherd</strong>
                            </div>
                            <span style={{color: 'var(--text-secondary)'}}>1,200 prayers answered <span style={{color:'var(--error)', fontSize:'0.8rem', marginLeft:'4px'}}>(5 Escalated)</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{fontSize:'1.2rem'}}>💪</span> <strong>The Coach</strong>
                            </div>
                            <span style={{color: 'var(--text-secondary)'}}>845 nudges sent</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{fontSize:'1.2rem'}}>🛡️</span> <strong>The Watchman</strong>
                            </div>
                            <span style={{color: 'var(--text-secondary)'}}>14,020 posts scanned <span style={{color:'var(--success)', fontSize:'0.8rem', marginLeft:'4px'}}>(0 Toxic)</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{fontSize:'1.2rem'}}>✍️</span> <strong>The Scribe</strong>
                            </div>
                            <span style={{color: 'var(--text-secondary)'}}>Daily Manna generated</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{fontSize:'1.2rem'}}>📋</span> <strong>The Clerk</strong>
                            </div>
                            <span style={{color: 'var(--text-secondary)'}}>42 support tickets closed</span>
                        </div>
                    </div>
                </div>

                {/* The War Room Inbox */}
                <div className="card" style={{ gridColumn: '1 / -1', borderLeft: '4px solid var(--error-500)', background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), white)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <ShieldAlert color="var(--error-500)" />
                        <h3 style={{ margin: 0 }}>The War Room (Urgent Inquiries)</h3>
                        {warRoomRequests.length > 0 && (
                            <span style={{ marginLeft: 'auto', background: 'var(--error-500)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                {warRoomRequests.filter(r => r.status === 'pending').length} Action Needed
                            </span>
                        )}
                    </div>
                    
                    {warRoomRequests.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No active war room situations. The flock is quiet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {warRoomRequests.map(req => (
                                <div key={req.id} style={{ padding: 'var(--space-md)', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>{req.user?.avatar}</span><strong>{req.user?.name}</strong>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{getTimeAgo(req.createdAt)}</span>
                                    </div>
                                    <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-primary)' }}>"{req.content}"</p>
                                    {req.status === 'pending' && (
                                        <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-sm" style={{ background: 'var(--primary-600)', color: 'white', border: 'none' }} onClick={() => alert('Opening Secure Chat connection to ' + req.user.name + '...')}>Initiate Pastoral Chat</button>
                                            <button className="btn btn-sm btn-ghost">Dismiss Alert</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Global Command Line & Scheduler */}
                <div className="card" style={{ background: 'var(--gray-900)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                        <Terminal color="var(--gold-400)" />
                        <h3 style={{ margin: 0, color: 'white' }}>Directive Scheduler</h3>
                    </div>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
                        Input a pastoral directive and optionally schedule it for an upcoming Sunday series.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <textarea
                            value={directive}
                            onChange={(e) => setDirective(e.target.value)}
                            placeholder="e.g., 'Series: New Beginnings. Focus all coaching tips this week on fresh starts.'"
                            style={{
                                background: 'var(--gray-800)',
                                border: '1px solid var(--gray-700)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-md)',
                                color: 'white',
                                resize: 'vertical',
                                minHeight: '100px',
                                fontFamily: 'monospace'
                            }}
                        />
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                            <label style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Activate on (Optional):</label>
                            <input 
                                type="date" 
                                value={activationDate}
                                onChange={(e) => setActivationDate(e.target.value)}
                                style={{
                                    background: 'var(--gray-800)',
                                    border: '1px solid var(--gray-700)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-sm)',
                                    color: 'white',
                                    flex: 1
                                }}
                            />
                        </div>
                        <button 
                            className="btn" 
                            style={{ background: 'var(--gold-500)', color: 'black', fontWeight: 600 }}
                            onClick={handleSendDirective}
                            disabled={isSending || !directive.trim()}
                        >
                            {isSending ? 'Transmitting...' : <><Send size={18} /> Execute Directive</>}
                        </button>

                        {successMsg && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.9rem', marginTop: 'var(--space-xs)' }}>
                                <CheckCircle2 size={16} /> {successMsg}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PastorDashboard;
