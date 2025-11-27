// frontend/Plated/src/pages/CreatePostPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePostPage.css';

type PostType = 'simple' | 'recipe';

interface RecipeData {
  title: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  ingredients: { item: string; amount: string; unit: string }[];
  instructions: string[];
  tags: string[];
}

function CreatePostPage() {
  const navigate = useNavigate();
  const [postType, setPostType] = useState<PostType>('simple');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // Recipe fields
  const [recipeTitle, setRecipeTitle] = useState('');
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState('medium');
  const [cuisine, setCuisine] = useState('');
  const [ingredients, setIngredients] = useState<{ item: string; amount: string; unit: string }[]>([
    { item: '', amount: '', unit: '' }
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof typeof ingredients[0], value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      setError('Please select an image');
      return;
    }

    if (postType === 'recipe') {
      if (!recipeTitle.trim()) {
        setError('Recipe title is required');
        return;
      }
      if (ingredients.every(ing => !ing.item.trim())) {
        setError('At least one ingredient is required');
        return;
      }
      if (instructions.every(inst => !inst.trim())) {
        setError('At least one instruction is required');
        return;
      }
    }

    setIsUploading(true);
    setError('');

    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await fetch('http://localhost:5000/api/posts/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error('Image upload failed');
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.image_url;

      // 2. Create post
      const postData: any = {
        post_type: postType,
        image_url: imageUrl,
        caption: caption.trim()
      };

      if (postType === 'recipe') {
        const recipeData: RecipeData = {
          title: recipeTitle,
          prep_time: prepTime,
          cook_time: cookTime,
          servings: servings,
          difficulty: difficulty,
          cuisine: cuisine,
          ingredients: ingredients.filter(ing => ing.item.trim()),
          instructions: instructions.filter(inst => inst.trim()),
          tags: tags
        };
        postData.recipe_data = recipeData;
      }

      const createRes = await fetch('http://localhost:5000/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!createRes.ok) {
        throw new Error('Failed to create post');
      }

      // Success - navigate to feed
      navigate('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="create-post-page">
      <header className="create-post-header">
        <button className="back-btn" onClick={() => navigate('/feed')}>
          Cancel
        </button>
        <h1>Create Post</h1>
        <button className="submit-btn" onClick={handleSubmit} disabled={isUploading}>
          {isUploading ? 'Posting...' : 'Post'}
        </button>
      </header>

      <div className="create-post-content">
        {error && <div className="error-message">{error}</div>}

        {/* Post Type Toggle */}
        <div className="post-type-toggle">
          <button
            className={postType === 'simple' ? 'active' : ''}
            onClick={() => setPostType('simple')}
          >
            Simple Post
          </button>
          <button
            className={postType === 'recipe' ? 'active' : ''}
            onClick={() => setPostType('recipe')}
          >
            Recipe Post
          </button>
        </div>

        {/* Image Upload */}
        <div className="image-upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            id="image-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="image-input" className="image-upload-label">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">
                <span>+ Add Photo</span>
              </div>
            )}
          </label>
        </div>

        {/* Caption */}
        <div className="form-group">
          <label>Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={3}
          />
        </div>

        {/* Recipe Fields (only if recipe post) */}
        {postType === 'recipe' && (
          <div className="recipe-fields">
            <div className="form-group">
              <label>Recipe Title *</label>
              <input
                type="text"
                value={recipeTitle}
                onChange={(e) => setRecipeTitle(e.target.value)}
                placeholder="e.g., Chicken Alfredo"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Prep Time (min)</label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Cook Time (min)</label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Servings</label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cuisine</label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g., Italian"
                />
              </div>
            </div>

            {/* Ingredients */}
            <div className="form-group">
              <label>Ingredients *</label>
              {ingredients.map((ing, idx) => (
                <div key={idx} className="ingredient-row">
                  <input
                    type="text"
                    placeholder="Amount"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Ingredient"
                    value={ing.item}
                    onChange={(e) => updateIngredient(idx, 'item', e.target.value)}
                  />
                  {ingredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredient(idx)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addIngredient} className="add-btn">
                + Add Ingredient
              </button>
            </div>

            {/* Instructions */}
            <div className="form-group">
              <label>Instructions *</label>
              {instructions.map((inst, idx) => (
                <div key={idx} className="instruction-row">
                  <span className="instruction-number">{idx + 1}.</span>
                  <textarea
                    value={inst}
                    onChange={(e) => updateInstruction(idx, e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                  />
                  {instructions.length > 1 && (
                    <button type="button" onClick={() => removeInstruction(idx)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addInstruction} className="add-btn">
                + Add Step
              </button>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label>Tags</label>
              <div className="tags-input">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag and press Enter"
                />
                <button type="button" onClick={addTag}>Add</button>
              </div>
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatePostPage;
