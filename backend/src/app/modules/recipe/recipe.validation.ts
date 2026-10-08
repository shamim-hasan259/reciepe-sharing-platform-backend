import { z } from 'zod';

export const createRecipeSchema = z.object({
  body: z.object({
    recipeName: z.string({ required_error: 'Recipe name is required' }).min(1),
    recipeImage: z.string({ required_error: 'Recipe image is required' }).url('Invalid image URL').or(z.string().min(1)),
    category: z.string({ required_error: 'Category is required' }).min(1),
    cuisineType: z.string({ required_error: 'Cuisine type is required' }).min(1),
    difficultyLevel: z.enum(['Easy', 'Medium', 'Hard'], {
      required_error: 'Difficulty level is required'
    }),
    preparationTime: z.number({ required_error: 'Preparation time is required' }).min(1),
    ingredients: z.array(z.string().min(1), { required_error: 'Ingredients are required' }).min(1),
    instructions: z.array(z.string().min(1), { required_error: 'Instructions are required' }).min(1),
    price: z.number().min(0).optional().default(0)
  })
});

export const updateRecipeSchema = z.object({
  body: z.object({
    recipeName: z.string().min(1).optional(),
    recipeImage: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    cuisineType: z.string().min(1).optional(),
    difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']).optional(),
    preparationTime: z.number().min(1).optional(),
    ingredients: z.array(z.string().min(1)).min(1).optional(),
    instructions: z.array(z.string().min(1)).min(1).optional(),
    price: z.number().min(0).optional(),
    status: z.enum(['published', 'draft', 'archived']).optional(),
    isFeatured: z.boolean().optional()
  })
});

export const RecipeValidation = {
  createRecipeSchema,
  updateRecipeSchema
};

export default RecipeValidation;
