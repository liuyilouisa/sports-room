import { FC, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import { CommentVO } from "../schemas/comment";
import CommentForm from "./CommentForm";

dayjs.locale("zh-cn");
dayjs.extend(relativeTime);

interface Props {
    comment: CommentVO;
    currentUserId?: number;
    onDelete: (commentId: number) => Promise<void>;
    onReply: (data: { content: string; parentId: number }) => Promise<void>;
    depth?: number;
}

const CHILDREN_FOLD_THRESHOLD = 10; // 超过 10 条子评论就折叠

const CommentItem: FC<Props> = ({
    comment,
    currentUserId,
    onDelete,
    onReply,
    depth = 0,
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    // 1️⃣ 新增：子评论折叠状态
    const [showChildren, setShowChildren] = useState(true);

    const isOwner = currentUserId === comment.userId;

    return (
        <div className="flex space-x-3">
            {/* 头像大小随层级变化 */}
            <div
                className={`flex-shrink-0 rounded-full bg-gray-200 flex-center text-sm font-bold text-gray-500
          ${depth === 0 ? "w-8 h-8" : "w-6 h-6 text-xs"}`}
            >
                {comment.userName.charAt(0)}
            </div>

            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">
                        {comment.userName}
                    </span>
                    <span className="text-xs text-gray-400">
                        {dayjs(comment.createdAt).fromNow()}
                    </span>
                </div>

                <p className="mt-1 text-sm text-gray-800">{comment.content}</p>

                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    {depth < 1 && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="hover:text-blue-600"
                        >
                            回复
                        </button>
                    )}
                    {isOwner && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="hover:text-red-600"
                        >
                            删除
                        </button>
                    )}
                </div>

                {showReplyForm && (
                    <div className="mt-2">
                        <CommentForm
                            activityId={comment.activityId}
                            parentId={comment.id}
                            placeholder={`回复 ${comment.userName}…`}
                            onSubmit={({ content }) => {
                                setShowReplyForm(false);
                                return onReply({
                                    content,
                                    parentId: comment.id,
                                });
                            }}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </div>
                )}

                {/* 2️⃣ 子评论渲染 + 折叠按钮 */}
                {comment.children && comment.children.length > 0 && (
                    <div
                        className={`mt-4 space-y-4 border-l-2 pl-4
              ${depth === 0 ? "ml-0" : ""}`}
                    >
                        {/* 折叠按钮：仅父评论且超过阈值时显示 */}
                        {depth === 0 &&
                            comment.children.length >
                                CHILDREN_FOLD_THRESHOLD && (
                                <button
                                    onClick={() =>
                                        setShowChildren(!showChildren)
                                    }
                                    className="text-xs text-blue-600 underline"
                                >
                                    {showChildren
                                        ? "收起回复"
                                        : `展开 ${comment.children.length} 条回复`}
                                </button>
                            )}

                        {showChildren &&
                            comment.children.map((child) => (
                                <CommentItem
                                    key={child.id}
                                    comment={child}
                                    currentUserId={currentUserId}
                                    onDelete={onDelete}
                                    onReply={onReply}
                                    depth={depth + 1}
                                />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
