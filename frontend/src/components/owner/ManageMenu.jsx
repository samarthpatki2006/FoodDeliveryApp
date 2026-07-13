import { useEffect, useState } from "react";
import {
  addMenuItem,
  getAllCategories,
  getAllCuisines,
  getMyRestaurantItems,
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
  const [activeTab, setActiveTab] = useState("add-items");
  const [restaurantMenuId, setRestaurantMenuId] = useState();
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

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
  const handleSelectRestaurantForItems = async (e) => {
    const { value } = e.target;
    setRestaurantMenuId(value);
  };

  const handleFetchMenu = async () => {
    try {
      setMenuLoading(true);
      if (restaurantMenuId.trim() === "") return;
      const response = await getMyRestaurantItems(restaurantMenuId);
      setMenuItems(response.data.data);
      
    } catch (err) {
    } finally {
      setMenuLoading(false);
    }
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
      <div className="w-full max-w-3xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("add-items")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              activeTab === "add-items"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Items
          </button>
          <button
            onClick={() => setActiveTab("view-items")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              activeTab === "view-items"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            View All Items
          </button>
        </div>

        {/* ── ADD ITEMS PANEL ── */}
        {activeTab === "add-items" && (
          <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                Add Menu Item
              </h1>
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
                  Price (₹)
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

              {/* Veg / Non-Veg */}
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
                  <option value="">Choose Veg / Non-Veg</option>
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

              {/* Submit */}
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
        )}

        {/* ── VIEW ITEMS PANEL ── */}
        {activeTab === "view-items" && (
          <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800">Menu Items</h1>
              <p className="text-gray-500 mt-2">
                Browse all items for a restaurant
              </p>
            </div>

            {/* Restaurant selector + fetch button */}
            <div className="flex gap-3 items-end mb-8">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant
                </label>
                <select
                  onChange={handleSelectRestaurantForItems}
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
              <button
                onClick={handleFetchMenu}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition whitespace-nowrap"
              >
                Fetch Menu
              </button>
            </div>

            {/* Summary stats */}
            {menuItems.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {menuItems.length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Veg</p>
                  <p className="text-2xl font-bold text-green-600">
                    {menuItems.filter((i) => i.is_veg === 1).length}
                  </p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Non-Veg</p>
                  <p className="text-2xl font-bold text-red-500">
                    {menuItems.filter((i) => i.is_veg === 0).length}
                  </p>
                </div>
              </div>
            )}

            {/* Menu item cards */}
            {menuItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <div
                    key={item.menu_item_id}
                    className="flex gap-4 items-start border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Image / placeholder */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden">
                      {item.menu_image ? (
                        <img
                          src={item.menu_image}
                          alt={item.item_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-semibold text-orange-300">
                          {item.item_name
                            .split(" ")
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <p className="text-base font-semibold text-gray-800">
                          {item.item_name}
                        </p>
                        <p className="text-base font-semibold text-orange-500">
                          ₹{parseFloat(item.price).toFixed(0)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 mb-3 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                            item.is_veg === 1
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.is_veg === 1 ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {item.is_veg === 1 ? "Veg" : "Non-Veg"}
                        </span>
                        <span className="text-xs text-gray-400">
                          #{item.menu_item_id}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mb-3 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm">
                  Select a restaurant and fetch its menu
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default ManageMenu;
