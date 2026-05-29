import { useEffect, useState } from "react";
import {getMyRestaurants} from "../../api/owner.api.js"
function MyRestaurants(){
  const [restaurants,setRestaurants]=useState([]);

  useEffect(()=>{
    const fetchRestaurants=async()=>{
      try{
        const response=await getMyRestaurants();
        setRestaurants(response.data.data);
      }
      catch(err){
        
      }
    }
    fetchRestaurants();
  },[]);
  return (
    <div className="grid gap-6 grid-cols-2">
      {restaurants.map((res)=>(
        <div key={res.restaurant_id} className="bg-red-200 w-120"> 
           <div>{res.restaurant_name}</div>
           <div>{res.description}</div>
           <div>{res.city}</div>
           <div>{res.state}</div>
           <div>{res.pincode}</div>
           <div>{res.rating_avg}</div>
           <div>{res.rating_count}</div>
           <div>{res.email}</div>
           <div>{res.phone}</div>
        </div>
      ))}
    </div>
  )
}
export default MyRestaurants;