import client from "./client";
import type { CreateCommentDTO } from "../schemas/comment";

/**
 * 发表评论
 */
export function createComment(
    activityId: number,
    data: Omit<CreateCommentDTO, "activityId">
) {
    return client.post(`/api/activities/${activityId}/comments`, data);
}

/**
 * 分页获取某活动的评论列表
 */
export function getComments(
    activityId: number,
    params: { page?: number; size?: number } = {}
) {
    return client.get(`/api/activities/${activityId}/comments`, { params });
}

/**
 * 删除评论
 */
export function deleteComment(activityId: number, commentId: number) {
    return client.delete(`/api/activities/${activityId}/comments/${commentId}`);
}
