import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapPin,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  NotebookPen,
  Minus,
  Plus,
} from "lucide-react";
import {
  getOrderSummary,
  placeOrder,
  getAddresses,
  getMyPaymentMethods,
} from "../../api/customer.api";

/* ── helpers ── */
const Section = ({ icon, title, children }) => (
  <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center gap-2 text-orange-500">
      {icon}
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

const SummaryRow = ({ label, value, bold }) => (
  <div className="flex items-center justify-between text-sm">
    <span className={bold ? "text-base font-bold text-gray-900" : "text-gray-500"}>
      {label}
    </span>
    <span className={bold ? "text-base font-bold text-gray-900" : "font-medium text-gray-800"}>
      ₹{value?.toFixed(2)}
    </span>
  </div>
);

/* ── main component ── */
const CheckoutItem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItem = location.state?.menuItem;

  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [provider, setProvider] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  // Redirect if no menuItem
  useEffect(() => {
    if (!menuItem) {
      toast.error("No item selected");
      navigate("/customer/explore");
    }
  }, [menuItem]);

  // Load addresses & payment methods
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [addrRes, payRes] = await Promise.all([
          getAddresses(),
          getMyPaymentMethods(),
        ]);
        if (addrRes?.data?.success) setAddresses(addrRes.data.data);
        if (payRes?.data?.success) setPaymentMethods(payRes.data.data);
      } catch {
        toast.error("Failed to load checkout data");
      }
    };
    loadInitialData();
  }, []);

  // Fetch order summary whenever address or quantity changes
  useEffect(() => {
    if (!menuItem || !selectedAddressId) return;
    const fetchSummary = async () => {
      setSummaryLoading(true);
      setSummary(null);
      try {
        const res = await getOrderSummary(
          {menu_item_id:menuItem.menu_item_id,
          quantity:quantity,
          delivery_address_id:selectedAddressId}
        );
        if (res?.data?.success) setSummary(res.data.data);
      } catch {
        toast.error("Failed to fetch order summary");
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [menuItem, selectedAddressId, quantity]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return toast.error("Please select a delivery address");
    if (!selectedPaymentId) return toast.error("Please select a payment method");
    if (!summary) return toast.error("Order summary not ready yet");

    setPlacing(true);
    try {
      const res = await placeOrder({
        menu_item_id: menuItem.menu_item_id,
        delivery_address_id: selectedAddressId,
        payment_method_id: selectedPaymentId,
        special_instructions: specialInstructions,
        quantity,
        provider,
      });
      if (res?.data?.success || res?.status < 300) {
        toast.success("Order placed successfully!");
        navigate("/customer/orders");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (!menuItem) return null;

  return (
    <div className="min-h-screen bg-orange-50/30 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 shadow-sm transition hover:bg-orange-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="mt-0.5 font-medium text-orange-500">
              Almost there — confirm your details
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Item & Quantity */}
          <Section icon={<ShoppingBag size={18} />} title="Your Item">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-orange-50/40 p-4">
              <div className="flex-1">
                <p className="font-bold text-gray-900">{menuItem.item_name}</p>
                {menuItem.cuisine_name && (
                  <p className="mt-0.5 text-xs text-gray-400">{menuItem.cuisine_name}</p>
                )}
                <p className="mt-1 text-sm font-semibold text-orange-500">
                  ₹{Number(menuItem.price).toFixed(2)} each
                </p>
              </div>
              {/* Quantity stepper */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 transition hover:bg-orange-50 active:scale-95"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-[1.5rem] text-center text-base font-bold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-500 transition hover:bg-orange-50 active:scale-95"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </Section>

          {/* Delivery Address */}
          <Section icon={<MapPin size={18} />} title="Delivery Address">
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-400">No saved addresses found.</p>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.address_id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      selectedAddressId === addr.address_id
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-100 bg-white hover:border-orange-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.address_id}
                      checked={selectedAddressId === addr.address_id}
                      onChange={() => setSelectedAddressId(addr.address_id)}
                      className="mt-1 accent-orange-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {addr.label || "Home"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {addr.address_line}, {addr.city}, {addr.state} –{" "}
                        {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Section>

          {/* Order Summary */}
          <Section icon={<ShoppingBag size={18} />} title="Order Summary">
            {!selectedAddressId ? (
              <p className="text-sm text-gray-400">
                Select an address to view pricing breakdown.
              </p>
            ) : summaryLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                Calculating…
              </div>
            ) : summary ? (
              <div className="space-y-2">
                <SummaryRow label="Item Total" value={summary.ItemPrice} />
                <SummaryRow label="Delivery Fee" value={summary.DeliveryFee} />
                <SummaryRow label="GST & Taxes" value={summary.TaxAmount} />
                <div className="mt-3 border-t border-orange-100 pt-3">
                  <SummaryRow
                    label="Total Payable"
                    value={summary.TotalAmount}
                    bold
                  />
                </div>
              </div>
            ) : null}
          </Section>

          {/* Payment Method */}
          <Section icon={<CreditCard size={18} />} title="Payment Method">
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-gray-400">No payment methods found.</p>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.payment_method_id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      selectedPaymentId === pm.payment_method_id
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-100 bg-white hover:border-orange-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.payment_method_id}
                      checked={selectedPaymentId === pm.payment_method_id}
                      onChange={() => {
                        setSelectedPaymentId(pm.payment_method_id);
                        setProvider(pm.provider || pm.method_name || "");
                      }}
                      className="accent-orange-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {pm.method_name || pm.provider}
                      </p>
                      {pm.details && (
                        <p className="text-sm text-gray-500">{pm.details}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Section>

          {/* Special Instructions */}
          <Section icon={<NotebookPen size={18} />} title="Special Instructions">
            <textarea
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="E.g. no onions, extra sauce, ring the bell…"
              className="w-full resize-none rounded-xl border border-gray-100 bg-white p-3 text-sm text-gray-700 placeholder:text-gray-300 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
            />
          </Section>

          {/* Place Order CTA */}
          <button
            onClick={handlePlaceOrder}
            disabled={placing || summaryLoading || !summary}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Placing Order…
              </>
            ) : (
              <>
                Place Order
                {summary && (
                  <span className="ml-1 text-orange-100">
                    · ₹{summary.TotalAmount?.toFixed(2)}
                  </span>
                )}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutItem;