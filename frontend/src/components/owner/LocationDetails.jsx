import { useState, useEffect } from "react";
import { addLocationDetails, getMyRestaurants } from "../../api/owner.api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

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
  const [isFetching, setIsFetching] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOnSubmit = async (
    e,
    nextRoute = "/owner/setup/add-operation-details",
  ) => {
    e.preventDefault();
    try {
      const response = await addLocationDetails(restaurantId, {
        ...formData,
        ...location,
      });
      if (response.status < 300) {
        toast.success("Location details updated successfully");
        navigate(nextRoute);
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || "Failed to update location details";
      toast.error(errorMsg);
    }
  };

  const getLocation = (e) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }

    setIsFetching(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setIsFetching(false);
        toast.success("Location fetched");
      },
      (error) => {
        console.log(error);

        toast.error("Location access denied");
        setIsFetching(false);
      },
    );
  };

  useEffect(() => {
    const getRestaurants = async () => {
      try {
        const response = await getMyRestaurants();
        setRestaurants(response.data.data);
        setFormData({
          address_line: "",
          state: "",
          city: "",
          pincode: "",
        });
      } catch (err) {
        console.log(err.response.data.message);
        setRestaurants(null);
      }
    };
    getRestaurants();
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
            Add your restaurant location details. You can always update this
            later.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                  2
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Location Details
                  </h2>

                  <p className="text-sm text-gray-500">
                    Optional — helps customers find you
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
                    <option value={res.restaurant_id} key={res.restaurant_id}>
                      {res.restaurant_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>

                <input
                  type="text"
                  placeholder="Enter address"
                  name="address_line"
                  value={formData.address_line}
                  onChange={handleOnChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"
                />
              </div>

              {/* State + City */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    placeholder="Enter state"
                    name="state"
                    value={formData.state}
                    onChange={handleOnChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    placeholder="Enter city"
                    name="city"
                    value={formData.city}
                    onChange={handleOnChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>

                <input
                  type="text"
                  placeholder="Enter pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleOnChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"
                />
              </div>

              {/* Geolocation */}
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      GPS Coordinates
                    </h3>

                    <p className="text-sm text-gray-500">
                      Fetch latitude & longitude automatically.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={isFetching}
                    className={`border border-orange-300 text-orange-600 px-4 py-2 rounded-xl font-medium transition flex items-center gap-2
                    ${isFetching ? "bg-orange-50 cursor-not-allowed" : "hover:bg-orange-50"}`}
                  >
                    {isFetching && (
                      <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isFetching ? "Fetching..." : "Fetch Location"}
                  </button>
                </div>

                {(location.latitude || location.longitude) && (
                  <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                    <p>Latitude: {location.latitude}</p>

                    <p>Longitude: {location.longitude}</p>
                  </div>
                )}
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
                <div className="h-9 w-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium">
                  2
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">
                    Location Details
                  </h3>

                  <p className="text-sm text-gray-500">Current step</p>
                </div>
              </div>

              <div className="flex items-start gap-4 opacity-80">
                <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium">
                  3
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">
                    Operation Details
                  </h3>

                  <p className="text-sm text-gray-500">
                    Add timings & availability
                  </p>
                </div>
              </div>

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
export default LocationDetails;
