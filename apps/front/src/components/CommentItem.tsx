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
}

const CommentItem: FC<Props> = ({
    comment,
    currentUserId,
    onDelete,
    onReply,
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const isOwner = currentUserId === comment.userId;

    return (
        <div className="flex space-x-3">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex-center text-sm font-bold text-gray-500">
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
                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="hover:text-blue-600"
                    >
                        回复
                    </button>
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
                            activityId={comment.activityId} // 这里仅透传，真实用不到
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

                {/* 楼中楼 */}
                {comment.children && comment.children.length > 0 && (
                    <div className="mt-4 space-y-4 border-l-2 pl-4">
                        {comment.children.map((child) => (
                            <CommentItem
                                key={child.id}
                                comment={child}
                                currentUserId={currentUserId}
                                onDelete={onDelete}
                                onReply={onReply}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
