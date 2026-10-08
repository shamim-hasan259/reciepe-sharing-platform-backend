import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    recipeId: z.string({ required_error: 'Recipe ID is required' }),
    quantity: z.number().int().min(1).optional().default(1)
  })
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number({ required_error: 'Quantity is required' }).int().min(1)
  })
});

export const CartValidation = {
  addToCartSchema,
  updateCartItemSchema
};

export default CartValidation;
