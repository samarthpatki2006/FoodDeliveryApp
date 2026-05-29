import { useState } from "react";
import { addRestaurantDetails } from "../../api/owner.api.js";
import toast from "react-hot-toast";
import { replace } from "react-router-dom";
function RestaurantDetails() {
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

  const handleOnSubmit = async (e,nextRoute = "/owner/setup/add-location-details") => {
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
        navigate(nextRoute,{replace:true});
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    }
  };
  return (
    <div className="max-h-screen bg-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Setup</h1>

          <p className="text-gray-500 mt-2">
            Start by creating your restaurant profile. Only this step is
            required right now.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
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
                  rows={4}
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

                <button
                  type="button"
                  onClick={(e) => handleOnSubmit(e, "/owner")}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition"
                >
                  Save and Finish Next Steps Later
                </button>
              </div>
            </form>
          </div>

          {/* Setup Guide */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Setup Progress
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              Complete your restaurant setup step by step. You can finish the
              remaining setup anytime from the dashboard.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium shrink-0">
                  1
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">
                    Restaurant Details
                  </h3>

                  <p className="text-sm text-gray-500">
                    Required to create your restaurant.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 opacity-80">
                <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium shrink-0">
                  2
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">
                    Location Details
                  </h3>

                  <p className="text-sm text-gray-500">
                    Add restaurant address and delivery zone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 opacity-80">
                <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium shrink-0">
                  3
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">
                    Operation Details
                  </h3>

                  <p className="text-sm text-gray-500">
                    Configure timings and availability.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 opacity-80">
                <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium shrink-0">
                  4
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Branding</h3>

                  <p className="text-sm text-gray-500">
                    Upload logo and banner later.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <p className="text-sm text-orange-700">
                Only step 1 is mandatory right now. Steps 2–4 can be completed
                later from your owner dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RestaurantDetails;
