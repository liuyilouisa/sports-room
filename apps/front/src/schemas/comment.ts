import { z } from "zod";

/* ====== 请求 ====== */
export const CreateCommentSchema = z.object({
    content: z.string().min(1).max(500),
    activityId: z.number().int().positive(),
    parentId: z.number().int().positive().optional(),
});
export type CreateCommentDTO = z.infer<typeof CreateCommentSchema>;

export const CommentListSchema = z.object({
    page: z.number().int().min(1).default(1),
    size: z.number().int().min(1).max(100).default(20),
});
export type CommentListDTO = z.infer<typeof CommentListSchema>;

/* ====== 响应 ====== */
// 基础字段
const BaseCommentSchema = z.object({
    id: z.number(),
    content: z.string(),
    parentId: z.number().nullable(),
    userId: z.number(),
    userName: z.string(),
    createdAt: z.iso.datetime(),
    activityId: z.number(),
});

// 运行时校验
export const CommentVOSchema: z.ZodType<CommentVO> = BaseCommentSchema.extend({
    children: z.lazy(() => z.array(CommentVOSchema)).optional(),
});

// 导出类型
export interface CommentVO extends z.infer<typeof BaseCommentSchema> {
    children?: CommentVO[];
}

export const CommentListResponseSchema = z.object({
    list: z.array(CommentVOSchema),
    total: z.number(),
    page: z.number(),
    size: z.number(),
});
export type CommentListResponse = z.infer<typeof CommentListResponseSchema>;
