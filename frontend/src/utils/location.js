import toast from "react-hot-toast";
const getLiveLocation = (e,setIsFetching,setLocation) => {
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
    () => {
      toast.error("Location access denied");
      setIsFetching(false);
    },
  );
};

export default getLiveLocation;