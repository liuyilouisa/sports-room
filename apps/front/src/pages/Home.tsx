import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/user";

export default function Home() {
    const logout = useUserStore((s) => s.logout);
    const nav = useNavigate();

    const user = useUserStore((s) => s.user);

    const isLoading = user === undefined;

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
                    logout();
                }}
                className="btn btn-error mt-4"
            >
                退出
            </button>
        </div>
    );
}
