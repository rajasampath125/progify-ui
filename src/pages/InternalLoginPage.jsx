import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { Eye, EyeOff, Loader2, ShieldCheck, WifiOff } from "lucide-react";
import { isNetworkError } from "../api/axios";
import clouvrLogo from "../images/clouvr-logo1.webp";

function InternalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleAuthSuccess = (data) => {
    setAuth({
      token: data.token,
      refreshToken: data.refreshToken,
      role: data.role,
    });
    if (data.role === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (data.role === "RECRUITER") {
      navigate("/recruiter/dashboard");
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      setMessage("");

      const normalizedEmail = email.trim().toLowerCase();
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        { email: normalizedEmail, password }
      );

      if (response.data.requiresPasswordChange) {
        setStep(2);
        setMessage("");
      } else {
        handleAuthSuccess(response.data);
      }
    } catch (err) {
      if (isNetworkError(err)) {
        setMessage("__offline");
      } else {
        setMessage("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const changeTempPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setMessage("New password must be at least 8 characters");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const normalizedEmail = email.trim().toLowerCase();
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/change-temp-password`,
        { email: normalizedEmail, tempPassword: password, newPassword }
      );
      handleAuthSuccess(response.data);
    } catch (err) {
      if (isNetworkError(err)) {
        setMessage("__offline");
      } else {
        setMessage(err.response?.data || "Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="mx-auto flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="hidden w-[45%] bg-gradient-to-br from-[#0a1f44] via-[#12347a] to-[#1f5bcf] p-8 text-white md:block relative">
          <div className="absolute inset-0 bg-black/10" />
          <img
            src={clouvrLogo}
            alt=""
            className="absolute -right-20 -bottom-20 w-80 h-auto opacity-10 pointer-events-none select-none grayscale brightness-0 invert"
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs tracking-wide">
              <ShieldCheck size={14} />
              INTERNAL ACCESS
            </div>
            <h2 className="mt-6 text-3xl font-semibold leading-tight">
              Admin and recruiter
              <br />
              control center
            </h2>
            <p className="mt-4 text-sm text-blue-100">
              Manage users, jobs, assignments, analytics, and approvals from one
              secure workspace.
            </p>
            <div className="mt-10 rounded-xl border border-white/20 bg-white/10 p-4 text-xs leading-relaxed">
              Login requires internal credentials. Candidate access is handled on
              the public portal.
            </div>
          </div>
        </div>

        <div className="w-full p-8 md:w-[55%] flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">
              {step === 1 ? "Internal Login" : "Update Password"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {step === 1 ? "Sign in as Admin or Recruiter" : "Please set a new permanent password"}
            </p>
          </div>

          {message === "__offline" ? (
            <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="font-semibold">Server Unreachable</p>
                <p className="text-xs text-amber-600 mt-0.5">The backend server is offline or not responding. Please try again shortly.</p>
              </div>
            </div>
          ) : message ? (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              {message}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your internal email"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={login}
                disabled={!email || !password || loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-sm text-blue-700">
                You are using a temporary password. You must configure a new permanent password to continue.
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Confirm New Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={changeTempPassword}
                disabled={!newPassword || !confirmPassword || loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? "Updating..." : "Update Password & Login"}
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 text-center">
              <span className="text-sm text-slate-500">
                Forgot password? Contact your administrator.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InternalLoginPage;
