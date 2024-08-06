import React, { useEffect, useState } from "react";
import fetch from "cross-fetch";
import Table from "./questionTable";
import Cookies from "js-cookie";

const UploadQuestion = () => {
  const [question, setQuestion] = useState("");
  const [answerType, setAnswerType] = useState("TextArea");
  const session_token = Cookies.get("session_token");

  const handleQuestionChange = (event) => {
    event.preventDefault();
    setQuestion(event.target.value);
  };

  const handleAnswerTypeChange = (event) => {
    event.preventDefault();
    setAnswerType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const is_admin = await fetch(
        `http://localhost:3000/api/isAdmin?session_token=${session_token}`,
        {
          method: "GET",
        }
      );
      if (!is_admin.ok) {
        window.alert("You are not admin");
        return;
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      return; // if there's an error, we probably want to stop execution
    }
    if (!question || !answerType) {
      console.error("Missing question or answer type");
      return; // Missing the question and answertype
    }
    try {
      const response = await fetch("http://localhost:3000/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answerType,
        }),
      });
      if (response.ok) {
        console.log("Question uploaded successfully!");
        setQuestion("");
        setAnswerType("TextArea");
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
      <div style={{ display: "flex", justifyContent: "center" }}>
        <form style={containerStyle}>
          <div style={formItemStyle}>
            <h3 style={formLabelStyle}>Add Your Questions Here:</h3>
            <textarea
              style={{
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #3498db",
                resize: "vertical",
              }}
              type="text"
              value={question}
              onChange={handleQuestionChange}
              rows="1"
              cols="50"
            />
          </div>
          <div style={formItemStyle}>
            <h3 style={formLabelStyle}>Select Answer type:</h3>
            <select
              name="choice"
              defaultValue={"TextArea"}
              onChange={handleAnswerTypeChange}
            >
              <option value="TextArea">Text Area</option>
              <option value="RadioButton">Radio Button</option>
            </select>
          </div>
          <div style={{ ...formItemStyle, justifyContent: "flex-end" }}>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: "#3498db",
              }}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </form>
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
};

const containerStyle = {
  display: "flex",
  flexDirection: "row",
  width: "80%",
  justifyContent: "space-evenly",
};

const formItemStyle = {
  display: "flex",
  flexDirection: "column",
};

const formLabelStyle = {
  fontSize: "20px",
  textAlign: "left",
  fontWeight: "600",
  marginBottom: "20px",
};

export default UploadQuestion;
