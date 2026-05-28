import {Routes,Route} from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import ProtectedRoute from "../components/ProtectedRoutes.jsx";
import Admin from "../pages/Admin.jsx";
import Owner from "../pages/Owner.jsx";
import DeliveryPartner from "../pages/DeliveryPartner.jsx";
import Customer from "../pages/Customer.jsx";

function AppRoutes(){
  return(
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>

      <Route element={<ProtectedRoute allowedRoles={["admin"]}/>}>
        <Route path="/admin" element={<Admin/>}>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["customer"]}/>}>
        <Route path="/customer" element={<Customer/>}>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["owner"]}/>}>
        <Route path="/owner" element={<Owner/>}>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["delivery_partner"]}/>}>
        <Route path="/delivery_partner" element={<DeliveryPartner/>}>
        </Route>
      </Route>
    </Routes>
  )
}
export default AppRoutes;
