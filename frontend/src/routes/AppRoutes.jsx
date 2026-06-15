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
import ManageCuisines from "../components/owner/ManageCuisines.jsx";
import ManageMenu from "../components/owner/ManageMenu.jsx";
import Address from "../components/customer/Address.jsx";
import CustomerDashboard from "../components/customer/CustomerDashboard.jsx";
import Cart from "../components/customer/Cart.jsx";
import Payments from "../components/customer/Payments.jsx";
import Orders from "../components/customer/Orders.jsx";
import Checkout from "../components/customer/Checkout.jsx";
import ManageOrders from "../components/owner/ManageOrders.jsx";
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
          <Route path="dashboard" element={<CustomerDashboard/>}/>
          <Route path="address" element={<Address/>}/>
          <Route path="cart" element={<Cart/>}/>
          <Route path="payments" element={<Payments/>}/>
          <Route path="orders" element={<Orders/>}/>
          <Route path="checkout" element={<Checkout/>}/>
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
          <Route path="manage-cuisines" element={<ManageCuisines/>}/>
          <Route path="manage-menu" element={<ManageMenu/>}/>
          <Route path="manage-orders" element={<ManageOrders/>}/>
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
