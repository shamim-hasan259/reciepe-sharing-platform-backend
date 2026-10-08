import { Types } from 'mongoose';
import Like from '../app/modules/recipe/like.model';
import Recipe from '../app/modules/recipe/recipe.model';
import RecipeService from '../app/modules/recipe/recipe.service';
import User from '../app/modules/user/user.model';

jest.mock('../app/modules/recipe/recipe.model');
jest.mock('../app/modules/recipe/like.model');
jest.mock('../app/modules/user/user.model');

describe('Recipe Service & Business Logic Tests', () => {
  const sellerId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  const mockSeller = {
    _id: new Types.ObjectId(sellerId),
    name: 'Chef Gordon',
    email: 'gordon@example.com',
    role: 'SELLER',
    isPremium: false
  };

  const mockRecipePayload = {
    recipeName: 'Beef Wellington',
    recipeImage: 'https://example.com/beef.jpg',
    category: 'British',
    cuisineType: 'British',
    difficultyLevel: 'Hard' as const,
    preparationTime: 90,
    ingredients: ['Beef', 'Pastry'],
    instructions: ['Sear', 'Bake'],
    price: 30,
    status: 'published' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Free Recipe Limit Enforcement', () => {
    it('should create recipe if non-premium seller has less than 2 recipes', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockSeller);
      (Recipe.countDocuments as jest.Mock).mockResolvedValue(1); // count = 1 (< 2)
      (Recipe.create as jest.Mock).mockResolvedValue({
        ...mockRecipePayload,
        _id: new Types.ObjectId(),
        authorId: mockSeller._id
      });

      const recipe = await RecipeService.createRecipe(sellerId, mockRecipePayload);

      expect(recipe).toBeDefined();
      expect(Recipe.create).toHaveBeenCalled();
    });

    it('should REJECT recipe creation if non-premium seller already has 2 recipes', async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockSeller);
      (Recipe.countDocuments as jest.Mock).mockResolvedValue(2); // count = 2 (limit reached)

      await expect(
        RecipeService.createRecipe(sellerId, mockRecipePayload)
      ).rejects.toThrow('Free recipe limit reached');
    });

    it('should ALLOW recipe creation if seller is PREMIUM even if count >= 2', async () => {
      const premiumSeller = {
        ...mockSeller,
        isPremium: true
      };

      (User.findById as jest.Mock).mockResolvedValue(premiumSeller);
      (Recipe.create as jest.Mock).mockResolvedValue({
        ...mockRecipePayload,
        _id: new Types.ObjectId()
      });

      const recipe = await RecipeService.createRecipe(sellerId, mockRecipePayload);

      expect(recipe).toBeDefined();
      expect(Recipe.create).toHaveBeenCalled();
    });
  });

  describe('Like / Unlike Toggle System', () => {
    const recipeId = new Types.ObjectId().toString();

    it('should like a recipe if not previously liked', async () => {
      (Recipe.findById as jest.Mock).mockResolvedValue({ _id: recipeId, likesCount: 5 });
      (User.findById as jest.Mock).mockResolvedValue({ _id: userId, role: 'USER' });
      (Like.findOne as jest.Mock).mockResolvedValue(null);
      (Like.create as jest.Mock).mockResolvedValue({});
      (Recipe.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: recipeId, likesCount: 6 });

      const result = await RecipeService.toggleLikeRecipe(recipeId, userId);

      expect(result.isLiked).toBe(true);
      expect(result.likesCount).toBe(6);
      expect(Like.create).toHaveBeenCalled();
    });

    it('should unlike a recipe if previously liked', async () => {
      (Recipe.findById as jest.Mock).mockResolvedValue({ _id: recipeId, likesCount: 6 });
      (User.findById as jest.Mock).mockResolvedValue({ _id: userId, role: 'USER' });
      (Like.findOne as jest.Mock).mockResolvedValue({ _id: 'like_id' });
      (Like.findByIdAndDelete as jest.Mock).mockResolvedValue({});
      (Recipe.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: recipeId, likesCount: 5 });

      const result = await RecipeService.toggleLikeRecipe(recipeId, userId);

      expect(result.isLiked).toBe(false);
      expect(result.likesCount).toBe(5);
      expect(Like.findByIdAndDelete).toHaveBeenCalled();
    });
  });
});
