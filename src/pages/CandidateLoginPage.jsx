import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import loginImage from "../images/login_welcome.png";

const OTP_LENGTH = 6;

function CandidateLoginPage({ onSuccess }) {
  const [mode, setMode] = useState("LOGIN");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [step, setStep] = useState("EMAIL");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupMessage, setSignupMessage] = useState("");
  const [signupError, setSignupError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [isCounting, setIsCounting] = useState(false);

  const timerRef = useRef(null);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

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
    if (step === "OTP") {
      startTimer();
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const sendOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      const normalizedEmail = email.trim().toLowerCase();
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/otp/request`,
        null,
        { params: { email: normalizedEmail } }
      );

      setStep("OTP");
      setMessage("OTP sent successfully");
      startTimer();
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Something went wrong";
      setMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      const code = otp.join("");
      const normalizedEmail = email.trim().toLowerCase();

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/otp/verify`,
        null,
        { params: { email: normalizedEmail, otp: code } }
      );

      setAuth({
        token: res.data.token,
        role: res.data.role,
      });

      onSuccess?.();
      navigate("/candidate/dashboard");
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Invalid or expired OTP";
      setMessage(backendMessage);

      if (
        backendMessage.toLowerCase().includes("expired") ||
        backendMessage.toLowerCase().includes("too many")
      ) {
        setOtp(Array(OTP_LENGTH).fill(""));
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async () => {
    try {
      setLoading(true);
      setSignupMessage("");
      setSignupError(false);
      setMessage("");

      const normalizedEmail = signupEmail.trim().toLowerCase();

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
        { name: signupName.trim(), email: normalizedEmail }
      );

      const successText =
        res?.data?.message ||
        "Signup request submitted. Wait for admin approval before OTP login.";

      setSignupMessage(successText);
      setSignupError(false);

      setMode("LOGIN");
      setMessage(successText);
      setEmail(normalizedEmail);
      setSignupName("");
      setSignupEmail("");
      setStep("EMAIL");
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Signup failed";
      setSignupMessage(backendMessage);
      setSignupError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
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
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const formatTimer = (s) => `00:${String(s).padStart(2, "0")}`;

  const isSuccessMessage =
    message.toLowerCase().includes("sent successfully") ||
    message.toLowerCase().includes("submitted");

  return (
    <div className="w-full max-w-5xl min-h-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl md:flex">
      <div className="hidden md:block md:w-[44%] relative bg-[#0d2147]">
        <img
          src={loginImage}
          alt="Welcome to ProgifyTech"
          className="h-full w-full object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <p className="text-xs uppercase tracking-[0.22em] text-yellow-300">
            Candidate Portal
          </p>
          <h3 className="mt-2 text-2xl font-semibold">
            Apply smarter.
            <br />
            Track every role.
          </h3>
        </div>
      </div>

      <div className="w-full p-6 sm:p-8 md:w-[56%]">
        <h2 className="text-2xl font-semibold text-slate-900">
          Candidate Access
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          OTP login for approved users, or request access as a new user.
        </p>

        <div className="mt-5 inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === "LOGIN"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600"
            }`}
            onClick={() => {
              setMode("LOGIN");
              setSignupMessage("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === "SIGNUP"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600"
            }`}
            onClick={() => {
              setMode("SIGNUP");
              setSignupMessage("");
            }}
          >
            Sign Up
          </button>
        </div>

        {mode === "SIGNUP" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email ID
              </label>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            {signupMessage && (
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  signupError
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                <strong>{signupMessage}</strong>
              </div>
            )}

            <button
              className="w-full rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-slate-900 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!signupName.trim() || !signupEmail.trim() || loading}
              onClick={signup}
            >
              {loading ? "Submitting..." : "Request Access"}
            </button>
          </div>
        )}

        {mode === "LOGIN" && (
          <div className="mt-6 space-y-4">
            {step === "EMAIL" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email ID
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                {message && (
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isSuccessMessage
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <strong>{message}</strong>
                  </div>
                )}

                <button
                  className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!email.trim() || loading}
                  onClick={sendOtp}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {step === "OTP" && (
              <>
                <p className="text-sm text-slate-600">
                  Enter the 6-digit OTP sent to <b>{email}</b>
                </p>

                <div className="flex flex-wrap gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      className="h-11 w-11 rounded-lg border border-slate-300 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      onPaste={handleOtpPaste}
                    />
                  ))}
                </div>

                {message && (
                  <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    <strong>{message}</strong>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Did not receive OTP?</span>
                  {isCounting ? (
                    <span className="text-slate-500">
                      Resend in {formatTimer(timer)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="font-medium text-blue-600"
                      onClick={sendOtp}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading || otp.includes("")}
                    onClick={verifyOtp}
                  >
                    {loading ? "Verifying..." : "Submit OTP"}
                  </button>

                  <button
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700"
                    type="button"
                    onClick={() => {
                      setStep("EMAIL");
                      setOtp(Array(OTP_LENGTH).fill(""));
                      setMessage("");
                    }}
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateLoginPage;
