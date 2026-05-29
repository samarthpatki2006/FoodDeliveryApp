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
        navigate("/login");
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
    <div>
      <h1>Register</h1>
      <form onSubmit={handleOnSubmit}>
        <input
          type="text"
          name="full_name"
          placeholder="Enter full name"
          value={formData.full_name}
          onChange={handleOnChange}
          required
        />

        <input
          type="text"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleOnChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleOnChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Enter phone"
          value={formData.phone}
          onChange={handleOnChange}
          required
        />

        <select
          name="role"
          onChange={handleOnChange}
          value={formData.role}
          required
        >
          <option value="">Enter a role</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
          <option value="delivery_partner">Delivery Partner</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
export default Register;
