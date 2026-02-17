import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

function CandidateLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const sendOtp = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/otp/request`,
        null,
        { params: { email } }
      );
      setOtpSent(true);
      setMessage("OTP sent successfully");
    } catch (error) {
      setMessage("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/otp/verify`,
        null,
        { params: { email, otp } }
      );

      // Store auth (token + role)
      setAuth({
        token: response.data.token,
        role: response.data.role,
      });

      // Redirect to candidate dashboard
      navigate("/candidate/dashboard");
    } catch (error) {
      setMessage("Invalid or expired OTP");
    }
  };

  return (
    <div>
      <h2>Candidate Login</h2>

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

      <button onClick={sendOtp} disabled={!email}>
        Send OTP
      </button>

      {message && <p>{message}</p>}

      {otpSent && (
        <div style={{ marginTop: "20px" }}>
          <label>OTP</label>
          <br />
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <br />
          <br />
          <button onClick={verifyOtp} disabled={!otp}>
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}

export default CandidateLoginPage;
