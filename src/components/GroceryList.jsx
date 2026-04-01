import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Plus, Trash2, Check, ChevronDown, ChevronRight, Search, Share2, X } from 'lucide-react';
import './GroceryList.css';

// Grocery categories organized by store department (Mealime-style)
const DEPARTMENTS = [
    { id: 'produce', name: 'Produce', icon: '🥬', color: '#2ECC71' },
    { id: 'protein', name: 'Meat & Protein', icon: '🥩', color: '#E74C3C' },
    { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', color: '#3B72E6' },
    { id: 'bakery', name: 'Bakery & Bread', icon: '🍞', color: '#DAA520' },
    { id: 'grains', name: 'Grains & Pasta', icon: '🌾', color: '#E8943D' },
    { id: 'canned', name: 'Canned & Jarred', icon: '🥫', color: '#8B5CF6' },
    { id: 'frozen', name: 'Frozen', icon: '🧊', color: '#06B6D4' },
    { id: 'snacks', name: 'Snacks & Drinks', icon: '🥤', color: '#EC4899' },
    { id: 'condiments', name: 'Oils & Condiments', icon: '🫒', color: '#A07714' },
    { id: 'spices', name: 'Spices & Seasonings', icon: '🧂', color: '#C4941A' },
    { id: 'other', name: 'Other', icon: '🛒', color: '#6B7280' },
];

// Helper to guess department based on food name
const guessDepartment = (name) => {
    const n = name.toLowerCase();
    if (n.match(/chicken|beef|pork|salmon|tuna|turkey|steak|bacon|meat/)) return 'protein';
    if (n.match(/apple|banana|spinach|tomato|onion|garlic|potato|lettuce|carrot|avocado|lemon|lime|fruit|veg/)) return 'produce';
    if (n.match(/milk|cheese|yogurt|butter|egg/)) return 'dairy';
    if (n.match(/bread|bun|bagel|tortilla/)) return 'bakery';
    if (n.match(/rice|pasta|oats|quinoa|cereal/)) return 'grains';
    if (n.match(/oil|vinegar|sauce|dressing|mayo|ketchup|mustard/)) return 'condiments';
    if (n.match(/salt|pepper|cumin|oregano|cinnamon|spice|seasoning/)) return 'spices';
    return 'other';
};

const GroceryList = () => {
    const { mealPlan, groceryItems, setGroceryItems } = useApp();
    const items = groceryItems || {};
    const setItems = setGroceryItems;
    const [collapsedDepts, setCollapsedDepts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', qty: '', department: 'other' });
    const [hideChecked, setHideChecked] = useState(false);

    // Toggle item checked
    const toggleItem = (deptId, itemId) => {
        setItems(prev => ({
            ...prev,
            [deptId]: (prev[deptId] || []).map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            )
        }));
    };

    // Remove item
    const removeItem = (deptId, itemId) => {
        setItems(prev => ({
            ...prev,
            [deptId]: (prev[deptId] || []).filter(item => item.id !== itemId)
        }));
    };

    // Add new item
    const addItem = () => {
        if (!newItem.name.trim()) return;
        const dept = newItem.department;
        const newId = Date.now();
        setItems(prev => ({
            ...prev,
            [dept]: [...(prev[dept] || []), { id: newId, name: newItem.name, qty: newItem.qty || '1', checked: false }]
        }));
        setNewItem({ name: '', qty: '', department: 'other' });
        setShowAddModal(false);
    };

    // Toggle department collapse
    const toggleDept = (deptId) => {
        setCollapsedDepts(prev => ({ ...prev, [deptId]: !prev[deptId] }));
    };

    // Clear all checked
    const clearChecked = () => {
        const cleared = {};
        Object.keys(items).forEach(dept => {
            cleared[dept] = items[dept].filter(item => !item.checked);
        });
        setItems(cleared);
    };

    // Auto-sync from next 7 days of Meal Planner
    const syncFromMealPlan = () => {
        if (!mealPlan) return;
        
        const today = new Date();
        const dates = [];
        for(let i=0; i<7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const offset = d.getTimezoneOffset() * 60000;
            const localStr = new Date(d.getTime() - offset).toISOString().split('T')[0];
            dates.push(localStr);
        }

        const newItems = { ...items };
        let addedCount = 0;

        dates.forEach(day => {
            if(mealPlan[day]) {
                ['breakfast', 'lunch', 'dinner', 'snack'].forEach(meal => {
                    if(mealPlan[day][meal]) {
                        mealPlan[day][meal].forEach(food => {
                            const dept = guessDepartment(food.name);
                            if (!newItems[dept]) newItems[dept] = [];
                            
                            const exists = newItems[dept].find(i => i.name.toLowerCase() === food.name.toLowerCase());
                            if (!exists) {
                                newItems[dept].push({
                                    id: Date.now() + Math.random(),
                                    name: food.name,
                                    qty: `${food.servings || 1} x ${food.serving || 'serving'}`,
                                    checked: false,
                                    fromRecipe: meal
                                });
                                addedCount++;
                            }
                        });
                    }
                });
            }
        });

        if (addedCount > 0) {
            setItems(newItems);
            alert(`Auto-added ${addedCount} scheduled items to your grocery list!`);
        } else {
            alert("No new items found in your Meal Planner for the next 7 days.");
        }
    };

    // Count totals
    const totalItems = Object.values(items).flat().length;
    const checkedItems = Object.values(items).flat().filter(i => i.checked).length;
    const remainingItems = totalItems - checkedItems;

    // Filter items by search
    const filterItems = (deptItems) => {
        let filtered = deptItems || [];
        if (searchTerm) {
            filtered = filtered.filter(i =>
                i.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (hideChecked) {
            filtered = filtered.filter(i => !i.checked);
        }
        return filtered;
    };

    // Share as text
    const shareList = () => {
        let text = '🛒 FuelFlow Grocery List\n\n';
        DEPARTMENTS.forEach(dept => {
            const deptItems = filterItems(items[dept.id]);
            if (deptItems.length > 0) {
                text += `${dept.icon} ${dept.name}\n`;
                deptItems.forEach(item => {
                    text += `  ${item.checked ? '✅' : '⬜'} ${item.name} — ${item.qty}\n`;
                });
                text += '\n';
            }
        });
        navigator.clipboard?.writeText(text);
        alert('Grocery list copied to clipboard!');
    };

    return (
        <div className="grocery-list">
            {/* Header */}
            <div className="grocery-header">
                <div className="grocery-header-top">
                    <h2><ShoppingCart size={24} /> Grocery List</h2>
                    <div className="grocery-header-actions">
                        <button className="btn btn-sm btn-outline" onClick={syncFromMealPlan} title="Sync Weekly Meals">
                            🗓️ Auto-Sync
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={shareList} title="Copy list">
                            <Share2 size={18} />
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={() => setShowAddModal(true)}>
                            <Plus size={18} /> Add
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="grocery-progress">
                    <div className="grocery-progress-bar">
                        <div
                            className="grocery-progress-fill"
                            style={{ width: totalItems > 0 ? `${(checkedItems / totalItems) * 100}%` : '0%' }}
                        />
                    </div>
                    <span className="grocery-progress-text">
                        {checkedItems}/{totalItems} items • {remainingItems} remaining
                    </span>
                </div>

                {/* Search & filter */}
                <div className="grocery-search-row">
                    <div className="grocery-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className={`btn btn-sm ${hideChecked ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setHideChecked(!hideChecked)}
                    >
                        <Check size={16} /> {hideChecked ? 'Show All' : 'Hide Done'}
                    </button>
                    {checkedItems > 0 && (
                        <button className="btn btn-sm btn-ghost text-error" onClick={clearChecked}>
                            <Trash2 size={16} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Department Sections */}
            <div className="grocery-departments">
                {DEPARTMENTS.map(dept => {
                    const deptItems = filterItems(items[dept.id]);
                    if (deptItems.length === 0) return null;
                    const isCollapsed = collapsedDepts[dept.id];
                    const deptChecked = deptItems.filter(i => i.checked).length;

                    return (
                        <div key={dept.id} className="grocery-dept">
                            <button
                                className="grocery-dept-header"
                                onClick={() => toggleDept(dept.id)}
                            >
                                <div className="grocery-dept-left">
                                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                    <span className="grocery-dept-icon" style={{ backgroundColor: dept.color + '18', color: dept.color }}>
                                        {dept.icon}
                                    </span>
                                    <span className="grocery-dept-name">{dept.name}</span>
                                </div>
                                <span className="grocery-dept-count">
                                    {deptChecked > 0 && <span className="dept-checked">{deptChecked}/</span>}
                                    {deptItems.length}
                                </span>
                            </button>

                            {!isCollapsed && (
                                <div className="grocery-dept-items">
                                    {deptItems.map(item => (
                                        <div
                                            key={item.id}
                                            className={`grocery-item ${item.checked ? 'grocery-item-checked' : ''}`}
                                        >
                                            <button
                                                className="grocery-check"
                                                onClick={() => toggleItem(dept.id, item.id)}
                                                style={{ borderColor: item.checked ? dept.color : undefined, backgroundColor: item.checked ? dept.color : undefined }}
                                            >
                                                {item.checked && <Check size={14} color="white" />}
                                            </button>
                                            <div className="grocery-item-info">
                                                <span className="grocery-item-name">{item.name}</span>
                                                <span className="grocery-item-qty">{item.qty}</span>
                                                {item.fromRecipe && (
                                                    <span className="grocery-item-recipe">📖 {item.fromRecipe}</span>
                                                )}
                                            </div>
                                            <button
                                                className="grocery-item-delete"
                                                onClick={() => removeItem(dept.id, item.id)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {totalItems === 0 && (
                <div className="grocery-empty">
                    <span className="grocery-empty-icon">🛒</span>
                    <h3>Your list is empty</h3>
                    <p>Add items manually or generate from your meal plan</p>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} /> Add First Item
                    </button>
                </div>
            )}

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="grocery-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="grocery-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="grocery-modal-header">
                            <h3>Add Grocery Item</h3>
                            <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="grocery-modal-body">
                            <div className="form-group">
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Chicken Breast"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. 2 lbs"
                                    value={newItem.qty}
                                    onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    className="form-input"
                                    value={newItem.department}
                                    onChange={(e) => setNewItem({ ...newItem, department: e.target.value })}
                                >
                                    {DEPARTMENTS.map(d => (
                                        <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grocery-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={addItem}>Add Item</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroceryList;
