import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Pencil, Navigation, Home, Briefcase, Building2, LocateFixed } from "lucide-react";
import { addAddressDetails, getAddresses } from "../../api/customer.api";
import getLiveLocation from "../../utils/location";

const LABEL_ICONS = {
  Home: Home,
  Work: Briefcase,
  Hostel: Building2,
  Other: MapPin,
};

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
  const fetchLiveLocation = (e) => {
    getLiveLocation(e, setIsFetching, setLocation);
  };
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

  const hasLocation = location.latitude !== "" && location.longitude !== "";

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-500 shadow-sm">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Manage Addresses
            </h1>
            <p className="mt-0.5 text-sm font-medium text-orange-600 sm:text-base">
              Add and manage your delivery locations
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Add Address Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  Add New Address
                </h2>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                  {addresses.length} saved
                </span>
              </div>

              <form onSubmit={handleOnSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Label
                  </label>
                  <select
                    onChange={handleOnChange}
                    value={formData.label}
                    name="label"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  >
                    <option value="">Choose a label</option>
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Address line
                  </label>
                  <input
                    type="text"
                    placeholder="Flat / street / landmark"
                    name="address_line"
                    value={formData.address_line}
                    onChange={handleOnChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      name="city"
                      value={formData.city}
                      onChange={handleOnChange}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="State"
                      name="state"
                      value={formData.state}
                      onChange={handleOnChange}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleOnChange}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                {/* Fetch Location */}
                <button
                  onClick={fetchLiveLocation}
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <>
                      <Navigation className="h-4 w-4 animate-pulse" />
                      Fetching Location...
                    </>
                  ) : hasLocation ? (
                    <>
                      <LocateFixed className="h-4 w-4" />
                      Location captured
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      Fetch Location
                    </>
                  )}
                </button>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  Save Address
                </button>
              </form>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Saved Addresses
              </h2>
            </div>

            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-16 text-center shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                  <MapPin className="h-7 w-7 text-orange-300" />
                </div>
                <p className="font-medium text-gray-700">No saved addresses yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the form to add your first delivery location
                </p>
              </div>
            ) : (
              <div className="grid max-h-[640px] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
                {addresses.map((add) => {
                  const LabelIcon = LABEL_ICONS[add.label] || MapPin;
                  return (
                    <div
                      key={add.address_id}
                      className="group relative rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-md"
                    >
                      {/* Edit Button */}
                      <button className="absolute right-5 top-5 rounded-full p-2 text-gray-400 transition hover:bg-orange-100 hover:text-orange-600">
                        <Pencil size={16} />
                      </button>

                      {/* Label */}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        <LabelIcon size={13} />
                        {add.label}
                      </span>

                      {/* Address Details */}
                      <div className="mt-4 space-y-1 pr-6 text-sm text-gray-600">
                        <p className="font-medium leading-snug text-gray-900">
                          {add.address_line}
                        </p>
                        <p>
                          {add.city}, {add.state}
                        </p>
                        <p className="text-gray-500">{add.pincode}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;