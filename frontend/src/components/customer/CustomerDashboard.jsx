import { useState } from "react";
import {getAddresses} from "../../api/customer.api.js"
import getLiveLocation from "../../utils/location.js";
const CustomerDashboard=()=>{
  const [restaurants,setRestaurants]=useState([]);
  const [addresses,setAddresses]=useState([]);
  const [selectedAddressId,setSelectedAddressId]=useState("");
  const [isFetching,setIsFetching]=useState(false);
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
  const fetchLiveLocation=(e)=>{
    getLiveLocation(e,setIsFetching,setLocation);
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