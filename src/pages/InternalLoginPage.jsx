import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

function InternalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const login = async () => {
    try {
      setLoading(true);
      setMessage("");

      const normalizedEmail = email.trim().toLowerCase();
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        { email: normalizedEmail, password }
      );

      setAuth({
        token: response.data.token,
        role: response.data.role,
      });

      if (response.data.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (response.data.role === "RECRUITER") {
        navigate("/recruiter/dashboard");
      }
    } catch {
      setMessage("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="hidden w-[46%] bg-gradient-to-br from-[#0a1f44] via-[#12347a] to-[#1f5bcf] p-8 text-white md:block">
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
          <div className="mt-10 rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
            Login requires internal credentials. Candidate access is handled on
            the public portal.
          </div>
        </div>

        <div className="w-full p-6 sm:p-8 md:w-[54%]">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">
              Internal Login
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in as Admin or Recruiter
            </p>
          </div>

          {message && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </div>
          )}

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

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">
              Forgot password? Contact your administrator.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternalLoginPage;
