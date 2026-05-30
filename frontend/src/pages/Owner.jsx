import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import { useAuth } from "../context/useAuth";
import {LayoutDashboard,Building2} from "lucide-react";

const adminNavItems = [
    { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {to:"/owner/get-my-restaurants" ,label:"My Restaurants",icon:Building2}
];

const OwnerLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Loading...</div>;

    if (!user || user?.role_name !== 'owner') {
        return <Navigate replace to="/login" />;
    }

    return (
        <div className="flex min-h-screen bg-white">

            <Sidebar 
                navItems={adminNavItems} 
                roleName="Restaurant Owner" 
                userName={user.name} 
            />

            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default OwnerLayout;