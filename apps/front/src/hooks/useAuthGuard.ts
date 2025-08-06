import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthGuard() {
    const navigate = useNavigate();

    useEffect(() => {
        // 刚挂载就检查
        if (!localStorage.getItem("token")) {
            navigate("/login", { replace: true });
            return;
        }

        // 监听 pageshow：从 bf cache 恢复时再次检查
        const onPageShow = (e: PageTransitionEvent) => {
            if (e.persisted && !localStorage.getItem("token")) {
                location.reload(); // 强制走服务器
            }
        };
        window.addEventListener("pageshow", onPageShow);
        return () => window.removeEventListener("pageshow", onPageShow);
    }, [navigate]);
}
