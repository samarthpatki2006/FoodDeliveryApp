import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wallet, FilterX } from "lucide-react";
import { getMyPaymentHistory } from "../../api/customer.api";

const STATUS_FILTERS = [
  { label: "All",       value: "" },
  { label: "Pending",   value: "1" },
  { label: "Paid",      value: "2" },
  { label: "Failed",    value: "3" },
  { label: "Refunded",  value: "4" },
];

const STATUS_STYLES = {
  1: { label: "Pending",  bg: "bg-yellow-50", text: "text-yellow-600", dot: "bg-yellow-400" },
  2: { label: "Paid",     bg: "bg-green-50",  text: "text-green-600",  dot: "bg-green-400" },
  3: { label: "Failed",   bg: "bg-red-50",    text: "text-red-500",    dot: "bg-red-400" },
  4: { label: "Refunded", bg: "bg-blue-50",   text: "text-blue-600",   dot: "bg-blue-400" },
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("");

  useEffect(() => {
    fetchPayments(activeFilter);
  }, [activeFilter]);

  const fetchPayments = async (statusId) => {
    setLoading(true);
    try {
      const res = await getMyPaymentHistory(statusId);
      if (res?.data?.success) setPayments(res.data.data);
    } catch (err) {
      if (err?.response?.status === 400) {
        setPayments([]);
      } else {
        toast.error("Failed to fetch payment history");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-orange-50/30 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="mt-1 font-medium text-orange-500">
            All your transactions in one place
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeFilter === f.value
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white border border-orange-100 text-gray-500 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="font-medium text-gray-400">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-12 text-center shadow-xs">
            <Wallet className="mx-auto mb-4 text-orange-300" size={48} />
            <p className="font-medium text-gray-500">No payments found</p>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter("")}
                className="mt-3 flex items-center gap-1 mx-auto text-sm text-orange-400 hover:text-orange-600 transition"
              >
                <FilterX size={14} />
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const status = STATUS_STYLES[payment.payment_status_id] || {
                label: "Unknown",
                bg: "bg-gray-50",
                text: "text-gray-500",
                dot: "bg-gray-400",
              };

              return (
                <div
                  key={payment.payment_id}
                  className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-medium text-gray-400">
                          Payment #{payment.payment_id}
                        </p>
                        <span className="text-gray-200">·</span>
                        <p className="text-xs text-gray-400">
                          Order #{payment.order_id}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{Number(payment.amount).toFixed(2)}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-400">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>

                    <span
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 ${status.bg} ${status.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-3 border-t border-orange-50" />

                  {/* Details row */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {payment.provider && (
                      <span className="text-gray-500">
                        Provider:{" "}
                        <span className="font-medium text-gray-700">
                          {payment.provider}
                        </span>
                      </span>
                    )}
                    {payment.transaction_id && (
                      <span className="text-gray-500">
                        Txn:{" "}
                        <span className="font-mono text-xs font-medium text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                          {payment.transaction_id}
                        </span>
                      </span>
                    )}
                    {payment.delivery_fee != null && (
                      <span className="text-gray-500">
                        Delivery:{" "}
                        <span className="font-medium text-gray-700">
                          ₹{Number(payment.delivery_fee).toFixed(2)}
                        </span>
                      </span>
                    )}
                    {payment.tax_amount != null && (
                      <span className="text-gray-500">
                        Tax:{" "}
                        <span className="font-medium text-gray-700">
                          ₹{Number(payment.tax_amount).toFixed(2)}
                        </span>
                      </span>
                    )}
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

export default Payments;