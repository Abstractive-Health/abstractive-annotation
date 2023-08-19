import React, { useEffect, useReducer, useState } from "react";
import RedirectButton from "../components/redirectButton";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

const AdminPage = () => {
  const [isAdmin, setIsAdmin, isSignedIn, setIsSignedIn, checkAdmin] = useOutletContext();
  const session_token = Cookies.get("session_token");
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [userFileNames, setUserFileNames] = useState([]);
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    checkAdmin();
    getUsers();
    getAllFileNames();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      getFileNamesByUser();
    }
    getEverything();
  }, [selectedUser]);

  const jsonToCSV = (json, questions, finished, userFileNames) => {
    const rows = Object.keys(json).filter((fileName) =>
      userFileNames.includes(fileName)
    );
    let csvStr = "data:text/csv;charset=utf-8,";

    // header
    csvStr += "File Name," + questions.join(",") + ",Finished\n";

    // rows
    for (const row of rows) {
      let rowStr = row + "," + Object.values(json[row]).join(",");
      rowStr += finished.includes(row) ? ",Yes\n" : ",No\n";
      csvStr += rowStr;
    }

    return encodeURI(csvStr);
  };

  const getAnswerTable = () => {
    if (!jsonData || !jsonData.file_names) {
      return null;
    }

    const { questions, file_names, finished } = jsonData;

    const downloadTable = () => {
      const csvUrl = jsonToCSV(
        jsonData.file_names,
        questions,
        finished,
        userFileNames
      );
      let downloadLink = document.createElement("a");
      downloadLink.href = csvUrl;
      downloadLink.download = `${selectedUser}_review_table.csv`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    return (
      <div style={styles.tableContainer}>
        <button
          className="bg-sky-500 py-2 px-3 rounded-lg text-white font-bold hover:text-white hover:bg-sky-800 ml-[38rem]"
          onClick={downloadTable}
        >
          Download for Review
        </button>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell}>File Name</th>
              {questions.map((question, index) => (
                <th key={index} style={styles.headerCell}>
                  {question}
                </th>
              ))}
              <th style={styles.headerCell}>Finished</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(file_names).map(
              (fileName) =>
                userFileNames.includes(fileName) && (
                  <tr key={fileName} style={styles.row}>
                    <td style={styles.cell}>{fileName}</td>
                    {file_names[fileName].map((answer, index) => (
                      <td key={index} style={styles.cell}>
                        {answer}
                      </td>
                    ))}
                    <td style={styles.cell}>
                      {finished.includes(fileName) ? "Yes" : "No"}
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // const jsonToCSV = (json) => {
  //     const rows = Object.keys(json);
  //     let csvStr = "data:text/csv;charset=utf-8,";

  //     // header
  //     csvStr += "File Name,Answer" + "\n";

  //     // rows
  //     for (const row of rows) {
  //         csvStr += row + "," + Object.values(json[row]).join(",") + "\n";
  //     }

  //     return encodeURI(csvStr);
  // };

  // const getAnswerTable = () => {
  //     if (!jsonData || !jsonData.file_names) {
  //         return null;
  //     }

  //     const { questions, file_names, finished } = jsonData;

  //     const downloadTable = () => {
  //         const csvUrl = jsonToCSV(jsonData.file_names);
  //         let downloadLink = document.createElement('a');
  //         downloadLink.href = csvUrl;
  //         downloadLink.download = `${selectedUser}_review_table.csv`;
  //         document.body.appendChild(downloadLink);
  //         downloadLink.click();
  //         document.body.removeChild(downloadLink);
  //     }

  //     return (
  //         <div style={styles.tableContainer}>
  //         <button onClick={downloadTable}>Download</button>
  //         <table style={styles.table}>
  //             <thead>
  //                 <tr style={styles.headerRow}>
  //                     <th style={styles.headerCell}>File Name</th>
  //                     {questions.map((question, index) => (
  //                         <th key={index} style={styles.headerCell}>{question}</th>
  //                     ))}
  //                     <th style={styles.headerCell}>Finished</th>
  //                 </tr>
  //             </thead>
  //             <tbody>
  //                 {Object.keys(file_names).map((fileName) => (
  //                     userFileNames.includes(fileName) && (
  //                         <tr key={fileName} style={styles.row}>
  //                             <td style={styles.cell}>{fileName}</td>
  //                             {file_names[fileName].map((answer, index) => (
  //                                 <td key={index} style={styles.cell}>{answer}</td>
  //                             ))}
  //                             <td style={styles.cell}>
  //                                 {finished.includes(fileName) ? 'Yes' : 'No'}
  //                             </td>
  //                         </tr>
  //                     )
  //                 ))}
  //             </tbody>
  //         </table>
  //         </div>
  //     );
  // };

  const getEverything = async () => {
    const response = await fetch("http://localhost:3000/api/everything", {
      method: "GET",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Unable to fetch questions: ${errorMessage}`);
    } else {
      const data = await response.json();
      setJsonData(data); // JSON.parse is not needed as response.json() already parses the response.
    }
  };

  const getUsers = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/AllUsername?session_token=${session_token}`
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const getAllFileNames = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/fileNames");
      const data = await response.json();
      setFileNames(data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const getFileNamesByUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/AllowedFiles?username=${selectedUser}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setUserFileNames(data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleFileCheck = async (fileName, isChecked) => {
    const url = isChecked ? "/api/addAllowedFile" : "/api/deleteAllowedFile";
    const response = await fetch(`http://localhost:3000${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: selectedUser,
        fileName: fileName,
      }),
    });
    if (response.ok) {
      getFileNamesByUser();
    } else {
      console.error("Failed to update user file access");
    }
  };

  const handleCheckAll = async () => {
    // Iterate over all file names
    for (const fileName of fileNames) {
      // If the user already has access to this file, continue to the next file
      if (userFileNames.includes(fileName)) continue;

      // Add this file to the user's access
      const response = await fetch(`http://localhost:3000/api/addAllowedFile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: selectedUser,
          fileName: fileName,
        }),
      });
      if (!response.ok) {
        console.error("Failed to add file access");
      }
    }

    // After iterating through all files, refresh the file names by user
    getFileNamesByUser();
  };

  const getFileAccessTable = () => (
    <div>
      <button
        className="bg-sky-500 py-2 px-3 rounded-lg text-white font-bold hover:bg-sky-800 ml-[53rem]"
        onClick={() => handleCheckAll()}
      >
        Check All
      </button>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell}>File Name</th>
              <th style={styles.headerCell}>Access</th>
            </tr>
          </thead>
          <tbody>
            {fileNames.map((fileName) => (
              <tr key={fileName} style={styles.row}>
                <td style={styles.cell}>{fileName}</td>
                <td style={styles.cell}>
                  <input
                    type="checkbox"
                    checked={userFileNames.includes(fileName)}
                    onChange={(e) =>
                      handleFileCheck(fileName, e.target.checked)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    // todo: change the className to admin (add the css file)
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
      <div>
        <label htmlFor="userSelect" style={{ color: "white" }}>
          Select User:{" "}
        </label>
        <select
          id="userSelect"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Select User --</option>
          {users.map((user, index) => (
            <option key={index} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>
      <h1
        style={{
          fontSize: "20px",
          textAlign: "left",
          marginLeft: "12%",
          fontWeight: "600",
          color: "white",
        }}
      >
        Access Table:
      </h1>
      {selectedUser && getFileAccessTable()}
      <h1
        style={{
          fontSize: "20px",
          textAlign: "left",
          marginLeft: "12%",
          fontWeight: "600",
          color: "white",
        }}
      >
        Review Table:
      </h1>
      {getAnswerTable()}
    </div>
  );
};

// Define styles outside of the AdminPage component
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#222",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  tableContainer: {
    paddingLeft: "10%",
    paddingBottom: "5%",
  },
  table: {
    width: "80%",
    borderCollapse: "collapse",
    margin: "20px",
    marginBottom: "40px",
  },
  headerRow: {
    backgroundColor: "#333",
    color: "white",
  },
  headerCell: {
    padding: "10px",
    border: "1px solid #fff",
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  row: {
    backgroundColor: "#444",
  },
  cell: {
    padding: "10px",
    border: "1px solid #fff",
    textAlign: "center",
    color: "white",
  },
};

export default AdminPage;
