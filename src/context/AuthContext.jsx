import React, { createContext, useEffect, userContext, useState } from "react";

const AuthContext = createContext();

export function userAuth() {
  return userContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    loggedIn: false,
    name: null,
    roles: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Tenta carregar dados vindos do WordPress, se houver
    const wp = window.__WP_DATA__;

    if (wp?.currentUser) {
      setUser({
        loggedIn: true,
        name: wp.currentUser.display_name,
        roles: wp.currentUser.roles || [],
      });
      setLoading(false);
      return;
    }

    // 2️⃣ (opcional) pode futuramente consultar a API REST:
    // fetch(wp.restUrl + "me", { headers: { "X-WP-Nonce": wp.nonce } })
    //   .then((r) => r.json())
    //   .then((data) => setUser(data))
    //   .finally(() => setLoading(false));

    setLoading(false);
  }, []);

  const value = { user, setUser, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
