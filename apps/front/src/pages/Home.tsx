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

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {/* 头像（占位图） */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                    </div>

                    {/* 欢迎语 */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-slate-800">
                            欢迎回来，{user?.name}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            很高兴再次见到你，祝你今天愉快！
                        </p>
                    </div>

                    {/* 信息卡片 */}
                    <div className="space-y-3 text-sm text-slate-700">
                        <InfoItem label="邮箱" value={user?.email} />
                        <InfoItem label="角色" value={user?.role} />
                        <InfoItem
                            label="积分"
                            value={
                                <span className="font-semibold text-indigo-600">
                                    {user?.points}
                                </span>
                            }
                        />
                    </div>

                    {/* 操作按钮 */}
                    <div className="pt-4">
                        <button
                            onClick={logout}
                            className="w-full btn bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl shadow-sm"
                        >
                            退出登录
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* 信息行组件 */
function InfoItem({ label, value }: { label: string; value?: any }) {
    return (
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-500">{label}</span>
            <span>{value || "—"}</span>
        </div>
    );
}
