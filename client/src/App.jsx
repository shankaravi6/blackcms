import React, { useState } from "react";
import Sidebar from "./components/SideBar";
import Login from "./components/Login";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return <>{!isLoggedIn ? <Login onLogin={handleLogin} /> : <Sidebar />}</>;
};

export default App;
