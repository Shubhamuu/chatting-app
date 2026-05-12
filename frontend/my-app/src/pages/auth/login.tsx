import { useState } from "react";
import { useNavigate,  Link, useLocation } from "react-router";
import api from "../../services/api";

function Login() {
     const navigate = useNavigate();
 // const location = useLocation() ;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("auth/login", {
        email: formData.email,
        password: formData.password,
      });
      console.log("Login response:", res);

      const data = res.data;

      // Store tokens
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      const { role } = data.user;
      console.log("User role:", role);

      let targetPath = "/chat/general"; // Default path for regular users

      if (role === "admin") {
        targetPath = "/admin/dashboard";
      }
      
        navigate(targetPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
        if (err.response) {
            setError(err.response.data.message || "Login failed");
        } else {
            setError("Network error. Please try again.");
        }
    } finally {
        setLoading(false);
    }
  }

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    name="email"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    name="password"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form> 
            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
}
export default Login;