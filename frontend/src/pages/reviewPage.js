import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { saveAs } from "file-saver";
import RedirectButton from "../components/redirectButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import { useOutletContext } from "react-router-dom";

const ReviewPage = () => {
  const [jsonData, setJsonData] = useState(null);
  const [isAdmin, setIsAdmin, isSignedIn, setIsSignedIn, checkAdmin] = useOutletContext();

  useEffect(() => {
    const session_token = Cookies.get("session_token");
    checkAdmin(session_token);
    getEverything();
  }, []);

  const downloadData = () => {
    if (!jsonData) return;

    let csvContent = "";
    csvContent +=
      ["File Name", ...jsonData.questions, "Thumbs Up", "Thumbs Down"].join(
        ","
      ) + "\n";

    Object.entries(jsonData.file_names).forEach(([file, answers]) => {
      const thumbsUp = jsonData.review[file]?.thumbs_up || "0";
      const thumbsDown = jsonData.review[file]?.thumbs_down || "0";
      const row = [file, ...answers, thumbsUp, thumbsDown];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const file = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(file, "data.csv");
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
      setJsonData(data);
    }
  };

  const getRowsData = () => {
    if (!jsonData?.file_names || !jsonData?.questions) return null;

    return Object.entries(jsonData.file_names).map(([file, answers], idx) => (
      <tr key={file} style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
        <td style={styles.cell}>{file}</td>
        {jsonData.questions.map((question, i) => (
          <td style={styles.cell} key={`cell_${i}`}>
            {answers[i] || "N/A"}
          </td>
        ))}
        {/* <td style={styles.cell}>{jsonData.review[file]?.thumbs_up || "0"}</td>
        <td style={styles.cell}>{jsonData.review[file]?.thumbs_down || "0"}</td> */}
        <td style={styles.cell}>
          {jsonData.review[file]?.thumbs_up == 1 && (
            <FontAwesomeIcon icon={faThumbsUp} />
          )}
          {jsonData.review[file]?.thumbs_down == 1 && (
            <FontAwesomeIcon icon={faThumbsDown} />
          )}
          {jsonData.review[file]?.thumbs_up == 0 &&
            jsonData.review[file]?.thumbs_down == 0 &&
            ""}
        </td>
        {/* <td style={styles.cell}>
          {jsonData.review[file]?.thumbs_down == 1 ? "down" : ""}
        </td> */}
      </tr>
    ));
  };

  return (
    <div className="upload">
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
      <div className="w-3/4 mx-auto">
        <button
          className="mt-10 mb-3 bg-sky-500 py-2 px-3 rounded-lg text-white font-bold hover:bg-sky-800"
          onClick={downloadData}
        >
          Download Data
        </button>
        <table style={styles.table}>
          <thead style={styles.headerRow}>
            <tr>
              <th style={styles.headerCell}>File Name</th>
              {jsonData?.questions?.map((question, i) => (
                <th style={styles.headerCell} key={`header_${i}`}>
                  {question}
                </th>
              ))}
              <th style={styles.headerCell}>Review</th>
              {/* <th style={styles.headerCell}>Thumbs Down</th> */}
            </tr>
          </thead>
          <tbody>{getRowsData()}</tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#333",
    color: "#fff",
  },
  headerRow: {
    backgroundColor: "#000",
  },
  headerCell: {
    padding: "10px",
    border: "1px solid #000",
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  rowEven: {
    backgroundColor: "#222",
  },
  rowOdd: {
    backgroundColor: "#111",
  },
  cell: {
    padding: "10px",
    border: "1px solid #000",
    textAlign: "center",
  },
};

export default ReviewPage;
