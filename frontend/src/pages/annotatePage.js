import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import RedirectButton from "../components/redirectButton";
import "bulma/css/bulma.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useOutletContext } from "react-router-dom";
import { isEmpty } from "lodash";

const AnnotatePage = () => {
  // eslint-disable-next-line
  const [isAdmin, checkAdmin] = useOutletContext();
  const [fileNames, setFileNames] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(-1);
  const [filePreview, setFilePreview] = useState(null);
  // const [isFinished, setIsFinished] = useState(false);
  const [inputAnswers, setInputAnswers] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const session_token = Cookies.get("session_token");
  const filename =
    selectedFileIndex === fileNames.length
      ? null
      : fileNames[selectedFileIndex];
  const hasEmptyAnswers =
    isEmpty(inputAnswers) ||
    Object.values(inputAnswers).some(({ answer }) => !answer);

  // Page Load - get the file name first
  useEffect(() => {
    setError("");
    setIsLoading(true);
    checkAdmin(session_token);
    getFileNames();
  }, [session_token]);

  // When file name updated (Next / Prev Buttons or Page Load)
  useEffect(() => {
    setError("");
    if (filename) {
      getQuestionsAndAnswers();
    } else {
      setInputAnswers({});
    }
  }, [selectedFileIndex]);

  // useEffect(() => {
  //   fetchFinishedFiles();
  // }, [fileNames, selectedFileIndex]);

  const getQuestionsAndAnswers = async () => {
    if (!filename) {
      setInputAnswers({});
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/qa?fileName=${filename}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        const errorMessage = await response.text();
        setError(errorMessage);
        throw new Error(`Unable to fetch questions: ${errorMessage}`);
      }
      const data = await response.json();
      // load original answers into state
      const originalAnswers = {};
      //{question: 'Summarize this outpatient note.', answerType: 'TextArea', answer: 'Jorge'}   this the Data
      (data || []).forEach((q_and_a) => {
        const { question, ...rest } = q_and_a;
        originalAnswers[question] = rest;
      });

      setError("");
      setInputAnswers(originalAnswers);
    } catch (error) {
      setError("Error Fetching File Questions and Answers for file=", filename);
    }
  };

  // Return true if unsuccessful
  const handleUpdateAnswer = async (fileToShow) => {
    if (hasEmptyAnswers) {
      setError("All answers must be filled out");
      return;
    }

    let hasErrors = false;
    for (const question of Object.keys(inputAnswers)) {
      // no need to update

      const { answer } = inputAnswers[question];

      if (!answer) {
        continue;
      }

      const response = await fetch(`http://localhost:3000/api/answer`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          answer: answer,
          fileName: fileToShow,
        }),
      });
      if (response.ok) {
        console.log("Answer updated successfully for question", question);
        // Just update the answer for the specific question in the state, not empty it
      } else {
        console.log("Answer update failed");
        hasErrors = true;
      }
    }
    return hasErrors;
  };

  const handleSubmit = async (event, fileToSubmit) => {
    event.preventDefault();
    if (hasEmptyAnswers && selectedFileIndex !== fileNames.length) {
      setError("Can't have empty answer"); // Should not reach here
      return;
    }
    if (selectedFileIndex === fileNames.length) {
      setError("Nothing left to annotate");
      return;
    }

    const hasAPIErrors = await handleUpdateAnswer(fileToSubmit);
    if (hasAPIErrors) {
      setError("Error backend. Please try again");
      return;
    }
    await handleCheckboxChange();
    await handleNext();
  };

  const getFileNames = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/AllowedFiles?session_token=${session_token}`
      );
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Unable to fetch file names: ${errorMessage}`);
      }

      const data = await response.json();
      const finishedFilesResponse = await fetch(
        "http://localhost:3000/api/getFinished"
      );
      const finishedFiles = await finishedFilesResponse.json();
      const sortedData = data.sort(
        (a, b) => finishedFiles.includes(a) - finishedFiles.includes(b)
      );

      setFileNames(sortedData);
      if (sortedData.length > 0) {
        handleFileChange(sortedData[0]);
        setSelectedFileIndex(0);
      }
      setIsLoading(false);
    } catch (error) {
      setError("Error Fetching Files");
      setIsLoading(false);
    }
  };

  // const fetchFinishedFiles = async () => {
  //   try {
  //     const response = await fetch("http://localhost:3000/api/getFinished");
  //     const finishedFiles = await response.json();
  //     setIsFinished(finishedFiles.includes(fileNames[selectedFileIndex]));
  //   } catch (error) {
  //     console.log("Error fetching finished files:", error);
  //   }
  // };

  const handleFileChange = async (targetFile) => {
    if (!targetFile) {
      setFilePreview(
        <div
          style={{
            // maxHeight: "600px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              textAlign: "left",
            }}
          >
            No file to render.
          </pre>
        </div>
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/files?filename=${encodeURIComponent(
          targetFile
        )}`
      );
      if (!response.ok) {
        setError(`Error fetching file ${targetFile}: ${response.statusText}`);
        return;
      }

      const file = await response.blob();
      const fileType = targetFile.split(".").pop();
      if (fileType === "pdf") {
        setFilePreview(
          <object
            data={URL.createObjectURL(file)}
            type="application/pdf"
            width="100%"
            height="600px"
          >
            <p>It appears you don't have a PDF plugin for this browser.</p>
          </object>
        );
      } else if (fileType === "txt") {
        const reader = new FileReader();
        reader.onload = function (event) {
          const text = event.target.result;
          setFilePreview(
            <div
              style={{
                maxHeight: "1000px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  textAlign: "left",
                }}
              >
                {text}
              </pre>
            </div>
          );
        };
        reader.readAsText(file);
      } else if (fileType === "csv") {
        const reader = new FileReader();
        reader.onload = function (event) {
          const csvData = event.target.result;
          const lines = csvData.split("\n");
          const rows = lines.map((line) => line.split(","));
          setFilePreview(
            <table>
              {rows.map((row) => (
                <tr>
                  {row.map((cell) => (
                    <td>{cell}</td>
                  ))}
                </tr>
              ))}
            </table>
          );
        };
        reader.readAsText(file);
      }
    } catch (e) {
      setError("Unable to fetch File");
    }
  };

  const handlePrevious = (event) => {
    event.preventDefault();
    const prevSelectedFileIndex = selectedFileIndex - 1;
    if ((prevSelectedFileIndex) => 0) {
      setSelectedFileIndex(prevSelectedFileIndex);
      handleFileChange(fileNames[prevSelectedFileIndex]);
    }
  };

  const handleNext = () => {
    const nextSelectedFileIndex = selectedFileIndex + 1;

    // if current file is within range
    if (nextSelectedFileIndex <= fileNames.length - 1) {
      setSelectedFileIndex(nextSelectedFileIndex);
      handleFileChange(fileNames[nextSelectedFileIndex]);
    } else if (nextSelectedFileIndex === fileNames.length) {
      setSelectedFileIndex(nextSelectedFileIndex);
      handleFileChange(null);
    }
  };

  const handleCheckboxChange = async (event) => {
    const endpoint = "/api/addFinished";
    const options = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: fileNames[selectedFileIndex] }),
    };

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, options);
      if (!response.ok) {
        setError(
          "Error updating finished state for file: ${response.statusText}`"
        );
        throw new Error(
          `Error updating finished state for file: ${response.statusText}`
        );
      }
      // setIsFinished(true); // Update the isFinished state
    } catch (error) {
      console.log("Error:", error);
      return true;
    }
  };

  const renderQuestions = () => {
    if (selectedFileIndex === fileNames.length) return <div>No Questions</div>;
    return;
  };

  const renderNoFiles = () => {
    return <p className="abstractivetitle">No Files to Annotate</p>;
  };

  const renderPreviewForm = () => {
    return (
      <>
        <div className="h-full w-3/5 mb-10">{filePreview}</div>
        <div className="mx-auto w-2/5">
          <div className="text-white h-full bg-gray-800 rounded-r-lg overflow-auto">
            <h2 className="text-white font-semibold text-xl mt-8 mx-10 text-left">
              {fileNames[selectedFileIndex]}
            </h2>
            <form id="qaform">
              {Object.keys(inputAnswers).map((question, i) => (
                <div key={question} className="p-4">
                  <div className="flex flex-row">
                    <span className="w-5 h-5 -mr-3 mt-2 bg-slate-700 transform rotate-45"></span>
                    <p className="bg-slate-700 p-4 rounded-lg">{question}</p>
                  </div>
                  <div className="flex flex-col items-center mt-5">
                    {inputAnswers[question].answerType === "RadioButton" ? (
                      <div className="flex flex-row w-full justify-evenly">
                        <div>
                          <input
                            type="radio"
                            name={`${question}`}
                            id={`${question}-Y`}
                            value="Y"
                            checked={inputAnswers[question].answer === "Y"}
                            onChange={(event) => {
                              setInputAnswers({
                                ...inputAnswers,
                                [question]: {
                                  answerType: inputAnswers[question].answerType,
                                  answer: event.target.value,
                                },
                              });
                            }}
                          />
                          <label className="ml-3" htmlFor={`${question}-Y`}>
                            Yes
                          </label>
                        </div>

                        <div>
                          <input
                            type="radio"
                            name={`${question}`}
                            id={`${question}-N`}
                            value="N"
                            checked={inputAnswers[question].answer === "N"}
                            onChange={(event) => {
                              setInputAnswers({
                                ...inputAnswers,
                                [question]: {
                                  answerType: inputAnswers[question].answerType,
                                  answer: event.target.value,
                                },
                              });
                            }}
                          />
                          <label className="ml-3" htmlFor={`${question}-N`}>
                            No
                          </label>
                        </div>
                      </div>
                    ) : (
                      <textarea
                        id={`${question}`}
                        rows="15"
                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder={
                          inputAnswers[question].answer ||
                          "Write your answer here..."
                        }
                        value={inputAnswers[question].answer}
                        onChange={(event) => {
                          event.preventDefault();
                          setInputAnswers({
                            ...inputAnswers,
                            [question]: {
                              answerType: inputAnswers[question].answerType,
                              answer: event.target.value,
                            },
                          });
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
              <div className="flex flex-row">
                <button
                  className="button text-white bg-slate-800 p-2 rounded-md mx-2 abstractiveButton"
                  disabled={
                    selectedFileIndex === 0 ||
                    (hasEmptyAnswers &&
                      selectedFileIndex < fileNames.length - 1)
                  }
                  onClick={(event) => handlePrevious(event)}
                >
                  <FontAwesomeIcon className="pr-2" icon={faArrowLeft} />
                  Previous
                </button>
                <button
                  className="button bg-slate-800 text-white abstractiveButton"
                  disabled={
                    selectedFileIndex === fileNames.length || hasEmptyAnswers
                  }
                  onClick={(event) => handleSubmit(event, filename)}
                >
                  Save and Continue
                  <FontAwesomeIcon className="pl-2" icon={faArrowRight} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  };
  console.log("re-rendering the component", inputAnswers);
  return (
    <div className="upload">
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
      </nav>
      <div className="mx-auto w-3/4 mt-5 h-full">
        {isLoading && <p className="abstractiveLoading">Loading</p>}

        <p className="abstractiveError">
          {error && !isLoading && `Error Encountered: ${error}`}
        </p>
        <div className="flex flex-row">
          {!isLoading && !fileNames.length && renderNoFiles()}
          {!isLoading && fileNames.length && renderPreviewForm()}
        </div>
      </div>
    </div>
  );
};

export default AnnotatePage;
