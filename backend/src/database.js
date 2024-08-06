const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");

let databasePath = path.join(__dirname, "database.json");
let database = {
  questions: [],
  file_names: {},
  finished: [],
  review: {},
};

try {
  // Load existing data from file if it exists
  // Else create a new database
  if (fs.existsSync(databasePath)) {
    let rawdata = fs.readFileSync(databasePath);
    database = JSON.parse(rawdata);
  } else {
    initDatabase();
  }
} catch (error) {
  console.error(`Error while initializing database: ${error}`);
}

// Database
/**
 * Save the current state of the database to a file.
 */
const saveDatabase = () => {
  try {
    let data = JSON.stringify(database);
    fs.writeFileSync(databasePath, data);
  } catch (error) {
    console.error(`Error while saving database: ${error}`);
  }
};

/**
 * Get all filenames in the 'uploads' directory with allowed file types.
 * @return {Array} an array of filenames with allowed file types.
 */
const getAllFileNames = () => {
  try {
    const all_file_names = fs.readdirSync(path.join(__dirname, "../uploads"));
    const allowedFileTypes = [".txt", ".pdf", ".csv"];
    return all_file_names.filter((file) =>
      allowedFileTypes.includes(path.extname(file))
    );
  } catch (error) {
    console.error(`Error while getting all filenames: ${error}`);
    return [];
  }
};

/**
 * Initialize the database with all filenames in the 'uploads' directory.
 */
const initDatabase = () => {
  try {
    const all_file_names = getAllFileNames();
    const file_names_obj = {};
    all_file_names.forEach((file) => {
      file_names_obj[file] = [];
    });
    database = {
      questions: [],
      file_names: file_names_obj,
      finished: [],
      review: {},
    };
    saveDatabase();
  } catch (error) {
    console.error(`Error while initializing database: ${error}`);
  }
};

/**
 * Update the database with the current filenames in the 'uploads' directory.
 */
const updateDatabase = () => {
  try {
    const all_file_names = getAllFileNames();
    let answer = Array(database.questions.length).fill("");
    for (let file_name of all_file_names) {
      if (!database["file_names"][file_name]) {
        database["file_names"][file_name] = answer;
      }
      if (!database["review"][file_name]) {
        database["review"][file_name] = {
          thumbs_up: 0,
          thumbs_down: 0,
        };
      }
    }
    console.log("Updated database");
    saveDatabase();
  } catch (error) {
    console.error(`Error while updating database: ${error}`);
  }
};

/**
 * Create a new question in the database.
 * @param {String} question - the question to be added.
 */
const createQuestion = (question, answerType) => {
  try {
    if (database.questions.some(({ value }) => value == question)) {
      console.log("Question already exists");
      return;
    }
    database["questions"].push({ value: question, answerType });
    Object.keys(database["file_names"]).forEach((file) => {
      database["file_names"][file].push("");
    });
    saveDatabase(); // save the database after a new post is created
  } catch (error) {
    console.error(`Error while creating question: ${error}`);
  }
};

/**
 * Delete a question and its associated answers from the database.
 * @param {String} question - the question to be deleted.
 */
const deleteQuestionAndAnswer = (question) => {
  try {
    const question_index = database["questions"].findIndex(
      ({ value }) => value === question
    );
    if (question_index === -1) {
      console.log("Question not found");
      return;
    }
    database["questions"].splice(question_index, 1);
    Object.keys(database["file_names"]).forEach((file) => {
      database["file_names"][file].splice(question_index, 1);
    });
    saveDatabase();
  } catch (error) {
    console.error(`Error while deleting question and answer: ${error}`);
  }
};

/**
 * Update the answer of a specific question in a specific file.
 * @param {String} file_name - the name of the file.
 * @param {String} question - the question to be updated.
 * @param {String} answer - the new answer.
 */
const updateAnswer = (file_name, question, answer) => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    const question_index = database["questions"].findIndex(
      ({ value }) => value === question
    );
    if (question_index === -1) {
      return;
    }
    database["file_names"][file_name][question_index] = answer;
    saveDatabase();
  } catch (error) {
    console.error(`Error while updating answer: ${error}`);
  }
};

