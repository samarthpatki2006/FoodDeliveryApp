import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { addAddressDetails, getAddresses } from "../../api/customer.api";
import getLiveLocation from "../../utils/location";

export const Address = () => {
  const [formData, setFormData] = useState({
    label: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [location, setLocation] = useState({
    longitude: "",
    latitude: "",
  });

  const [isFetching, setIsFetching] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch addresses");
    }
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (location.latitude === "" || location.longitude === "") {
      return toast.error("Please fetch location first");
    }

    try {
      const response = await addAddressDetails({
        ...formData,
        ...location,
      });

      if (response.status < 300) {
        toast.success("Address added successfully");

        setFormData({
          label: "",
          address_line: "",
          city: "",
          state: "",
          pincode: "",
        });

        setLocation({
          longitude: "",
          latitude: "",
        });

        fetchAddresses();
      }
    } catch (err) {
      const errMsg =
        "Could not update the address: " + err?.response?.data?.message;

      toast.error(errMsg);
    }
  };
  const fetchLiveLocation=(e)=>{
    getLiveLocation(e,setIsFetching,setLocation);
  }
  // const getLocation = (e) => {
  //   e.preventDefault();

  //   if (!navigator.geolocation) {
  //     toast.error("Geolocation is not supported");
  //     return;
  //   }

  //   setIsFetching(true);

  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       setLocation({
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude,
  //       });

  //       setIsFetching(false);
  //       toast.success("Location fetched");
  //     },
  //     () => {
  //       toast.error("Location access denied");
  //       setIsFetching(false);
  //     },
  //   );
  // };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <div className="h-screen bg-orange-50/30 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Addresses</h1>
          <p className="mt-2 font-medium text-orange-500">
            Add and manage delivery locations
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Address Form */}
          <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Add New Address
            </h2>

            <form onSubmit={handleOnSubmit} className="space-y-5">
              <select
                onChange={handleOnChange}
                value={formData.label}
                name="label"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Choose a label</option>
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Hostel">Hostel</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Address Line"
                name="address_line"
                value={formData.address_line}
                onChange={handleOnChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  value={formData.city}
                  onChange={handleOnChange}
                  required
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />

                <input
                  type="text"
                  placeholder="State"
                  name="state"
                  value={formData.state}
                  onChange={handleOnChange}
                  required
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <input
                type="text"
                placeholder="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleOnChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />

              {/* Fetch Location */}
              <button
                onClick={fetchLiveLocation}
                type="button"
                className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-medium text-orange-700 transition hover:bg-orange-100"
              >
                {isFetching ? "Fetching Location..." : "Fetch Location"}
              </button>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Save Address
              </button>
            </form>
          </div>

          {/* Saved Addresses */}
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Saved Addresses
            </h2>

            {addresses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 text-center text-gray-500 shadow-sm">
                No saved addresses yet
              </div>
            ) : (
              <div className="space-y-4 max-h-[460px] overflow-y-auto py-6 rounded-3xl border border-orange-100 px-4 shadow-xl bg-white">
                {addresses.map((add) => (
                  <div
                    key={add.address_id}
                    className="relative rounded-3xl border border-orange-100 bg-white p-6 shadow-md transition hover:shadow-xl"
                  >
                    {/* Edit Button */}
                    <button className="absolute right-5 top-5 rounded-full p-2 text-gray-500 transition hover:bg-orange-100 hover:text-orange-600">
                      <Pencil size={18} />
                    </button>

                    {/* Label */}
                    <span className="inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-700">
                      {add.label}
                    </span>

                    {/* Address Details */}
                    <div className="mt-4 space-y-1 text-gray-700">
                      <p className="font-medium text-gray-900">
                        {add.address_line}
                      </p>
                      <p>
                        {add.city}, {add.state}
                      </p>
                      <p>{add.pincode}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
