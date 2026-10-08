import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }).min(1),
    image: z.string().optional(),
    description: z.string().optional()
  })
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    image: z.string().optional(),
    description: z.string().optional()
  })
});

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema
};

export default CategoryValidation;
