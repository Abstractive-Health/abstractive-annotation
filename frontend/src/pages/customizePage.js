import React from "react";
import RedirectButton from "../components/redirectButton";
import UploadQuestion from "../components/uploadQuestions";
// import "../styling/redirectButtonStyle.css"
import Table from "../components/questionTable";

const CustomizePage = () => {
  return (
    <div className="customize">
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
      <br />
      <h3 style={{"fontSize": "20px", "textAlign": "left", "marginLeft": "10%", "fontWeight": "600"}}>Add Your Questions Here:</h3>
      <br />
      <UploadQuestion />
      {/* <Table /> */}
    </div>
  );
};

export default CustomizePage;
