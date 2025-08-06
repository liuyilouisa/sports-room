import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createActivitySchema,
    updateActivitySchema,
} from "../../schemas/adminActivity";
import { useEffect } from "react";
import { useListActivities } from "../../hooks/useAdminActivity";
import type { AdminActivity } from "../../api/adminActivity";

interface Props {
    activityId?: number;
    onClose: () => void;
    onSubmit: (values: any) => Promise<void>;
}

export default function ActivityForm({ activityId, onClose, onSubmit }: Props) {
    const toFormValues = (activity: AdminActivity) => ({
        title: activity.title,
        description: activity.description,
        capacity: activity.capacity,
        startAt: activity.startAt?.slice(0, 16) ?? "",
        endAt: activity.endAt ? activity.endAt.slice(0, 16) : "",
    });

    const { data: list } = useListActivities();
    const activity = list?.data?.find((a) => a.id === activityId);

    const schema = activityId ? updateActivitySchema : createActivitySchema;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: activity
            ? toFormValues(activity)
            : {
                  title: "",
                  description: "",
                  capacity: 10,
                  startAt: "",
                  endAt: "",
              },
    });

    useEffect(() => {
        if (activity) {
            reset(toFormValues(activity));
        }
    }, [activity, reset]);

    return (
        <div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-20"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold mb-4">
                    {activityId ? "编辑活动" : "新建活动"}
                </h3>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* 标题 */}
                    <label className="block mb-2">
                        标题
                        <input
                            aria-label="标题"
                            {...register("title")}
                            className="block w-full border rounded px-2 py-1"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm">
                                {errors.title.message}
                            </p>
                        )}
                    </label>

                    {/* 开始时间 */}
                    <label className="block mb-2">
                        开始时间
                        <input
                            aria-label="开始时间"
                            type="datetime-local"
                            {...register("startAt")}
                            className="block w-full border rounded px-2 py-1"
                        />
                        {errors.startAt && (
                            <p className="text-red-500 text-sm">
                                {errors.startAt.message}
                            </p>
                        )}
                    </label>

                    {/* 结束时间 */}
                    <label className="block mb-2">
                        结束时间（选填）
                        <input
                            aria-label="结束时间"
                            type="datetime-local"
                            {...register("endAt")}
                            className="block w-full border rounded px-2 py-1"
                        />
                        {errors.endAt && (
                            <p className="text-red-500 text-sm">
                                {errors.endAt.message}
                            </p>
                        )}
                    </label>

                    {/* 描述 */}
                    <label className="block mb-2">
                        描述
                        <textarea
                            aria-label="描述"
                            {...register("description")}
                            className="block w-full border rounded px-2 py-1"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm">
                                {errors.description.message}
                            </p>
                        )}
                    </label>

                    {/* 人数上限 */}
                    <label className="block mb-4">
                        人数上限
                        <input
                            aria-label="人数上限"
                            type="number"
                            {...register("capacity", { valueAsNumber: true })}
                            className="block w-full border rounded px-2 py-1"
                        />
                        {errors.capacity && (
                            <p className="text-red-500 text-sm">
                                {errors.capacity.message}
                            </p>
                        )}
                    </label>

                    {/* 按钮 */}
                    <div className="flex gap-2 justify-end">
                        <button
                            aria-label="取消"
                            type="button"
                            className="px-4 py-2 border rounded"
                            onClick={onClose}
                        >
                            取消
                        </button>
                        <button
                            aria-label="保存"
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            {isSubmitting ? "保存中..." : "保存"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
