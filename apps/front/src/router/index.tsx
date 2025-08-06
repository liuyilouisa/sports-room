import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import Navbar from "../components/Navbar";
import { RequireAdmin } from "./RequireAdmin";

/* ====== 懒加载页面 ====== */
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Home = lazy(() => import("../pages/Home"));
const AdminActivities = lazy(() => import("../pages/admin/AdminActivities"));
const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const ActivityDetail = lazy(() => import("../pages/ActivityDetail"));
const Activities = lazy(() => import("../pages/Activities"));

/* ====== 通用守卫 ====== */
function RequireAuth() {
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
    if (!user || error) return <Navigate to="/login" replace />;

    return (
        <>
            <Navbar /> {/* ✅ 全局导航栏 */}
            <Outlet context={user} />
        </>
    );
}

/* ====== 路由表 ====== */
export const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },

    /* 普通用户区域 */
    {
        path: "/",
        element: <RequireAuth />,
        children: [
            { index: true, element: <Navigate to="/activities" replace /> },
            { path: "activities", element: <Activities /> },
            { path: "activities/:id", element: <ActivityDetail /> },
            { path: "home", element: <Home /> },
        ],
    },

    /* 管理后台区域 —— 加守卫 */
    {
        path: "/admin",
        element: <RequireAdmin />,
        children: [
            { index: true, element: <Navigate to="/admin/activities" /> },
            { path: "activities", element: <AdminActivities /> },
        ],
    },
]);
