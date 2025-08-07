import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { CreateCommentSchema, CreateCommentDTO } from "../schemas/comment";
import Spinner from "./Spinner";

interface Props {
    activityId: number;
    parentId?: number;
    onSubmit: (data: Omit<CreateCommentDTO, "activityId">) => Promise<void>;
    onCancel?: () => void;
    placeholder?: string;
}

const CommentForm: FC<Props> = ({
    activityId,
    parentId,
    onSubmit,
    onCancel,
    placeholder = "写下你的评论…",
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<Omit<CreateCommentDTO, "activityId">>({
        resolver: zodResolver(
            CreateCommentSchema.omit({
                activityId: true,
                parentId: true,
            }).extend({
                parentId: z.number().optional(),
            })
        ),
        defaultValues: { parentId },
    });

    const submit = async (values: Omit<CreateCommentDTO, "activityId">) => {
        await onSubmit(values);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-2">
            <textarea
                {...register("content")}
                rows={3}
                placeholder={placeholder}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.content && (
                <p className="text-xs text-red-500">{errors.content.message}</p>
            )}
            <div className="flex items-center justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm text-gray-500 hover:text-gray-800"
                    >
                        取消
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    {isSubmitting && <Spinner size="xs" />}
                    {isSubmitting ? "发表中…" : "发表"}
                </button>
            </div>
        </form>
    );
};

export default CommentForm;
