import { Moon, Sun, LogOut, ChevronDown, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { logOut } from '../services/authService';
import { useState, useRef, useEffect } from 'react';
import './Header.css';

const Header = ({ currentView, setCurrentView, authUser }) => {
    const { theme, toggleTheme } = useApp();
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    // Desktop nav: grouped into dropdowns
    const desktopNav = [
        { id: 'dashboard', label: 'Home', icon: '📊', type: 'link' },
        {
            label: 'Track', icon: '📝', type: 'dropdown',
            items: [
                { id: 'logger', label: 'Food Log', icon: '🍽️', desc: 'Search & log meals' },
                { id: 'photoLogger', label: 'AI Photo', icon: '📸', desc: 'Snap a photo to log' },
                { id: 'voiceLogger', label: 'Voice Log', icon: '🎙️', desc: 'Log by speaking' },
                { id: 'activity', label: 'Activity', icon: '🏃', desc: 'Track exercise' },
            ]
        },
        {
            label: 'Plan', icon: '📅', type: 'dropdown',
            items: [
                { id: 'mealPlan', label: 'Meal Planner', icon: '📅', desc: 'Plan your week' },
                { id: 'groceryList', label: 'Grocery List', icon: '🛒', desc: 'Shop by department' },
                { id: 'recipes', label: 'Recipes', icon: '📖', desc: 'Save favorites' },
                { id: 'coach', label: 'AI Coach', icon: '🧠', desc: 'Smart recommendations' },
            ]
        },
        { id: 'fasting', label: 'Fasting', icon: '⏱️', type: 'link' },
        { id: 'progress', label: 'Progress', icon: '📈', type: 'link' },
        { id: 'social', label: 'Community', icon: '🌐', type: 'link' },
    ];

    // Primary tabs for mobile bottom bar
    const primaryTabs = [
        { id: 'dashboard', label: 'Home', icon: '📊' },
        { id: 'logger', label: 'Log', icon: '🍽️' },
        { id: 'fasting', label: 'Fasting', icon: '⏱️' },
        { id: 'progress', label: 'Progress', icon: '📈' },
        { id: 'more', label: 'More', icon: '⋯' }
    ];

    // All items for mobile "More" menu
    const moreItems = [
        { id: 'photoLogger', label: 'AI Photo', icon: '📸' },
        { id: 'voiceLogger', label: 'Voice', icon: '🎙️' },
        { id: 'activity', label: 'Activity', icon: '🏃' },
        { id: 'coach', label: 'Coach', icon: '🧠' },
        { id: 'mealPlan', label: 'Meals', icon: '📅' },
        { id: 'groceryList', label: 'Groceries', icon: '🛒' },
        { id: 'social', label: 'Community', icon: '🌐' },
        { id: 'recipes', label: 'Recipes', icon: '📖' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        setOpenDropdown(null);
    };

    const toggleDropdown = (label) => {
        setOpenDropdown(openDropdown === label ? null : label);
    };

    // Check if current view is inside a dropdown
    const isViewInDropdown = (items) => {
        return items?.some(item => item.id === currentView);
    };

    const isActiveInMore = moreItems.some(item => item.id === currentView);

    return (
        <>
            {/* Top Header Bar */}
            <header className="header">
                <div className="header-container">
                    <div className="header-brand">
                        <div className="logo" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer' }}>
                            <span className="logo-icon">🔥</span>
                            <span className="logo-text gradient-text">FuelFlow</span>
                        </div>
                    </div>

                    {/* Desktop Navigation with Dropdowns */}
                    <nav className="nav-desktop" ref={dropdownRef}>
                        {desktopNav.map((navItem, idx) => {
                            if (navItem.type === 'link') {
                                return (
                                    <button
                                        key={navItem.id}
                                        className={`nav-item ${currentView === navItem.id ? 'active' : ''}`}
                                        onClick={() => handleNavClick(navItem.id)}
                                    >
                                        <span className="nav-icon">{navItem.icon}</span>
                                        <span>{navItem.label}</span>
                                    </button>
                                );
                            }

                            // Dropdown
                            const isOpen = openDropdown === navItem.label;
                            const hasActive = isViewInDropdown(navItem.items);

                            return (
                                <div key={navItem.label} className="nav-dropdown-wrapper">
                                    <button
                                        className={`nav-item nav-dropdown-trigger ${hasActive ? 'active' : ''}`}
                                        onClick={() => toggleDropdown(navItem.label)}
                                    >
                                        <span className="nav-icon">{navItem.icon}</span>
                                        <span>{navItem.label}</span>
                                        <ChevronDown size={14} className={`dropdown-chevron ${isOpen ? 'open' : ''}`} />
                                    </button>

                                    {isOpen && (
                                        <div className="nav-dropdown-menu">
                                            {navItem.items.map(sub => (
                                                <button
                                                    key={sub.id}
                                                    className={`nav-dropdown-item ${currentView === sub.id ? 'active' : ''}`}
                                                    onClick={() => handleNavClick(sub.id)}
                                                >
                                                    <span className="nav-dropdown-icon">{sub.icon}</span>
                                                    <div className="nav-dropdown-text">
                                                        <span className="nav-dropdown-label">{sub.label}</span>
                                                        {sub.desc && <span className="nav-dropdown-desc">{sub.desc}</span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    <div className="header-actions">
                        <button
                            className={`nav-item nav-settings ${currentView === 'settings' ? 'active' : ''}`}
                            onClick={() => handleNavClick('settings')}
                            title="Settings"
                        >
                            ⚙️
                        </button>
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
