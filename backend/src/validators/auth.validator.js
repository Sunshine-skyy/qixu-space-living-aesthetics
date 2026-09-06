import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().trim().min(2).max(50),
  email: z.string().trim().email().max(191),
  password: z.string().min(6).max(72)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(191),
  password: z.string().min(1).max(72)
});
