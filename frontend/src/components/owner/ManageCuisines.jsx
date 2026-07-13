import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getMyRestaurants,
  getAllCuisines,
  addRestaurantCuisine,
} from "../../api/owner.api";

function ManageCuisines() {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);

  const [formData, setFormData] = useState({
    restaurant_id: "",
    cuisine_id: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getRestaurants = async () => {
      try {
        const response = await getMyRestaurants();
        setRestaurants(response.data.data || []);
      } catch (err) {
        setRestaurants([]);
      }
    };

    const fetchCuisines = async () => {
      try {
        const response = await getAllCuisines();
        setCuisines(response.data.data || []);
      } catch (err) {
        setCuisines([]);
      }
    };

    fetchCuisines();
    getRestaurants();
  }, []);

  const handleRestaurantChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      restaurant_id: e.target.value,
    }));
  };

  const handleCuisineChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      cuisine_id: e.target.value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (!formData.restaurant_id) {
      return toast.error("Please select a restaurant");
    }

    if (!formData.cuisine_id) {
      return toast.error("Please select a cuisine");
    }

    try {
      setLoading(true);

      const response = await addRestaurantCuisine(
        formData.cuisine_id,
        formData.restaurant_id,
      );

      toast.success(response?.data?.message || "Cuisine added successfully");

      setFormData({
        restaurant_id: "",
        cuisine_id: "",
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Manage Cuisines</h1>

          <p className="text-gray-500 mt-2">
            Assign cuisines to your restaurant for better customer discovery.
          </p>
        </div>

        <form onSubmit={handleOnSubmit} className="space-y-5">
          {/* Restaurant Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant
            </label>

            <select
              value={formData.restaurant_id}
              onChange={handleRestaurantChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 transition"
            >
              <option value="">Choose a Restaurant</option>

              {restaurants?.map((res) => (
                <option key={res.restaurant_id} value={res.restaurant_id}>
                  {res.restaurant_name}
                </option>
              ))}
            </select>
          </div>

          {/* Cuisine Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine
            </label>

            <select
              value={formData.cuisine_id}
              onChange={handleCuisineChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 transition"
            >
              <option value="">Choose a Cuisine</option>

              {cuisines?.map((cuisine) => (
                <option key={cuisine.cuisine_id} value={cuisine.cuisine_id}>
                  {cuisine.cuisine_name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding Cuisine...
                </div>
              ) : (
                "Save Cuisine"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManageCuisines;