/**
 * Add a filename to the 'finished' list in the database.
 * @param {String} file_name - the name of the file.
 */
const addFinished = (file_name) => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    const fileExists = database["finished"].includes(file_name);
    if (!fileExists) {
      database["finished"].push(file_name);
    }
    saveDatabase();
  } catch (error) {
    console.error(`Error while making finished: ${error}`);
  }
};

/**
 * Remove a filename from the 'finished' list in the database.
 * @param {String} file_name - the name of the file.
 */
const deleteFinished = (file_name) => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    const index = database["finished"].indexOf(file_name);
    if (index === -1) {
      return;
    }
    database["finished"].splice(index, 1);
    saveDatabase();
  } catch (error) {
    console.error(`Error while deleting finished: ${error}`);
  }
};

/**
 * Get all the data from the database.
 * @return {Object} an object containing all data from the database.
 */
const getEverything = () => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    return database;
  } catch (error) {
    console.error(`Error while getting everything: ${error}`);
    return {};
  }
};

const thumbsUp = (file_name) => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    database["review"][file_name]["thumbs_up"] = 1;
    if (database["review"][file_name]["thumbs_down"] > 0) {
      database["review"][file_name]["thumbs_down"] = 0;
    }
    saveDatabase();
  } catch (error) {
    console.error(`Error while thumbs up: ${error}`);
  }
};

const thumbsDown = (file_name) => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    database["review"][file_name]["thumbs_down"] = 1;
    if (database["review"][file_name]["thumbs_up"] > 0) {
      database["review"][file_name]["thumbs_up"] = 0;
    }
    saveDatabase();
  } catch (error) {
    console.error(`Error while thumbs down: ${error}`);
  }
};

/**
 * Get all filenames in the 'finished' list from the database.
 * @return {Array} an array of all 'finished' filenames.
 */
const getAllFinishedFiles = () => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    return JSON.stringify(database["finished"]);
  } catch (error) {
    console.error(`Error while getting all finished files: ${error}`);
    return [];
  }
};

/**
 * Get all questions from the database.
 * @return {Array} an array of all questions.
 */
const getAllQuestions = () => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    // return stringified array of all questions
    return JSON.stringify(database["questions"]);
  } catch (error) {
    console.error(`Error while getting all questions: ${error}`);
    return [];
  }
};

/**
 * Get all questions and answers associated with a specific filename from the database.
 * @param {String} file_name - the name of the file.
 * @return {Array} an array of objects, each containing a question and its associated answer.
 */
const getAllQuestionAndAnswerFromFileName = (file_name) => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    if (!database["file_names"][file_name]) {
      return [];
    }
    const answers = database["file_names"][file_name];
    let ret = [];
    for (let i = 0; i < database.questions.length; i++) {
      ret.push({
        question: database.questions[i].value,
        answerType: database.questions[i].answerType,
        answer: answers[i],
      });
    }
    return ret;
  } catch (error) {
    console.error(
      `Error while getting all questions and answers from filename: ${error}`
    );
    return [];
  }
};

/**
 * Delete all records associated with a given filename.
 * @param {String} file_name - the name of the file to be deleted.
 * @param {Function} callback - callback function to handle results.
 */
const deleteFileRecord = (file_name, callback) => {
  try {
    if (fs.existsSync(databasePath)) {
      let rawdata = fs.readFileSync(databasePath);
      database = JSON.parse(rawdata);
    }
    // Check if file_name exists in the database
    if (!database["file_names"][file_name]) {
      return callback(new Error("Filename not found in database"));
    }

    // Delete answers associated with file_name
    delete database["file_names"][file_name];

    // Delete the review of file_name
    if (database["review"][file_name]) {
      delete database["review"][file_name];
    }

    // Delete file_name from the finished list
    const finishedIndex = database["finished"].indexOf(file_name);
    if (finishedIndex !== -1) {
      database["finished"].splice(finishedIndex, 1);
    }

    // Save the updated database
    saveDatabase();

    callback(null); // No error, successfully deleted records
  } catch (error) {
    callback(error);
  }
};

