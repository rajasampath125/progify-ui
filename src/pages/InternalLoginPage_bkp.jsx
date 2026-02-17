import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

function InternalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const login = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      // Store auth (token + role)
      setAuth({
        token: response.data.token,
        role: response.data.role,
      });

      // Redirect to admin dashboard
      //navigate("/admin/dashboard");
      // Role-based redirect
      if (response.data.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (response.data.role === "RECRUITER") {
        navigate("/recruiter/dashboard");
      }
    } catch (error) {
      setMessage("Invalid email or password");
    }
  };

  return (
    <div>
      <h2>Admin / Recruiter Login</h2>

      <div>
        <label>Email</label>
        <br />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Password</label>
        <br />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <br />

      <button onClick={login} disabled={!email || !password}>
        Login
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

//export default InternalLoginPage;
