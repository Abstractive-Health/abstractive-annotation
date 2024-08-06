import React, { useState, useEffect } from "react";

function Download() {
  const [jsonInput, setJsonInput] = useState("");

  useEffect(() => {
    getEverything();
  }, []);

  const jsonToCsv = (jsonObj) => {
    let rows = [];

    for (let file in jsonObj.file_names) {
      if (!jsonObj.file_names.hasOwnProperty(file)) continue;

      let row = {};
      row["File Name"] = file;
      // row['Completed'] = jsonObj.finished.includes(file) ? "Yes" : "No";
      // row['ThumbsUp'] = jsonObj.review[file] ? jsonObj.review[file].thumbs_up : 'N/A';
      // row['ThumbsDown'] = jsonObj.review[file] ? jsonObj.review[file].thumbs_down : 'N/A';

      jsonObj.questions.forEach((question, i) => {
        row[question] = jsonObj.file_names[file][i]
          ? jsonObj.file_names[file][i]
          : "N/A";
      });

      rows.push(row);
    }

    // Convert object to CSV string
    const csv = rows
      .map((row) => {
        return Object.values(row)
          .map((val) => JSON.stringify(val))
          .join(",");
      })
      .join("\r\n");

    // Add header
    const header = Object.keys(rows[0]).join(",") + "\r\n";
    return header + csv;
  };

  const getEverything = async () => {
    const response = await fetch("http://localhost:3000/api/everything", {
      method: "GET",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Unable to fetch questions: ${errorMessage}`);
    } else {
      const data = await response.json();
      const questionValues = (data.questions || []).map(
        (question) => question.value
      );
      data["questions"] = questionValues;
      setJsonInput(data);
    }
  };

  const handleDownload = () => {
    const csv = jsonToCsv(jsonInput);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "export.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <button
      className="mt-10 mb-3 bg-sky-500 py-2 px-3 rounded-lg text-white font-bold hover:bg-sky-800"
      // style={{ ...buttonStyle }}
      onClick={handleDownload}
    >
      Download CSV
    </button>
  );
}

const buttonStyle = {
  border: "none",
  color: "white",
  padding: "10px 20px",
  marginBottom: "10px",
  marginLeft: "40%",
  textAlign: "center",
  justifyContent: "left",
  textDecoration: "none",
  display: "inline-block",
  fontSize: "16px",
  cursor: "pointer",
  borderRadius: "12px",
  backgroundColor: "#28b2fb",
};
export default Download;
