import { useState,useEffect } from "react";
import { addOperationDetails, getMyRestaurants } from "../../api/owner.api";
import toast from "react-hot-toast";
function OperationDetails(){
  const [formData,setFormData]=useState({
    "opening_time":"",
    "closing_time":"",
  });
  const [restaurants,setRestaurants]=useState([]);
  const [restaurantId,setRestaurantId]=useState("");

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
      const response=await addOperationDetails(restaurantId,formData);
      if(response.status<300){
        toast.success("Operation details added successfully");
      }
      setFormData({
        opening_time:"",
        closing_time:""
      })
      setRestaurantId("");
    }catch(err){
      const errMsg=err?.response?.data?.message || "Failed to add operation details";
      toast.error(errMsg);
    }
  }

  useEffect(()=>{
    const fetchRestaurants=async()=>{
      try{
        const response=await getMyRestaurants();
        if(response.status<300)
          setRestaurants(response.data.data);
      }
      catch(err){
        const errMsg=err.response.data.message || "Cannot find any restaurants owned by you";
        toast.error(errMsg);
      }
    }
    fetchRestaurants();
  },[])

  const handleSelectRestaurant=(e)=>{
    const {value}=e.target;
    setRestaurantId(value);
  }
  return (
    <div>
      <form onSubmit={handleOnSubmit}>
        <input type="time" placeholder="Opening time" value={formData.opening_time} name="opening_time" onChange={handleOnChange} required/>
        <input type="time" placeholder="Closing time" value={formData.closing_time} name="closing_time" onChange={handleOnChange} required/>
        <select name="restaurant_id" onChange={handleSelectRestaurant} value={restaurantId}>
          <option value="">Choose an restaurant</option>
          {restaurants.map((res)=>(
            <option key={res.restaurant_id} value={res.restaurant_id}>{res.restaurant_name}</option>
          ))}
        </select>
        <button type="submit">Add Operation Details</button>
      </form>
    </div>
  )
}
export default OperationDetails;