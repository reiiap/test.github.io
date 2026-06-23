import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol");

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  email: z.string().email("Enter a valid email").toLowerCase(),
  password,
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(1200),
  price: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
