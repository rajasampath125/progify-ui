/*WHY THIS FILE EXISTS??
Wraps the entire app
Holds auth state centrally
Allows future login/logout updates
No backend interaction yet (by design)

Refresh page → user stays logged in
Logout later → clears storage
Centralized auth state
No coupling to login UI
*/

import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth from localStorage on app start
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
    setLoading(false);
  }, []);

  // Persist auth whenever it changes
  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
