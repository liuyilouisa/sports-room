import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import Navbar from "../components/Navbar";

export function RequireAdmin() {
    const {
        isLoading,
        data: user,
        error,
    } = useQuery({
        queryKey: ["me"],
        queryFn: authApi.me,
        retry: false,
    });

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
