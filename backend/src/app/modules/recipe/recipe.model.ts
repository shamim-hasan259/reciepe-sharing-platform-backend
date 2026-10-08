import { Schema, model } from 'mongoose';
import { IRecipeDocument, RecipeModelType } from './recipe.interface';

const recipeSchema = new Schema<IRecipeDocument, RecipeModelType>(
  {
    recipeName: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true
    },
    recipeImage: {
      type: String,
      required: [true, 'Recipe image is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    cuisineType: {
      type: String,
      required: [true, 'Cuisine type is required'],
      trim: true,
      index: true
    },
    difficultyLevel: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
      index: true
    },
    preparationTime: {
      type: Number,
      required: [true, 'Preparation time in minutes is required']
    },
    ingredients: {
      type: [String],
      required: [true, 'Ingredients are required'],
      validate: {
        validator: (val: string[]) => val.length > 0,
        message: 'At least one ingredient is required'
      }
    },
    instructions: {
      type: [String],
      required: [true, 'Instructions are required'],
      validate: {
        validator: (val: string[]) => val.length > 0,
        message: 'At least one instruction is required'
      }
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    authorName: {
      type: String,
      required: true
    },
    authorEmail: {
      type: String,
      required: true
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

recipeSchema.index({ recipeName: 'text', category: 'text', cuisineType: 'text' });

export const Recipe = model<IRecipeDocument, RecipeModelType>('Recipe', recipeSchema);
export default Recipe;
