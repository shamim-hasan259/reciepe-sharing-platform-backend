import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['ADMIN', 'SELLER', 'USER'], {
      required_error: 'Role is required'
    })
  })
});

export const featureRecipeSchema = z.object({
  body: z.object({
    isFeatured: z.boolean({
      required_error: 'isFeatured boolean is required'
    })
  })
});

export const AdminValidation = {
  updateUserRoleSchema,
  featureRecipeSchema
};

export default AdminValidation;
