"use client";

import { useState, createContext, useContext } from "react";

const UserContext = createContext(null);

export function UserProvider({ currentUser, children }) {
  const [user, setUser] = useState(currentUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
