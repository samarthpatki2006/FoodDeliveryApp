import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getMyRestaurants, addBrandingDetails } from "../../api/owner.api";
import { Link, replace, useNavigate } from "react-router-dom";
function BrandingDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    banner: null,
    logo: null,
  });
  const [isUploading, setIsUploading] = useState(false);
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
      setIsUploading(true);
      const data = new FormData();
      data.append("logo", formData.logo);
      data.append("banner", formData.banner);
      const response = await addBrandingDetails(restaurantId, data);
      if (response.status < 300) {
        toast.success("Files uploaded successfully");
        setFormData({
          logo: null,
          banner: null,
        });
        setRestaurantId("");
      }
    } catch (err) {
      console.error(err);
      const errorMsg =
        err?.response?.data?.message || "Could not update the files";
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
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
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Restaurant Setup</h1>

          <p className="text-gray-500 mt-2">
            Add your restaurant branding. Upload one logo and one banner image.
          </p>
        </div>
        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
          {/* Step Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                4
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Branding
                </h2>

                <p className="text-sm text-gray-500">
                  Optional — upload logo & banner
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleOnSubmit} className="space-y-5">
            {/* Restaurant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant
              </label>

              <select
                required
                value={restaurantId}
                onChange={handleSelectRestaurant}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"
              >
                <option value="">Choose a restaurant</option>

                {restaurants.map((res) => (
                  <option key={res.restaurant_id} value={res.restaurant_id}>
                    {res.restaurant_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Logo Upload */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Restaurant Logo
              </label>

              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleOnChange}
                required
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:bg-orange-50 file:text-orange-600
                hover:file:bg-orange-100"
              />

              {formData.logo && (
                <p className="mt-3 text-sm text-gray-500">
                  Selected: {formData.logo.name}
                </p>
              )}
            </div>

            {/* Banner Upload */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Restaurant Banner
              </label>

              <input
                type="file"
                name="banner"
                accept="image/*"
                onChange={handleOnChange}
                required
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:bg-orange-50 file:text-orange-600
                hover:file:bg-orange-100"
              />

              {formData.banner && (
                <p className="mt-3 text-sm text-gray-500">
                  Selected: {formData.banner.name}
                </p>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading}
              className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2
              ${
                isUploading
                  ? "bg-orange-400 cursor-not-allowed text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {isUploading && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}

              {isUploading ? "Uploading..." : "Finish Setup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BrandingDetails;
