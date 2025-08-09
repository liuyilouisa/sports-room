import { useParams, Link } from "react-router-dom";
import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

import { getActivityById } from "../api/activities";
import { createComment, getComments, deleteComment } from "../api/comment";
import type { CommentVO } from "../schemas/comment";
import { createOrder, getMyOrders } from "../api/order";

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

    /* ---------- 报名 mutation ---------- */
    const enrollMutation = useMutation({
        mutationFn: () => createOrder(numericId),
        onSuccess: () => {
            // 刷新活动详情 & 我的订单
            queryClient.invalidateQueries({
                queryKey: ["activity", numericId],
            });
            queryClient.invalidateQueries({ queryKey: ["myOrders"] });
            toast.success("报名成功！");
        },
        onError: (err: any) => {
            // 业务错误后端返回 409
            const msg =
                err?.response?.status === 409
                    ? err?.response?.data?.message || "名额已满或不符合报名条件"
                    : "报名失败";
            toast.error(msg);
        },
    });

    /* ---------- 渲染 ---------- */
    if (activityLoading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    if (activityError)
        return (
            <div className="text-red-500 p-10 flex items-center justify-center min-h-screen">
                <span className="bg-red-50 px-4 py-2 rounded-md shadow">
                    {String(activityErrorMsg)}
                </span>
            </div>
        );
    if (!activity)
        return (
            <div className="text-gray-500 p-10 flex items-center justify-center min-h-screen">
                活动不存在
            </div>
        );

    const comments = commentsPages?.pages.flatMap((p) => p.data) ?? [];
    const total = commentsPages?.pages[0]?.total ?? 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* 返回按钮 */}
                <Link
                    to="/activities"
                    className="inline-flex items-center gap-1.5 mb-6 text-sm font-medium text-sky-600 hover:text-sky-700 transition"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    返回列表
                </Link>

                {/* 主要内容卡片 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                        {activity.title}
                    </h1>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        {activity.description}
                    </p>

                    <div className="space-y-4 divide-y divide-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="w-24 font-semibold text-slate-700">
                                开始时间
                            </span>
                            <span className="text-slate-500">
                                {new Date(activity.startAt).toLocaleString(
                                    "zh-CN"
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                            <span className="w-24 font-semibold text-slate-700">
                                结束时间
                            </span>
                            <span className="text-slate-500">
                                {activity.endAt
                                    ? new Date(activity.endAt).toLocaleString(
                                          "zh-CN"
                                      )
                                    : "暂无"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                            <span className="w-24 font-semibold text-slate-700">
                                名额状态
                            </span>
                            <span className="text-slate-500">
                                {activity.enrolledCount} / {activity.capacity}
                            </span>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => enrollMutation.mutate()}
                            disabled={enrollMutation.isPending}
                            className="px-8 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-full shadow-lg hover:shadow-sky-400/50 hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none transition-all duration-200"
                        >
                            {enrollMutation.isPending
                                ? "报名中..."
                                : "立即报名"}
                        </button>
                    </div>
                </div>

                {/* 评论区 */}
                <section className="mt-10">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">
                        评论区
                    </h2>

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
                                    if (!window.confirm("确认删除该评论？"))
                                        return;
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
                                    hasNextPage
                                        ? () => fetchNextPage()
                                        : undefined
                                }
                            />
                            <div ref={ref} />
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
