import { z } from 'zod';

export const checkoutOrderSchema = z.object({
  body: z.object({
    orderId: z.string({ required_error: 'Order ID is required' })
  })
});

export const verifySessionSchema = z.object({
  body: z.object({
    sessionId: z.string({ required_error: 'Session ID is required' })
  })
});

export const PaymentValidation = {
  checkoutOrderSchema,
  verifySessionSchema
};

export default PaymentValidation;
