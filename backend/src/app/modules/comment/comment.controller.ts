import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import CommentService from './comment.service';

export const addComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { recipeId } = req.params;
  const { text } = req.body;

  const result = await CommentService.addComment(recipeId as string, userId, text);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Comment added successfully',
    data: result
  });
});

export const getRecipeComments = catchAsync(async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const result = await CommentService.getRecipeComments(recipeId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comments retrieved successfully',
    data: result
  });
});

export const updateComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { text } = req.body;

  const result = await CommentService.updateComment(id as string, userId, text);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment updated successfully',
    data: result
  });
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  await CommentService.deleteComment(id as string, user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment deleted successfully',
    data: null
  });
});

export const CommentController = {
  addComment,
  getRecipeComments,
  updateComment,
  deleteComment
};

export default CommentController;
