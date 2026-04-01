import React, { useState, useEffect } from 'react';
import { Brain, Target, Activity, ChevronRight, User, TrendingDown, TrendingUp, Sparkles, CheckCircle2, Apple, History } from 'lucide-react';
import { useApp } from '../context/AppContext';

const OnboardingFlow = ({ onComplete }) => {
    const { user, setUser } = useApp();
    const [step, setStep] = useState(1);
    
    // Internal Wizard State
    const [primaryGoal, setPrimaryGoal] = useState('');
    const [dietHistory, setDietHistory] = useState('');
    const [foodNeeds, setFoodNeeds] = useState('');
    const [gender, setGender] = useState('');
    const [weight, setWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    
    const [computationStage, setComputationStage] = useState(0);

    // Simulated AI Computation Steps
    const computingTexts = [
        "Analyzing physical biometrics...",
        "Processing dietary history & preferences...",
        "Calculating optimal macronutrient targets...",
        "Calibrating spiritual baseline routines...",
        "Generating Custom FuelFlow Blueprint..."
    ];

    useEffect(() => {
        if (step === 7) {
            // Run the fake 'computation' loop to build sunk-cost anticipation
            let currentStage = 0;
            const interval = setInterval(() => {
                currentStage++;
                if (currentStage < computingTexts.length) {
                    setComputationStage(currentStage);
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        setStep(8);
                    }, 800);
                }
            }, 1200); // 1.2s per simulated stage

            return () => clearInterval(interval);
        }
    }, [step]);

    const handleNext = () => {
        if (step < 7) setStep(step + 1);
    };

    const completeOnboarding = () => {
        setUser(prev => ({
            ...prev,
            gender,
            weight: parseFloat(weight) || prev.weight,
            targetWeight: parseFloat(goalWeight) || prev.targetWeight,
            goal: primaryGoal,
            dietHistory,
            foodNeeds
        }));
        onComplete();
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            width: '100%',
            background: 'var(--gradient-bg)',
            padding: '24px',
            color: 'var(--text-primary)',
            fontFamily: "'Outfit', sans-serif"
        }}>
            
            <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Header Progress */}
                {step > 1 && step < 6 && (
                    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Activity color="white" size={16} />
                            </div>
                            FuelFlow
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                            STEP {step - 1} OF 4
                        </div>
                    </div>
                )}

                {/* STEP 1: Welcome Page */}
                {step === 1 && (
                    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '32px', paddingTop: '40px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--gradient-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 32px rgba(61, 150, 140, 0.3)' }}>
                            <Activity color="white" size={40} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.8rem, 8vw, 2.5rem)', marginBottom: '16px', lineHeight: 1.2, color: 'var(--text-primary)' }}>Welcome to the first day of your changed life.</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                                Let's build a lifelong success journey that transforms your eating habits, achieves your goals, and elevates your mind, body, and soul.
                            </p>
                        </div>
                        <button 
                            onClick={handleNext}
                            style={{
                                padding: '20px 48px',
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                borderRadius: '99px',
                                fontWeight: '800',
                                fontSize: '1.2rem',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                width: '100%',
                                marginTop: '16px',
                                boxShadow: '0 8px 24px rgba(61, 150, 140, 0.25)'
                            }}
                        >
                            Let's Go
                        </button>
                    </div>
                )}

                {/* STEP 2: Primary Goal */}
                {step === 2 && (
                    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', marginBottom: '8px', lineHeight: 1.2 }}>What is your primary objective?</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>We will tailor the Digital Staff to rigorously pursue this exact outcome.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { id: 'lose_fat', label: 'Lose Body Fat', desc: 'Aggressive calorie deficits & macro tracking.', icon: <TrendingDown color="var(--primary-500)" /> },
                                { id: 'build_muscle', label: 'Build Lean Muscle', desc: 'Protein surplus & heavy resistance tracking.', icon: <TrendingUp color="var(--primary-500)" /> },
                                { id: 'spiritual_balance', label: 'Mind, Body, & Spirit', desc: 'Focus on fasting, mental health, and complete balance.', icon: <Sparkles color="var(--gold-500)" /> }
                            ].map(g => (
                                <div 
                                    key={g.id}
                                    onClick={() => setPrimaryGoal(g.label)}
                                    style={{
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: `2px solid ${primaryGoal === g.label ? 'var(--primary-500)' : 'var(--border-color)'}`,
                                        background: primaryGoal === g.label ? 'var(--primary-100)' : 'var(--bg-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: primaryGoal === g.label ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                                    }}
                                >
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {g.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{g.label}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{g.desc}</div>
                                    </div>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${primaryGoal === g.label ? 'var(--primary-500)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {primaryGoal === g.label && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-500)' }} />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleNext}
                            disabled={!primaryGoal}
                            style={{
                                padding: '18px',
                                background: !primaryGoal ? 'var(--bg-tertiary)' : 'var(--gradient-primary)',
                                color: !primaryGoal ? 'var(--text-tertiary)' : 'white',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                border: 'none',
                                cursor: !primaryGoal ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '16px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Continue <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                )}

                {/* STEP 3: Dietary History */}
                {step === 3 && (
                    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', marginBottom: '8px', lineHeight: 1.2 }}>Have you dieted before?</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>This helps the AI understand your metabolic adaptability and design a realistic protocol.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { id: 'many', label: 'Yes, many times', desc: 'I have successfully and unsuccessfully tried multiple diets.' },
                                { id: 'few', label: 'A few times', desc: 'I have tried to diet once or twice in the past.' },
                                { id: 'never', label: 'No, this is my first time', desc: 'I am completely new to structured nutrition.' }
                            ].map(g => (
                                <div 
                                    key={g.id}
                                    onClick={() => setDietHistory(g.label)}
                                    style={{
                                        padding: '24px',
                                        borderRadius: '16px',
                                        border: `2px solid ${dietHistory === g.label ? 'var(--primary-500)' : 'var(--border-color)'}`,
                                        background: dietHistory === g.label ? 'var(--primary-100)' : 'var(--bg-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: dietHistory === g.label ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{g.label}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{g.desc}</div>
                                    </div>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${dietHistory === g.label ? 'var(--primary-500)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {dietHistory === g.label && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary-500)' }} />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleNext}
                            disabled={!dietHistory}
                            style={{
                                padding: '18px',
                                background: !dietHistory ? 'var(--bg-tertiary)' : 'var(--gradient-primary)',
                                color: !dietHistory ? 'var(--text-tertiary)' : 'white',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                border: 'none',
                                cursor: !dietHistory ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '16px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Continue <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                )}

                {/* STEP 4: Dietary Needs */}
                {step === 4 && (
                    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', marginBottom: '8px', lineHeight: 1.2 }}>What are your food needs?</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>The AI will only generate meals and recipes that match your exact dietary profile.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { id: 'none', label: 'No Restrictions', desc: 'I eat everything.' },
                                { id: 'keto', label: 'Keto / Low-Carb', desc: 'High fat, moderate protein, minimal carbs.' },
                                { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat or poultry.' },
                                { id: 'vegan', label: 'Vegan', desc: '100% plant-based diet.' },
                                { id: 'paleo', label: 'Paleo', desc: 'Whole foods, no processed grains or dairy.' }
                            ].map(g => (
                                <div 
                                    key={g.id}
                                    onClick={() => setFoodNeeds(g.label)}
                                    style={{
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        border: `2px solid ${foodNeeds === g.label ? 'var(--primary-500)' : 'var(--border-color)'}`,
                                        background: foodNeeds === g.label ? 'var(--primary-100)' : 'var(--bg-secondary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: foodNeeds === g.label ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Apple color={foodNeeds === g.label ? "var(--primary-600)" : "var(--text-tertiary)"} size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-primary)' }}>{g.label}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{g.desc}</div>
                                    </div>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${foodNeeds === g.label ? 'var(--primary-500)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {foodNeeds === g.label && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-500)' }} />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleNext}
                            disabled={!foodNeeds}
                            style={{
                                padding: '18px',
                                background: !foodNeeds ? 'var(--bg-tertiary)' : 'var(--gradient-primary)',
                                color: !foodNeeds ? 'var(--text-tertiary)' : 'white',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                border: 'none',
                                cursor: !foodNeeds ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '16px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Continue <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                )}

                {/* STEP 5: Basic Biometrics */}
                {step === 5 && (
                    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', marginBottom: '8px', lineHeight: 1.2 }}>Let's build your physical baseline.</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>The AI Coach needs your current metrics to finalize your exact formulas.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Biological Sex (For BMR Calculation)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                                    {['Male', 'Female'].map(g => (
                                        <button 
                                            key={g}
                                            onClick={() => setGender(g)}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: `2px solid ${gender === g ? 'var(--primary-500)' : 'var(--border-color)'}`,
                                                background: gender === g ? 'var(--primary-100)' : 'var(--bg-secondary)',
                                                color: gender === g ? 'var(--primary-800)' : 'var(--text-primary)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: gender === g ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                                            }}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current Weight (lbs)</label>
                                <div style={{ position: 'relative' }}>
                                    <User color="var(--text-tertiary)" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="number" 
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="e.g. 185"
                                        style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1.1rem' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Target Weight (lbs)</label>
                                <div style={{ position: 'relative' }}>
                                    <Target color="var(--text-tertiary)" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="number" 
                                        value={goalWeight}
                                        onChange={(e) => setGoalWeight(e.target.value)}
                                        placeholder="e.g. 160"
                                        style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1.1rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleNext}
                            disabled={!gender || !weight || !goalWeight}
                            style={{
                                padding: '18px',
                                background: (!gender || !weight || !goalWeight) ? 'var(--bg-tertiary)' : 'var(--gradient-primary)',
                                color: (!gender || !weight || !goalWeight) ? 'var(--text-tertiary)' : 'white',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                border: 'none',
                                cursor: (!gender || !weight || !goalWeight) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '16px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Finalize Profile <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                )}

                {/* STEP 6 & 7: Simulated AI Computation Screen */}
                {(step === 6 || step === 7) && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '32px' }}>
                        
                        {/* Fake spinner logic (Step 6 asks user to trigger it, Step 7 runs it) */}
                        {step === 6 ? (
                            <>
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary-100)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Brain color="var(--primary-600)" size={40} />
                                </div>
                                <div>
                                    <h1 style={{ fontSize: 'clamp(1.8rem, 8vw, 2.4rem)', marginBottom: '16px', color: 'var(--text-primary)' }}>Ready to build your Blueprint?</h1>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '350px', margin: '0 auto' }}>
                                        The Adaptive Coach will now synthesize your inputs, biometrics, and dietary history to generate your lifelong protocol.
                                    </p>
                                </div>
                                <button 
                                    onClick={handleNext}
                                    style={{
                                        padding: '20px 48px',
                                        background: 'var(--gradient-primary)',
                                        color: 'white',
                                        borderRadius: '99px',
                                        fontWeight: '800',
                                        fontSize: '1.2rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 30px rgba(61, 150, 140, 0.3)',
                                        marginTop: '16px'
                                    }}
                                >
                                    Activate AI Generation
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Loading Ring */}
                                <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--border-color)', borderRadius: '50%' }}></div>
                                    <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--primary-500)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                                    <Brain color="var(--primary-500)" size={40} className="animate-pulse" />
                                </div>

                                <div style={{ height: '120px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {computingTexts.map((text, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                display: idx <= computationStage ? 'flex' : 'none', 
                                                alignItems: 'center', 
                                                gap: '12px',
                                                color: idx === computationStage ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                                fontWeight: idx === computationStage ? '600' : '400',
                                                opacity: idx === computationStage ? 1 : 0.6
                                            }}
                                        >
                                            {idx < computationStage ? <CheckCircle2 size={18} color="var(--gold-500)" /> : <div style={{ width: '18px' }} />}
                                            {text}
                                        </div>
                                    ))}
                                </div>
                                
                                <style>{`
                                    @keyframes spin { 100% { transform: rotate(360deg); } }
                                    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.95); } }
                                    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                                `}</style>
                            </>
                        )}
                    </div>
                )}

                {/* STEP 8: Medical Disclaimer */}
                {step === 8 && (
                    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
                        <div style={{ padding: '32px 24px', background: 'rgba(239, 68, 68, 0.05)', border: '2px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px' }}>
                            <Activity color="#EF4444" size={48} style={{ margin: '0 auto 16px' }} />
                            <h1 style={{ fontSize: '1.8rem', color: '#EF4444', marginBottom: '16px' }}>Medical Disclaimer</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, textAlign: 'left' }}>
                                Before we reveal your custom FuelFlow Blueprint, you must acknowledge that FuelFlow is <strong>not a medical provider</strong> and the AI Coach is <strong>not a doctor</strong>.
                                <br/><br/>
                                This platform provides educational tools for tracking extreme fasting, macros, and workout regimens. You should <strong>always consult your physician</strong> before beginning any new diet or fitness program. By proceeding, you accept full responsibility for your health.
                            </p>
                        </div>
                        <button 
                            onClick={completeOnboarding}
                            style={{
                                padding: '20px',
                                background: '#EF4444',
                                color: 'white',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                border: 'none',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            I Agree & Understand
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OnboardingFlow;
