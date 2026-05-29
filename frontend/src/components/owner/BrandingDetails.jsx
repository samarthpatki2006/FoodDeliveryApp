import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getMyRestaurants,addBrandingDetails } from "../../api/owner.api";
function BrandingDetails() {
  const [formData, setFormData] = useState({
    banner: null,
    logo: null,
  });
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getMyRestaurants();
        if (response.status < 300) setRestaurants(response.data.data);
      } catch (err) {
        const errMsg =
          err?.response?.data?.message ||
          "Cannot find any restaurants owned by you";
        toast.error(errMsg);
      }
    };
    fetchRestaurants();
  }, []);

  const handleSelectRestaurant = (e) => {
    const { value } = e.target;
    setRestaurantId(value);
  };
  const handleOnSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("logo", formData.logo);
      data.append("banner", formData.banner);

      const response = await addBrandingDetails(restaurantId, data);
      toast.success("Files uploaded successfully");
    } catch (err) {
      console.error(err);
      const errorMsg=err?.response?.data?.message || "Could not update the files";
      toast.error(errorMsg);
    }
  };

  const handleOnChange = (e) => {
    const name = e.target.name;
    const file = e.target.files[0];

    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  return (
    <div>
      <form onSubmit={handleOnSubmit}>
        <input
          type="file"
          name="logo"
          accept="image/*"
          onChange={handleOnChange}
          required
        />

        <input
          type="file"
          name="banner"
          accept="image/*"
          onChange={handleOnChange}
          required
        />
        <select
          name="restaurant_id"
          onChange={handleSelectRestaurant}
          value={restaurantId}
        >
          <option value="">Choose an restaurant</option>
          {restaurants.map((res) => (
            <option key={res.restaurant_id} value={res.restaurant_id}>
              {res.restaurant_name}
            </option>
          ))}
        </select>
        <button type="submit">Update Images</button>
      </form>
    </div>
  );
}

export default BrandingDetails;
