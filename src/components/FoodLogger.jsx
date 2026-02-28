import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, X, Barcode, Loader, Camera } from 'lucide-react';
import { searchAllFoods, isEnhancedSearchAvailable } from '../services/foodService';
import { lookupBarcode } from '../services/barcodeService';
import { categories } from '../data/foodDatabase';
import './FoodLogger.css';

const FoodLogger = () => {
    const { addFoodLog, getTodayData } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFood, setSelectedFood] = useState(null);
    const [servings, setServings] = useState(1);
    const [mealType, setMealType] = useState('breakfast');
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [useUSDASearch, setUseUSDASearch] = useState(true);

    // Barcode scanner state
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
    const [barcodeScanning, setBarcodeScanning] = useState(false);
    const [barcodeResult, setBarcodeResult] = useState(null);
    const [barcodeError, setBarcodeError] = useState('');
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    // Manual entry state
    const [manualFood, setManualFood] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: ''
    });

    const todayData = getTodayData();
    const enhancedSearchAvailable = isEnhancedSearchAvailable();

    // Debounced search effect for USDA API
    useEffect(() => {
        const performSearch = async () => {
            if (!searchQuery || searchQuery.trim().length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchAllFoods(searchQuery, selectedCategory, useUSDASearch);
                setSearchResults(results);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce search by 500ms
        const timeoutId = setTimeout(performSearch, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedCategory, useUSDASearch]);

    // Cleanup barcode scanner on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const handleSelectFood = (food) => {
        setSelectedFood(food);
        setServings(1);
    };

    const handleAddFood = () => {
        if (!selectedFood) return;

        const foodLog = {
            name: selectedFood.name,
            calories: Math.round(selectedFood.calories * servings),
            protein: Math.round(selectedFood.protein * servings * 10) / 10,
            carbs: Math.round(selectedFood.carbs * servings * 10) / 10,
            fats: Math.round(selectedFood.fats * servings * 10) / 10,
            serving: selectedFood.serving,
            servings: servings,
            mealType: mealType
        };

        addFoodLog(foodLog);
        setSelectedFood(null);
        setServings(1);
        setSearchQuery('');
    };

    const handleAddManualFood = () => {
        if (!manualFood.name || !manualFood.calories) return;

        const foodLog = {
            name: manualFood.name,
            calories: parseFloat(manualFood.calories) || 0,
            protein: parseFloat(manualFood.protein) || 0,
            carbs: parseFloat(manualFood.carbs) || 0,
            fats: parseFloat(manualFood.fats) || 0,
            serving: 'Custom',
            servings: 1,
            mealType: mealType
        };

        addFoodLog(foodLog);
        setManualFood({ name: '', calories: '', protein: '', carbs: '', fats: '' });
        setShowManualEntry(false);
    };

    // Barcode Scanner
    const handleBarcodeScanner = async () => {
        setShowBarcodeScanner(true);
        setBarcodeResult(null);
        setBarcodeError('');
        setBarcodeScanning(true);

        // Dynamic import to avoid bundling issues
        try {
            const { Html5Qrcode } = await import('html5-qrcode');

            // Wait for DOM element
            await new Promise(resolve => setTimeout(resolve, 300));

            if (!document.getElementById('barcode-reader')) {
                setBarcodeError('Scanner element not found');
                setBarcodeScanning(false);
                return;
            }

            const html5QrCode = new Html5Qrcode('barcode-reader');
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 280, height: 150 },
                    aspectRatio: 1.5
                },
                async (decodedText) => {
                    // Success - barcode scanned
                    await html5QrCode.stop();
                    html5QrCodeRef.current = null;
                    setBarcodeScanning(false);

                    // Look up the product
                    setBarcodeError('');
                    setBarcodeResult({ barcode: decodedText, loading: true });

                    const product = await lookupBarcode(decodedText);

                    if (product) {
                        setBarcodeResult({ barcode: decodedText, product, loading: false });
                    } else {
                        setBarcodeResult({ barcode: decodedText, loading: false });
                        setBarcodeError(`Product not found for barcode: ${decodedText}. Try manual entry.`);
                    }
                },
                () => { /* Ignore scan failures */ }
            );
        } catch (err) {
            console.error('Barcode scanner error:', err);
            setBarcodeScanning(false);
            setBarcodeError(
                err.name === 'NotAllowedError'
                    ? 'Camera access denied. Please allow camera permissions and try again.'
                    : 'Could not start camera. Try using a different browser or device.'
            );
        }
    };

    const closeBarcodeScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (e) { /* ignore */ }
            html5QrCodeRef.current = null;
        }
        setShowBarcodeScanner(false);
        setBarcodeResult(null);
        setBarcodeError('');
        setBarcodeScanning(false);
    };

    const handleAddBarcodeProduct = () => {
        if (!barcodeResult?.product) return;
        const p = barcodeResult.product;
        handleSelectFood({
            id: p.id,
            name: p.brandName ? `${p.name} (${p.brandName})` : p.name,
            calories: p.calories,
            protein: p.protein,
            carbs: p.carbs,
            fats: p.fats,
            serving: p.serving,
        });
        closeBarcodeScanner();
    };

    return (
        <div className="food-logger animate-fadeIn">
            <div className="logger-header">
                <div>
                    <h1>Food Logger 🍽️</h1>
                    <p>Track your meals and nutrition</p>
                </div>
                <div className="logger-actions">
                    <button
                        className="btn btn-outline"
                        onClick={handleBarcodeScanner}
                    >
                        <Barcode size={20} />
                        Scan Barcode
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowManualEntry(!showManualEntry)}
                    >
                        <Plus size={20} />
                        Manual Entry
                    </button>
                </div>
            </div>

            {/* Barcode Scanner Modal */}
            {showBarcodeScanner && (
                <div className="barcode-modal-overlay" onClick={closeBarcodeScanner}>
                    <div className="barcode-modal card" onClick={(e) => e.stopPropagation()}>
                        <div className="barcode-modal-header">
                            <h3><Barcode size={24} /> Barcode Scanner</h3>
                            <button className="btn btn-icon" onClick={closeBarcodeScanner}>
                                <X size={20} />
                            </button>
                        </div>

                        {barcodeScanning && (
                            <div className="barcode-scanner-area">
                                <div id="barcode-reader" ref={scannerRef}></div>
                                <p className="scanner-hint">Point your camera at a product barcode</p>
                            </div>
                        )}

                        {barcodeError && (
                            <div className="barcode-error">
                                <p>⚠️ {barcodeError}</p>
                                <button className="btn btn-secondary btn-sm" onClick={handleBarcodeScanner}>
                                    <Camera size={16} /> Try Again
                                </button>
                            </div>
                        )}

                        {barcodeResult?.loading && (
                            <div className="barcode-loading">
                                <Loader size={32} className="animate-spin" />
                                <p>Looking up product...</p>
                            </div>
                        )}

                        {barcodeResult?.product && !barcodeResult.loading && (
                            <div className="barcode-product">
                                <div className="product-info">
                                    {barcodeResult.product.imageUrl && (
                                        <img
                                            src={barcodeResult.product.imageUrl}
                                            alt={barcodeResult.product.name}
                                            className="product-image"
                                        />
                                    )}
                                    <div>
                                        <h4>{barcodeResult.product.name}</h4>
                                        {barcodeResult.product.brandName && (
                                            <span className="product-brand">{barcodeResult.product.brandName}</span>
                                        )}
                                        <span className="product-serving">{barcodeResult.product.serving}</span>
                                    </div>
                                </div>
                                <div className="product-nutrition">
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Calories</span>
                                        <span className="nutrition-value">{barcodeResult.product.calories}</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Protein</span>
                                        <span className="nutrition-value">{barcodeResult.product.protein}g</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Carbs</span>
                                        <span className="nutrition-value">{barcodeResult.product.carbs}g</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Fats</span>
                                        <span className="nutrition-value">{barcodeResult.product.fats}g</span>
                                    </div>
                                </div>
                                {barcodeResult.product.nutriScore && (
                                    <div className="nutri-score">
                                        Nutri-Score: <strong>{barcodeResult.product.nutriScore.toUpperCase()}</strong>
                                    </div>
                                )}
                                <button className="btn btn-primary btn-lg" onClick={handleAddBarcodeProduct}>
                                    <Plus size={20} /> Add to Log
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Today's Summary */}
            <div className="today-summary card">
                <h3>Today's Progress</h3>
                <div className="summary-stats">
                    <div className="summary-stat">
                        <span className="summary-label">Calories</span>
                        <span className="summary-value">{todayData.netCalories}</span>
                    </div>
                    <div className="summary-stat">
                        <span className="summary-label">Protein</span>
                        <span className="summary-value">{todayData.totalProtein}g</span>
                    </div>
                    <div className="summary-stat">
                        <span className="summary-label">Carbs</span>
                        <span className="summary-value">{todayData.totalCarbs}g</span>
                    </div>
                    <div className="summary-stat">
                        <span className="summary-label">Fats</span>
                        <span className="summary-value">{todayData.totalFats}g</span>
                    </div>
                </div>
            </div>

            {/* Manual Entry Form */}
            {showManualEntry && (
                <div className="manual-entry card">
                    <div className="manual-header">
                        <h3>Manual Entry</h3>
                        <button
                            className="btn btn-icon"
                            onClick={() => setShowManualEntry(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Food Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={manualFood.name}
                                onChange={(e) => setManualFood({ ...manualFood, name: e.target.value })}
                                placeholder="e.g., Homemade Pasta"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Calories *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={manualFood.calories}
                                onChange={(e) => setManualFood({ ...manualFood, calories: e.target.value })}
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Protein (g)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={manualFood.protein}
                                onChange={(e) => setManualFood({ ...manualFood, protein: e.target.value })}
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Carbs (g)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={manualFood.carbs}
                                onChange={(e) => setManualFood({ ...manualFood, carbs: e.target.value })}
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fats (g)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={manualFood.fats}
                                onChange={(e) => setManualFood({ ...manualFood, fats: e.target.value })}
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Meal Type</label>
                            <select
                                className="form-select"
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleAddManualFood}
                        disabled={!manualFood.name || !manualFood.calories}
                    >
                        <Plus size={20} />
                        Add Food
                    </button>
                </div>
            )}

            {/* Search Section */}
            <div className="search-section card">
                <div className="search-header">
                    <div className="search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder={useUSDASearch ? "Search 300,000+ foods..." : "Search local database..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isSearching && <Loader size={20} className="search-loader" />}
                    </div>




                    <div className="search-toggle">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={useUSDASearch}
                                onChange={(e) => setUseUSDASearch(e.target.checked)}
                            />
                            <span>Search USDA Database (300,000+ foods)</span>
                        </label>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="category-filter">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Search Results */}
                <div className="search-results">
                    {searchResults.length > 0 ? (
                        searchResults.map(food => (
                            <div
                                key={food.id}
                                className={`food-item ${selectedFood?.id === food.id ? 'selected' : ''}`}
                                onClick={() => handleSelectFood(food)}
                            >
                                <div className="food-info">
                                    <div className="food-name-row">
                                        <span className="food-name">{food.name}</span>
                                        {food.brandName && <span className="food-brand">{food.brandName}</span>}
                                        {food.source === 'USDA' && <span className="food-badge">USDA</span>}
                                    </div>
                                    <span className="food-serving">{food.serving}</span>
                                </div>
                                <div className="food-nutrition">
                                    <span className="food-calories">{food.calories} cal</span>
                                    <span className="food-macro">P: {food.protein}g</span>
                                    <span className="food-macro">C: {food.carbs}g</span>
                                    <span className="food-macro">F: {food.fats}g</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <p>No foods found. Try a different search or use manual entry.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Food Panel */}
            {selectedFood && (
                <div className="selected-food card">
                    <div className="selected-header">
                        <h3>Add to Log</h3>
                        <button
                            className="btn btn-icon"
                            onClick={() => setSelectedFood(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="selected-details">
                        <h4>{selectedFood.name}</h4>
                        <p>{selectedFood.serving}</p>

                        <div className="servings-control">
                            <label className="form-label">Number of Servings</label>
                            <div className="servings-input">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={servings}
                                    onChange={(e) => setServings(Math.max(0.1, parseFloat(e.target.value) || 1))}
                                    step="0.5"
                                    min="0.1"
                                />
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setServings(servings + 0.5)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Meal Type</label>
                            <select
                                className="form-select"
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>

                        <div className="nutrition-preview">
                            <h5>Nutrition (for {servings} serving{servings !== 1 ? 's' : ''})</h5>
                            <div className="nutrition-grid">
                                <div className="nutrition-item">
                                    <span className="nutrition-label">Calories</span>
                                    <span className="nutrition-value">{Math.round(selectedFood.calories * servings)}</span>
                                </div>
                                <div className="nutrition-item">
                                    <span className="nutrition-label">Protein</span>
                                    <span className="nutrition-value">{Math.round(selectedFood.protein * servings * 10) / 10}g</span>
                                </div>
                                <div className="nutrition-item">
                                    <span className="nutrition-label">Carbs</span>
                                    <span className="nutrition-value">{Math.round(selectedFood.carbs * servings * 10) / 10}g</span>
                                </div>
                                <div className="nutrition-item">
                                    <span className="nutrition-label">Fats</span>
                                    <span className="nutrition-value">{Math.round(selectedFood.fats * servings * 10) / 10}g</span>
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleAddFood}
                        >
                            <Plus size={20} />
                            Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodLogger;
