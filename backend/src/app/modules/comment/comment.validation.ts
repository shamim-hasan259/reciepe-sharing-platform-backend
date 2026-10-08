import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    text: z.string({ required_error: 'Comment text is required' }).min(1, 'Comment text cannot be empty')
  })
});

export const updateCommentSchema = z.object({
  body: z.object({
    text: z.string({ required_error: 'Comment text is required' }).min(1, 'Comment text cannot be empty')
  })
});

export const CommentValidation = {
  createCommentSchema,
  updateCommentSchema
};

export default CommentValidation;
