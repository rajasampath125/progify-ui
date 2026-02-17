import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

const OTP_LENGTH = 6;

function CandidateLoginPage({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [step, setStep] = useState("EMAIL");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [isCounting, setIsCounting] = useState(false);

  const timerRef = useRef(null);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  /* ===================== */
  /* TIMER */
  /* ===================== */
  const startTimer = () => {
    clearInterval(timerRef.current);

    setIsCounting(true);
    setTimer(59);

    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setIsCounting(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };


  useEffect(() => {
    if (step === "OTP") startTimer();
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

      setStep("OTP");
      setMessage("OTP sent successfully");
      startTimer(); // this now guarantees countdown for OTP timer
    } catch (err) {
      console.error(err);
      const backendMessage =
        err.response?.data?.message || "Something went wrong";
      setMessage(backendMessage);
    }
    finally {
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

      onSuccess?.();
      navigate("/candidate/dashboard");
    } catch (err) {
      console.error(err);

      const backendMessage =
        err.response?.data?.message || "Invalid or expired OTP";

      setMessage(backendMessage);
      if (
        backendMessage.includes("expired") ||
        backendMessage.includes("Too many")
      ) {
        setOtp(Array(OTP_LENGTH).fill(""));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < OTP_LENGTH - 1)
      otpRefs.current[index + 1].focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const updated = [...otp];
    pasted.split("").forEach((char, idx) => {
      updated[idx] = char;
      if (otpRefs.current[idx]) {
        otpRefs.current[idx].value = char;
      }
    });

    setOtp(updated);

    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1].focus();
  };

  const formatTimer = (s) =>
    `00:${String(s).padStart(2, "0")}`;

  /* ===================== */
  /* UI */
  /* ===================== */
  return (
    <div style={styles.card}>
      {/* LEFT */}
      <div style={styles.left}>
        <img
          src="/src/images/login_welcome.png"
          alt="Welcome to ProgifyTech"
          style={styles.leftImage}
        />
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        <h2>
          <span style={{ color: "#facc15" }}>Start today</span>, find your perfect
          career.
        </h2>

        {step === "EMAIL" && (
          <>
            <label>Email ID</label>
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
        
            {message && (
              <div style={{ color: "#fd2727", marginLeft:"10px" , fontSize: "14px", justifyContent: "center" }}>
                <strong>{message}</strong>
              </div>
            )}
            
            <button
              style={styles.primaryBtn}
              disabled={!email || loading}
              onClick={sendOtp}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "OTP" && (
          <>
            <p style={styles.subText}>
              Enter the 6 digit OTP received on <b>{email}</b>
            </p>

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
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>
        
            {message && (
              <div style={{ color: "green", marginLeft:"90px" , marginTop: "20px", fontSize: "14px", justifyContent: "center" }}>
                <strong>{message}</strong>
              </div>
            )}
            <div style={styles.resendRow}>
              <span style={styles.muted}>Didn’t receive OTP?</span>
              {isCounting ? (
                <span style={styles.timer}>
                  Resend OTP ({formatTimer(timer)})
                </span>
              ) : (
                <span style={styles.resendLink} onClick={sendOtp}>
                  Resend OTP
                </span>
              )}

            </div>
            <div style={styles.buttons}>
              <button
                style={styles.primaryBtn}
                disabled={loading || otp.includes("")}
                onClick={verifyOtp}
              >
                {loading ? "Verifying..." : "Submit"}
              </button>

              {/* CLEAR OTP */}
              <button
                style={styles.secondaryBtn}
                type="button"
                onClick={() => {
                  setOtp(Array(OTP_LENGTH).fill(""));
                  otpRefs.current[0]?.focus();
                  setMessage("");
                }}
              >
                Clear OTP
              </button>
            </div>
            <div
              style={styles.back}
              onClick={() => {
                setStep("EMAIL");
                setOtp(Array(OTP_LENGTH).fill(""));
              }}
            >
              Back to Email
            </div>
          </>
        )}

      </div>
    </div>
  );
}

/* ===================== */
/* STYLES */
/* ===================== */

const styles = {
  card: {
    width: "820px",
    height: "440px",
    display: "flex",
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    justifyContent: "center"
  },
  left: {
    flex: 1,
    position: "relative",
    background: "#3b5ccc",
    overflow: "hidden",
  },

  leftImage: {
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },

  leftOverlay: {
    position: "absolute",
    top: "20px",
    left: "20px",
    color: "#fff",
    zIndex: 2,
  },

  leftTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "6px",
  },

  leftSubtitle: {
    fontSize: "14px",
    opacity: 0.9,
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
  secondaryBtn: {
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    padding: "10px 20px",
    borderRadius: "20px",
    cursor: "pointer",
    marginTop: "10px",
    marginLeft: "10px",
    color: "#020202",
  },

  otpRow: {
    display: "flex",
    gap: "10px",
    margin: "16px 0",
  },
  otpBox: {
    width: "40px",
    height: "40px",
    fontSize: "18px",
    textAlign: "center",
  },
  resendRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
    marginTop: "10px"
  },
  resendLink: {
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "13px",
  },
  timer: {
    fontSize: "13px",
    color: "#6b7280",
  },
  muted: {
    fontSize: "13px",
    color: "#6b7280",
  },
  back: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#2563eb",
    cursor: "pointer",
    textAlign: "center",
  },
  subText: {
    marginBottom: "12px",
    color: "#374151",
  },
  buttons: {
    textAlign: "center",
  }
};

export default CandidateLoginPage;
