import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import { useAuth } from "../context/useAuth";
import { LayoutDashboard } from "lucide-react";

const partnerNavItems = [
  { to: "/partner/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const PartnerLayout = () => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );

  if (!user || user?.role_name !== "delivery_partner") {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="flex max-h-screen bg-white">
      <Sidebar
        navItems={partnerNavItems}
        roleName="Delivery Partner"
        userName={user.full_name}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PartnerLayout;
