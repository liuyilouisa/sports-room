import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Home = lazy(() => import("../pages/Home"));

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
    return <Outlet context={user} />;
}

export const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    {
        path: "/",
        element: <RequireAuth />,
        children: [{ index: true, element: <Home /> }],
    },
]);
