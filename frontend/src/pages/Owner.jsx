import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import { useAuth } from "../context/useAuth";
import {
  LayoutDashboard,
  Building2,
  Plus,
  IceCream,
  PizzaIcon,
  ClipboardList,
} from "lucide-react";

const adminNavItems = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/manage-orders", label: "Manage Orders", icon: ClipboardList },
  { to: "/owner/get-my-restaurants", label: "My Restaurants", icon: Building2 },
  { to: "/owner/add-restaurant-details", label: "Add Restaurant", icon: Plus },
  { to: "/owner/manage-cuisines", label: "Manage Cuisines", icon: IceCream },
  { to: "/owner/manage-menu", label: "Manage Menu Items", icon: PizzaIcon },
  
];

const OwnerLayout = () => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );

  if (!user || user?.role_name !== "owner") {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="flex max-h-screen bg-white">
      <Sidebar
        navItems={adminNavItems}
        roleName="Restaurant Owner"
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

export default OwnerLayout;
