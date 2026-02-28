import { Moon, Sun, Menu, X, LogOut, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { logOut } from '../services/authService';
import { useState } from 'react';
import './Header.css';

const Header = ({ currentView, setCurrentView, authUser }) => {
    const { theme, toggleTheme } = useApp();
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Primary tabs shown in bottom bar (max 5 for mobile)
    const primaryTabs = [
        { id: 'dashboard', label: 'Home', icon: '📊' },
        { id: 'logger', label: 'Log', icon: '🍽️' },
        { id: 'fasting', label: 'Fasting', icon: '⏱️' },
        { id: 'progress', label: 'Progress', icon: '📈' },
        { id: 'more', label: 'More', icon: '⋯' }
    ];

    // All nav items for desktop + "More" menu
    const allNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'logger', label: 'Food Log', icon: '🍽️' },
        { id: 'photoLogger', label: 'AI Photo', icon: '📸' },
        { id: 'voiceLogger', label: 'Voice', icon: '🎙️' },
        { id: 'activity', label: 'Activity', icon: '🏃' },
        { id: 'progress', label: 'Progress', icon: '📈' },
        { id: 'fasting', label: 'Fasting', icon: '⏱️' },
        { id: 'coach', label: 'Coach', icon: '🧠' },
        { id: 'mealPlan', label: 'Meals', icon: '📅' },
        { id: 'groceryList', label: 'Groceries', icon: '🛒' },
        { id: 'social', label: 'Community', icon: '🌐' },
        { id: 'recipes', label: 'Recipes', icon: '📖' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    // Items shown in "More" menu on mobile
    const moreItems = allNavItems.filter(
        item => !['dashboard', 'logger', 'fasting', 'progress'].includes(item.id)
    );

    const handleLogout = async () => {
        await logOut();
        localStorage.removeItem('fuelflow_skipAuth');
        window.location.reload();
    };

    const handleNavClick = (id) => {
        if (id === 'more') {
            setShowMoreMenu(!showMoreMenu);
            return;
        }
        setCurrentView(id);
        setShowMoreMenu(false);
    };

    const isActiveInMore = moreItems.some(item => item.id === currentView);

    return (
        <>
            {/* Top Header Bar */}
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
                        {allNavItems.map(item => (
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
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Tab Bar */}
            <nav className="bottom-tab-bar">
                {primaryTabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`bottom-tab ${tab.id === 'more'
                            ? (showMoreMenu || isActiveInMore ? 'active' : '')
                            : currentView === tab.id ? 'active' : ''
                            }`}
                        onClick={() => handleNavClick(tab.id)}
                    >
                        <span className="bottom-tab-icon">{tab.icon}</span>
                        <span className="bottom-tab-label">{tab.label}</span>
                    </button>
                ))}
            </nav>

            {/* More Menu Overlay (Mobile) */}
            {showMoreMenu && (
                <>
                    <div className="more-overlay" onClick={() => setShowMoreMenu(false)} />
                    <div className="more-menu animate-slideUp">
                        <div className="more-menu-header">
                            <h3>More Options</h3>
                            <button className="btn btn-icon" onClick={() => setShowMoreMenu(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="more-menu-grid">
                            {moreItems.map(item => (
                                <button
                                    key={item.id}
                                    className={`more-menu-item ${currentView === item.id ? 'active' : ''}`}
                                    onClick={() => handleNavClick(item.id)}
                                >
                                    <span className="more-item-icon">{item.icon}</span>
                                    <span className="more-item-label">{item.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="more-menu-footer">
                            <button
                                className="more-menu-action"
                                onClick={toggleTheme}
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                            </button>
                            {authUser && (
                                <button className="more-menu-action logout" onClick={handleLogout}>
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Header;
