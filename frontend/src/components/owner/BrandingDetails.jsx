import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getMyRestaurants, addBrandingDetails } from "../../api/owner.api";
import {Link, replace} from "react-router-dom";
function BrandingDetails() {
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
    navigate("/owner",{replace:true});
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
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Setup</h1>

          <p className="text-gray-500 mt-2">
            Add your restaurant branding. Upload one logo and one banner image.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
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

              {/* Info Box */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <p className="text-sm text-orange-700">
                  Branding is optional for now. You can always update your logo
                  and banner later from the dashboard.
                </p>
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
              <div className="flex justify-center pt-2">
                <Link
                  to="/owner"
                  className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Skip setup and go to dashboard
                </Link>
              </div>
            </form>
          </div>

          {/* Setup Progress */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Setup Progress
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-medium">
                  ✓
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">
                    Restaurant Details
                  </h3>

                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-medium">
                  ✓
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">
                    Location Details
                  </h3>

                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-medium">
                  ✓
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">
                    Operation Details
                  </h3>

                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium">
                  4
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Branding</h3>

                  <p className="text-sm text-gray-500">Final step</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-green-50 border border-green-100 rounded-2xl p-4">
              <p className="text-sm text-green-700">
                You're almost done. Complete branding to finish your restaurant
                setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandingDetails;
