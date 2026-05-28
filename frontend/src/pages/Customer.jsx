import { logoutUser } from "../api/auth.api";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
function Customer(){
  const {user,setUser}=useAuth();
  const navigate=useNavigate();
  const handleLogout=async ()=>{
    console.log(user)
    try{
      const res=await logoutUser();
      if(res.status<300){
        toast.success("Logged Out Successfully");
        navigate("/");
        setUser(null);
      }
    }
    catch(e){
      toast.error(e);
    }
  }
  return (
    <div>
      <h1>Customer Main Layout</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
export default Customer;