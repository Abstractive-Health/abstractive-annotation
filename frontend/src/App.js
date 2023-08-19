import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Outlet } from 'react-router-dom';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  // const [cookies, setCookie, removeCookie] = useCookies(['session_token']);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const session_token = Cookies.get("session_token");
    checkAdmin(session_token);
  }, []);

  const checkAdmin = async (session_token) => {
    try {
        const response = await fetch(`http://localhost:3000/api/isAdmin?session_token=${session_token}`);
        if (!response.ok) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
    } catch (error) {
        console.log("Not Authenticated as Admin:", error);
    }
  };
  console.log('isAdmin', isAdmin, 'isSignedIn', isSignedIn)
  return (
    <div className="App">
      <Outlet context={[isAdmin, setIsAdmin, isSignedIn, setIsSignedIn, checkAdmin]} />
    </div>
  );
}

export default App;
