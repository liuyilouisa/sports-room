import { getMyOrders, refundOrder } from "../api/order";
import { useQuery } from "@tanstack/react-query";

export default () => {
    const { data = [] } = useQuery({
        queryKey: ["myOrders"],
        queryFn: getMyOrders,
    });
    return (
        <table>
            <thead>
                <tr>
                    <th>活动</th>
                    <th>口令</th>
                    <th>操作</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                {data.map((o: any) => (
                    <tr key={o.id}>
                        <td>{o.activity.title}</td>
                        <td>{o.secret}</td>
                        <td>{o.status}</td>
                        <td>
                            <button
                                className="text-red-600 hover:text-red-800"
                                disabled={o.status !== "PAID"}
                                onClick={() =>
                                    refundOrder(o.id).then(() =>
                                        location.reload()
                                    )
                                }
                            >
                                退
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
