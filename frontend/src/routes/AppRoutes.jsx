import {Routes,Route} from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";

function AppRoutes(){
  return(
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
    </Routes>
  )
}
export default AppRoutes;
