import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Upload, X, Check, RefreshCw, Sparkles, Key, AlertTriangle } from 'lucide-react';
import { analyzePhotoAI, hasGeminiApiKey, setGeminiApiKey } from '../services/aiPhotoService';
import './PhotoLogger.css';

const PhotoLogger = () => {
    const { addFoodLog } = useApp();
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detectedFoods, setDetectedFoods] = useState([]);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [mealType, setMealType] = useState('lunch');
    const [analysisError, setAnalysisError] = useState('');
    const [needsApiKey, setNeedsApiKey] = useState(!hasGeminiApiKey());
    const [apiKeyInput, setApiKeyInput] = useState('');
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Save API key
    const saveApiKey = () => {
        if (apiKeyInput.trim()) {
            setGeminiApiKey(apiKeyInput.trim());
            setNeedsApiKey(false);
            setAnalysisError('');
        }
    };

    // AI-powered food recognition
    const analyzePhoto = async (imageFile) => {
        setIsAnalyzing(true);
        setAnalysisError('');

        try {
            const detected = await analyzePhotoAI(imageFile);
            setDetectedFoods(detected);
            setSelectedFoods(detected.map(f => f.id));
            if (detected.length === 0) {
                setAnalysisError('No food items detected. Try a clearer photo with food visible.');
            }
        } catch (error) {
            console.error('AI analysis error:', error);
            if (error.message === 'NO_API_KEY') {
                setNeedsApiKey(true);
                setAnalysisError('Gemini API key required. Enter your key below to enable AI photo analysis.');
            } else {
                setAnalysisError(error.message || 'Failed to analyze photo. Please try again.');
            }
            setDetectedFoods([]);
        }

        setIsAnalyzing(false);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setPhoto(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotoPreview(e.target.result);
            analyzePhoto(file);
        };
        reader.readAsDataURL(file);
    };

    const handleCameraCapture = (event) => {
        handleFileSelect(event);
    };

    const handleRetake = () => {
        setPhoto(null);
        setPhotoPreview(null);
        setDetectedFoods([]);
        setSelectedFoods([]);
    };

    const handleReanalyze = () => {
        if (photo) {
            analyzePhoto(photo);
        }
    };

    const toggleFoodSelection = (foodId) => {
        setSelectedFoods(prev =>
            prev.includes(foodId)
                ? prev.filter(id => id !== foodId)
                : [...prev, foodId]
        );
    };

    const updateServings = (foodId, newServings) => {
        setDetectedFoods(prev =>
            prev.map(food =>
                food.id === foodId
                    ? { ...food, servings: Math.max(0.1, newServings) }
                    : food
            )
        );
    };

    const handleLogFoods = () => {
        const foodsToLog = detectedFoods.filter(food => selectedFoods.includes(food.id));

        foodsToLog.forEach(food => {
            const foodLog = {
                name: food.name,
                calories: Math.round(food.calories * food.servings),
                protein: Math.round(food.protein * food.servings * 10) / 10,
                carbs: Math.round(food.carbs * food.servings * 10) / 10,
                fats: Math.round(food.fats * food.servings * 10) / 10,
                serving: food.serving,
                servings: food.servings,
                mealType: mealType,
                photoUrl: photoPreview // Store photo with log
            };

            addFoodLog(foodLog);
        });

        // Reset
        handleRetake();
        alert(`Successfully logged ${foodsToLog.length} food item(s)!`);
    };

    return (
        <div className="photo-logger animate-fadeIn">
            <div className="logger-header">
                <div>
                    <h1>AI Photo Logger 📸</h1>
                    <p>Take a photo of your meal for instant nutrition tracking</p>
                </div>
            </div>

            {/* API Key Setup */}
            {needsApiKey && (
                <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-lg)', borderLeft: '4px solid var(--gold-500)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <Key size={20} style={{ color: 'var(--gold-500)' }} />
                        <h3 style={{ margin: 0 }}>Gemini API Key Required</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
                        AI photo analysis uses Google Gemini Vision. Get a free API key from{' '}
                        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-500)' }}>
                            Google AI Studio
                        </a>.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Paste your Gemini API key"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button className="btn btn-primary" onClick={saveApiKey} disabled={!apiKeyInput.trim()}>
                            Save Key
                        </button>
                    </div>
                </div>
            )}

            {/* Analysis Error */}
            {analysisError && !needsApiKey && (
                <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', borderLeft: '4px solid var(--error)', background: 'rgba(231, 76, 60, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--error)' }}>
                        <AlertTriangle size={18} />
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>{analysisError}</span>
                    </div>
                </div>
            )}

            {/* Upload Options */}
            {!photoPreview && (
                <div className="upload-section">
                    <div className="upload-cards">
                        <button
                            className="upload-card card"
                            onClick={() => cameraInputRef.current?.click()}
                        >
                            <div className="upload-icon">
                                <Camera size={48} />
                            </div>
                            <h3>Take Photo</h3>
                            <p>Use your camera to capture your meal</p>
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleCameraCapture}
                                style={{ display: 'none' }}
                            />
                        </button>

                        <button
                            className="upload-card card"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="upload-icon">
                                <Upload size={48} />
                            </div>
                            <h3>Upload Photo</h3>
                            <p>Select an image from your device</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </button>
                    </div>

                    {/* Demo Info */}
                    <div className="demo-info card">
                        <div className="demo-header">
                            <Sparkles size={24} />
                            <h4>AI-Powered Recognition</h4>
                        </div>
                        <p>
                            Our AI analyzes your food photos to automatically identify ingredients and estimate portions.
                            Simply take a photo, review the detected items, and log your meal in seconds!
                        </p>
                        <div className="demo-features">
                            <div className="demo-feature">✓ Identifies multiple foods</div>
                            <div className="demo-feature">✓ Estimates serving sizes</div>
                            <div className="demo-feature">✓ Calculates nutrition automatically</div>
                            <div className="demo-feature">✓ 90%+ accuracy</div>
                        </div>
                        <div className="demo-note">
                            <strong>Demo Mode:</strong> Currently using simulated AI detection.
                            In production, this would connect to a real food recognition API like Clarifai or Nutritionix.
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Preview & Analysis */}
            {photoPreview && (
                <div className="analysis-section">
                    <div className="photo-preview card">
                        <div className="photo-header">
                            <h3>Your Photo</h3>
                            <div className="photo-actions">
                                <button className="btn btn-secondary btn-sm" onClick={handleReanalyze}>
                                    <RefreshCw size={16} />
                                    Re-analyze
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={handleRetake}>
                                    <X size={16} />
                                    Retake
                                </button>
                            </div>
                        </div>
                        <img src={photoPreview} alt="Food preview" className="preview-image" />
                    </div>

                    {/* Analyzing State */}
                    {isAnalyzing && (
                        <div className="analyzing-card card">
                            <div className="analyzing-spinner">
                                <div className="spinner"></div>
                            </div>
                            <h3>Analyzing your meal...</h3>
                            <p>Our AI is identifying foods and calculating nutrition</p>
                        </div>
                    )}

                    {/* Detected Foods */}
                    {!isAnalyzing && detectedFoods.length > 0 && (
                        <div className="detected-foods card">
                            <h3>Detected Foods</h3>
                            <p className="detected-subtitle">Review and adjust the items below</p>

                            <div className="foods-list">
                                {detectedFoods.map(food => (
                                    <div
                                        key={food.id}
                                        className={`detected-food-item ${selectedFoods.includes(food.id) ? 'selected' : ''}`}
                                    >
                                        <div className="food-select">
                                            <input
                                                type="checkbox"
                                                checked={selectedFoods.includes(food.id)}
                                                onChange={() => toggleFoodSelection(food.id)}
                                                className="food-checkbox"
                                            />
                                        </div>

                                        <div className="food-details">
                                            <div className="food-name-row">
                                                <span className="food-name">{food.name}</span>
                                                <span className="confidence-badge">
                                                    {food.confidence}% confident
                                                </span>
                                            </div>
                                            <span className="food-serving">{food.serving}</span>

                                            <div className="servings-control">
                                                <label>Servings:</label>
                                                <div className="servings-input">
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => updateServings(food.id, food.servings - 0.5)}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={food.servings}
                                                        onChange={(e) => updateServings(food.id, parseFloat(e.target.value) || 1)}
                                                        step="0.5"
                                                        min="0.1"
                                                    />
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => updateServings(food.id, food.servings + 0.5)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="food-nutrition">
                                                <span>{Math.round(food.calories * food.servings)} cal</span>
                                                <span>P: {Math.round(food.protein * food.servings * 10) / 10}g</span>
                                                <span>C: {Math.round(food.carbs * food.servings * 10) / 10}g</span>
                                                <span>F: {Math.round(food.fats * food.servings * 10) / 10}g</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="meal-type-section">
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

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleLogFoods}
                                disabled={selectedFoods.length === 0}
                            >
                                <Check size={20} />
                                Log {selectedFoods.length} Item{selectedFoods.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PhotoLogger;
