import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, ChefHat, Clock, Users, Trash2, Edit2, X, Star } from 'lucide-react';
import { searchUSDAFoods } from '../services/usdaApi';
import './RecipeManager.css';

const RecipeManager = () => {
    const { recipes, addRecipe, updateRecipe, deleteRecipe, addFoodLog } = useApp();
    const [view, setView] = useState('library'); // 'library', 'create', 'detail'
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingRecipe, setEditingRecipe] = useState(null);

    // Recipe form state
    const [recipeName, setRecipeName] = useState('');
    const [description, setDescription] = useState('');
    const [servings, setServings] = useState(4);
    const [prepTime, setPrepTime] = useState(15);
    const [cookTime, setCookTime] = useState(30);
    const [category, setCategory] = useState('dinner');
    const [instructions, setInstructions] = useState('');
    const [ingredients, setIngredients] = useState([]);

    // Ingredient search
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [ingredientResults, setIngredientResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // URL import
    const [showUrlImport, setShowUrlImport] = useState(false);
    const [recipeUrl, setRecipeUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const categories = [
        { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
        { id: 'lunch', name: 'Lunch', icon: '🥗' },
        { id: 'dinner', name: 'Dinner', icon: '🍽️' },
        { id: 'snack', name: 'Snack', icon: '🍿' },
        { id: 'dessert', name: 'Dessert', icon: '🍰' },
        { id: 'drink', name: 'Drink', icon: '🥤' }
    ];

    const handleSearchIngredient = async () => {
        if (!ingredientSearch.trim()) return;

        setIsSearching(true);
        try {
            const results = await searchUSDAFoods(ingredientSearch, 10);
            setIngredientResults(results);
        } catch (error) {
            console.error('Error searching ingredients:', error);
            setIngredientResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddIngredient = (food) => {
        const ingredient = {
            id: Date.now(),
            fdcId: food.fdcId,
            name: food.name,
            amount: 100,
            unit: 'g',
            calories: food.calories || 0,
            protein: food.protein || 0,
            carbs: food.carbs || 0,
            fats: food.fats || 0
        };

        setIngredients(prev => [...prev, ingredient]);
        setIngredientSearch('');
        setIngredientResults([]);
    };

    const handleUpdateIngredient = (id, field, value) => {
        setIngredients(prev => prev.map(ing =>
            ing.id === id ? { ...ing, [field]: parseFloat(value) || 0 } : ing
        ));
    };

    const handleRemoveIngredient = (id) => {
        setIngredients(prev => prev.filter(ing => ing.id !== id));
    };

    const calculateTotalNutrition = () => {
        return ingredients.reduce((total, ing) => {
            const multiplier = ing.amount / 100; // Assuming nutrition is per 100g
            return {
                calories: total.calories + (ing.calories * multiplier),
                protein: total.protein + (ing.protein * multiplier),
                carbs: total.carbs + (ing.carbs * multiplier),
                fats: total.fats + (ing.fats * multiplier)
            };
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
    };

    const handleSaveRecipe = () => {
        if (!recipeName.trim() || ingredients.length === 0) {
            alert('Please add a recipe name and at least one ingredient');
            return;
        }

        const totalNutrition = calculateTotalNutrition();
        const perServing = {
            calories: Math.round(totalNutrition.calories / servings),
            protein: Math.round(totalNutrition.protein / servings),
            carbs: Math.round(totalNutrition.carbs / servings),
            fats: Math.round(totalNutrition.fats / servings)
        };

        const recipe = {
            name: recipeName,
            description,
            servings,
            prepTime,
            cookTime,
            category,
            instructions,
            ingredients,
            nutrition: {
                total: totalNutrition,
                perServing
            },
            favorite: false
        };

        if (editingRecipe) {
            updateRecipe(editingRecipe.id, recipe);
        } else {
            addRecipe(recipe);
        }

        resetForm();
        setView('library');
    };

    const resetForm = () => {
        setRecipeName('');
        setDescription('');
        setServings(4);
        setPrepTime(15);
        setCookTime(30);
        setCategory('dinner');
        setInstructions('');
        setIngredients([]);
        setEditingRecipe(null);
    };

    const handleEditRecipe = (recipe) => {
        setEditingRecipe(recipe);
        setRecipeName(recipe.name);
        setDescription(recipe.description);
        setServings(recipe.servings);
        setPrepTime(recipe.prepTime);
        setCookTime(recipe.cookTime);
        setCategory(recipe.category);
        setInstructions(recipe.instructions);
        setIngredients(recipe.ingredients);
        setView('create');
    };

    const handleLogRecipe = (recipe, servingSize = 1) => {
        const nutrition = recipe.nutrition.perServing;
        const foodLog = {
            name: `${recipe.name} (${servingSize} serving${servingSize > 1 ? 's' : ''})`,
            calories: nutrition.calories * servingSize,
            protein: nutrition.protein * servingSize,
            carbs: nutrition.carbs * servingSize,
            fats: nutrition.fats * servingSize,
            meal: recipe.category,
            isRecipe: true,
            recipeId: recipe.id
        };

        addFoodLog(foodLog);
        alert(`${recipe.name} logged successfully!`);
    };

    const toggleFavorite = (recipe) => {
        updateRecipe(recipe.id, { ...recipe, favorite: !recipe.favorite });
    };

    const handleImportFromUrl = async () => {
        if (!recipeUrl.trim()) return;

        setIsImporting(true);
        try {
            // Simple demo parser - in production, you'd use a recipe parsing API
            // For now, we'll create a template recipe that users can edit
            const urlObj = new URL(recipeUrl);
            const siteName = urlObj.hostname.replace('www.', '');

            // Create a template recipe from URL
            const importedRecipe = {
                name: `Recipe from ${siteName}`,
                description: `Imported from ${recipeUrl}`,
                servings: 4,
                prepTime: 15,
                cookTime: 30,
                category: 'dinner',
                instructions: 'Visit the original URL to view full instructions.',
                ingredients: [],
                sourceUrl: recipeUrl
            };

            // Pre-fill the form with imported data
            setRecipeName(importedRecipe.name);
            setDescription(importedRecipe.description);
            setServings(importedRecipe.servings);
            setPrepTime(importedRecipe.prepTime);
            setCookTime(importedRecipe.cookTime);
            setCategory(importedRecipe.category);
            setInstructions(importedRecipe.instructions);

            // Switch to create view
            setShowUrlImport(false);
            setRecipeUrl('');
            setView('create');

            alert('Recipe template created! Please add ingredients and adjust details.');
        } catch (error) {
            console.error('Error importing recipe:', error);
            alert('Invalid URL. Please enter a valid recipe URL.');
        } finally {
            setIsImporting(false);
        }
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="recipe-manager animate-fadeIn">
            {/* Header */}
            <div className="recipe-header">
                <div>
                    <h1>Recipe Manager 📖</h1>
                    <p>Create, save, and manage your favorite recipes</p>
                </div>
                {view === 'library' && (
                    <div className="header-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowUrlImport(true)}
                        >
                            <Plus size={20} />
                            Import from URL
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => setView('create')}
                        >
                            <Plus size={20} />
                            Create Recipe
                        </button>
                    </div>
                )}
                {view === 'create' && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            resetForm();
                            setView('library');
                        }}
                    >
                        <X size={20} />
                        Cancel
                    </button>
                )}
            </div>

            {/* URL Import Modal */}
            {showUrlImport && (
                <div className="modal-overlay" onClick={() => setShowUrlImport(false)}>
                    <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Import Recipe from URL</h3>
                            <button
                                className="btn btn-icon"
                                onClick={() => setShowUrlImport(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Enter a recipe URL from popular cooking websites:</p>
                            <input
                                type="url"
                                className="form-input"
                                value={recipeUrl}
                                onChange={(e) => setRecipeUrl(e.target.value)}
                                placeholder="https://example.com/recipe"
                                onKeyPress={(e) => e.key === 'Enter' && handleImportFromUrl()}
                            />
                            <p className="import-note">
                                📝 Note: This will create a recipe template. You'll need to add ingredients manually.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowUrlImport(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleImportFromUrl}
                                disabled={!recipeUrl.trim() || isImporting}
                            >
                                {isImporting ? 'Importing...' : 'Import Recipe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Library View */}
            {view === 'library' && (
                <div className="recipe-library">
                    {/* Search */}
                    <div className="recipe-search card">
                        <Search size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search recipes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Recipe Grid */}
                    {filteredRecipes.length === 0 ? (
                        <div className="empty-state card">
                            <ChefHat size={64} />
                            <h3>No Recipes Yet</h3>
                            <p>Create your first recipe to get started!</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setView('create')}
                            >
                                <Plus size={20} />
                                Create Recipe
                            </button>
                        </div>
                    ) : (
                        <div className="recipe-grid">
                            {filteredRecipes.map(recipe => (
                                <div key={recipe.id} className="recipe-card card">
                                    <div className="recipe-card-header">
                                        <div className="recipe-category">
                                            {categories.find(c => c.id === recipe.category)?.icon}
                                        </div>
                                        <button
                                            className={`favorite-btn ${recipe.favorite ? 'active' : ''}`}
                                            onClick={() => toggleFavorite(recipe)}
                                        >
                                            <Star size={20} fill={recipe.favorite ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>

                                    <h3>{recipe.name}</h3>
                                    <p className="recipe-description">{recipe.description}</p>

                                    <div className="recipe-meta">
                                        <span><Clock size={16} /> {recipe.prepTime + recipe.cookTime} min</span>
                                        <span><Users size={16} /> {recipe.servings} servings</span>
                                    </div>

                                    <div className="recipe-nutrition">
                                        <div className="nutrition-item">
                                            <span className="label">Calories</span>
                                            <span className="value">{recipe.nutrition.perServing.calories}</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="label">Protein</span>
                                            <span className="value">{recipe.nutrition.perServing.protein}g</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="label">Carbs</span>
                                            <span className="value">{recipe.nutrition.perServing.carbs}g</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="label">Fats</span>
                                            <span className="value">{recipe.nutrition.perServing.fats}g</span>
                                        </div>
                                    </div>

                                    <div className="recipe-actions">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                setSelectedRecipe(recipe);
                                                setView('detail');
                                            }}
                                        >
                                            View
                                        </button>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleLogRecipe(recipe)}
                                        >
                                            Log Meal
                                        </button>
                                        <button
                                            className="btn btn-icon"
                                            onClick={() => handleEditRecipe(recipe)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn btn-icon btn-danger"
                                            onClick={() => {
                                                if (confirm(`Delete "${recipe.name}"?`)) {
                                                    deleteRecipe(recipe.id);
                                                }
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit View */}
            {view === 'create' && (
                <div className="recipe-form">
                    <div className="form-section card">
                        <h3>{editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}</h3>

                        <div className="form-group">
                            <label className="form-label">Recipe Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={recipeName}
                                onChange={(e) => setRecipeName(e.target.value)}
                                placeholder="e.g., Chicken Stir Fry"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of your recipe..."
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-input"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Servings</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={servings}
                                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                                    min="1"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Prep Time (min)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={prepTime}
                                    onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Cook Time (min)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={cookTime}
                                    onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <div className="form-section card">
                        <h3>Ingredients *</h3>

                        <div className="ingredient-search">
                            <input
                                type="text"
                                className="form-input"
                                value={ingredientSearch}
                                onChange={(e) => setIngredientSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchIngredient()}
                                placeholder="Search for ingredients..."
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleSearchIngredient}
                                disabled={isSearching}
                            >
                                <Search size={20} />
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {ingredientResults.length > 0 && (
                            <div className="ingredient-results">
                                {ingredientResults.map(food => (
                                    <div
                                        key={food.fdcId}
                                        className="ingredient-result"
                                        onClick={() => handleAddIngredient(food)}
                                    >
                                        <span>{food.name}</span>
                                        <Plus size={16} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {ingredients.length > 0 && (
                            <div className="ingredients-list">
                                {ingredients.map(ing => (
                                    <div key={ing.id} className="ingredient-item">
                                        <span className="ingredient-name">{ing.name}</span>
                                        <div className="ingredient-controls">
                                            <input
                                                type="number"
                                                className="form-input-sm"
                                                value={ing.amount}
                                                onChange={(e) => handleUpdateIngredient(ing.id, 'amount', e.target.value)}
                                                min="0"
                                                step="0.1"
                                            />
                                            <span className="unit">g</span>
                                            <button
                                                className="btn btn-icon btn-sm"
                                                onClick={() => handleRemoveIngredient(ing.id)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {ingredients.length > 0 && (
                            <div className="nutrition-summary">
                                <h4>Total Nutrition</h4>
                                <div className="nutrition-grid">
                                    <div>
                                        <span>Calories:</span>
                                        <strong>{Math.round(calculateTotalNutrition().calories)}</strong>
                                    </div>
                                    <div>
                                        <span>Protein:</span>
                                        <strong>{Math.round(calculateTotalNutrition().protein)}g</strong>
                                    </div>
                                    <div>
                                        <span>Carbs:</span>
                                        <strong>{Math.round(calculateTotalNutrition().carbs)}g</strong>
                                    </div>
                                    <div>
                                        <span>Fats:</span>
                                        <strong>{Math.round(calculateTotalNutrition().fats)}g</strong>
                                    </div>
                                </div>
                                <p className="per-serving">
                                    Per serving ({servings} servings): {Math.round(calculateTotalNutrition().calories / servings)} cal
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="form-section card">
                        <h3>Instructions</h3>
                        <textarea
                            className="form-input"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Step-by-step cooking instructions..."
                            rows="6"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleSaveRecipe}
                        disabled={!recipeName.trim() || ingredients.length === 0}
                    >
                        <Plus size={20} />
                        {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
                    </button>
                </div>
            )}

            {/* Detail View */}
            {view === 'detail' && selectedRecipe && (
                <div className="recipe-detail">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setView('library')}
                    >
                        ← Back to Library
                    </button>

                    <div className="detail-card card">
                        <div className="detail-header">
                            <div>
                                <h2>{selectedRecipe.name}</h2>
                                <p>{selectedRecipe.description}</p>
                            </div>
                            <button
                                className={`favorite-btn-large ${selectedRecipe.favorite ? 'active' : ''}`}
                                onClick={() => toggleFavorite(selectedRecipe)}
                            >
                                <Star size={32} fill={selectedRecipe.favorite ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        <div className="detail-meta">
                            <div className="meta-item">
                                <span className="meta-icon">{categories.find(c => c.id === selectedRecipe.category)?.icon}</span>
                                <span>{categories.find(c => c.id === selectedRecipe.category)?.name}</span>
                            </div>
                            <div className="meta-item">
                                <Clock size={20} />
                                <span>{selectedRecipe.prepTime + selectedRecipe.cookTime} minutes</span>
                            </div>
                            <div className="meta-item">
                                <Users size={20} />
                                <span>{selectedRecipe.servings} servings</span>
                            </div>
                        </div>

                        <div className="detail-nutrition">
                            <h3>Nutrition (per serving)</h3>
                            <div className="nutrition-detail-grid">
                                <div className="nutrition-detail-item">
                                    <span className="label">Calories</span>
                                    <span className="value">{selectedRecipe.nutrition.perServing.calories}</span>
                                </div>
                                <div className="nutrition-detail-item">
                                    <span className="label">Protein</span>
                                    <span className="value">{selectedRecipe.nutrition.perServing.protein}g</span>
                                </div>
                                <div className="nutrition-detail-item">
                                    <span className="label">Carbs</span>
                                    <span className="value">{selectedRecipe.nutrition.perServing.carbs}g</span>
                                </div>
                                <div className="nutrition-detail-item">
                                    <span className="label">Fats</span>
                                    <span className="value">{selectedRecipe.nutrition.perServing.fats}g</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-ingredients">
                            <h3>Ingredients</h3>
                            <ul>
                                {selectedRecipe.ingredients.map(ing => (
                                    <li key={ing.id}>
                                        {ing.amount}g {ing.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {selectedRecipe.instructions && (
                            <div className="detail-instructions">
                                <h3>Instructions</h3>
                                <p>{selectedRecipe.instructions}</p>
                            </div>
                        )}

                        <div className="detail-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => handleLogRecipe(selectedRecipe)}
                            >
                                Log as Meal
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleEditRecipe(selectedRecipe)}
                            >
                                <Edit2 size={20} />
                                Edit Recipe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeManager;
