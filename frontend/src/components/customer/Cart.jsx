import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, ShoppingBag } from "lucide-react";
import { deleteCart, deleteCartItem, getMyCarts, updateCartQuantity } from "../../api/customer.api";
import {useNavigate} from "react-router-dom";

const Cart = () => {
  const navigate=useNavigate();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await getMyCarts();
      if (res?.data?.success) {
        setCarts(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  // TODO: implement quantity update
  const handleUpdateCartQty = async (cartId,cartItemId, newQty) => {
    try{
      const data={"cart_id":cartId,"cart_item_id":cartItemId,"quantity":newQty};
      console.log(data);
      const response=await updateCartQuantity(data);
      fetchCart();
    }
    catch(err){
      toast.error("Failed to update quantity");
    }
  };

  // TODO: implement delete cart item
  const handleDeleteCartItem = async (cartId,cartItemId) => {
    try{
      const response=await deleteCartItem({"cart_id":cartId,"cart_item_id":cartItemId})
      fetchCart();
      toast.success("Cart item deleted successfully");
    }
    catch(err){
      toast.error("Failed to delete cart item");
    }
  };

  // TODO: implement place order
  const placeOrder = async (cartId) => {
    console.log(cartId);
    navigate("/customer/checkout", { state: { cartId } });
  };

  const handleDeleteCart = async (cart_id) => {
    try{
      // console.log(cart_id)
      const response=await deleteCart(cart_id);
      if(response.status<300){
        toast.success("Cart deleted successfully");
      }
      fetchCart();
    }
    catch(err){
      console.log(err.response.data.message)
      toast.error("Failed to delete cart");
    }
  };
  const handleQtyChange = (cartId,cartItemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    handleUpdateCartQty(cartId,cartItemId, newQty);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-orange-50/30">
        <p className="text-lg font-medium text-gray-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/30 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
          <p className="mt-2 font-medium text-orange-500">
            Review your items before ordering
          </p>
        </div>

        {carts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center shadow-xs">
            <ShoppingBag className="mx-auto mb-4 text-orange-300" size={48} />
            <p className="text-gray-500 font-medium">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-6">
            {carts.map((cart) => {
              const cartTotal = cart.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );

              return (
                <div
                  key={cart.cart_id}
                  className="rounded-3xl border border-orange-100 bg-white p-6 shadow-xl"
                >
                  {/* Restaurant Name */}
                  <div className="mb-5 border-b border-orange-100 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {cart.restaurant_name}
                    </h2>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div
                        key={item.cart_item_id}
                        className="flex items-center gap-4 rounded-2xl border border-orange-50 bg-orange-50/40 p-3 transition hover:shadow-sm"
                      >
                        {/* Image */}
                        <img
                          src={
                            item.image_url ||
                            "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop"
                          }
                          alt={item.item_name}
                          className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.item_name}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleQtyChange(
                                cart.cart_id,
                                item.cart_item_id,
                                item.quantity,
                                -1,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 transition hover:bg-orange-100 active:scale-95 text-lg font-semibold leading-none"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQtyChange(
                                cart.cart_id,
                                item.cart_item_id,
                                item.quantity,
                                1,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 transition hover:bg-orange-100 active:scale-95 text-lg font-semibold leading-none"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total */}
                        <p className="w-20 text-right text-sm font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteCartItem(cart.cart_id,item.cart_item_id)}
                          className="flex-shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Cart Footer */}
                  <div className="mt-5 flex items-center justify-end border-t border-orange-100 pt-4">
                    <span className="text-xl font-bold text-gray-900 mr-2">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{cartTotal.toFixed(2)}
                    </span>
                    <span className="text-sm font-secondary">
                      {`(Excl. delivery fee and GST)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <button
                      onClick={() => placeOrder(cart.cart_id)}
                      className="mt-4 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98]"
                    >
                      Place Order
                    </button>

                    <button
                      onClick={() => handleDeleteCart(cart.cart_id)}
                      className="mt-4 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600 active:scale-[0.98]"
                    >
                      Delete Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
