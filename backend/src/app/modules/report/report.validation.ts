import { z } from 'zod';

export const createReportSchema = z.object({
  body: z.object({
    recipeId: z.string({ required_error: 'Recipe ID is required' }),
    reason: z.enum(['Spam', 'Offensive Content', 'Copyright Issue'], {
      required_error: 'Reason is required'
    }),
    description: z.string().optional()
  })
});

export const updateReportStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'dismissed', 'resolved'], {
      required_error: 'Status is required'
    })
  })
});

export const ReportValidation = {
  createReportSchema,
  updateReportStatusSchema
};

export default ReportValidation;