module.exports = {
  getAllFileNames,
  createQuestion,
  getAllQuestionAndAnswerFromFileName,
  updateAnswer,
  getEverything,
  getAllQuestions,
  deleteQuestionAndAnswer,
  updateDatabase,
  addFinished,
  deleteFinished,
  getAllFinishedFiles,
  thumbsUp,
  thumbsDown,
  deleteFileRecord,
};

// const fs = require('fs');
// const path = require('path');
// const { Parser } = require('json2csv');

// let databasePath = path.join(__dirname, 'database.json');
// let database = {
//     "questions" : [],
//     "file_names" : {}
// }
// // {
// //     "questions": ["question1", "questions2"],
// //     "file_names": {
// //         "file_name1": ["answer1", "answer2"],
// //         "file_name2": ["answer1", "answer2"],
// //     }
// // }

// // Load existing data from file if it exists
// // Else create a new database
// if (fs.existsSync(databasePath)) {
//     let rawdata = fs.readFileSync(databasePath);
//     try {
//         database = JSON.parse(rawdata);
//     } catch (error) {
//         initDatabase();
//     }
// }

// const saveDatabase = () => {
//     console.log('Saving database...');
//     let data = JSON.stringify(database);
//     fs.writeFileSync(databasePath, data);
//     console.log('Database saved!');
// }

// const getAllFileNames = () => {
//     const all_file_names = fs.readdirSync(path.join(__dirname, '../uploads'));
//     const allowedFileTypes = ['.txt', '.pdf'];
//     const filteredFiles = all_file_names.filter((file) =>
//         allowedFileTypes.includes(path.extname(file))
//     );
//     return filteredFiles;
// }

// const initDatabase = () => {
//     const all_file_names = getAllFileNames();
//     const file_names_obj = {};
//     all_file_names.forEach((file) => {
//         file_names_obj[file] = [];
//     })
//     database = {
//         "questions" : [],
//         "file_names" : file_names_obj,
//     }
//     saveDatabase();
// }

// const updateDatabase = () => {
//     const all_file_names = getAllFileNames();
//     let answer = [];
//     for (let i = 0; i < database.questions.length; i++) {
//         answer.push("");
//     }
//     for (let file_name of all_file_names) {
//         if (!database["file_names"][file_name]) {
//             database["file_names"][file_name] = answer;
//         }
//     }
//     saveDatabase();
// }

// const createQuestion = (question) => {
//     if (database.questions.includes(question)) {
//         console.log("Question already exists");
//         return;
//     }
//     database["questions"].push(question);
//     Object.keys(database["file_names"]).forEach((file) => {
//         database["file_names"][file].push("");
//     })
//     saveDatabase(); // save the database after a new post is created
// }

// // Delete
// const deleteQuestionAndAnswer = (question) => {
//     const question_index = database["questions"].indexOf(question);
//     if (question_index === -1) {
//         console.log("Question not found")
//         return;
//     }
//     database["questions"].splice(question_index, 1);
//     Object.keys(database["file_names"]).forEach((file) => {
//         database["file_names"][file].splice(question_index, 1);
//     })
//     saveDatabase();
// }

// // Update
// const updateAnswer = (file_name, question, answer) => {
//     const question_index = database["questions"].indexOf(question);
//     if (question_index === -1) {
//         return;
//     }
//     database["file_names"][file_name][question_index] = answer;
//     saveDatabase();
// }

// // Get
// const getEverything = () => {
//     return JSON.stringify(database);
// }

// const getAllQuestions = () =>  {
//     // return stringified array of all questions
//     return JSON.stringify(database["questions"]);
// }

// const getAllQuestionAndAnswerFromFileName = (file_name) => {
//     if (!database["file_names"][file_name]) {
//         return []
//     }
//     const answers = database["file_names"][file_name]
//     let ret = [];
//     for (let i = 0; i < answers.length; i++) {
//         ret.push({
//             question: database.questions[i],
//             answer: answers[i],
//         })
//     }
//     return JSON.stringify(ret);
// }

// module.exports = {
//     getAllQuestionAndAnswerFromFileName,
//     updateAnswer,
//     getEverything,
//     getAllQuestions,
//     deleteQuestionAndAnswer,
// }v
