import { Document, Types } from 'mongoose';

export type ReportReason = 'Spam' | 'Offensive Content' | 'Copyright Issue';
export type ReportStatus = 'pending' | 'dismissed' | 'resolved';

export interface IReport {
  recipeId: Types.ObjectId;
  reporterId: Types.ObjectId;
  reporterEmail: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReportDocument extends IReport, Document {}
