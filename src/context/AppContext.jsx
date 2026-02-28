import { createContext, useContext, useState, useEffect } from 'react';

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
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('fuelflow_theme');
    const savedUser = localStorage.getItem('fuelflow_user');
    const savedFoodLogs = localStorage.getItem('fuelflow_foodLogs');
    const savedWaterIntake = localStorage.getItem('fuelflow_waterIntake');
    const savedExerciseLogs = localStorage.getItem('fuelflow_exerciseLogs');
    const savedRecipes = localStorage.getItem('fuelflow_recipes');
    const savedFavorites = localStorage.getItem('fuelflow_favorites');

    if (savedTheme) setTheme(savedTheme);
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedFoodLogs) setFoodLogs(JSON.parse(savedFoodLogs));
    if (savedWaterIntake) setWaterIntake(JSON.parse(savedWaterIntake));
    if (savedExerciseLogs) setExerciseLogs(JSON.parse(savedExerciseLogs));
    if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedWeightHistory = localStorage.getItem('fuelflow_weightHistory');
    if (savedWeightHistory) setWeightHistory(JSON.parse(savedWeightHistory));
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
    localStorage.setItem('fuelflow_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('fuelflow_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('fuelflow_weightHistory', JSON.stringify(weightHistory));
  }, [weightHistory]);

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

  // Weight History
  const addWeightEntry = (weight) => {
    const today = new Date().toISOString().split('T')[0];
    setWeightHistory(prev => {
      // Replace entry if same date exists
      const filtered = prev.filter(e => e.date !== today);
      return [...filtered, { date: today, weight: parseFloat(weight), timestamp: new Date().toISOString() }]
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    });
  };

  const getWeightHistory = (days = 30) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return weightHistory.filter(e => new Date(e.date) >= cutoff);
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

      const totalCalories = dayFoodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const totalProtein = dayFoodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
      const totalCarbs = dayFoodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
      const totalFats = dayFoodLogs.reduce((sum, log) => sum + (log.fats || 0), 0);
      const exerciseCalories = dayExerciseLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);

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

    const totalCalories = todayFoodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const totalProtein = todayFoodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
    const totalCarbs = todayFoodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
    const totalFats = todayFoodLogs.reduce((sum, log) => sum + (log.fats || 0), 0);
    const exerciseCalories = todayExerciseLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
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
      waterIntake
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
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    favorites,
    toggleFavorite,
    getTodayData,
    weightHistory,
    addWeightEntry,
    getWeightHistory,
    getHistoricalData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
