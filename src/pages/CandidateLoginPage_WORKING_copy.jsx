import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

const OTP_LENGTH = 6;

function CandidateLoginPage({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [step, setStep] = useState("EMAIL"); // EMAIL | OTP
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const timerRef = useRef(null);

  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  /* ===================== */
  /* START TIMER */
  /* ===================== */
 const startTimer = () => {
  clearInterval(timerRef.current);

  setTimer(59);

  timerRef.current = setInterval(() => {
    setTimer((t) => {
      if (t <= 1) {
        clearInterval(timerRef.current);
        return 0;
      }
      return t - 1;
    });
  }, 1000);
};


  /* ===================== */
  /* OTP TIMER */
  /* ===================== */
  useEffect(() => {
  if (step !== "OTP") return;

  startTimer();

  return () => clearInterval(timerRef.current);
}, [step]);

  /* ===================== */
  /* SEND OTP */
  /* ===================== */
  const sendOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/otp/request`,
        null,
        { params: { email } }
      );

      setStep("OTP");           // ✅ REQUIRED
      console.log("STEP CHANGED TO OTP");
      setTimer(59);             // match backend TTL
      setMessage("OTP sent successfully");
       startTimer();
    } catch (err) {
      console.error(err);
      setMessage("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };



  /* ===================== */
  /* VERIFY OTP */
  /* ===================== */
  const verifyOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      const code = otp.join("");

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/otp/verify`,
        null,
        { params: { email, otp: code } }
      );

      setAuth({
        token: res.data.token,
        role: res.data.role,
      });

      navigate("/candidate/dashboard");
      onSuccess?.();
    } catch {
      setMessage("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== */
  /* OTP INPUT HANDLING */
  /* ===================== */
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const formatTimer = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };


  /* ===================== */
  /* UI */
  /* ===================== */
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>

        {/*CLOSE ICON */}
        <div
          style={styles.close}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 6px 14px rgba(0,0,0,0.2)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              "0 4px 10px rgba(0,0,0,0.15)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={() => {
            setStep("EMAIL");
            setOtp(Array(OTP_LENGTH).fill(""));
            setMessage("");
            setTimer(0);
          }}
        >
          ×
        </div>

        {/* LEFT */}
        <div style={styles.left}>
          <h2 style={{ marginBottom: 8 }}>ProgifyTech</h2>
          <p>Excited to have you here!</p>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          {step === "EMAIL" && (
            <>
              <h2>
                <span style={{ color: "#facc15" }}>Start today</span>, find your
                perfect career.
              </h2>

              <label>Email ID</label>
              <input
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />

              <button
                style={styles.primaryBtn}
                disabled={!email || loading}
                onClick={sendOtp}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              {message && <p style={styles.error}>{message}</p>}
            </>
          )}

          {step === "OTP" && (
            <>
              <h2 style={{ marginBottom: "10px" }}>
                <span style={{ color: "#facc15" }}>Start today</span>, find your
                perfect career.
              </h2>

              <p style={{ marginBottom: "18px", color: "#374151" }}>
                Enter the 6 digit OTP received on <b>{email}</b>
              </p>

              {/* OTP BOXES */}
              <div style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    style={styles.otpBox}
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                  />
                ))}
              </div>

              {/* RESEND ROW */}
              <div style={styles.resendRow}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>
                  Didn’t receive OTP?
                </span>

                {timer > 0 ? (
                  <span style={styles.timer}>
                    Resend OTP ({formatTimer(timer)})
                  </span>
                ) : (
                  <span style={styles.resendLink} onClick={sendOtp}>
                    Resend OTP
                  </span>
                )}
              </div>

              {/* ACTIONS */}
              <div style={styles.actions}>
                <button
                  style={styles.primaryBtn}
                  disabled={loading || otp.includes("")}
                  onClick={verifyOtp}
                >
                  {loading ? "Verifying..." : "Submit"}
                </button>

                <div
                  style={styles.back}
                  onClick={() => {
                    setStep("EMAIL");
                    setOtp(Array(OTP_LENGTH).fill(""));
                  }}
                >
                  Back to Email
                </div>
              </div>

              {/* STATUS MESSAGE */}
              {message && (
                <p
                  style={{
                    marginTop: "14px",
                    color: message.includes("success")
                      ? "#16a34a"
                      : "#dc2626",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  {message}
                </p>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

/* ===================== */
/* STYLES */
/* ===================== */

const styles = {
  overlay: {
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    position: "relative",
    width: "820px",
    height: "420px",
    background: "#fff",
    display: "flex",
    borderRadius: "12px",
    overflow: "hidden",
  },
  left: {
    flex: 1,
    background: "#3b5ccc",
    color: "#fff",
    padding: "40px",
  },
  right: {
    flex: 1,
    padding: "40px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    marginBottom: "16px",
  },
  primaryBtn: {
    background: "#facc15",
    border: "none",
    padding: "10px 20px",
    borderRadius: "20px",
    cursor: "pointer",
    marginTop: "12px",
  },
  otpRow: {
    display: "flex",
    gap: "10px",
    margin: "16px",
  },
  otpBox: {
    width: "40px",
    height: "40px",
    fontSize: "18px",
    textAlign: "center",
  },
  error: {
    color: "#dc2626",
    marginTop: "10px",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  timer: {
    fontSize: "13px",
    color: "#6b7280",
      opacity: 0.8,
  },

  resendLink: {
    fontSize: "13px",
    color: "#2563eb",
    cursor: "pointer",
      transition: "opacity 0.3s ease",
  },

  back: {
    fontSize: "13px",
    color: "#2563eb",
    cursor: "pointer",
    marginTop: "6px",
  },
  close: {
    position: "absolute",
    top: "12px",
    right: "16px",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "600",
    cursor: "pointer",
    color: "#374151",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
    zIndex: 10,
  },

  resendRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

};

const globalStyle = document.createElement("style");
globalStyle.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;
document.head.appendChild(globalStyle);

export default CandidateLoginPage;
