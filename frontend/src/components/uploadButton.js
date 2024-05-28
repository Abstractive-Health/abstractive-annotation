import React, { useState } from "react";
import Cookies from "js-cookie";
import "../styling/uploadButton.css";
const UploadButton = ({ onSuccessfulUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const session_token = Cookies.get("session_token");
  const [loader, setLoader] = useState(false);
  const handleFileChange = (event) => {
    setSelectedFiles([...event.target.files]);
  };

  const handleSubmit = async () => {
    setLoader(true);
    var formData = new FormData();
    console.log("selectedFiles");
    console.log(selectedFiles);
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    // add a sleep for 2 seconds here
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("formData");
    console.log(formData);

    const response = await fetch(
      `${process.env.API_HOST}/api/upload?session_token=${session_token}`,
      {
        method: "POST",
        body: formData,
      }
    );
    console.log("response");
    console.log(response);
    if (response.ok) {
      console.log("Files uploaded successfully");
      setSelectedFiles([]); // Clear the selected files
      window.alert("Files uploaded successfully");
      setLoader(false);
      onSuccessfulUpload();
    } else {
      console.log("File upload failed");
      window.alert("File upload failed/You are not admin");
    }
  };

  const buttonColor = selectedFiles.length > 0 ? "#4CAF50" : "#808080";

  return (
    <div style={containerStyle}>
      <div className="my-4">
        <span style={stepStyle}>Step 1 :</span>
        <input
          type="file"
          multiple
          accept=".txt,.pdf,.csv"
          onChange={handleFileChange}
          style={{ display: "none" }} // Hide the file input element
          id="fileUpload" // Add an ID for label 'for' attribute
        />
        <label htmlFor="fileUpload" style={labelStyle}>
          Select Files to Annotate
        </label>
      </div>
      <div>
        {selectedFiles.length > 0 && (
          <div
            className="mb-4 border border-[#3498DA] mx-auto w-1/2 text-white overflow-auto h-36 scrollbar"
            style={fileListStyle}
          >
            <div className="text-lg text-[#3498DA] font-semibold ">
              Selected Files:
            </div>
            <ul>
              {selectedFiles.map((file, index) => (
                <li className="text-white w-7/12 mx-auto text-left" key={index}>
                  {index + 1}. {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <span style={stepStyle}> Step 2 :</span>
      <button
        onClick={handleSubmit}
        disabled={!selectedFiles.length}
        style={{ ...buttonStyle, backgroundColor: buttonColor }}
      >
        Upload the selected Files
      </button>
      {loader && (
        <div className="mt-4">
          <div
            className="animate-spin inline-block w-7 h-7 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
            role="status"
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS styles
const labelStyle = {
  display: "inline-block",
  backgroundColor: "#3498db",
  color: "white",
  padding: "10px 20px",
  fontSize: "14px",
  fontFamily: "Helvetica Neue",
  fontWeight: "600",
  cursor: "pointer",
  borderRadius: "4px",
  transition: "background-color 0.2s ease-in-out",
};

const buttonStyle = {
  display: "inline-block",
  backgroundColor: "#808080",
  color: "white",
  padding: "10px 18px",
  border: "none",
  fontSize: "14px",
  fontFamily: "Helvetica Neue",
  fontWeight: "600",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background-color 0.2s ease-in-out",
};

const containerStyle = {
  marginTop: "10vh",
  color: "white",
};

const stepStyle = {
  marginRight: "10px",
  fontSize: "16px",
  fontFamily: "Helvetica Neue",
  fontWeight: "600",
};
const fileListStyle = {
  marginTop: "10px",
  color: "#000000",
  fontFamily: "Helvetica Neue",
};
export default UploadButton;
