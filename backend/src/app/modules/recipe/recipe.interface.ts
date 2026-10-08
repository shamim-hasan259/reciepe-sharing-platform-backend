import { Document, Model, Types } from 'mongoose';

export type RecipeDifficulty = 'Easy' | 'Medium' | 'Hard';
export type RecipeStatus = 'published' | 'draft' | 'archived';

export interface IRecipe {
  recipeName: string;
  recipeImage: string;
  category: string;
  cuisineType: string;
  difficultyLevel: RecipeDifficulty;
  preparationTime: number; // in minutes
  ingredients: string[];
  instructions: string[];
  price: number;
  authorId: Types.ObjectId;
  authorName: string;
  authorEmail: string;
  likesCount: number;
  isFeatured: boolean;
  status: RecipeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRecipeDocument extends IRecipe, Document {}

export type RecipeModelType = Model<IRecipeDocument>;
