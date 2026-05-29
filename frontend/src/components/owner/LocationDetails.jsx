import { useState,useEffect } from "react";
import { addLocationDetails, getMyRestaurants } from "../../api/owner.api";
import toast from "react-hot-toast";

function LocationDetails() {
  const [formData, setFormData] = useState({
    address_line: "",
    state: "",
    city: "",
    pincode: "",
  });
  const [restaurantId, setRestaurantId] = useState("");
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
  });
  const [restaurants,setRestaurants]=useState([]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleOnSubmit = async(e) => {
    e.preventDefault();

    try{
      const response=await addLocationDetails(restaurantId,{...formData,...location});
      if(response.status<300){
        toast.success("Location details updated successfully");
      }
    }
    catch(err){
      const errorMsg=err.response.data.message || "Failed to update location details";
      toast.error(errorMsg);
    }
  };

  const getLocation = (e) => {
    e.preventDefault()
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log(error);
        toast.error("Location access denied");
      },
    );
  };

  useEffect(()=>{
    const getRestaurants=async()=>{
      try{
        const response=await getMyRestaurants();
        setRestaurants(response.data.data);
      }
      catch(err){
        console.log(err.response.data.message);
        setRestaurants(null);
      }
    }
    getRestaurants();
  },[])

  const handleSelectRestaurant=(e)=>{
    const {value}=e.target;
    setRestaurantId(value);
  }
  return (
    <div>
      <form onSubmit={handleOnSubmit}>
        <input
          type="text"
          placeholder="Enter address"
          name="address_line"
          value={formData.address_line}
          onChange={handleOnChange}
          required
        />
        <input
          type="text"
          placeholder="Enter state"
          name="state"
          value={formData.state}
          onChange={handleOnChange}
          required
        />
        <input
          type="text"
          placeholder="Enter city"
          name="city"
          value={formData.city}
          onChange={handleOnChange}
          required
        />
        <input
          type="text"
          placeholder="Enter pincode"
          name="pincode"
          value={formData.pincode}
          onChange={handleOnChange}
          required
        />
        <select required name={restaurantId} value={restaurantId} onChange={handleSelectRestaurant}>
          <option value="">Choose an restaurant</option>
          {restaurants.map((res)=>(
            <option value={res.restaurant_id} key={res.restaurant_id}>{res.restaurant_name}</option>
          ))}
        </select>
        <button onClick={getLocation}>
          Fetch latitude and longitude
        </button>
        <p></p>
        <button type="submit">Add Details</button>
      </form>
    </div>
  );
}
export default LocationDetails;
