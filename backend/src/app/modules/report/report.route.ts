import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import ReportController from './report.controller';
import ReportValidation from './report.validation';

const router = Router();

// Customer submits report
router.post(
  '/',
  auth('USER'),
  validateRequest(ReportValidation.createReportSchema),
  ReportController.createReport
);

// Admin moderation routes
router.get('/', auth('ADMIN'), ReportController.getAllReports);
router.patch('/:id/resolve', auth('ADMIN'), ReportController.resolveReport);
router.patch('/:id/dismiss', auth('ADMIN'), ReportController.dismissReport);
router.patch(
  '/:id/status',
  auth('ADMIN'),
  validateRequest(ReportValidation.updateReportStatusSchema),
  ReportController.updateReportStatus
);

export const ReportRoutes = router;
export default ReportRoutes;
