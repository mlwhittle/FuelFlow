import { useState, useEffect } from 'react';
import { getDailyBread } from '../services/aiSpiritualService';
import { useApp } from '../context/AppContext';
import { Book } from 'lucide-react';

const DailyBread = () => {
    const { user, getTodayData } = useApp();
    const [inspiration, setInspiration] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchBread = async () => {
            setLoading(true);
            const todayData = getTodayData();
            // Assuming user has a property for consistency, otherwise mock 0
            const daysConsistent = user.daysConsistent || 0; 
            
            const result = await getDailyBread(user, todayData, daysConsistent);
            if (isMounted) {
                setInspiration(result);
                setLoading(false);
            }
        };

        fetchBread();
        return () => { isMounted = false; };
    }, [user, getTodayData]);

    if (loading) {
        return (
            <div className="daily-bread card animate-pulse" style={{ background: 'var(--gradient-gold-blue)', color: 'white', marginBottom: 'var(--space-md)' }}>
                <div style={{ padding: 'var(--space-md)', opacity: 0.7 }}>
                    Receiving guidance from Pastor Mel... ✨
                </div>
            </div>
        );
    }

    return (
        <div className="daily-bread card animate-fadeIn" style={{ 
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', // Deep Navy to Royal Blue
            color: '#FFFFFF',
            border: 'none',
            marginBottom: 'var(--space-lg)',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    padding: 'var(--space-sm)', 
                    borderRadius: 'var(--radius-full)',
                    display: 'flex'
                }}>
                    <Book size={24} color="white" />
                </div>
                <div>
                    <h3 style={{ margin: '0 0 var(--space-xs)', fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
                        Daily Bread <span style={{fontSize:'0.8rem', background:'rgba(255,255,255,0.25)', padding:'4px 10px', borderRadius:'16px', color: '#FFFFFF', fontWeight: 500}}>From Pastor Mel</span>
                    </h3>
                    <p style={{ margin: '0 0 var(--space-sm)', fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.95)' }}>
                        "{inspiration?.scripture}"
                    </p>
                    <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.6, color: '#FFFFFF' }}>
                        {inspiration?.message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DailyBread;
