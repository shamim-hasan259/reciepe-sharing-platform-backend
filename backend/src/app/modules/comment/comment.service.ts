import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import Recipe from '../recipe/recipe.model';
import User from '../user/user.model';
import Comment from './comment.model';

export const addComment = async (
  recipeId: string,
  userId: string,
  text: string
) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const comment = await Comment.create({
    recipeId: new Types.ObjectId(recipeId),
    userId: new Types.ObjectId(userId),
    userName: user.name,
    userImage: user.image || '',
    text: text.trim()
  });

  return comment;
};

export const getRecipeComments = async (recipeId: string) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const comments = await Comment.find({ recipeId }).sort({ createdAt: -1 });
  return comments;
};

export const updateComment = async (
  commentId: string,
  userId: string,
  text: string
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(404, 'Comment not found');
  }

  if (comment.userId.toString() !== userId) {
    throw new AppError(403, 'You are not authorized to edit this comment');
  }

  comment.text = text.trim();
  await comment.save();

  return comment;
};

export const deleteComment = async (
  commentId: string,
  user: { userId: string; role: string }
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(404, 'Comment not found');
  }

  const recipe = await Recipe.findById(comment.recipeId);

  // Authorized if: Comment Author OR Admin OR Recipe Seller
  const isAuthor = comment.userId.toString() === user.userId;
  const isAdmin = user.role === 'ADMIN';
  const isRecipeOwner = recipe && recipe.authorId.toString() === user.userId;

  if (!isAuthor && !isAdmin && !isRecipeOwner) {
    throw new AppError(403, 'You are not authorized to delete this comment');
  }

  await Comment.findByIdAndDelete(commentId);
  return null;
};

export const CommentService = {
  addComment,
  getRecipeComments,
  updateComment,
  deleteComment
};

export default CommentService;
