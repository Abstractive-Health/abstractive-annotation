import React, { useEffect, useState } from "react";
import RedirectButton from "../components/redirectButton";
import Table from "../components/table.js";
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from "react-router-dom";
// import "../styling/redirectButtonStyle.css"

const DownloadPage = () => {
  const [isAdmin, setIsAdmin, isSignedIn, setIsSignedIn, checkAdmin] = useOutletContext();
  const session_token = Cookies.get("session_token");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  return (
    <div className="download">
      <h1 className="abstractivetitle">Abstractive Health</h1>
      <nav>
        <RedirectButton buttonText="Home" buttonUrl="/home" />
        <RedirectButton buttonText="Upload" buttonUrl="/upload" />
        <RedirectButton buttonText="Customize" buttonUrl="/customize" />
        <RedirectButton buttonText="Annotate" buttonUrl="/annotate" />
        <RedirectButton buttonText="Download" buttonUrl="/download" />
        <RedirectButton buttonText="Admin" buttonUrl="/admin" />
        <RedirectButton buttonText="Review" buttonUrl="/review" />
      </nav>
      <Table />
    </div>
  );
};

export default DownloadPage;
