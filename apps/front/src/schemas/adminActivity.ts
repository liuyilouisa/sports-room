import { z } from "zod";

export const createActivitySchema = z.object({
    title: z.string().min(1, "标题不能为空"),
    description: z.string().min(1, "描述不能为空"),
    capacity: z.coerce.number().int().positive("人数必须为正整数"),
    startAt: z.string().min(1, "开始时间不能为空").pipe(z.coerce.date()),
    endAt: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : null))
        .pipe(z.date().nullable()),
});
export type CreateActivityDTO = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = createActivitySchema.partial().extend({
    status: z.enum(["draft", "published"]).optional(),
});
export type UpdateActivityDTO = z.infer<typeof updateActivitySchema>;
