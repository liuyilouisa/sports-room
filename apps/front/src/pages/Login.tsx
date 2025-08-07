import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "../stores/user";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authApi } from "../api/auth";
import { loginSchema, type LoginDto } from "../schemas/auth";

export default function Login() {
    const nav = useNavigate();
    const setUser = useUserStore((s) => s.setUser);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginDto>({
        resolver: zodResolver(loginSchema),
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: authApi.login,
        onSuccess: ({ data }) => {
            toast.success("登录成功");
            localStorage.setItem("token", data.token);
            setUser(data.user);
            nav("/");
        },
    });

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border rounded shadow">
            <h2 className="text-2xl mb-4">登录</h2>
            <form
                onSubmit={handleSubmit((d) => mutate(d))}
                className="space-y-4"
            >
                <input
                    {...register("email")}
                    placeholder="邮箱"
                    aria-label="邮箱"
                    className="w-full input"
                />
                {errors.email && (
                    <p className="text-red-600 text-sm">
                        {errors.email.message}
                    </p>
                )}

                <input
                    type="password"
                    {...register("password")}
                    placeholder="密码"
                    aria-label="密码"
                    className="w-full input"
                />
                {errors.password && (
                    <p className="text-red-600 text-sm">
                        {errors.password.message}
                    </p>
                )}

                <button disabled={isPending} className="btn btn-primary w-full">
                    {isPending ? "登录中…" : "登录"}
                </button>
                {error && (
                    <p className="text-red-600 text-sm">
                        {error?.message || "未知错误"}
                    </p>
                )}
            </form>
            <p className="text-center mt-4">
                还没有账号？
                <a href="/register" className="link">
                    去注册
                </a>
            </p>
        </div>
    );
}
