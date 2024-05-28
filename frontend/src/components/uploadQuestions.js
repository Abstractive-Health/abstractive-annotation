import React, { useEffect, useState } from "react";
import fetch from "cross-fetch";
import Table from "./questionTable";
import Cookies from 'js-cookie';

const UploadQuestion = () => {
  const [question, setQuestion] = useState("");
  const [all_file_names, setAllFileNames] = useState([]);
  const session_token = Cookies.get("session_token")

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = async (file_name) => {
    try {
      const is_admin = await fetch(`${process.env.HOST}/api/isAdmin?session_token=${session_token}`, {
        method: "GET"
      });
      if (!is_admin.ok) {
        window.alert("You are not admin");
        return;
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return;  // if there's an error, we probably want to stop execution
    }
    try {
      const response = await fetch(`${process.env.HOST}api/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });
      if (response.ok) {
        console.log("Question uploaded successfully!");
        setQuestion("");
        window.location.reload();
      } else {
        console.log("Question upload failed");
      }
    } catch (error) {
      console.error("Error uploading question:", error);
    }
  };


  return (
    <div>
      <div className="upload" style={containerStyle}>
        <textarea
            style={{
              width: "70%",
              marginLeft: "10VW",
              fontSize: "16px",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #3498db;",
              resize: "vertical",
            }}
          type="text"
          value={question}
          onChange={handleQuestionChange}
          rows="4"
          cols="50"
        />
        <button
            style={{ ...buttonStyle, backgroundColor: "#3498db", marginLeft: "2%" }}
            onClick={() => handleSubmit(question)}
          >
            Submit
        </button>
      </div>
      <Table className="upload" />
    </div>
  );
};

// CSS styles
const buttonStyle = {
  border: "none",
  color: "white",
  padding: "10px 20px",
  textAlign: "center",
  textDecoration: "none",
  display: "inline-block",
  fontSize: "16px",
  margin: "4px 2px",
  cursor: "pointer",
  borderRadius: "12px",
  width: "100px",
  marginLeft: "5vw",
};

const containerStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center", // Optional, if you want the elements vertically aligned
};
export default UploadQuestion;
