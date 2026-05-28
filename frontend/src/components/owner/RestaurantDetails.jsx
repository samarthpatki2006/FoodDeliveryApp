import { useState } from "react";
import { addRestaurantDetails } from "../../api/owner.api.js";
import toast from "react-hot-toast";
function RestaurantDetails() {
  const [formData, setFormData] = useState({
    restaurant_name: "",
    email: "",
    phone: "",
    description: ""
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOnSubmit = async(e) => {
    e.preventDefault();
    try {
      const response = await addRestaurantDetails(formData);
        console.log(response);
        if(response.status<300){
          setFormData({
          restaurant_name: "",
          email: "",
          phone: "",
          description: ""
        });
        toast.success("Restaurant details added successfully");
      }
    }
    catch (err) {
      console.log(err.response.data);
    }
    
  }
  return (
    <div>
      <form onSubmit={handleOnSubmit}>
        <input type="text" placeholder="Enter Restaurant Name" value={formData.restaurant_name} name="restaurant_name" onChange={handleOnChange} required />

        <input type="text" placeholder="Enter email" value={formData.email} name="email" onChange={handleOnChange} required />

        <input type="text" placeholder="Enter phone no" value={formData.phone} name="phone" onChange={handleOnChange} required />

        <input type="text" placeholder="Enter description" value={formData.description} name="description" onChange={handleOnChange} required />

        <button type="submit">Add Details</button>
      </form>
    </div>
  )
}
export default RestaurantDetails;