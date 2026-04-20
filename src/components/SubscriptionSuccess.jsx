import { useEffect, useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import './PremiumGate.css';

export default function SubscriptionSuccess({ onContinue }) {
    const { isPremium, subscriptionLoading } = useSubscription();

    return (
        <div className="premium-gate">
            <div className="premium-gate-card" style={{ borderColor: 'rgba(0, 255, 100, 0.4)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {isPremium ? '🎉' : '⏳'}
                </div>

                <h2 className="premium-gate-title">
                    {isPremium ? 'Welcome to Premium!' : 'Activating Premium...'}
                </h2>

                <p className="premium-gate-description">
                    {isPremium
                        ? 'Your Whittle Vitalio Premium subscription is now active. All features are unlocked!'
                        : 'Securely finalizing your subscription with Stripe. This usually takes about 5 seconds...'
                    }
                </p>

                {isPremium && (
                    <>
                        <div className="premium-gate-divider" />

                        <ul className="premium-gate-features" style={{ marginTop: '1.5rem' }}>
                            <li>📸 AI Photo Scanner ✅</li>
                            <li>🎤 Voice Logger ✅</li>
                            <li>📊 Progress Charts ✅</li>
                            <li>📅 Meal Planner ✅</li>
                            <li>🛒 Grocery Lists ✅</li>
                            <li>🧠 AI Coach ✅</li>
                            <li>🏃 Activity Tracker ✅</li>
                            <li>👥 Social Feed ✅</li>
                        </ul>

                        <button
                            className="premium-gate-subscribe-btn"
                            onClick={onContinue}
                            style={{ background: 'linear-gradient(135deg, #00c853, #00e676)' }}
                        >
                            🚀 Start Exploring Premium!
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
