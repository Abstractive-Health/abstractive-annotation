import React, { useState, useEffect } from "react";
import UploadButton from "../components/uploadButton";
import RedirectButton from "../components/redirectButton";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import axios from "axios";
import { Button, Checkbox, Table } from "flowbite-react";

axios.defaults.baseURL = "http://localhost:3000";

const UploadPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    // Fetch the list of files when the component mounts
    // (This assumes you have an endpoint `/api/files` that returns a list of file names.)
    axios
      .get("/api/fileNames")
      .then((response) => {
        setFiles(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch files:", error);
      });
  }, []);
  const refreshFileList = () => {
    axios
      .get("/api/fileNames")
      .then((response) => {
        setFiles(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch files:", error);
      });
  };
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedFiles({}); // Clear all selections
    } else {
      // Select all files
      const allFiles = {};
      files.forEach((file) => (allFiles[file] = true));
      setSelectedFiles(allFiles);
    }

    setSelectAll(!selectAll);
  };
  const toggleSelect = (fileName) => {
    setSelectedFiles((prevState) => ({
      ...prevState,
      [fileName]: !prevState[fileName],
    }));

    if (selectAll && !selectedFiles[fileName]) {
      setSelectAll(false); // If unchecking any, uncheck "select all" as well
    }
  };

  const deleteSelectedFiles = () => {
    setLoader(true);
    const filesToDelete = Object.keys(selectedFiles).filter(
      (fileName) => selectedFiles[fileName]
    );

    axios
      .delete("/api/deleteFiles", {
        data: { fileNames: filesToDelete },
      })
      .then((response) => {
        alert("Files deleted successfully!");
        // Refresh the list after successful deletion
        setFiles(files.filter((file) => !filesToDelete.includes(file)));
        setLoader(false);
      })
      .catch((error) => {
        alert("Failed to delete files. Please try again.");
        console.error("Deletion failed:", error);
        setLoader(false);
      });
  };
  const areFilesSelected = Object.values(selectedFiles).some((val) => val);

  const organizeDataToPayloads = (data) => {
    const fileNameKey = 'File Name';
    const payloads = [];
    (data || []).forEach((result) => {
      const filename = result[fileNameKey];
      Object.keys(result).forEach((question)=> {
        const answer = result[question];
        if(question !== fileNameKey && answer !== "N/A") {
          payloads.push({
            question: question,
            answer: answer,
            fileName: filename,
          })
        }
      })
    })
    return payloads
  }
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const csvString = reader.result;
        Papa.parse(csvString, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const payloads = organizeDataToPayloads(results.data);
            const httpCalls = payloads.map((payload) => {
              return fetch(`http://localhost:3000/api/answer`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }).then(response => response.ok ? 
                console.info(payload['question'] + " annotation upload success ") : 
                console.error(payload['question'] + " annotation upload failure "));
            })
            Promise.all(httpCalls).then(() => {
              // navigate("/reviewAnnotate", { state: { info: results.data } });
              navigate("/annotate");
            })
          },
        });
      };
      reader.readAsText(file);
    }
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
      <UploadButton
        className="uploadBtn"
        onSuccessfulUpload={refreshFileList}
      />
      <span className="text-white font-semibold">For Reviewing :</span>
      <input
        type="file"
        multiple
        accept=".csv"
        onChange={handleFileSelect}
        style={{ display: "none" }} // Hide the file input element
        id="csvUpload" // Add an ID for label 'for' attribute
      />
      <label className="ml-2" htmlFor="csvUpload" style={labelStyle}>
        Upload CSV
      </label>
      <div className="text-white ">
        <div className="flex items-center justify-around">
          <div className="text-xl font-semibold my-5">Current Files</div>
          <div className="flex">
            <Button onClick={deleteSelectedFiles} disabled={!areFilesSelected}>
              Delete Selected Files
            </Button>{" "}
            {loader && (
              <div className="mt-2 ml-4">
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
        </div>
        <div className="w-3/4 mx-auto h-[35vh] max-h-[35vh] overflow-y-scroll">
          <Table>
            <Table.Head>
              <Table.HeadCell>
                <Checkbox checked={selectAll} onChange={toggleSelectAll} />
              </Table.HeadCell>
              <Table.HeadCell>File Name</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {files.map((file) => (
                <Table.Row
                  className="border-gray-700 bg-gray-800 text-white"
                  key={file}
                >
                  <Table.Cell>
                    <Checkbox
                      checked={selectedFiles[file] || false}
                      onChange={() => toggleSelect(file)}
                    />
                  </Table.Cell>
                  <Table.Cell>{file}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

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
  marginTop: "50px",
};

export default UploadPage;
