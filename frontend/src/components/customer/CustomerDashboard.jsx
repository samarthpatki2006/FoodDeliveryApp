import { useState } from "react";
import {getAddresses} from "../../api/customer.api.js"
const CustomerDashboard=()=>{
  const [restaurants,setRestaurants]=useState([]);
  const [addresses,setAddresses]=useState([]);
  const [selectedAddressId,setSelectedAddressId]=useState("");

  const [location,setLocation]=useState({
    latitude:"",
    longitude:""
  })

  const fetchAddress=async()=>{
    const response=await getAddresses();
    if(response.status<300){
      setAddresses(response.data.data);
      console.log(addresses);
    }
  }
  const fetchLiveLocation=()=>{

  }
  const fetchRestaurants=async()=>{
    const response=await fetchRestaurants(selectedAddressId);
    if(response.status<300){
      setRestaurants(response.data.data);
    }
  }
  return(
    <div>Customer Dashboard</div>
  )
}
export default CustomerDashboard;