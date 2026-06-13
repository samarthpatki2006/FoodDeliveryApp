import { NavLink, useNavigate } from "react-router-dom";
import { UtensilsCrossed,LogOut,Menu,X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { logoutUser } from "../../api/auth.api.js";
import toast from "react-hot-toast";
const Sidebar = ({ navItems = [], roleName = "User" }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await logoutUser();
      toast.success("Logged Out Successflly");
    } catch (err) {
      toast.error("Logout failed:", err);
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-orange-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-300/40">
            <UtensilsCrossed size={22} className="text-white" />
          </div>

          <div>
            <h2 className="text-slate-800 text-lg font-bold tracking-wide">
              FoodieHub
            </h2>

            <p className="text-orange-500 text-[11px] uppercase tracking-[0.18em] font-medium">
              {roleName} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300
            ${
              isActive
                ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200"
                : "text-slate-600 hover:bg-orange-100/80 hover:text-orange-600"
            }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all
                ${
                  isActive
                    ? "bg-white/20"
                    : "bg-orange-100 text-orange-500 group-hover:bg-orange-200"
                }`}
                >
                  <Icon size={18} />
                </div>

                <span>{label}</span>

                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-white" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-orange-100">
        <button
          onClick={handleSignOut}
          className="group flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:text-black hover:bg-orange-200 transition-all duration-300"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-100 group-hover:bg-orange-300 transition">
            <LogOut size={18} />
          </div>

          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-[60]">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-orange-200 text-orange-500 shadow-lg"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 min-h-screen bg-white border-r border-orange-100 shadow-sm shrink-0">
        <SidebarContent />
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-[290px] bg-white border-r border-orange-100 transform transition-transform duration-300 ease-out
      ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
