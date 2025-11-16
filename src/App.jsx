import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { RouterProvider } from "react-router-dom";
import axios from 'axios'
import { router } from "./router";

function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    axios
      .get("/wp-json/adb/v1/ping")
      .then((res) => setData(res.data))
      .catch(console.error);
  });

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
