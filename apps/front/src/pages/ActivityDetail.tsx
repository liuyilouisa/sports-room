import { useParams, Link } from "react-router-dom";
import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

import { createOrder } from "../api/order";
import { getActivityById } from "../api/activities";
import { createComment, getComments, deleteComment } from "../api/comment";
import type { CommentVO } from "../schemas/comment";

import Spinner from "../components/Spinner";
import CommentForm from "../components/CommentForm";
import CommentList from "../components/CommentList";
import { useUserStore } from "../stores/user";
import { toast } from "react-hot-toast";

export default function ActivityDetail() {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);
    const queryClient = useQueryClient();
    const currentUser = useUserStore((state) => state.user);
    const { ref, inView } = useInView({ threshold: 0.5 });

    /* ---------- 活动详情 ---------- */
    const {
        data: activity,
        isLoading: activityLoading,
        isError: activityError,
        error: activityErrorMsg,
    } = useQuery({
        queryKey: ["activity", numericId],
        queryFn: () => getActivityById(numericId),
        enabled: !!id,
    });

    /* ---------- 评论列表（无限滚动） ---------- */
    const {
        data: commentsPages,
        isLoading: commentsLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ["comments", numericId] as const,
        queryFn: ({ pageParam = 1 }) =>
            getComments(numericId, { page: pageParam, size: 20 }).then(
                (r) => r.data
            ),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const totalPages = Math.ceil(lastPage.total / 20);
            const next = lastPage.page + 1;
            return next <= totalPages ? next : undefined;
        },
        enabled: !!id,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    /* ---------- 发表评论 ---------- */
    const createCommentMutation = useMutation({
        mutationFn: (payload: {
            activityId: number;
            content: string;
            parentId?: number;
        }) => createComment(payload.activityId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["comments", numericId],
            });
            toast.success("评论发表成功");
        },
        onError: () => toast.error("评论发表失败"),
    });

    /* ---------- 删除评论 ---------- */
    const deleteCommentMutation = useMutation({
        mutationFn: (payload: { activityId: number; commentId: number }) =>
            deleteComment(payload.activityId, payload.commentId),
        onMutate: async (payload) => {
            await queryClient.cancelQueries({
                queryKey: ["comments", numericId],
            });
            const prev = queryClient.getQueryData(["comments", numericId]);
            queryClient.setQueryData(["comments", numericId], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: page.data.filter(
                            (c: CommentVO) => c.id !== payload.commentId
                        ),
                    })),
                };
            });
            return { prev };
        },
        onError: (_err, _vars, ctx: any) => {
            queryClient.setQueryData(["comments", numericId], ctx?.prev);
            toast.error("删除失败");
        },
        onSettled: () =>
            queryClient.invalidateQueries({
                queryKey: ["comments", numericId],
            }),
    });

    const enroll = useMutation({
        mutationFn: createOrder,
        onSuccess: (d) => alert(`报名成功！口令：${d.secret}`),
    });

    /* ---------- 渲染 ---------- */
    if (activityLoading) return <Spinner />;
    if (activityError)
        return (
            <div className="text-red-500 p-4">{String(activityErrorMsg)}</div>
        );
    if (!activity) return <div className="p-4">活动不存在</div>;

    const comments = commentsPages?.pages.flatMap((p) => p.data) ?? [];
    const total = commentsPages?.pages[0]?.total ?? 0;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/activities" className="link mb-4 inline-block">
                &larr; 返回列表
            </Link>

            <h1 className="text-3xl font-bold mb-2">{activity.title}</h1>
            <p className="mb-4 text-gray-600">{activity.description}</p>

            <div className="mb-2">
                <span className="font-semibold">开始时间：</span>
                {new Date(activity.startAt).toLocaleString()}
            </div>
            <div className="mb-2">
                <span className="font-semibold">结束时间：</span>
                {activity.endAt
                    ? new Date(activity.endAt).toLocaleString()
                    : "暂无"}
            </div>
            {activity.enrolledCount < activity.capacity && (
                <button onClick={() => enroll.mutate(activity.id)}>
                    用100积分报名
                </button>
            )}
            <div className="mb-6">
                <span className="font-semibold">已报名/名额：</span>
                {activity.enrolledCount} / {activity.capacity}
            </div>

            {/* 评论区 */}
            <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4">评论区</h2>

                {currentUser ? (
                    <CommentForm
                        activityId={numericId}
                        onSubmit={async ({ content, parentId }) => {
                            await createCommentMutation.mutateAsync({
                                activityId: numericId,
                                content,
                                parentId,
                            });
                        }}
                    />
                ) : (
                    <p className="text-gray-500 mb-4">请登录后评论</p>
                )}

                {commentsLoading ? (
                    <Spinner />
                ) : (
                    <>
                        <CommentList
                            comments={comments}
                            total={total}
                            currentUserId={currentUser?.id}
                            loadingMore={isFetchingNextPage}
                            onDelete={async (commentId: number) => {
                                if (!window.confirm("确认删除该评论？")) return;
                                await deleteCommentMutation.mutateAsync({
                                    activityId: numericId,
                                    commentId,
                                });
                            }}
                            onReply={async ({ content, parentId }) => {
                                await createCommentMutation.mutateAsync({
                                    activityId: numericId,
                                    content,
                                    parentId,
                                });
                            }}
                            onLoadMore={
                                hasNextPage ? () => fetchNextPage() : undefined
                            }
                        />
                        <div ref={ref} />
                    </>
                )}
            </section>
        </div>
    );
}
