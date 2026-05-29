import { useState, useEffect } from "react";
import { addOperationDetails, getMyRestaurants } from "../../api/owner.api";
import toast from "react-hot-toast";
import { useNavigate,Link } from "react-router-dom";
function OperationDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    opening_time: "",
    closing_time: "",
  });
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOnSubmit = async (
    e,
    nextRoute = "/owner/setup/add-branding-details",
  ) => {
    e.preventDefault();
    try {
      const response = await addOperationDetails(restaurantId, formData);
      if (response.status < 300) {
        toast.success("Operation details added successfully");
        setFormData({
          opening_time: "",
          closing_time: "",
        });
        setRestaurantId("");
        navigate(nextRoute);
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Failed to add operation details";
      toast.error(errMsg);
    }
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getMyRestaurants();
        if (response.status < 300) setRestaurants(response.data.data);
      } catch (err) {
        const errMsg =
          err.response.data.message ||
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
  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Setup</h1>

          <p className="text-gray-500 mt-2">
            Configure your restaurant timings. Customers will see when your
            restaurant is open.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
            {/* Step Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                  3
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Operation Details
                  </h2>

                  <p className="text-sm text-gray-500">
                    Optional — set restaurant timings
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleOnSubmit} className="space-y-5">
              {/* Restaurant Select */}
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

              {/* Time Inputs */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time
                  </label>

                  <input
                    type="time"
                    value={formData.opening_time}
                    name="opening_time"
                    onChange={handleOnChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time
                  </label>

                  <input
                    type="time"
                    value={formData.closing_time}
                    name="closing_time"
                    onChange={handleOnChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <p className="text-sm text-orange-700">
                  Customers will see your restaurant as open only during these
                  hours.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
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
              <div className="flex justify-center pt-2">
                <Link
                  to="/owner"
                  replace
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
              {/* Step 1 */}
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

              {/* Step 2 */}
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

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium">
                  3
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">
                    Operation Details
                  </h3>

                  <p className="text-sm text-gray-500">Current step</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4 opacity-80">
                <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium">
                  4
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Branding</h3>

                  <p className="text-sm text-gray-500">Upload logo & banner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OperationDetails;
