import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import { useAuth } from "../context/useAuth";
import { LayoutDashboard } from "lucide-react";

const adminNavItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/userManagement", label: "User Management", icon: LayoutDashboard },
  { to: "/admin/restaurantManagement", label: "Restaurant Management", icon: LayoutDashboard },

];

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );

  if (!user || user?.role_name !== "admin") {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        navItems={adminNavItems}
        roleName="Administrator"
        userName={user.name}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
