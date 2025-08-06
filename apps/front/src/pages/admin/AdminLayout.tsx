import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
