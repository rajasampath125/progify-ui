import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import {
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import clouvrLogo from "../images/clouvr-logo1.webp";

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
      setMessage(""); // The green info box already shows OTP-sent confirmation
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
        refreshToken: res.data.refreshToken,
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

  // Resend: same as sendOtp but shows a green confirmation banner
  const resendOtp = async () => {
    await sendOtp();
    setMessage("OTP resent successfully — check your inbox.");
  };

  const isSuccessMessage =
    message.toLowerCase().includes("sent successfully") ||
    message.toLowerCase().includes("resent successfully") ||
    message.toLowerCase().includes("submitted");

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:flex">
      {/* LEFT PANEL — matches InternalLoginPage style */}
      <div className="hidden md:block md:w-[40%] bg-gradient-to-br from-[#0a1f44] via-[#12347a] to-[#1f5bcf] p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        {/* Decorative background logo */}
        <img
          src={clouvrLogo}
          alt=""
          className="absolute -right-20 -bottom-20 w-80 h-auto opacity-10 pointer-events-none select-none grayscale brightness-0 invert"
        />
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-400 rounded-full opacity-20 blur-3xl" />
        <div className="relative z-10 flex flex-col h-full">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs tracking-wide mb-6">
              <ShieldCheck size={14} />
              CANDIDATE PORTAL
            </div>
            <h2 className="text-3xl font-semibold leading-tight">
              Your career,
              <br />
              powered by ClouVR
            </h2>
            <p className="mt-4 text-sm text-blue-100 leading-relaxed">
              Apply smarter. Track every application. Get hired faster with our streamlined candidate platform.
            </p>
          </div>
          <div className="mt-auto">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-xs leading-relaxed">
              Login uses OTP sent to your registered email. New candidates can request access below.
            </div>
          </div>
        </div>
      </div>

      <div className="w-full p-6 sm:p-8 md:w-[60%]">
        <h2 className="text-2xl font-semibold text-slate-900">
          Candidate Access
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          OTP login for approved users, or request access as a new user.
        </p>

        <div className="mt-6 inline-flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto overflow-hidden">
          <button
            type="button"
            className={`flex-1 sm:flex-none rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 ${mode === "LOGIN"
              ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            onClick={() => {
              setMode("LOGIN");
              setSignupMessage("");
            }}
          >
            Candidate Login
          </button>
          <button
            type="button"
            className={`flex-1 sm:flex-none rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 ${mode === "SIGNUP"
              ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            onClick={() => {
              setMode("SIGNUP");
              setSignupMessage("");
            }}
          >
            Request Access
          </button>
        </div>

        {mode === "SIGNUP" && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your professional email"
                />
              </div>
            </div>

            {signupMessage && (
              <div
                className={`flex items-start gap-3 rounded-xl p-4 text-sm ${signupError
                  ? "bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/20"
                  : "bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-600/20"
                  }`}
              >
                {signupError ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{signupError ? "Access Request Failed" : "Access Request Sent"}</p>
                  <p className="mt-1 leading-relaxed opacity-90">{signupMessage}</p>
                </div>
              </div>
            )}

            <button
              className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              disabled={!signupName.trim() || !signupEmail.trim() || loading}
              onClick={signup}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  Request Access
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {mode === "LOGIN" && (
          <div className="mt-6 space-y-6">

            {/* ---- STEP: EMAIL ---- */}
            {step === "EMAIL" && (
              <>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      Passwordless login using a One-Time Password sent to your registered email address.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && email.trim() && !loading) sendOtp();
                      }}
                    />
                  </div>

                  {message && (
                    <div className={`mt-3 flex items-start gap-3 rounded-xl p-4 text-sm ${isSuccessMessage
                      ? "bg-green-50 text-green-800 ring-1 ring-inset ring-green-600/20"
                      : "bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/20"
                      }`}>
                      {isSuccessMessage
                        ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                      <p className="font-medium">{message}</p>
                    </div>
                  )}

                  <button
                    className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    disabled={!email.trim() || loading}
                    onClick={sendOtp}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ---- STEP: OTP ---- */}
            {step === "OTP" && (
              <>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-900 leading-relaxed">
                      A 6-digit code was sent to <span className="font-semibold">{email}</span>. Enter it below to sign in.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center sm:justify-start gap-2 sm:gap-3 my-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-slate-300 text-center text-xl font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      onPaste={handleOtpPaste}
                    />
                  ))}
                </div>

                {message && (
                  <div className={`flex items-start gap-3 rounded-xl p-4 text-sm ${isSuccessMessage
                    ? "bg-green-50 text-green-800 ring-1 ring-inset ring-green-600/20"
                    : "bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/20"
                    }`}>
                    {isSuccessMessage
                      ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                    <p className="font-medium">{message}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
                  <span className="text-slate-500">Didn't receive the code?</span>
                  {isCounting ? (
                    <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg">
                      Resend in {formatTimer(timer)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                      onClick={resendOtp}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <button
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                    type="button"
                    onClick={() => {
                      setStep("EMAIL");
                      setOtp(Array(OTP_LENGTH).fill(""));
                      setMessage("");
                    }}
                  >
                    Use Different Email
                  </button>
                  <button
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    disabled={loading || otp.includes("")}
                    onClick={verifyOtp}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Login"
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <a
            href="/login/internal"
            className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Looking for Internal Staff Login?
          </a>
        </div>
      </div>
    </div>
  );
}

export default CandidateLoginPage;
