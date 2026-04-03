import React from 'react';
import { BookOpen, Target, LayoutDashboard, Utensils, Activity, Brain, Sparkles, CheckCircle2 } from 'lucide-react';

const UserManual = () => {
    return (
        <div className="container animate-fade-in-up" style={{ paddingBottom: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--gradient-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(61, 150, 140, 0.3)' }}>
                    <BookOpen color="white" size={32} />
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>FuelFlow User Manual</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Welcome to your Digital Staff. Review this guide to master balancing your mind, body, and spirit using the AI effectively.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                
                {/* Phase 1 */}
                <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-100)', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Target color="var(--primary-600)" size={24} />
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '8px' }}>Phase 1: Building Your Baseline</h3>
                        <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>
                            The AI cannot give you accurate recommendations without understanding who you are and where you want to go.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Primary Goal:</strong> Choose fat loss, muscle growth, or spiritual balance.</li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Diet & Food Needs:</strong> Input your history and dietary restrictions (e.g., Keto, Vegan).</li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Biometrics:</strong> Log sex, current weight, and target weight to generate your AI Blueprint.</li>
                        </ul>
                    </div>
                </div>

                {/* Phase 2 */}
                <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-100)', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <LayoutDashboard color="var(--primary-600)" size={24} />
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '8px' }}>Phase 2: The Command Center (Dashboard)</h3>
                        <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>
                            Think of the Dashboard as your daily cockpit. Use it to instantly see your metabolic reality.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Macro Rings:</strong> Visual rings for Protein, Carbs, and Fats that fill dynamically.</li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Calorie Summary:</strong> Track calories consumed versus remaining for the day.</li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Quick Actions:</strong> Jump straight into logging tests or starting your fasting timer.</li>
                        </ul>
                    </div>
                </div>

                {/* Phase 3 */}
                <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-100)', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Utensils color="var(--primary-600)" size={24} />
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '8px' }}>Phase 3: Fueling The Body (Logging)</h3>
                        <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>
                            FuelFlow makes tracking nutrition the easiest part of your day by providing three distinct tools.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px', flexShrink: 0}} /> <div><strong>The Food Log Arsenal:</strong> Use Standard Search, the Vision AI Photo Logger (snap photos for instant estimation), or Voice Logging (speak your meal out loud).</div></li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px', flexShrink: 0}} /> <div><strong>Meal Planner & Groceries:</strong> Generate an entire week constraint-based meal plans instantly. Click 'Sync to Groceries' to seamlessly build an aisle-sorted shopping list.</div></li>
                        </ul>
                    </div>
                </div>

                {/* Phase 4 */}
                <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-100)', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Activity color="var(--primary-600)" size={24} />
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '8px' }}>Phase 4: Fasting & Physical Tracking</h3>
                        <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>
                            True health requires extreme periods of rest and recovery.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Fasting Timer:</strong> Visual countdown for IF windows (like 16:8) to keep you accountable.</li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Body Measurements:</strong> Track waist, chest, and hip metrics to visualize body composition changes outside of the scale.</li>
                        </ul>
                    </div>
                </div>

                {/* Phase 5 */}
                <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', border: '2px solid var(--primary-500)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-primary)', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(61, 150, 140, 0.3)' }}>
                        <Brain color="white" size={24} />
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '8px' }}>Phase 5: Engaging The AI Coach (The Mind)</h3>
                        <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>
                            The most powerful feature of FuelFlow. Standard trackers leave you guessing; FuelFlow talks back.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Context-Aware Advice:</strong> Ask "Why am I so tired at 2pm?" and the Coach will read your macro data to identify exactly what is causing glycogen depletion.</li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--primary-500)" style={{marginTop: '4px'}} /> <strong>Plateau Breaking:</strong> Safe, mathematically-sound caloric recalculation if weight stalls.</li>
                        </ul>
                    </div>
                </div>

                {/* Phase 6 */}
                <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: 'linear-gradient(to right, var(--bg-secondary), rgba(251, 191, 36, 0.05))', borderRight: '4px solid var(--gold-500)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Sparkles color="var(--gold-500)" size={24} />
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '8px' }}>Phase 6: The Shepherd (The Spirit)</h3>
                        <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>
                            Physical burnout is almost always tied to emotional and spiritual exhaustion. Use the spiritual diary to heal at a foundational level.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--gold-500)" style={{marginTop: '4px'}} /> <strong>Spiritual Diary:</strong> Secure space to track daily gratitude and prayer entries.</li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><CheckCircle2 size={18} color="var(--gold-500)" style={{marginTop: '4px'}} /> <strong>The Shepherd AI:</strong> Receives your diary logs to deliver highly personalized scriptures and specific spiritual encouragement, bridging the gap between gym and sanctuary.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserManual;
