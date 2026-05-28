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
      } else {
        toast.error("Login Failed");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
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
    <div>
      <h1>Login</h1>
      <form onSubmit={handleOnSubmit}>
        <input
          type="text"
          name="email"
          value={formData.email}
          placeholder="Enter email"
          onChange={handleOnChange}
        />
        <input
          type="text"
          name="phone"
          value={formData.phone}
          placeholder="Enter phone"
          onChange={handleOnChange}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="Enter password"
          onChange={handleOnChange}
        />
        <button type="submit">Login</button>
        <p>No account?</p>
        <Link to="/register" replace>
          Register
        </Link>
      </form>
    </div>
  );
}
export default Login;
