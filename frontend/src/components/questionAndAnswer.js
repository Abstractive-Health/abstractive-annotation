import React, { useEffect, useState } from "react";
import fetch from "cross-fetch";
import "bulma/css/bulma.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Table from "./questionTable";

const QuestionAndAnswer = (props) => {
  const [questions_and_answers, setquestions_and_answers] = useState([]);
  const [answer, setAnswer] = useState({});

  const filename = props.filename;
  let length = questions_and_answers.length;

  const getQuestionsAndAnswers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/qa?fileName=${filename}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Unable to fetch questions: ${errorMessage}`);
      }
      const data = await response.json();
      setquestions_and_answers(data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {
    getQuestionsAndAnswers();
  }, [filename, length, answer]);

  const handleAnswerChange = (question, event) => {
    setAnswer((prevAnswers) => ({
      ...prevAnswers,
      [question]: event.target.value,
    }));
  };

  const handleUpdateAnswer = async (question, answer, filename) => {
    if (answer === undefined) {
      console.error("No answer for question: " + question);
      return;
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/answer`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        answer: answer,
        fileName: filename,
      }),
    });
    if (response.ok) {
      console.log("Answer updated successfully");
      getQuestionsAndAnswers();
      setAnswer((prevAnswers) => ({ ...prevAnswers, [question]: "" }));
    } else {
      console.log("Answer update failed");
    }
  };

  return (
    // <div className="container">
    //   <table className="table is-striped is-hoverable is-fullwidth">
    //     <thead>
    //       <tr>
    //         <th>Question</th>
    //         <th>Answer</th>
    //         <th>Update/Add Answer</th>
    //         {/* <th>Delete</th> */}
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {questions_and_answers.map((q_and_a) => (
    //         <tr key={q_and_a.question}>
    //           <td>
    //             <div style={{ width: "9vw", overflowWrap: "break-word" }}>
    //               {q_and_a.question}
    //             </div>
    //           </td>
    //           <td>
    //             <div style={{ width: "9vw", overflowWrap: "break-word" }}>
    //               {q_and_a.answer}
    //             </div>
    //           </td>
    //           <td>
    //             <div className="field">
    //               <div className="control">
    //                 <input
    //                   className="input is-small"
    //                   style={{
    //                     width: "80%",
    //                     overflow: "auto",
    //                   }}
    //                   type="text"
    //                   value={answer[q_and_a.question] || ""}
    //                   onChange={(event) =>
    //                     handleAnswerChange(q_and_a.question, event)
    //                   }
    //                 />
    //                 <button
    //                   style={{ width: "20%" }}
    //                   className="button is-small is-link"
    //                   onClick={() =>
    //                     handleUpdateAnswer(
    //                       q_and_a.question,
    //                       answer[q_and_a.question],
    //                       filename
    //                     )
    //                   }
    //                 >
    //                   <FontAwesomeIcon icon={faArrowRight} />
    //                 </button>
    //               </div>
    //             </div>
    //           </td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
    <div className="text-white h-2/3 bg-gray-800 rounded-r-lg overflow-auto">
      {questions_and_answers.map((q_and_a) => (
        <>
          {console.log(q_and_a)}
          <div key={q_and_a.question} className="p-4">
            <div className="flex flex-row">
              <span className="w-5 h-5 -mr-3 mt-2 bg-slate-700 transform rotate-45"></span>
              <p className="bg-slate-700 p-4 rounded-lg">{q_and_a.question}</p>
            </div>

            <div className="flex flex-row items-center mt-5">
              <textarea
                id="message"
                rows="12"
                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Write your answer here..."
                value={q_and_a.answer || ""}
                onChange={(event) =>
                  handleAnswerChange(q_and_a.question, event)
                }
              ></textarea>

              <button
                className="button bg-slate-800 text-white w-1/5 ml-4"
                onClick={() =>
                  handleUpdateAnswer(
                    q_and_a.question,
                    answer[q_and_a.question],
                    filename
                  )
                }
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </>
      ))}
    </div>
  );
};

export default QuestionAndAnswer;
