import { Moon, Sun, Menu, X, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { logOut } from '../services/authService';
import { useState } from 'react';
import './Header.css';

const Header = ({ currentView, setCurrentView, authUser }) => {
    const { theme, toggleTheme } = useApp();
    const [menuOpen, setMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'logger', label: 'Food Log', icon: '🍽️' },
        { id: 'photoLogger', label: 'AI Photo', icon: '📸' },
        { id: 'voiceLogger', label: 'Voice', icon: '🎙️' },
        { id: 'activity', label: 'Activity', icon: '🏃' },
        { id: 'progress', label: 'Progress', icon: '📈' },
        { id: 'fasting', label: 'Fasting', icon: '⏱️' },
        { id: 'coach', label: 'Coach', icon: '🧠' },
        { id: 'mealPlan', label: 'Meals', icon: '📅' },
        { id: 'social', label: 'Community', icon: '🌐' },
        { id: 'recipes', label: 'Recipes', icon: '📖' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    const handleLogout = async () => {
        await logOut();
        localStorage.removeItem('fuelflow_skipAuth');
        window.location.reload();
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-brand">
                    <div className="logo">
                        <span className="logo-icon">🔥</span>
                        <span className="logo-text gradient-text">FuelFlow</span>
                    </div>
                    <span className="tagline">Fuel your body, flow through life</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="nav-desktop">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => setCurrentView(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
                    {authUser && (
                        <button
                            className="btn btn-icon"
                            onClick={handleLogout}
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                    <button
                        className="btn btn-icon theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="btn btn-icon mobile-menu-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {menuOpen && (
                <nav className="nav-mobile animate-fadeIn">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item-mobile ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentView(item.id);
                                setMenuOpen(false);
                            }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                    {authUser && (
                        <button
                            className="nav-item-mobile"
                            onClick={handleLogout}
                        >
                            <span className="nav-icon">🚪</span>
                            <span>Sign Out</span>
                        </button>
                    )}
                </nav>
            )}
        </header>
    );
};

export default Header;
