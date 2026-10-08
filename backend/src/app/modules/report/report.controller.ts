import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ReportService from './report.service';

export const createReport = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userEmail = req.user!.email;

  const result = await ReportService.createReport(userId, userEmail, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Report submitted successfully',
    data: result
  });
});

export const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getAllReports(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reports retrieved successfully',
    meta: result.meta,
    data: result.data
  });
});

export const resolveReport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { removeRecipe } = req.body;

  const result = await ReportService.resolveReport(id as string, removeRecipe === true);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Report resolved successfully',
    data: result
  });
});

export const dismissReport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ReportService.dismissReport(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Report dismissed successfully',
    data: result
  });
});

export const updateReportStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await ReportService.updateReportStatus(id as string, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Report status updated successfully',
    data: result
  });
});

export const ReportController = {
  createReport,
  getAllReports,
  resolveReport,
  dismissReport,
  updateReportStatus
};

export default ReportController;
