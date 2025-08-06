import { Link } from "react-router-dom";
import { Activity } from "../api/activities";

interface Props {
    activity: Activity;
}

export default function ActivityCard({ activity }: Props) {
    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title">{activity.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-2">
                    {activity.description}
                </p>
                <p className="text-sm mt-1">
                    开始时间：{new Date(activity.startAt).toLocaleString()}
                </p>
                <p className="text-sm">
                    名额：{activity.enrolledCount} / {activity.capacity}
                </p>
                <div className="card-actions justify-end mt-2">
                    <Link
                        to={`/activities/${activity.id}`}
                        className="btn btn-primary btn-sm"
                    >
                        查看详情
                    </Link>
                </div>
            </div>
        </div>
    );
}
