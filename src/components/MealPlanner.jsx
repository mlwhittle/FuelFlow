import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Plus, X, ShoppingCart, Copy, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { searchAllFoods } from '../services/foodService';
import './MealPlanner.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const MealPlanner = () => {
    const { user } = useApp();
    const [mealPlan, setMealPlan] = useState(() => {
        const saved = localStorage.getItem('fuelflow_mealPlan');
        if (saved) return JSON.parse(saved);
        // Initialize empty plan
        const plan = {};
        DAYS.forEach(day => {
            plan[day] = {};
            MEAL_TYPES.forEach(meal => {
                plan[day][meal] = [];
            });
        });
        return plan;
    });

    const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
    const [addingTo, setAddingTo] = useState(null); // { day, mealType }
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showGroceryList, setShowGroceryList] = useState(false);

    // Persist plan
    const savePlan = (newPlan) => {
        setMealPlan(newPlan);
        localStorage.setItem('fuelflow_mealPlan', JSON.stringify(newPlan));
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

    const addFoodToPlan = (food) => {
        if (!addingTo) return;
        const newPlan = { ...mealPlan };
        newPlan[addingTo.day][addingTo.mealType] = [
            ...newPlan[addingTo.day][addingTo.mealType],
            {
                id: Date.now() + Math.random(),
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fats: food.fats,
                serving: food.serving
            }
        ];
        savePlan(newPlan);
        setAddingTo(null);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeFromPlan = (day, mealType, index) => {
        const newPlan = { ...mealPlan };
        newPlan[day][mealType] = newPlan[day][mealType].filter((_, i) => i !== index);
        savePlan(newPlan);
    };

    const clearDay = (day) => {
        const newPlan = { ...mealPlan };
        MEAL_TYPES.forEach(meal => {
            newPlan[day][meal] = [];
        });
        savePlan(newPlan);
    };

    const copyDay = (fromDay) => {
        const dayIndex = DAYS.indexOf(fromDay);
        const nextDay = DAYS[(dayIndex + 1) % 7];
        const newPlan = { ...mealPlan };
        MEAL_TYPES.forEach(meal => {
            newPlan[nextDay][meal] = mealPlan[fromDay][meal].map(f => ({ ...f, id: Date.now() + Math.random() }));
        });
        savePlan(newPlan);
    };

    // Day totals
    const getDayTotals = (day) => {
        let calories = 0, protein = 0, carbs = 0, fats = 0;
        MEAL_TYPES.forEach(meal => {
            mealPlan[day][meal].forEach(food => {
                calories += food.calories;
                protein += food.protein;
                carbs += food.carbs;
                fats += food.fats;
            });
        });
        return { calories, protein, carbs, fats };
    };

    // Grocery list
    const generateGroceryList = () => {
        const items = {};
        DAYS.forEach(day => {
            MEAL_TYPES.forEach(meal => {
                mealPlan[day][meal].forEach(food => {
                    if (items[food.name]) {
                        items[food.name].count++;
                    } else {
                        items[food.name] = { name: food.name, serving: food.serving, count: 1 };
                    }
                });
            });
        });
        return Object.values(items).sort((a, b) => a.name.localeCompare(b.name));
    };

    const dayTotals = getDayTotals(activeDay);
    const groceryList = generateGroceryList();

    return (
        <div className="meal-planner animate-fadeIn">
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
                    <h3><ShoppingCart size={20} /> Weekly Grocery List</h3>
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

            {/* Day Selector */}
            <div className="day-tabs">
                {DAYS.map(day => {
                    const totals = getDayTotals(day);
                    const hasItems = totals.calories > 0;
                    return (
                        <button
                            key={day}
                            className={`day-tab ${activeDay === day ? 'active' : ''} ${hasItems ? 'has-items' : ''}`}
                            onClick={() => setActiveDay(day)}
                        >
                            <span className="day-short">{day.slice(0, 3)}</span>
                            {hasItems && <span className="day-cal">{totals.calories}</span>}
                        </button>
                    );
                })}
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
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setAddingTo(addingTo?.mealType === mealType ? null : { day: activeDay, mealType })}
                        >
                            {addingTo?.mealType === mealType ? <X size={14} /> : <Plus size={14} />}
                            {addingTo?.mealType === mealType ? 'Cancel' : 'Add'}
                        </button>
                    </div>

                    {/* Food Search */}
                    {addingTo?.mealType === mealType && (
                        <div className="add-food-search">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search for a food..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoFocus
                            />
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
                    {mealPlan[activeDay][mealType].length === 0 ? (
                        <p className="meal-empty">No foods planned</p>
                    ) : (
                        <div className="meal-foods">
                            {mealPlan[activeDay][mealType].map((food, index) => (
                                <div key={food.id} className="planned-food">
                                    <div className="planned-food-info">
                                        <span className="planned-food-name">{food.name}</span>
                                        <span className="planned-food-serving">{food.serving}</span>
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
