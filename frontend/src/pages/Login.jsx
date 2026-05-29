import { useState, useEffect } from "react";
import { getCurrentUser, loginUser } from "../api/auth.api.js";
import { useAuth } from "../context/useAuth.js";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
function Login() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if(!formData.email && !formData.phone){
      toast.error("Email or phone no. required to login");
      return;
    }
    try {
      const res = await loginUser(formData);
      if (res.status < 400) {
        toast.success("Login Success");
        const user = await getCurrentUser();
        if (user) {
          setUser(user.data.data[0]);
        }
        setFormData({
          email: "",
          phone: "",
          password: "",
        });

        if(user.role_name==="owner"){
          navigate("/owner");
        }
        else if(user.role_name==="customer"){
          navigate("/customer");
        }
        else if(user.role_name==="delivery_partner"){
          navigate("/delivery_partner");
        }
        else if(user.role_name==="admin"){
          navigate("/admin");
        }
        else{
          toast.error("Navigation Failed");
        }
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (user?.role_name === "admin") {
      navigate("/admin", { replace: true });
    } else if (user?.role_name === "owner") {
      navigate("/owner", { replace: true });
    } else if (user?.role_name === "customer") {
      navigate("/customer", { replace: true });
    } else if (user?.role_name === "delivery_partner") {
      navigate("/delivery_partner,{replace:true}");
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Loading</div>;

  return (
  <div className="min-h-screen bg-white flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white border border-orange-100 rounded-3xl shadow-sm p-8">

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome Back
        </h1>

        <p className="text-gray-500 mt-2 text-sm">
          Login to continue
        </p>
      </div>

      <form onSubmit={handleOnSubmit} className="space-y-5">

        {/* Helper Message */}
        <div className="bg-orange-50 border border-orange-100 text-orange-700 text-sm rounded-xl px-4 py-3">
          Enter <span className="font-medium">email or phone</span> to login.
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>

          <input
            type="text"
            name="email"
            value={formData.email}
            placeholder="Enter email"
            onChange={handleOnChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            placeholder="Enter phone"
            onChange={handleOnChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter password"
            onChange={handleOnChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition duration-200"
        >
          Login
        </button>

        {/* Register */}
        <div className="text-center text-sm text-gray-500">
          No account?{" "}
          <Link
            to="/register"
            className="text-orange-500 font-medium hover:text-orange-600"
          >
            Register
          </Link>
        </div>
      </form>
    </div>
  </div>
);
}
export default Login;
