import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Plus, X, ShoppingCart, Copy, ChevronDown, ChevronUp, Trash2, Mic, Loader, Share2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { searchAllFoods } from '../services/foodService';
import PageScripture from './PageScripture';
import './MealPlanner.css';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

// Helper to get local ISO date string (YYYY-MM-DD)
const getLocalISODate = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
};

const MealPlanner = () => {
    const { user, addFoodLog, mealPlan, setMealPlan } = useApp();
    const [activeDateObj, setActiveDateObj] = useState(new Date());
    const activeDay = getLocalISODate(activeDateObj);

    const [addingTo, setAddingTo] = useState(null); // { day, mealType }
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showGroceryList, setShowGroceryList] = useState(false);

    // Voice Search State
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            handleSearch(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
            }
        };
    }, []);

    const toggleListening = () => {
        if (!speechSupported || !recognitionRef.current) return;
        
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error('Failed to start recognition:', e);
            }
        }
    };

    // Persist plan
    const savePlan = (newPlan) => {
        setMealPlan(newPlan);
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchAllFoods(query, 'all', true);
            setSearchResults(results.slice(0, 8));
        } catch (e) {
            setSearchResults([]);
        }
        setIsSearching(false);
    };

    // Helper to deeply merge/initialize a day structure
    const ensureDayExists = (plan, dayStr) => {
        if (!plan[dayStr]) {
            plan[dayStr] = {};
        }
        MEAL_TYPES.forEach(meal => {
            if (!plan[dayStr][meal]) {
                plan[dayStr][meal] = [];
            }
        });
        return plan;
    };

    const addFoodToPlan = (food) => {
        if (!addingTo) return;
        let newPlan = { ...mealPlan };
        newPlan = ensureDayExists(newPlan, addingTo.day);
        
        newPlan[addingTo.day][addingTo.mealType] = [
            ...newPlan[addingTo.day][addingTo.mealType],
            {
                id: Date.now() + Math.random(),
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fats: food.fats,
                baseCalories: food.calories,
                baseProtein: food.protein,
                baseCarbs: food.carbs,
                baseFats: food.fats,
                serving: food.serving,
                servings: 1
            }
        ];
        savePlan(newPlan);
        setAddingTo(null);
        setSearchQuery('');
        setSearchResults([]);
    };

    const logMealToDiary = (day, mealType) => {
        if (!mealPlan[day] || !mealPlan[day][mealType] || mealPlan[day][mealType].length === 0) return;
        
        mealPlan[day][mealType].forEach(food => {
            const servings = food.servings || 1;
            const logEntry = {
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fats: food.fats,
                serving: food.serving,
                servings: servings,
                mealType: mealType
            };
            addFoodLog(logEntry);
        });

        // Optional: show some temporary feedback that it worked
        const btn = document.getElementById(`log-btn-${day}-${mealType}`);
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span style="display:flex;align-items:center;gap:4px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Logged!</span>';
            btn.classList.add('btn-primary');
            btn.classList.remove('btn-outline');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline');
            }, 2000);
        }
    };

    const removeFromPlan = (day, mealType, index) => {
        const newPlan = { ...mealPlan };
        newPlan[day][mealType] = newPlan[day][mealType].filter((_, i) => i !== index);
        savePlan(newPlan);
    };

    const updateFoodServing = (day, mealType, index, newServings) => {
        if (newServings < 0.1 || isNaN(newServings)) return;
        const newPlan = { ...mealPlan };
        const food = newPlan[day][mealType][index];
        
        // Handle backwards compatibility for items saved before baseCalories existed
        if (food.baseCalories === undefined) {
            food.baseCalories = food.calories;
            food.baseProtein = food.protein;
            food.baseCarbs = food.carbs;
            food.baseFats = food.fats;
        }

        food.servings = newServings;
        food.calories = Math.round((food.baseCalories || 0) * newServings);
        food.protein = Math.round((food.baseProtein || 0) * newServings * 10) / 10;
        food.carbs = Math.round((food.baseCarbs || 0) * newServings * 10) / 10;
        food.fats = Math.round((food.baseFats || 0) * newServings * 10) / 10;
        savePlan(newPlan);
    };

    const clearDay = (day) => {
        let newPlan = { ...mealPlan };
        newPlan = ensureDayExists(newPlan, day);
        MEAL_TYPES.forEach(meal => {
            newPlan[day][meal] = [];
        });
        savePlan(newPlan);
    };

    const copyDay = (fromDay) => {
        // Calculate the next day manually from the ISO string
        const dateObj = new Date(fromDay + 'T12:00:00'); // Midday to avoid TZ shifts
        dateObj.setDate(dateObj.getDate() + 1);
        const nextDay = getLocalISODate(dateObj);
        
        let newPlan = { ...mealPlan };
        newPlan = ensureDayExists(newPlan, nextDay);
        
        if (mealPlan[fromDay]) {
            MEAL_TYPES.forEach(meal => {
                if (mealPlan[fromDay][meal]) {
                    newPlan[nextDay][meal] = mealPlan[fromDay][meal].map(f => ({ ...f, id: Date.now() + Math.random() }));
                }
            });
        }
        savePlan(newPlan);
    };

    // Day totals
    const getDayTotals = (day) => {
        let calories = 0, protein = 0, carbs = 0, fats = 0;
        if (mealPlan[day]) {
            MEAL_TYPES.forEach(meal => {
                if (mealPlan[day][meal]) {
                    mealPlan[day][meal].forEach(food => {
                        calories += food.calories;
                        protein += food.protein;
                        carbs += food.carbs;
                        fats += food.fats;
                    });
                }
            });
        }
        return { calories, protein, carbs, fats };
    };

    // Grocery list scoped to the current week (Sun-Sat) containing activeDay
    const generateGroceryList = () => {
        const items = {};
        
        // Find the Sunday of the week containing activeDay
        const currentDate = new Date(activeDay + 'T12:00:00');
        const dayOfWeek = currentDate.getDay(); // 0 (Sun) to 6 (Sat)
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
        
        // Build array of the 7 days in this week
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            weekDates.push(getLocalISODate(date));
        }

        weekDates.forEach(day => {
            if (mealPlan[day]) {
                MEAL_TYPES.forEach(meal => {
                    if (mealPlan[day][meal]) {
                        mealPlan[day][meal].forEach(food => {
                            const servingCount = food.servings || 1;
                            if (items[food.name]) {
                                items[food.name].count += servingCount;
                            } else {
                                items[food.name] = { name: food.name, serving: food.serving, count: servingCount };
                            }
                        });
                    }
                });
            }
        });
        return Object.values(items).sort((a, b) => a.name.localeCompare(b.name));
    };

    const handleShareList = async () => {
        if (groceryList.length === 0) return;
        
        const textToShare = `Weekly Grocery List:\n\n` + groceryList.map(item => 
            `• ${item.count > 1 ? `${item.count}x ` : ''}${item.serving} ${item.name}`
        ).join('\n');

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Grocery List',
                    text: textToShare
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback for desktop
            navigator.clipboard.writeText(textToShare);
            alert('Grocery list copied to clipboard!');
        }
    };

    const dayTotals = getDayTotals(activeDay);
    const groceryList = generateGroceryList();

    return (
        <div className="meal-planner animate-fadeIn">
            <PageScripture 
                verse="So whether you eat or drink or whatever you do, do it all for the glory of God."
                reference="1 Corinthians 10:31"
            />
            
            <div className="planner-header">
                <div>
                    <h1>Meal Planner 📅</h1>
                    <p>Plan your week's meals and generate grocery lists</p>
                </div>
                <button
                    className={`btn ${showGroceryList ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setShowGroceryList(!showGroceryList)}
                >
                    <ShoppingCart size={18} />
                    Grocery List ({groceryList.length})
                </button>
            </div>

            {/* Grocery List */}
            {showGroceryList && (
                <div className="grocery-list card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3><ShoppingCart size={20} /> Weekly Grocery List</h3>
                        <button className="btn btn-outline btn-sm" onClick={handleShareList}>
                            <Share2 size={16} /> Share List
                        </button>
                    </div>
                    {groceryList.length === 0 ? (
                        <p className="empty-grocery">Add foods to your meal plan to generate a grocery list</p>
                    ) : (
                        <div className="grocery-items">
                            {groceryList.map((item, i) => (
                                <div key={i} className="grocery-item">
                                    <span className="grocery-name">{item.name}</span>
                                    <span className="grocery-details">
                                        {item.count > 1 ? `${item.count}x ` : ''}{item.serving}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Day Selector - Infinite Calendar Slider */}
            <div className="date-slider-container">
                <button 
                    className="btn btn-icon date-nav-btn" 
                    onClick={() => {
                        const d = new Date(activeDateObj);
                        d.setDate(d.getDate() - 1);
                        setActiveDateObj(d);
                    }}
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="date-window">
                    {[-2, -1, 0, 1, 2].map(offset => {
                        const d = new Date(activeDateObj);
                        d.setDate(d.getDate() + offset);
                        const dateStr = getLocalISODate(d);
                        const isToday = offset === 0;
                        const totals = getDayTotals(dateStr);
                        const hasItems = totals.calories > 0;
                        
                        return (
                            <button
                                key={offset}
                                className={`date-tab ${isToday ? 'active' : ''} ${hasItems ? 'has-items' : ''}`}
                                onClick={() => setActiveDateObj(d)}
                            >
                                <span className="date-weekday">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className="date-number">{d.getDate()}</span>
                                {hasItems && <span className="date-dot" />}
                            </button>
                        );
                    })}
                </div>

                <button 
                    className="btn btn-icon date-nav-btn" 
                    onClick={() => {
                        const d = new Date(activeDateObj);
                        d.setDate(d.getDate() + 1);
                        setActiveDateObj(d);
                    }}
                >
                    <ChevronRight size={24} />
                </button>
                
                <div className="date-picker-wrapper">
                    <button className="btn btn-icon date-nav-btn" onClick={() => document.getElementById('jump-date').showPicker?.()}>
                        <Calendar size={20} />
                    </button>
                    <input 
                        type="date" 
                        id="jump-date"
                        className="hidden-date-input"
                        value={activeDay}
                        onChange={(e) => {
                            if (e.target.value) {
                                // Add midday time to avoid timezone offset pushing it back a day
                                setActiveDateObj(new Date(e.target.value + 'T12:00:00'));
                            }
                        }}
                    />
                </div>
            </div>

            {/* Day Summary */}
            <div className="day-summary card">
                <div className="day-summary-header">
                    <h3>{activeDay}</h3>
                    <div className="day-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => copyDay(activeDay)} title="Copy to next day">
                            <Copy size={14} /> Copy
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => clearDay(activeDay)} title="Clear day">
                            <Trash2 size={14} /> Clear
                        </button>
                    </div>
                </div>
                <div className="day-macros">
                    <div className="day-macro">
                        <span className="macro-val">{Math.round(dayTotals.calories)}</span>
                        <span className="macro-lbl">Calories</span>
                    </div>
                    <div className="day-macro">
                        <span className="macro-val">{Math.round(dayTotals.protein)}g</span>
                        <span className="macro-lbl">Protein</span>
                    </div>
                    <div className="day-macro">
                        <span className="macro-val">{Math.round(dayTotals.carbs)}g</span>
                        <span className="macro-lbl">Carbs</span>
                    </div>
                    <div className="day-macro">
                        <span className="macro-val">{Math.round(dayTotals.fats)}g</span>
                        <span className="macro-lbl">Fats</span>
                    </div>
                </div>
                {user.dailyCalories && (
                    <div className="calorie-bar">
                        <div
                            className="calorie-fill"
                            style={{ width: `${Math.min(100, (dayTotals.calories / user.dailyCalories) * 100)}%` }}
                        />
                        <span className="calorie-label">
                            {Math.round(dayTotals.calories)} / {user.dailyCalories} cal
                        </span>
                    </div>
                )}
            </div>

            {/* Meal Sections */}
            {MEAL_TYPES.map(mealType => (
                <div key={mealType} className="meal-section card">
                    <div className="meal-section-header">
                        <h4>
                            {mealType === 'breakfast' && '🌅 '}
                            {mealType === 'lunch' && '☀️ '}
                            {mealType === 'dinner' && '🌙 '}
                            {mealType === 'snack' && '🍪 '}
                            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                        </h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {mealPlan[activeDay]?.[mealType]?.length > 0 && (
                                <button
                                    id={`log-btn-${activeDay}-${mealType}`}
                                    className="btn btn-outline btn-sm"
                                    onClick={() => logMealToDiary(activeDay, mealType)}
                                    title={`Log ${mealType} to today's diary`}
                                >
                                    <Check size={14} /> Log Meal
                                </button>
                            )}
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setAddingTo(addingTo?.mealType === mealType ? null : { day: activeDay, mealType })}
                            >
                                {addingTo?.mealType === mealType ? <X size={14} /> : <Plus size={14} />}
                                {addingTo?.mealType === mealType ? 'Cancel' : 'Add'}
                            </button>
                        </div>
                    </div>

                    {/* Food Search */}
                    {addingTo?.mealType === mealType && (
                        <div className="add-food-search">
                            <div className="search-input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={isListening ? "Listening..." : "Search for a food..."}
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    autoFocus
                                    style={{ paddingRight: speechSupported ? '40px' : 'auto' }}
                                />
                                {speechSupported && (
                                    <button 
                                        className={`btn btn-icon btn-sm voice-search-btn ${isListening ? 'listening' : ''}`}
                                        onClick={toggleListening}
                                        title={isListening ? "Stop listening" : "Search by voice"}
                                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', padding: '4px', color: isListening ? 'var(--primary-500)' : 'var(--text-secondary)' }}
                                    >
                                        {isListening ? <Loader className="animate-spin" size={16} /> : <Mic size={16} />}
                                    </button>
                                )}
                            </div>
                            {searchResults.length > 0 && (
                                <div className="search-drop">
                                    {searchResults.map((food, i) => (
                                        <button
                                            key={i}
                                            className="search-drop-item"
                                            onClick={() => addFoodToPlan(food)}
                                        >
                                            <span>{food.name}</span>
                                            <span className="search-drop-cal">{food.calories} cal</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Food Items */}
                    {(!mealPlan[activeDay] || !mealPlan[activeDay][mealType] || mealPlan[activeDay][mealType].length === 0) ? (
                        <p className="meal-empty">No foods planned</p>
                    ) : (
                        <div className="meal-foods">
                            {mealPlan[activeDay][mealType].map((food, index) => (
                                <div key={food.id} className="planned-food">
                                    <div className="planned-food-info">
                                        <span className="planned-food-name">{food.name}</span>
                                        <span className="planned-food-serving">{food.serving}</span>
                                    </div>
                                    <div className="serving-control" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 'var(--radius-md)' }}>
                                        <button 
                                            className="btn btn-icon btn-sm" 
                                            onClick={() => updateFoodServing(activeDay, mealType, index, (food.servings || 1) - 1)}
                                            style={{ padding: '2px' }}
                                        >
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>-</span>
                                        </button>
                                        <input 
                                            type="number" 
                                            value={food.servings || 1} 
                                            onChange={(e) => updateFoodServing(activeDay, mealType, index, parseFloat(e.target.value) || 1)}
                                            style={{ width: '40px', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', fontWeight: 'bold', color: 'var(--text-primary)' }}
                                            step="0.5"
                                            min="0.1"
                                        />
                                        <button 
                                            className="btn btn-icon btn-sm" 
                                            onClick={() => updateFoodServing(activeDay, mealType, index, (food.servings || 1) + 1)}
                                            style={{ padding: '2px' }}
                                        >
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
                                        </button>
                                    </div>
                                    <div className="planned-food-macros">
                                        <span>{food.calories} cal</span>
                                        <span>P: {food.protein}g</span>
                                        <span>C: {food.carbs}g</span>
                                        <span>F: {food.fats}g</span>
                                    </div>
                                    <button
                                        className="btn btn-icon btn-sm"
                                        onClick={() => removeFromPlan(activeDay, mealType, index)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MealPlanner;
