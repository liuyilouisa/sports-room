import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../stores/user";
import Navbar from "../components/Navbar";

export function RequireAdmin() {
    const user = useUserStore((s) => s.user);
    const isLoading = user === undefined;
    const error = user === null;

    if (isLoading) return <div className="p-4">加载中…</div>;
    if (error || !user) return <Navigate to="/login" replace />;
    if (user.role !== "admin") return <Navigate to="/" replace />; // 也可跳 /403

    return (
        <>
            <Navbar /> {/* 用统一的导航栏，里面已包含“管理后台”链接 */}
            <Outlet context={user} />
        </>
    );
}
