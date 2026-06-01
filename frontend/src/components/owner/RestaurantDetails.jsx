import { useState } from "react";
import { addRestaurantDetails } from "../../api/owner.api.js";
import toast from "react-hot-toast";
import { replace, useNavigate } from "react-router-dom";
function RestaurantDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    restaurant_name: "",
    email: "",
    phone: "",
    description: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e?.preventDefault();
    try {
      const response = await addRestaurantDetails(formData);
      if (response.status < 300) {
        toast.success("Restaurant details added successfully");
        setFormData({
          restaurant_name: "",
          email: "",
          phone: "",
          description: "",
        });
        navigate("/owner/add-location-details", { replace: true });
      }
    } catch (err) {
      console.log(err);
      const errorMsg = err?.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    }
  };
  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Setup</h1>

          <p className="text-gray-500 mt-2">
            Start by creating your restaurant profile. Only this step is
            required right now.
          </p>
        </div>
        {/* Form Section */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
          {/* Step Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                1
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Restaurant Details
                </h2>

                <p className="text-sm text-gray-500">
                  Required to start accepting orders
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleOnSubmit} className="space-y-5">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name
              </label>

              <input
                type="text"
                placeholder="Enter restaurant name"
                value={formData.restaurant_name}
                name="restaurant_name"
                onChange={handleOnChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Email
              </label>

              <input
                type="email"
                placeholder="Enter email"
                value={formData.email}
                name="email"
                onChange={handleOnChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>

              <input
                type="text"
                placeholder="Enter phone number"
                value={formData.phone}
                name="phone"
                onChange={handleOnChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>

              <textarea
                placeholder="Tell customers about your restaurant"
                value={formData.description}
                name="description"
                onChange={handleOnChange}
                rows={2}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              {/* Enter triggers this */}
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition"
              >
                Save & Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default RestaurantDetails;
