import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import { useAuth } from "../context/useAuth";
import {
  BottleWine,
  Home,
  HomeIcon,
  IndianRupee,
  LayoutDashboard,
  ListOrderedIcon,
  ShoppingBasket,
  ShoppingCart,
  SoupIcon,
} from "lucide-react";

const adminNavItems = [
  {to:"/customer/dashboard1",label:"Dashboard",icon:LayoutDashboard},
  {to:"/customer/dashboard",label:"Home",icon:Home},
  { to: "/customer/dishes", label: "Explore Dishes", icon: SoupIcon},
  {to:"/customer/orders",label:"My Orders",icon:ListOrderedIcon},
  {to:"/customer/payments",label:"My Payments",icon:IndianRupee},
  {to:"/customer/cart",label:"Cart",icon:ShoppingCart},
  { to: "/customer/address", label: "Address", icon: HomeIcon },
];

const CustomerLayout = () => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );

  if (!user || user?.role_name !== "customer") {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="flex max-h-screen bg-white">
      <Sidebar
        navItems={adminNavItems}
        roleName="Customer"
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

export default CustomerLayout;
