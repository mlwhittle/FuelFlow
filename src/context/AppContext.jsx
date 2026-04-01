import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const DEFAULT_USER = {
  name: 'User',
  age: 30,
  height: 170, // cm
  weight: 70, // kg
  gender: 'other',
  activityLevel: 'moderate',
  goal: 'maintain', // lose, maintain, gain
  targetWeight: 70,
  dailyCalories: 2000,
  macros: {
    protein: 150, // grams
    carbs: 200,
    fats: 65
  }
};

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(DEFAULT_USER);
  const [foodLogs, setFoodLogs] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [spiritualLogs, setSpiritualLogs] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [measurementHistory, setMeasurementHistory] = useState([]);

  // Lifted state for Meal Planner and Grocery List
  const [mealPlan, setMealPlan] = useState(() => {
    const saved = localStorage.getItem('fuelflow_mealPlan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed['Monday']) return {};
        return parsed;
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [groceryItems, setGroceryItems] = useState(() => {
    const saved = localStorage.getItem('fuelflow_groceryItems');
    return saved ? JSON.parse(saved) : {};
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('fuelflow_theme');
    const savedUser = localStorage.getItem('fuelflow_user');
    const savedFoodLogs = localStorage.getItem('fuelflow_foodLogs');
    const savedWaterIntake = localStorage.getItem('fuelflow_waterIntake');
    const savedExerciseLogs = localStorage.getItem('fuelflow_exerciseLogs');
    const savedSpiritualLogs = localStorage.getItem('fuelflow_spiritualLogs');
    const savedRecipes = localStorage.getItem('fuelflow_recipes');
    const savedFavorites = localStorage.getItem('fuelflow_favorites');

    if (savedTheme) setTheme(savedTheme);
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedFoodLogs) setFoodLogs(JSON.parse(savedFoodLogs));
    if (savedWaterIntake) setWaterIntake(JSON.parse(savedWaterIntake));
    if (savedExerciseLogs) setExerciseLogs(JSON.parse(savedExerciseLogs));
    if (savedSpiritualLogs) setSpiritualLogs(JSON.parse(savedSpiritualLogs));
    if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedMeasurementHistory = localStorage.getItem('fuelflow_measurementHistory');
    if (savedMeasurementHistory) {
      setMeasurementHistory(JSON.parse(savedMeasurementHistory));
    } else {
      // Migrate old weight history if exists
      const oldWeightHistory = localStorage.getItem('fuelflow_weightHistory');
      if (oldWeightHistory) {
        setMeasurementHistory(JSON.parse(oldWeightHistory));
        localStorage.removeItem('fuelflow_weightHistory');
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('fuelflow_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fuelflow_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fuelflow_foodLogs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('fuelflow_waterIntake', JSON.stringify(waterIntake));
  }, [waterIntake]);

  useEffect(() => {
    localStorage.setItem('fuelflow_exerciseLogs', JSON.stringify(exerciseLogs));
  }, [exerciseLogs]);

  useEffect(() => {
    localStorage.setItem('fuelflow_spiritualLogs', JSON.stringify(spiritualLogs));
  }, [spiritualLogs]);

  useEffect(() => {
    localStorage.setItem('fuelflow_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('fuelflow_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('fuelflow_measurementHistory', JSON.stringify(measurementHistory));
  }, [measurementHistory]);

  useEffect(() => {
    localStorage.setItem('fuelflow_mealPlan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    localStorage.setItem('fuelflow_groceryItems', JSON.stringify(groceryItems));
  }, [groceryItems]);

  // Synchronize daily aggregates to Firestore so the AI Coach can monitor
  useEffect(() => {
    // We only want to sync if there's actual logic, but since it's local-first it's okay if it's anon
    if (!user || typeof getTodayData !== 'function') return;
    
    const bounceSync = setTimeout(async () => {
      try {
        const todayData = getTodayData();
        const todayStr = new Date().toISOString().split('T')[0];
        const userIdRaw = user.uid || 'anonymous';
        const docId = `${userIdRaw}_${todayStr}`;
        
        await setDoc(doc(db, 'userMetrics', docId), {
          userId: userIdRaw,
          date: todayStr,
          caloriesLogged: todayData.totalCalories || 0,
          exerciseCalories: todayData.exerciseCalories || 0,
          protein: todayData.totalProtein || 0,
          missedDay: (todayData.totalCalories || 0) === 0,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Ensure "missed 3 days" agent metric triggers update
      } catch (err) {
        console.error("Firestore sync error:", err);
      }
    }, 2000); // 2-second debounce for bulk adds

    return () => clearTimeout(bounceSync);
  }, [foodLogs, exerciseLogs, user]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Food logging functions
  const addFoodLog = (food) => {
    const newLog = {
      id: Date.now(),
      ...food,
      timestamp: new Date().toISOString()
    };
    setFoodLogs(prev => [...prev, newLog]);
  };

  const deleteFoodLog = (id) => {
    setFoodLogs(prev => prev.filter(log => log.id !== id));
  };

  const updateFoodLog = (id, updates) => {
    setFoodLogs(prev => prev.map(log =>
      log.id === id ? { ...log, ...updates } : log
    ));
  };

  // Water tracking
  const addWater = (amount) => {
    setWaterIntake(prev => prev + amount);
  };

  const resetWater = () => {
    setWaterIntake(0);
  };

  // Exercise logging
  const addExerciseLog = (exercise) => {
    const newLog = {
      id: Date.now(),
      ...exercise,
      timestamp: new Date().toISOString()
    };
    setExerciseLogs(prev => [...prev, newLog]);
  };

  const deleteExerciseLog = (id) => {
    setExerciseLogs(prev => prev.filter(log => log.id !== id));
  };

  // Spiritual tracking
  const addSpiritualLog = (log) => {
    setSpiritualLogs(prev => [...prev, log]);
  };

  // Recipe management
  const addRecipe = (recipe) => {
    const newRecipe = {
      id: Date.now(),
      ...recipe,
      createdAt: new Date().toISOString()
    };
    setRecipes(prev => [...prev, newRecipe]);
  };

  const deleteRecipe = (id) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  };

  const updateRecipe = (id, updatedRecipe) => {
    setRecipes(prev => prev.map(recipe =>
      recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
    ));
  };

  // Measurement tracking (Weight + Body Metrics)
  const addMeasurementEntry = (measurements) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...measurements
    };
    setMeasurementHistory(prev => [...prev, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const deleteMeasurementEntry = (id) => {
    setMeasurementHistory(prev => prev.filter(entry => entry.id !== id));
  };

  const getMeasurementHistory = (days = 30) => {
    if (!measurementHistory.length) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return measurementHistory.filter(entry => new Date(entry.date) >= cutoff);
  };

  // Get historical food/exercise data for charts
  const getHistoricalData = (days = 30) => {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();

      const dayFoodLogs = foodLogs.filter(log => new Date(log.timestamp).toDateString() === dateStr);
      const dayExerciseLogs = exerciseLogs.filter(log => new Date(log.timestamp).toDateString() === dateStr);

      const totalCalories = Math.round(dayFoodLogs.reduce((sum, log) => sum + (log.calories || 0), 0));
      const totalProtein = Math.round(dayFoodLogs.reduce((sum, log) => sum + (log.protein || 0), 0) * 10) / 10;
      const totalCarbs = Math.round(dayFoodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0) * 10) / 10;
      const totalFats = Math.round(dayFoodLogs.reduce((sum, log) => sum + (log.fats || 0), 0) * 10) / 10;
      const exerciseCalories = Math.round(dayExerciseLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0));

      result.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalCalories,
        netCalories: totalCalories - exerciseCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        exerciseCalories,
        mealsLogged: dayFoodLogs.length
      });
    }
    return result;
  };

  // Favorites
  const toggleFavorite = (foodId) => {
    setFavorites(prev =>
      prev.includes(foodId)
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
  };

  // Get today's data
  const getTodayData = () => {
    const today = new Date().toDateString();

    const todayFoodLogs = foodLogs.filter(log =>
      new Date(log.timestamp).toDateString() === today
    );

    const todayExerciseLogs = exerciseLogs.filter(log =>
      new Date(log.timestamp).toDateString() === today
    );

    const todaySpiritualLogs = spiritualLogs.filter(log =>
      new Date(log.timestamp).toDateString() === today
    );

    const totalCalories = Math.round(todayFoodLogs.reduce((sum, log) => sum + (log.calories || 0), 0));
    const totalProtein = Math.round(todayFoodLogs.reduce((sum, log) => sum + (log.protein || 0), 0) * 10) / 10;
    const totalCarbs = Math.round(todayFoodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0) * 10) / 10;
    const totalFats = Math.round(todayFoodLogs.reduce((sum, log) => sum + (log.fats || 0), 0) * 10) / 10;
    const exerciseCalories = Math.round(todayExerciseLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0));
    const activeMinutes = todayExerciseLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const workoutCount = todayExerciseLogs.length;

    return {
      foodLogs: todayFoodLogs,
      exerciseLogs: todayExerciseLogs,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      exerciseCalories,
      activeMinutes,
      workoutCount,
      netCalories: totalCalories - exerciseCalories,
      waterIntake,
      spiritualLogs: todaySpiritualLogs
    };
  };

  const value = {
    theme,
    toggleTheme,
    user,
    setUser,
    foodLogs,
    addFoodLog,
    deleteFoodLog,
    updateFoodLog,
    waterIntake,
    addWater,
    resetWater,
    exerciseLogs,
    addExerciseLog,
    deleteExerciseLog,
    spiritualLogs,
    addSpiritualLog,
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    favorites,
    toggleFavorite,
    getTodayData,
    measurementHistory,
    addMeasurementEntry,
    deleteMeasurementEntry,
    getMeasurementHistory,
    getHistoricalData,
    mealPlan,
    setMealPlan,
    groceryItems,
    setGroceryItems
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
