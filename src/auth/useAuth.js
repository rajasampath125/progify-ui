/*WHY THIS FILE EXISTS??
Clean access to auth state
Prevents direct context imports everywhere
Standard React pattern
*/

import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useAuth() {
  return useContext(AuthContext);
}
