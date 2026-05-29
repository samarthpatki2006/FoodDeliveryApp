import { useState } from "react";
import { registerUser } from "../api/auth.api.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
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
    try {
      const res = await registerUser(formData);
      if (res.status < 400) {
        toast.success("Register successfully");
        if(formData.role==="owner"){
          navigate("/owner/setup",{replace:true});
        }
        else{
          navigate("/login",{replace:true});
        }
        setFormData({
          full_name: "",
          email: "",
          password: "",
          phone: "",
          role: "",
        });
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    }
  };

  return (
  <div className="min-h-screen bg-white flex items-center justify-center px-2 py-10">
    <div className="w-full max-w-lg bg-white border border-orange-100 rounded-3xl shadow-sm px-4 py-6">

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="text-gray-500 mt-2 text-sm">
          Register to start ordering delicious food
        </p>
      </div>

      <form onSubmit={handleOnSubmit} className="space-y-5">

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>

          <input
            type="text"
            name="full_name"
            placeholder="Enter full name"
            value={formData.full_name}
            onChange={handleOnChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleOnChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleOnChange}
            required
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
            placeholder="Create password"
            value={formData.password}
            onChange={handleOnChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>

          <select
            name="role"
            onChange={handleOnChange}
            value={formData.role}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition bg-white text-gray-700"
          >
            <option value="">Select role</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="delivery_partner">
              Delivery Partner
            </option>
          </select>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition duration-200"
        >
          Register
        </button>

        {/* Login Redirect */}
        <div className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-orange-500 font-medium hover:text-orange-600"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
);
}
export default Register;
