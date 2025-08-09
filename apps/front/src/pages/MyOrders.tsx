import { getMyOrders, refundOrder } from "../api/order";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

export default function MyOrders() {
    const queryClient = useQueryClient();
    const { data = [], isLoading } = useQuery({
        queryKey: ["myOrders"],
        queryFn: getMyOrders,
    });

    const handleRefund = (orderId: string) => {
        toast.promise(refundOrder(Number(orderId)), {
            loading: "正在申请退款…",
            success: () => {
                queryClient.invalidateQueries({ queryKey: ["myOrders"] });
                return "退款成功";
            },
            error: (err) => `退款失败：${err?.message || "未知错误"}`,
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                加载中…
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="flex h-40 flex-col items-center justify-center text-sm text-slate-500">
                <span>暂无订单</span>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                                >
                                    活动
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                                >
                                    口令
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                                >
                                    状态
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600"
                                >
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {data.map((o: any) => (
                                <tr
                                    key={o.id}
                                    className="transition hover:bg-slate-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-800">
                                        {o.activity.title}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-600">
                                        {o.secret}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <StatusBadge status={o.status} />
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                        <button
                                            disabled={o.status !== "paid"}
                                            onClick={() => handleRefund(o.id)}
                                            className="rounded-md px-3 py-1 text-sm font-medium transition
                               disabled:cursor-not-allowed disabled:opacity-40
                               text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            退
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

/* 小工具：状态标签 */
function StatusBadge({ status }: { status: string }) {
    const styleMap: Record<string, string> = {
        PAID: "bg-emerald-100 text-emerald-700",
        REFUNDED: "bg-slate-100 text-slate-600",
        CANCELED: "bg-rose-100 text-rose-700",
    };
    const labelMap: Record<string, string> = {
        PAID: "已支付",
        REFUNDED: "已退款",
        CANCELED: "已取消",
    };

    const cls = styleMap[status] || "bg-gray-100 text-gray-600";
    const text = labelMap[status] || status;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
        >
            {text}
        </span>
    );
}
