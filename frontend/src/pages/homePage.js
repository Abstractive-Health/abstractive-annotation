import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import RedirectButton from "../components/redirectButton";
import "../styling/redirectButtonStyle.css";
import "../components/loginButton"
import LoginButton from "../components/loginButton";
import '../styling/Home.css';
import { useOutletContext } from "react-router-dom";

function Home() {
  const [isAdmin, setIsAdmin, isSignedIn, setIsSignedIn, checkAdmin] = useOutletContext();
  return (
    <div className="App">
      <h1 className="abstractivetitle">Abstractive Health</h1>
      <nav>
        <RedirectButton buttonText="Home" buttonUrl="/home" />
        {isAdmin && (
          <>
            <RedirectButton buttonText="Upload" buttonUrl="/upload" />
            <RedirectButton buttonText="Customize" buttonUrl="/customize" />
            </>
        )}
        <RedirectButton buttonText="Annotate" buttonUrl="/annotate" />
        {isAdmin && (
          <>
            <RedirectButton buttonText="Download" buttonUrl="/download" />
            <RedirectButton buttonText="Admin" buttonUrl="/admin" />
            <RedirectButton buttonText="Review" buttonUrl="/review" />
            </>
        )}


        <h4 className="centered">
        Abstractive Health allows physicians to spend less time reading and writing their clinical notes and improves their revenue reimbursement from insurance companies. Our automated patient summary is a game-changer as it improves interoperability so patients receive better care. Anote's annotation interface help annotators provide the training data for these LLMs.
        </h4 >
        <h4 className="centered">Get started here:</h4>
        <LoginButton 
          className="button-container"
          isSignedIn={isSignedIn}
          setIsSignedIn={setIsSignedIn}
        />
        {!isSignedIn && (
        <button className="button-container ButtonType2">
          <a href="/signup">Sign Up</a>
        </button>
        )}
      </nav>
    </div>
  );
}

export default Home;
