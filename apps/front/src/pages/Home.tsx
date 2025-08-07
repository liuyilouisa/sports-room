import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuthGuard } from "../hooks/useAuthGuard";

export default function Home() {
    useAuthGuard();
    const nav = useNavigate();

    const { data: user, isLoading } = useQuery({
        queryKey: ["me"],
        queryFn: () => authApi.me(),
        retry: false,
    });

    // 没登录就跳转
    if (!isLoading && !user) {
        nav("/login", { replace: true });
        return null;
    }

    if (isLoading) return <p className="p-8">加载中…</p>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl">欢迎，{user?.name}</h1>
            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    nav("/login");
                }}
                className="btn btn-error mt-4"
            >
                退出
            </button>
        </div>
    );
}
