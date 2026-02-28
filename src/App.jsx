import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { onAuthChange } from './services/authService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FoodLogger from './components/FoodLogger';
import PhotoLogger from './components/PhotoLogger';
import VoiceLogger from './components/VoiceLogger';
import ActivityTracker from './components/ActivityTracker';
import RecipeManager from './components/RecipeManager';
import ProgressCharts from './components/ProgressCharts';
import FastingTimer from './components/FastingTimer';
import AdaptiveCoach from './components/AdaptiveCoach';
import MealPlanner from './components/MealPlanner';
import SocialFeed from './components/SocialFeed';
import Settings from './components/Settings';
import Login from './components/Login';
import SignUp from './components/SignUp';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [authUser, setAuthUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [skipAuth, setSkipAuth] = useState(() => {
    return localStorage.getItem('fuelflow_skipAuth') === 'true';
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSkipAuth = () => {
    setSkipAuth(true);
    localStorage.setItem('fuelflow_skipAuth', 'true');
  };

  // Show auth screen if not logged in and not skipped
  if (authLoading) {
    return (
      <div className="auth-page">
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '4rem' }}>🔥</span>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading FuelFlow...</p>
        </div>
      </div>
    );
  }

  if (!authUser && !skipAuth) {
    if (authView === 'signup') {
      return <SignUp onSwitch={() => setAuthView('login')} onSkip={handleSkipAuth} />;
    }
    return <Login onSwitch={() => setAuthView('signup')} onSkip={handleSkipAuth} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setCurrentView={setCurrentView} />;
      case 'logger':
        return <FoodLogger />;
      case 'photoLogger':
        return <PhotoLogger />;
      case 'voiceLogger':
        return <VoiceLogger />;
      case 'activity':
        return <ActivityTracker />;
      case 'progress':
        return <ProgressCharts />;
      case 'fasting':
        return <FastingTimer />;
      case 'coach':
        return <AdaptiveCoach />;
      case 'mealPlan':
        return <MealPlanner />;
      case 'social':
        return <SocialFeed />;
      case 'recipes':
        return <RecipeManager />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  return (
    <AppProvider>
      <div className="app">
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          authUser={authUser}
        />
        <main className="main-content">
          {renderView()}
        </main>
        <footer className="footer">
          <p>© 2026 FuelFlow - Fuel your body, flow through life 🔥</p>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;
