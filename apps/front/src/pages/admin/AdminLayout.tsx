import { Outlet } from "react-router-dom";

export default function AdminLayout() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">管理后台</h1>
            <Outlet />
        </div>
    );
}
