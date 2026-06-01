import { useEffect, useState } from "react";
import {
  addMenuItem,
  getAllCategories,
  getAllCuisines,
  getMyRestaurants,
} from "../../api/owner.api";
import toast from "react-hot-toast";
function ManageMenu() {
  const [formData, setFormData] = useState({
    category_id: "",
    cuisine_id: "",
    item_name: "",
    description: "",
    price: "",
    is_veg: "",
  });
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [menuImage, setMenuImage] = useState(null);
  const [restaurantId, setRestaurantId] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("category_id", formData.category_id);
      data.append("cuisine_id", formData.cuisine_id);
      data.append("price", formData.price);
      data.append("description", formData.description);
      data.append("item_name", formData.item_name);
      data.append("is_veg", formData.is_veg);

      if (menuImage) {
        data.append("menu_image", menuImage);
      }
      setIsUploading(true);

      const response = await addMenuItem(restaurantId, data);
      if (response.status < 300) {
        toast.success("Menu item added successfully");
        setFormData({
          category_id: "",
          cuisine_id: "",
          item_name: "",
          description: "",
          price: "",
          is_veg: "",
        });
        setRestaurantId("");
        setMenuImage(null);
      }
    } catch (err) {
      console.log(err.response.data.message);
      toast.error("Could not add the menu item");
    } finally {
      setIsUploading(false);
    }
  };
  const handleSelectRestaurant = (e) => {
    const { value } = e.target;
    setRestaurantId(value);
  };
  const handleImageChange = (e) => {
    setMenuImage(e.target.files[0]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await getMyRestaurants();
        const res2 = await getAllCategories();
        const res3 = await getAllCuisines();

        setRestaurants(res1.data.data);
        setCategories(res2.data.data);
        setCuisines(res3.data.data);
      } catch (err) {
        toast.error("Could not fetch data");
      }
    };
    fetchData();
  }, []);
  return (
    <div className="w-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Add Menu Item</h1>
          <p className="text-gray-500 mt-2">
            Add food items to your restaurant menu
          </p>
        </div>

        <form
          onSubmit={handleOnSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Restaurant */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant
            </label>

            <select
              onChange={handleSelectRestaurant}
              value={restaurantId}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Choose a Restaurant</option>

              {restaurants?.map((res) => (
                <option key={res.restaurant_id} value={res.restaurant_id}>
                  {res.restaurant_name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>

            <select
              onChange={handleOnChange}
              value={formData.category_id}
              name="category_id"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Choose a category</option>

              {categories?.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine
            </label>

            <select
              onChange={handleOnChange}
              value={formData.cuisine_id}
              name="cuisine_id"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Choose a cuisine</option>

              {cuisines?.map((cuisine) => (
                <option key={cuisine.cuisine_id} value={cuisine.cuisine_id}>
                  {cuisine.cuisine_name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>

            <input
              type="text"
              placeholder="Enter item name"
              onChange={handleOnChange}
              value={formData.item_name}
              name="item_name"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>

            <input
              type="number"
              placeholder="Enter price"
              onChange={handleOnChange}
              value={formData.price}
              name="price"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>

            <textarea
              placeholder="Enter description"
              onChange={handleOnChange}
              value={formData.description}
              name="description"
              rows={4}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Veg/Non Veg */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Type
            </label>

            <select
              onChange={handleOnChange}
              value={formData.is_veg}
              name="is_veg"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Choose Veg/Non-Veg</option>
              <option value="1">Veg</option>
              <option value="0">Non Veg</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Image
            </label>

            <input
              type="file"
              name="menu_image"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 file:mr-4 file:px-4 file:py-2 file:border-0 file:bg-orange-100 file:text-orange-600 file:rounded-lg hover:file:bg-orange-200"
            />

            {menuImage && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {menuImage.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 pt-3">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                "Add Menu Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ManageMenu;
