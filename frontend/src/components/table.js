// import React, { useState, useEffect } from "react";

// const Table = () => {
//   const [jsonData, setJsonData] = useState(null);

//   const getEverything = async () => {
//     const response = await fetch("http://localhost:3000/api/everything", {
//       method: "GET",
//     });
//     if (!response.ok) {
//       const errorMessage = await response.text();
//       throw new Error(`Unable to fetch questions: ${errorMessage}`);
//     } else {
//       const data = await response.json();
//       console.log("data", data)
//       setJsonData(data); // JSON.parse is not needed as response.json() already parses the response.
//     }
//   };

//   useEffect(() => {
//     getEverything();
//   }, []);

//   const getHeader = () => {
//     if (!jsonData || !jsonData.questions) return null;

//     return (
//       <tr >
//         <th style={styles.headerCell}>File Name</th>
//         {jsonData.questions.map((question, i) => (
//           <th style={styles.headerCell} key={`header_${i}`}>{question}</th>
//         ))}
//       </tr>
//     );
//   };

//   const getRowsData = () => {
//     if (!jsonData || !jsonData.file_names || !jsonData.questions) return null;

//     const rows = Object.entries(jsonData.file_names).map(([file, answers], idx) => (
//       <tr style={styles.row} key={`row_${idx}`}>
//         <td style={styles.cell}>{file}</td>
//         {answers.map((answer, i) => (
//           <td style={styles.cell} key={`cell_${i}`}>{answer}</td>
//         ))}
//       </tr>
//     ));

//     return rows.slice(0, 10); // limit the rows to 10
//   };

//   return (
//     <div style={styles.container}>
//       <table style={styles.table}>
//         <thead>{getHeader()}</thead>
//         <tbody>{getRowsData()}</tbody>
//       </table>
//     </div>
//   );
// };
// const styles = {
//   container: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "80vh",
//   },
//   table: {
//     width: "80%",
//     borderCollapse: "collapse",
//     backgroundColor: "#333",
//     color: "#fff",
//   },
//   headerRow: {
//     backgroundColor: "#000",
//   },
//   headerCell: {
//     padding: "10px",
//     border: "1px solid #000",
//     fontWeight: "bold",
//     textAlign: "center",
//     color: "white",
//   },
//   rowEven: {
//     backgroundColor: "#222",
//   },
//   rowOdd: {
//     backgroundColor: "#111",
//   },
//   cell: {
//     padding: "10px",
//     border: "1px solid #000",
//     textAlign: "center",
//   },
// };

// export default Table;
import React, { useState, useEffect } from "react";
import Download from "../components/download";
const Table = () => {
  const [jsonData, setJsonData] = useState(null);

  const getEverything = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/everything`, {
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
      setJsonData(data);
    }
  };

  useEffect(() => {
    getEverything();
  }, []);

  const getHeader = () => {
    if (!jsonData || !jsonData.questions) return null;

    return (
      <tr style={styles.headerRow}>
        <th style={styles.headerCell}>File Name</th>
        {jsonData.questions.map((question, i) => (
          <th style={styles.headerCell} key={`header_${i}`}>
            {question}
          </th>
        ))}
      </tr>
    );
  };

  const getRowsData = () => {
    if (!jsonData || !jsonData.file_names || !jsonData.questions) return null;

    const rows = Object.entries(jsonData.file_names).map(
      ([file, answers], idx) => (
        <tr
          style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}
          key={`row_${idx}`}
        >
          <td style={styles.cell}>{file}</td>
          {answers.map((answer, i) => (
            <td style={styles.cell} key={`cell_${i}`}>
              {answer}
            </td>
          ))}
        </tr>
      )
    );

    return rows; // limit the rows to 10
  };

  return (
    <div>
      <div>
        <Download />
        <div className="max-h-[64vh] rounded-3xl h-[64vh] overflow-y-scroll text-white w-3/4 mx-auto">
          <table className="w-full relative text-white">
            <thead className="sticky -top-1">{getHeader()}</thead>
            <tbody>{getRowsData()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
    marginLeft: "20%",
    marginTop: "5%",
  },
  table: {
    width: "80%",
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

export default Table;
