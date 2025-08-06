import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("邮箱格式不正确"),
    password: z.string().min(6, "至少 6 位"),
});

export const registerSchema = loginSchema
    .extend({
        name: z.string().min(1, "昵称不能为空"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "两次密码不一致",
        path: ["confirmPassword"],
    });

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
