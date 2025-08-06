import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getActivityById } from "../api/activities";
import Spinner from "../components/Spinner";

export default function ActivityDetail() {
    const { id } = useParams<{ id: string }>();
    const numericId = Number(id);

    const {
        data: activity,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["activity", numericId],
        queryFn: () => getActivityById(numericId),
        enabled: !!id,
    });

    if (isLoading) return <Spinner />;
    if (isError) return <div className="text-red-500 p-4">{String(error)}</div>;
    if (!activity) return <div className="p-4">活动不存在</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/activities" className="link mb-4 inline-block">
                &larr; 返回列表
            </Link>

            <h1 className="text-3xl font-bold mb-2">{activity.title}</h1>
            <p className="mb-4 text-gray-600">{activity.description}</p>

            <div className="mb-2">
                <span className="font-semibold">开始时间：</span>
                {new Date(activity.startAt).toLocaleString()}
            </div>

            <div className="mb-2">
                <span className="font-semibold">结束时间：</span>
                {activity.endAt
                    ? new Date(activity.endAt).toLocaleString()
                    : "暂无"}
            </div>

            <div className="mb-2">
                <span className="font-semibold">已报名/名额：</span>
                {activity.enrolledCount} / {activity.capacity}
            </div>

            {/* 后续可扩展评论区 */}
        </div>
    );
}
