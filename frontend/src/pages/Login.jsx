import { useState } from "react";
import { loginUser } from "../api/auth";
import toast from "react-hot-toast";
function Login(){
  const [formData,setFormData]=useState({
    email:"",
    phone:"",
    password:""
  });


  const handleOnChange=(e)=>{
    const {name,value}=e.target;
    setFormData((prev)=>({
      ...prev,
      [name]:value
    }))
  }

  const handleOnSubmit=async(e)=>{
    e.preventDefault();

    try{
      const res=await loginUser(formData);
      if(res.status<400) {
        toast.success("Login Success");
      }
      else {
        toast.error("Login successfully");
      }
    }
    catch(err){
      console.log(err);
      toast.error("Something went wrong");
    }
    setFormData({
      email:"",
      phone:"",
      password:""
    })
  }
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleOnSubmit}>
        <input type="text" name="email" value={formData.email} placeholder="Enter email" onChange={handleOnChange}/>
        <input type="text" name="phone" value={formData.phone} placeholder="Enter phone" onChange={handleOnChange}/>
        <input type="password" name="password" value={formData.password} placeholder="Enter password" onChange={handleOnChange}/>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
export default Login;