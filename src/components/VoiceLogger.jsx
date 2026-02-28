import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, Plus, X, Loader, Volume2, Trash2 } from 'lucide-react';
import { searchAllFoods } from '../services/foodService';
import './VoiceLogger.css';

const VoiceLogger = () => {
    const { addFoodLog } = useApp();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [parsedFoods, setParsedFoods] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [mealType, setMealType] = useState(() => {
        const hour = new Date().getHours();
        if (hour < 10) return 'breakfast';
        if (hour < 14) return 'lunch';
        if (hour < 17) return 'snack';
        return 'dinner';
    });
    const [error, setError] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef(null);
    const [pulseIntensity, setPulseIntensity] = useState(0);

    useEffect(() => {
        // Check for Web Speech API support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            if (final) {
                setTranscript(prev => (prev ? prev + ' ' + final : final).trim());
            }
            setInterimTranscript(interim);

            // Pulse animation based on audio
            setPulseIntensity(Math.random() * 100);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone permissions.');
            } else if (event.error === 'no-speech') {
                // Ignore — just means silence
            } else {
                setError(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            setPulseIntensity(0);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
            }
        };
    }, []);

    const startListening = () => {
        if (!isSupported || !recognitionRef.current) return;
        setError('');
        setInterimTranscript('');
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        setPulseIntensity(0);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Parse the transcript into food items
    const parseTranscript = async () => {
        if (!transcript.trim()) return;

        setIsParsing(true);
        setParsedFoods([]);

        try {
            // Split transcript into potential food items
            const foodPhrases = extractFoodPhrases(transcript);
            const results = [];

            for (const phrase of foodPhrases) {
                const searchResults = await searchAllFoods(phrase, 'all', true);
                if (searchResults.length > 0) {
                    const best = searchResults[0];
                    results.push({
                        id: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                        searchPhrase: phrase,
                        name: best.name,
                        calories: best.calories,
                        protein: best.protein,
                        carbs: best.carbs,
                        fats: best.fats,
                        serving: best.serving,
                        servings: 1,
                        selected: true,
                        source: best.source || 'Local'
                    });
                }
            }

            setParsedFoods(results);
        } catch (err) {
            console.error('Parse error:', err);
            setError('Failed to parse foods. Please try again.');
        }

        setIsParsing(false);
    };

    // Extract individual food phrases from natural language
    const extractFoodPhrases = (text) => {
        const cleaned = text.toLowerCase()
            .replace(/i had |i ate |i've had |i've eaten |i just had |for breakfast |for lunch |for dinner |for snack |and a |and some |with some |with a |also had |plus /g, ', ')
            .replace(/a cup of |a bowl of |a slice of |a piece of |a glass of |a plate of |a serving of /g, '')
            .replace(/\band\b/g, ',')
            .replace(/[.!?]/g, ',');

        return cleaned
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length >= 2)
            .filter(s => !['i', 'a', 'the', 'some', 'then', 'also', 'with'].includes(s));
    };

    const toggleFoodSelection = (foodId) => {
        setParsedFoods(prev =>
            prev.map(f => f.id === foodId ? { ...f, selected: !f.selected } : f)
        );
    };

    const updateServings = (foodId, newServings) => {
        setParsedFoods(prev =>
            prev.map(f => f.id === foodId ? { ...f, servings: Math.max(0.1, newServings) } : f)
        );
    };

    const removeFood = (foodId) => {
        setParsedFoods(prev => prev.filter(f => f.id !== foodId));
    };

    const handleLogAll = () => {
        const selectedItems = parsedFoods.filter(f => f.selected);
        if (selectedItems.length === 0) return;

        selectedItems.forEach(food => {
            addFoodLog({
                name: food.name,
                calories: Math.round(food.calories * food.servings),
                protein: Math.round(food.protein * food.servings * 10) / 10,
                carbs: Math.round(food.carbs * food.servings * 10) / 10,
                fats: Math.round(food.fats * food.servings * 10) / 10,
                serving: food.serving,
                servings: food.servings,
                mealType: mealType,
                source: 'voice'
            });
        });

        // Reset
        setTranscript('');
        setParsedFoods([]);
    };

    const clearAll = () => {
        setTranscript('');
        setInterimTranscript('');
        setParsedFoods([]);
        setError('');
    };

    const selectedCount = parsedFoods.filter(f => f.selected).length;

    return (
        <div className="voice-logger animate-fadeIn">
            <div className="voice-header">
                <div>
                    <h1>Voice Logger 🎙️</h1>
                    <p>Speak your meals and we'll log them for you</p>
                </div>
            </div>

            {/* Microphone Section */}
            <div className="voice-mic-section card">
                <div className="mic-container">
                    <button
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={toggleListening}
                        disabled={!isSupported}
                        style={{
                            '--pulse': isListening ? `${0.8 + pulseIntensity / 200}` : '1'
                        }}
                    >
                        {isListening ? (
                            <>
                                <div className="mic-pulse-ring ring-1" />
                                <div className="mic-pulse-ring ring-2" />
                                <div className="mic-pulse-ring ring-3" />
                                <MicOff size={36} />
                            </>
                        ) : (
                            <Mic size={36} />
                        )}
                    </button>
                    <p className="mic-label">
                        {isListening
                            ? '🔴 Listening... Tap to stop'
                            : 'Tap the mic and say what you ate'
                        }
                    </p>
                    <p className="mic-hint">
                        Try: "I had a chicken sandwich, a coffee, and some french fries"
                    </p>
                </div>

                {/* Live Transcript */}
                {(transcript || interimTranscript) && (
                    <div className="transcript-section">
                        <div className="transcript-header">
                            <h4><Volume2 size={18} /> Transcript</h4>
                            <button className="btn btn-icon btn-sm" onClick={clearAll}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="transcript-text">
                            {transcript && <span className="final-text">{transcript}</span>}
                            {interimTranscript && (
                                <span className="interim-text"> {interimTranscript}</span>
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="voice-error">
                        <p>⚠️ {error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                {transcript && !isListening && (
                    <div className="voice-actions">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={parseTranscript}
                            disabled={isParsing}
                        >
                            {isParsing ? (
                                <><Loader size={20} className="animate-spin" /> Parsing Foods...</>
                            ) : (
                                <><Plus size={20} /> Find Foods</>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Meal Type Selector */}
            {parsedFoods.length > 0 && (
                <div className="meal-selector card">
                    <h4>Meal Type</h4>
                    <div className="meal-options">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                            <button
                                key={type}
                                className={`meal-btn ${mealType === type ? 'active' : ''}`}
                                onClick={() => setMealType(type)}
                            >
                                {type === 'breakfast' && '🌅'}
                                {type === 'lunch' && '☀️'}
                                {type === 'dinner' && '🌙'}
                                {type === 'snack' && '🍪'}
                                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Parsed Foods */}
            {parsedFoods.length > 0 && (
                <div className="parsed-foods card">
                    <h3>Detected Foods ({parsedFoods.length})</h3>
                    <div className="parsed-food-list">
                        {parsedFoods.map(food => (
                            <div
                                key={food.id}
                                className={`parsed-food-item ${food.selected ? 'selected' : ''}`}
                            >
                                <div className="parsed-food-check">
                                    <button
                                        className={`check-btn ${food.selected ? 'checked' : ''}`}
                                        onClick={() => toggleFoodSelection(food.id)}
                                    >
                                        {food.selected && <Check size={16} />}
                                    </button>
                                </div>
                                <div className="parsed-food-info">
                                    <span className="parsed-food-name">{food.name}</span>
                                    <span className="parsed-food-search">
                                        Matched: "{food.searchPhrase}" • {food.source}
                                    </span>
                                    <div className="parsed-food-macros">
                                        <span>{Math.round(food.calories * food.servings)} cal</span>
                                        <span>P: {(food.protein * food.servings).toFixed(1)}g</span>
                                        <span>C: {(food.carbs * food.servings).toFixed(1)}g</span>
                                        <span>F: {(food.fats * food.servings).toFixed(1)}g</span>
                                    </div>
                                </div>
                                <div className="parsed-food-controls">
                                    <div className="servings-mini">
                                        <button
                                            className="btn btn-icon btn-sm"
                                            onClick={() => updateServings(food.id, food.servings - 0.5)}
                                        >
                                            −
                                        </button>
                                        <span>{food.servings}</span>
                                        <button
                                            className="btn btn-icon btn-sm"
                                            onClick={() => updateServings(food.id, food.servings + 0.5)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        className="btn btn-icon btn-sm remove-btn"
                                        onClick={() => removeFood(food.id)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn btn-success btn-lg log-all-btn"
                        onClick={handleLogAll}
                        disabled={selectedCount === 0}
                    >
                        <Plus size={20} />
                        Log {selectedCount} Food{selectedCount !== 1 ? 's' : ''}
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceLogger;
