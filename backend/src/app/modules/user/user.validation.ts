import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    image: z.string().optional()
  })
});

export const UserValidation = {
  updateProfileSchema
};

export default UserValidation;
