// components/Navbar.tsx
import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export default function Navbar() {
    const location = useLocation();
    const { data: user } = useQuery({
        queryKey: ["me"],
        queryFn: authApi.me,
        retry: false,
    });

    // 登录/注册页不显示
    if (location.pathname === "/login" || location.pathname === "/register") {
        return null;
    }

    // 判断是否在 admin 区域
    const inAdmin = location.pathname.startsWith("/admin");

    const doLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    // 统一高亮类名
    const navClass = ({ isActive }: { isActive: boolean }) =>
        isActive
            ? "text-blue-600 font-semibold"
            : "text-gray-600 hover:text-blue-600";

    return (
        <nav className="bg-white shadow px-4 py-2 mb-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <NavLink
                    to="/activities"
                    className="text-xl font-bold text-blue-600"
                >
                    活动系统
                </NavLink>

                {/* 主导航链接 */}
                <div className="space-x-4 flex items-center">
                    {inAdmin ? (
                        <>
                            <NavLink
                                to="/admin/activities"
                                className={navClass}
                            >
                                活动管理
                            </NavLink>
                            <NavLink
                                to="/activities"
                                className="link text-green-600"
                            >
                                返回前台
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/home" className={navClass}>
                                个人中心
                            </NavLink>
                            <NavLink to="/activities" className={navClass}>
                                活动列表
                            </NavLink>
                            {user?.role === "admin" && (
                                <NavLink
                                    to="/admin/activities"
                                    className={navClass}
                                >
                                    管理后台
                                </NavLink>
                            )}
                        </>
                    )}

                    {/* 退出按钮 */}
                    <button
                        onClick={doLogout}
                        className="text-red-600 hover:underline"
                    >
                        退出
                    </button>
                </div>
            </div>
        </nav>
    );
}
