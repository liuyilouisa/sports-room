import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authApi } from "../api/auth";
import { registerSchema, type RegisterDto } from "../schemas/auth";

export default function Register() {
    const nav = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterDto>({
        resolver: zodResolver(registerSchema),
    });

    const { mutate, isPending, error } = useMutation({
        mutationFn: authApi.register,
        onSuccess: ({ data }) => {
            toast.success("注册成功");
            localStorage.setItem("token", data.token);
            nav("/");
        },
    });

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border rounded shadow">
            <h2 className="text-2xl mb-4">注册</h2>
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
                    {...register("name")}
                    placeholder="昵称"
                    aria-label="昵称"
                    className="w-full input"
                />
                {errors.name && (
                    <p className="text-red-600 text-sm">
                        {errors.name.message}
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

                <input
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="确认密码"
                    aria-label="确认密码"
                    className="w-full input"
                />
                {errors.confirmPassword && (
                    <p className="text-red-600 text-sm">
                        {errors.confirmPassword.message}
                    </p>
                )}

                <button disabled={isPending} className="btn btn-primary w-full">
                    {isPending ? "注册中…" : "注册"}
                </button>
                {error && (
                    <p className="text-red-600 text-sm">
                        {error?.message || "未知错误"}
                    </p>
                )}
            </form>
            <p className="text-center mt-4">
                已有账号？
                <a href="/login" className="link">
                    去登录
                </a>
            </p>
        </div>
    );
}
