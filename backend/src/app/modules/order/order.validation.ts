import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          recipeId: z.string({ required_error: 'Recipe ID is required' }),
          quantity: z.number().int().min(1).default(1)
        })
      )
      .optional(),
    fromCart: z.boolean().optional()
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional()
  })
});

export const OrderValidation = {
  createOrderSchema,
  updateOrderStatusSchema
};

export default OrderValidation;
