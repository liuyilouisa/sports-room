import { z } from "zod";

export const createActivitySchema = z.object({
    title: z.string().min(1, "标题不能为空"),
    description: z.string().min(1, "描述不能为空"),
    capacity: z.coerce.number().int().positive("人数必须为正整数"),
});
export type CreateActivityDTO = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = createActivitySchema.partial().extend({
    status: z.enum(["draft", "published"]).optional(),
});
export type UpdateActivityDTO = z.infer<typeof updateActivitySchema>;
