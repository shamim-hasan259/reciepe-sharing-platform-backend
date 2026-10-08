import { Document, Schema, Types, model } from 'mongoose';

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

const reportSchema = new Schema<IReportDocument>(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
      index: true
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reporterEmail: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      enum: ['Spam', 'Offensive Content', 'Copyright Issue'],
      required: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'dismissed', 'resolved'],
      default: 'pending',
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

export const Report = model<IReportDocument>('Report', reportSchema);
export default Report;
