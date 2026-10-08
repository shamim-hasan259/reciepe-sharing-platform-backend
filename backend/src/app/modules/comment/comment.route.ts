import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import CommentController from './comment.controller';
import CommentValidation from './comment.validation';

const router = Router();

router.patch(
  '/:id',
  auth('USER'),
  validateRequest(CommentValidation.updateCommentSchema),
  CommentController.updateComment
);

router.delete('/:id', auth('USER', 'ADMIN', 'SELLER'), CommentController.deleteComment);

export const CommentRoutes = router;
export default CommentRoutes;
