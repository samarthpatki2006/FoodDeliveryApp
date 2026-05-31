import { Routes, Route,Navigate,Link } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import ProtectedRoute from "../components/ProtectedRoutes.jsx";
import Admin from "../pages/Admin.jsx";
import Owner from "../pages/Owner.jsx";
import DeliveryPartner from "../pages/DeliveryPartner.jsx";
import Customer from "../pages/Customer.jsx";
import RestaurantDetails from "../components/owner/RestaurantDetails.jsx";
import LocationDetails from "../components/owner/LocationDetails.jsx";
import OperationDetails from "../components/owner/OperationDetails.jsx";
import BrandingDetails from "../components/owner/BrandingDetails.jsx";
import MyRestaurants from "../components/owner/MyRestaurants.jsx";
import AdminDashboard from "../components/admin/AdminDashboard.jsx";
import OwnerDashboard from "../components/owner/OwnerDashboard.jsx";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<Admin />}>
          <Route path="dashboard" element={<AdminDashboard/>}/>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
        <Route path="/customer" element={<Customer />}>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
        <Route path="/owner" element={<Owner />}>
          <Route path="dashboard" element={<OwnerDashboard/>}/>
          <Route path="get-my-restaurants" element={<MyRestaurants />}/>
          <Route path="add-restaurant-details" element={<RestaurantDetails />}/>
          <Route path="add-location-details" element={<LocationDetails />}/>
          <Route path="add-operation-details" element={<OperationDetails />}/>
          <Route path="add-branding-details" element={<BrandingDetails />}/>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["delivery_partner"]} />}>
        <Route path="/delivery_partner" element={<DeliveryPartner />}>
        </Route>
      </Route>
    </Routes>
  )
}
export default AppRoutes;
