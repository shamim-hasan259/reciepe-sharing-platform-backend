import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import Comment from '../comment/comment.model';
import Like from '../recipe/like.model';
import Recipe from '../recipe/recipe.model';
import { IReport, ReportReason, ReportStatus } from './report.interface';
import Report from './report.model';

export const createReport = async (
  userId: string,
  userEmail: string,
  payload: { recipeId: string; reason: ReportReason; description?: string }
) => {
  const recipe = await Recipe.findById(payload.recipeId);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const existingReport = await Report.findOne({
    recipeId: new Types.ObjectId(payload.recipeId),
    reporterId: new Types.ObjectId(userId),
    status: 'pending'
  });

  if (existingReport) {
    throw new AppError(400, 'You already have a pending report for this recipe');
  }

  const report = await Report.create({
    recipeId: new Types.ObjectId(payload.recipeId),
    reporterId: new Types.ObjectId(userId),
    reporterEmail: userEmail,
    reason: payload.reason,
    description: payload.description || '',
    status: 'pending'
  });

  return report;
};

export const getAllReports = async (query: any) => {
  const page = parseInt(String(query.page || '1'), 10);
  const limit = parseInt(String(query.limit || '10'), 10);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.status) {
    filter.status = query.status;
  }
  if (query.reason) {
    filter.reason = query.reason;
  }

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('recipeId', 'recipeName recipeImage authorName authorEmail')
      .populate('reporterId', 'name email image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    data: reports
  };
};

export const resolveReport = async (reportId: string, removeRecipe = false) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError(404, 'Report not found');
  }

  if (removeRecipe && report.recipeId) {
    await Recipe.findByIdAndDelete(report.recipeId);
    await Like.deleteMany({ recipeId: report.recipeId });
    await Comment.deleteMany({ recipeId: report.recipeId });
  }

  report.status = 'resolved';
  await report.save();

  return report;
};

export const dismissReport = async (reportId: string) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError(404, 'Report not found');
  }

  report.status = 'dismissed';
  await report.save();

  return report;
};

export const updateReportStatus = async (reportId: string, status: ReportStatus) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError(404, 'Report not found');
  }

  report.status = status;
  await report.save();

  return report;
};

export const ReportService = {
  createReport,
  getAllReports,
  resolveReport,
  dismissReport,
  updateReportStatus
};

export default ReportService;
