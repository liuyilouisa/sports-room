import { FC } from "react";
import { CommentVO } from "../schemas/comment";
import CommentItem from "./CommentItem";
import Empty from "./Empty";

interface Props {
    comments: CommentVO[];
    total: number;
    currentUserId?: number;
    loadingMore?: boolean;
    onDelete: (commentId: number) => Promise<void>;
    onReply: (data: { content: string; parentId: number }) => Promise<void>;
    onLoadMore?: () => void;
}

const CommentList: FC<Props> = ({
    comments,
    total,
    currentUserId,
    loadingMore,
    onDelete,
    onReply,
    onLoadMore,
}) => {
    if (!comments.length) return <Empty text="暂无评论，快来抢沙发~" />;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">共 {total} 条评论</h3>

            {comments.map((c) => (
                <CommentItem
                    key={c.id}
                    comment={c}
                    currentUserId={currentUserId}
                    onDelete={onDelete}
                    onReply={onReply}
                />
            ))}

            {onLoadMore && comments.length < total && (
                <div className="text-center">
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                    >
                        {loadingMore ? "加载中…" : "加载更多"}
                    </button>
                </div>
            )}
            <div data-testid="comment-list-end" style={{ height: 1 }} />
        </div>
    );
};

export default CommentList;
