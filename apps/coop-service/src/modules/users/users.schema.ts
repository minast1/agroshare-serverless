import z from "zod";

export const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email address'),
    age: z.number().int().positive(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;