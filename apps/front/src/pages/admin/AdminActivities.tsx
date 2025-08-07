import { useState } from "react";
import {
    useListActivities,
    useCreateActivity,
    useUpdateActivity,
    useDeleteActivity,
} from "../../hooks/useAdminActivity";
import ActivityForm from "./ActivityForm";
import toast from "react-hot-toast";

export default function AdminActivities() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useListActivities(page);

    console.log("活动列表数据:", data);

    const create = useCreateActivity();
    const update = useUpdateActivity();
    const remove = useDeleteActivity();

    const [drawer, setDrawer] = useState<
        { mode: "create" } | { mode: "edit"; id: number } | null
    >(null);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold mb-4">活动列表</h2>
                <button
                    aria-label="新建"
                    onClick={() => setDrawer({ mode: "create" })}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    新建
                </button>
            </div>
            {isLoading ? (
                <p>加载中...</p>
            ) : data?.data?.length ? (
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">ID</th>
                            <th className="border px-2 py-1">标题</th>
                            <th className="border px-2 py-1">开始时间</th>
                            <th className="border px-2 py-1">结束时间</th>
                            <th className="border px-2 py-1">人数上限</th>
                            <th className="border px-2 py-1">状态</th>
                            <th className="border px-2 py-1">操作</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.data.map((act) => (
                            <tr key={act.id}>
                                <td className="border px-2 py-1">{act.id}</td>
                                <td className="border px-2 py-1">
                                    {act.title}
                                </td>
                                <td className="border px-2 py-1">
                                    {new Date(act.startAt).toLocaleString()}
                                </td>
                                <td className="border px-2 py-1">
                                    {act.endAt
                                        ? new Date(act.endAt).toLocaleString()
                                        : "-"}
                                </td>
                                <td className="border px-2 py-1">
                                    {act.capacity}
                                </td>
                                <td className="border px-2 py-1">
                                    {act.status}
                                </td>
                                <td className="border px-2 py-1 flex gap-2">
                                    <button
                                        aria-label={`编辑 ${act.title}`}
                                        onClick={() =>
                                            setDrawer({
                                                mode: "edit",
                                                id: act.id,
                                            })
                                        }
                                        className="text-blue-600 underline"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        aria-label={`删除 ${act.title}`}
                                        onClick={() =>
                                            remove
                                                .mutateAsync(act.id)
                                                .then(() =>
                                                    toast.success("已删除")
                                                )
                                        }
                                        className="text-red-600 underline"
                                    >
                                        删除
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">
                        暂无活动，快去创建一个吧！
                    </p>
                </div>
            )}
            {drawer && (
                <ActivityForm
                    activityId={drawer.mode === "edit" ? drawer.id : undefined}
                    onClose={() => setDrawer(null)}
                    onSubmit={async (values: any) => {
                        if (drawer.mode === "create") {
                            await create.mutateAsync(values);
                        } else {
                            await update.mutateAsync({
                                id: drawer.id,
                                data: values,
                            });
                        }
                        setDrawer(null);
                        toast.success("保存成功");
                    }}
                />
            )}
        </div>
    );
}
