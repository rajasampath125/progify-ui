import { useAuth } from "../auth/useAuth";
import { Link } from "react-router-dom";
import clouvrLogo from "../images/clouvr-logo1.webp";

function PublicHeader({ onLoginClick }) {
  const { auth } = useAuth();

  return (
    <header className="h-16 bg-gradient-to-r from-indigo-700 to-indigo-600 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold text-xl tracking-tight no-underline"
        >
          <img
            src={clouvrLogo}
            alt="Clouvr"
            className="h-8 w-auto brightness-0 invert"
          />
          {/* <span>Clouvr</span> */}
        </Link>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {/* <a
            href="/contact"
            className="text-indigo-100 hover:text-white text-sm font-medium transition-colors"
          >
            Contact Us
          </a> */}

          {!auth?.token ? (
            <button
              onClick={onLoginClick}
              className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-gray-900 font-semibold text-sm px-5 py-2 rounded-full shadow transition-all duration-150"
            >
              Login
            </button>
          ) : (
            <a
              href="/candidate/dashboard"
              className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-semibold text-sm px-5 py-2 rounded-full shadow transition-all duration-150 no-underline"
            >
              Dashboard →
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
