import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createActivitySchema,
    updateActivitySchema,
} from "../../schemas/adminActivity";
import { useEffect } from "react";
import { useListActivities } from "../../hooks/useAdminActivity";

interface Props {
    activityId?: number;
    onClose: () => void;
    onSubmit: (values: any) => Promise<void>;
}

export default function ActivityForm({ activityId, onClose, onSubmit }: Props) {
    const { data: list } = useListActivities();
    const activity = list?.rows?.find((a) => a.id === activityId);

    const schema = activityId ? updateActivitySchema : createActivitySchema;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: activity
            ? {
                  title: activity.title,
                  description: activity.description,
                  capacity: activity.capacity,
              }
            : { title: "", description: "", capacity: 10 },
    });

    useEffect(() => {
        if (activity) reset(activity);
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
                    <label className="block mb-2">
                        标题
                        <input
                            {...register("title")}
                            className="block w-full border rounded px-2 py-1"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm">
                                {errors.title.message}
                            </p>
                        )}
                    </label>

                    <label className="block mb-2">
                        描述
                        <textarea
                            {...register("description")}
                            className="block w-full border rounded px-2 py-1"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm">
                                {errors.description.message}
                            </p>
                        )}
                    </label>

                    <label className="block mb-4">
                        人数上限
                        <input
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

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            className="px-4 py-2 border rounded"
                            onClick={onClose}
                        >
                            取消
                        </button>
                        <button
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
