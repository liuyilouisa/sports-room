import { Link } from "react-router-dom";
import { Activity } from "../api/activities";

interface Props {
    activity: Activity;
}

export default function ActivityCard({ activity }: Props) {
    const percent = Math.min(
        (activity.enrolledCount / activity.capacity) * 100,
        100
    );

    return (
        <div className="card bg-base-100 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
            {/* 封面图占位 */}
            <figure className="w-full h-36 bg-gradient-to-br from-indigo-300 to-purple-400" />

            <div className="p-4 space-y-2">
                {/* 标题 */}
                <h2 className="text-lg font-bold text-gray-900 truncate">
                    {activity.title}
                </h2>

                {/* 描述 */}
                <p className="text-sm text-gray-600 line-clamp-2">
                    {activity.description}
                </p>

                {/* 时间 */}
                <p className="text-xs text-gray-500">
                    开始：{new Date(activity.startAt).toLocaleString()}
                </p>

                {/* 进度条 */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                        <span>已报名</span>
                        <span>
                            {activity.enrolledCount} / {activity.capacity}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>

                {/* 按钮 */}
                <div className="pt-2">
                    <Link
                        to={`/activities/${activity.id}`}
                        className="btn btn-primary btn-sm w-full"
                    >
                        查看详情
                    </Link>
                </div>
            </div>
        </div>
    );
}
