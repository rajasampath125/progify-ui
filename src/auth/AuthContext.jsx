// WHY THIS FILE EXISTS
// Central place for auth state
// Will be used by provider + hooks
// Keeps auth logic isolated from UI


import { createContext } from "react";

export const AuthContext = createContext(null);
