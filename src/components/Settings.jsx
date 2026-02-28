import { useApp } from '../context/AppContext';
import { User, Target, Activity as ActivityIcon, Download, Upload } from 'lucide-react';
import { calculateBMR, calculateTDEE, calculateCalorieGoal, calculateMacros, calculateBMI, getBMICategory } from '../utils/calculations';
import './Settings.css';

const Settings = () => {
    const { user, setUser } = useApp();

    const handleUserUpdate = (updates) => {
        const updatedUser = { ...user, ...updates };

        // Recalculate goals if relevant fields changed
        if (updates.weight || updates.height || updates.age || updates.gender || updates.activityLevel || updates.goal) {
            const bmr = calculateBMR(updatedUser.weight, updatedUser.height, updatedUser.age, updatedUser.gender);
            const tdee = calculateTDEE(bmr, updatedUser.activityLevel);
            const dailyCalories = calculateCalorieGoal(tdee, updatedUser.goal);
            const macros = calculateMacros(dailyCalories, updatedUser.goal);

            updatedUser.dailyCalories = dailyCalories;
            updatedUser.macros = macros;
        }

        setUser(updatedUser);
    };

    const handleExportData = () => {
        const data = {
            user,
            foodLogs: JSON.parse(localStorage.getItem('fuelflow_foodLogs') || '[]'),
            waterIntake: JSON.parse(localStorage.getItem('fuelflow_waterIntake') || '0'),
            exerciseLogs: JSON.parse(localStorage.getItem('fuelflow_exerciseLogs') || '[]'),
            recipes: JSON.parse(localStorage.getItem('fuelflow_recipes') || '[]'),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fuelflow-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportData = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result);
                if (data.user) localStorage.setItem('fuelflow_user', JSON.stringify(data.user));
                if (data.foodLogs) localStorage.setItem('fuelflow_foodLogs', JSON.stringify(data.foodLogs));
                if (data.waterIntake) localStorage.setItem('fuelflow_waterIntake', JSON.stringify(data.waterIntake));
                if (data.exerciseLogs) localStorage.setItem('fuelflow_exerciseLogs', JSON.stringify(data.exerciseLogs));
                if (data.recipes) localStorage.setItem('fuelflow_recipes', JSON.stringify(data.recipes));

                alert('Data imported successfully! Please refresh the page.');
                window.location.reload();
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    };

    const bmi = calculateBMI(user.weight, user.height);
    const bmiCategory = getBMICategory(parseFloat(bmi));

    return (
        <div className="settings animate-fadeIn">
            <div className="settings-header">
                <h1>Settings ⚙️</h1>
                <p>Manage your profile and preferences</p>
            </div>

            {/* Personal Information */}
            <div className="settings-section card">
                <div className="section-header">
                    <User size={24} />
                    <h3>Personal Information</h3>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={user.name}
                            onChange={(e) => handleUserUpdate({ name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Age</label>
                        <input
                            type="number"
                            className="form-input"
                            value={user.age}
                            onChange={(e) => handleUserUpdate({ age: parseInt(e.target.value) || 30 })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Height (cm)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={user.height}
                            onChange={(e) => handleUserUpdate({ height: parseInt(e.target.value) || 170 })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Weight (kg)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={user.weight}
                            onChange={(e) => handleUserUpdate({ weight: parseFloat(e.target.value) || 70 })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                            className="form-select"
                            value={user.gender}
                            onChange={(e) => handleUserUpdate({ gender: e.target.value })}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Activity Level</label>
                        <select
                            className="form-select"
                            value={user.activityLevel}
                            onChange={(e) => handleUserUpdate({ activityLevel: e.target.value })}
                        >
                            <option value="sedentary">Sedentary (little/no exercise)</option>
                            <option value="light">Light (1-3 days/week)</option>
                            <option value="moderate">Moderate (3-5 days/week)</option>
                            <option value="active">Active (6-7 days/week)</option>
                            <option value="veryActive">Very Active (intense daily)</option>
                        </select>
                    </div>
                </div>

                {/* BMI Display */}
                <div className="bmi-display">
                    <div className="bmi-value">
                        <span className="bmi-number">{bmi}</span>
                        <span className="bmi-label">BMI</span>
                    </div>
                    <div className="bmi-category" style={{ color: bmiCategory.color }}>
                        {bmiCategory.category}
                    </div>
                </div>
            </div>

            {/* Goals */}
            <div className="settings-section card">
                <div className="section-header">
                    <Target size={24} />
                    <h3>Goals</h3>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Goal</label>
                        <select
                            className="form-select"
                            value={user.goal}
                            onChange={(e) => handleUserUpdate({ goal: e.target.value })}
                        >
                            <option value="lose">Lose Weight</option>
                            <option value="maintain">Maintain Weight</option>
                            <option value="gain">Gain Weight</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Target Weight (kg)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={user.targetWeight}
                            onChange={(e) => handleUserUpdate({ targetWeight: parseFloat(e.target.value) || 70 })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Daily Calorie Goal</label>
                        <input
                            type="number"
                            className="form-input"
                            value={user.dailyCalories}
                            onChange={(e) => handleUserUpdate({ dailyCalories: parseInt(e.target.value) || 2000 })}
                        />
                    </div>
                </div>

                <div className="macros-section">
                    <h4>Macro Goals (grams)</h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Protein</label>
                            <input
                                type="number"
                                className="form-input"
                                value={user.macros.protein}
                                onChange={(e) => handleUserUpdate({
                                    macros: { ...user.macros, protein: parseInt(e.target.value) || 150 }
                                })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Carbs</label>
                            <input
                                type="number"
                                className="form-input"
                                value={user.macros.carbs}
                                onChange={(e) => handleUserUpdate({
                                    macros: { ...user.macros, carbs: parseInt(e.target.value) || 200 }
                                })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fats</label>
                            <input
                                type="number"
                                className="form-input"
                                value={user.macros.fats}
                                onChange={(e) => handleUserUpdate({
                                    macros: { ...user.macros, fats: parseInt(e.target.value) || 65 }
                                })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="settings-section card">
                <div className="section-header">
                    <ActivityIcon size={24} />
                    <h3>Data Management</h3>
                </div>

                <p className="section-description">
                    Export your data to backup or import previously saved data.
                </p>

                <div className="data-actions">
                    <button className="btn btn-outline" onClick={handleExportData}>
                        <Download size={20} />
                        Export Data
                    </button>

                    <label className="btn btn-outline">
                        <Upload size={20} />
                        Import Data
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Settings;
