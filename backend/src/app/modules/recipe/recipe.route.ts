import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import CommentController from '../comment/comment.controller';
import CommentValidation from '../comment/comment.validation';
import RecipeController from './recipe.controller';
import RecipeValidation from './recipe.validation';

const router = Router();

// Public routes
router.get('/', RecipeController.getAllRecipes);
router.get('/featured', RecipeController.getFeaturedRecipes);
router.get('/popular', RecipeController.getPopularRecipes);
router.get('/my-recipes', auth('SELLER'), RecipeController.getMyRecipes);
router.get('/:id', RecipeController.getSingleRecipe);

// Comments on recipes
router.get('/:recipeId/comments', CommentController.getRecipeComments);
router.post(
  '/:recipeId/comments',
  auth('USER'),
  validateRequest(CommentValidation.createCommentSchema),
  CommentController.addComment
);

// Seller routes
router.post(
  '/',
  auth('SELLER'),
  validateRequest(RecipeValidation.createRecipeSchema),
  RecipeController.createRecipe
);

// Seller & Admin management routes
router.patch(
  '/:id',
  auth('SELLER', 'ADMIN'),
  validateRequest(RecipeValidation.updateRecipeSchema),
  RecipeController.updateRecipe
);

router.delete('/:id', auth('SELLER', 'ADMIN'), RecipeController.deleteRecipe);

// User Like routes
router.post('/:id/like', auth('USER'), RecipeController.toggleLikeRecipe);
router.get('/:id/like-status', auth('USER'), RecipeController.checkLikeStatus);

export const RecipeRoutes = router;
export default RecipeRoutes;

