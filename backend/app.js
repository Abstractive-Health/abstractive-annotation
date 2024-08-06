const express = require("express");
const multer = require("multer");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const db = require("./src/database.js");
const pw = require("./src/password.js");
const cookieParser = require("cookie-parser");
const { constants } = require("fs/promises");
const app = express();

function cleanText(text) {
  const cleanedText = text
    .replace(/[^\w\s.]|_/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
  return cleanedText;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    let file_name = file.originalname;
    // file_name = cleanText(file_name)
    cb(null, file_name);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; font-src 'self' http://localhost:3000;"
  );
  next();
});

// Signup
app.post("/api/signup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = pw.getUser(username);
  if (user !== undefined) {
    res.status(401).send("User already exists");
    return;
  }
  pw.addUser(username, password, false);
  res.send("Successfully signed up");
});

// Login
app.post("/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = pw.getUser(username);
  if (user === undefined) {
    res.status(401).send("User not found");
    return;
  }

  if (!pw.verifyPassword(username, password)) {
    res.status(402).send("Incorrect password");
    return;
  }

  // Save this session identifier in the database associated with the user
  const session_token = pw.updateUserSession(username);
  // Set a cookie in the user's browser with this session identifier
  res.cookie("session_token", session_token, { httpOnly: true }); // httpOnly flag to protect against cross-site scripting attacks
  res.json({ message: "Successfully logged in", session_token: session_token });
});

// Logout
app.get("/api/logout", (req, res) => {
  res.clearCookie("session_id");
  res.send("Logged out successfully");
});

// Check admin
app.get("/api/isAdmin", (req, res) => {
  const session_token = req.query.session_token;
  if (!pw.isAdmin(session_token)) {
    res.status(401).send("Unauthorized");
    return;
  }
  res.send("passed");
});

// get all usernames
app.get("/api/AllUsername", (req, res) => {
  const session_token = req.query.session_token;
  res.json(pw.getAllUsername(session_token));
});

// get allowed projects by username
app.get("/api/AllowedFiles", (req, res) => {
  let username = req.query.username;
  if (!username) {
    const session_token = req.query.session_token;
    const user = pw.getUserBySessionToken(session_token);
    if (user === undefined) {
      res.status(401).send("User not found");
      return;
    }
    username = user.username;
  }
  res.json(pw.getAllowedFiles(username));
});

// add allowed file name by username
app.patch("/api/addAllowedFile", (req, res) => {
  const username = req.body.username;
  const file_name = req.body.fileName;
  pw.addAllowedFile(username, file_name);
  res.send("Successfully updated");
});

// delete allowed file name by username
app.patch("/api/deleteAllowedFile", (req, res) => {
  const username = req.body.username;
  const file_name = req.body.fileName;
  pw.deleteAllowedFile(username, file_name);
  res.send("Successfully updated");
});

// pw end
// Upload a file
app.post("/api/upload", upload.array("files"), function (req, res, next) {
  const session_token = req.query.session_token;
  if (!pw.isAdmin(session_token)) {
    res.status(401).send("Unauthorized");
    return;
  }
  // req.files is array of `files` files
  // req.body will contain the text fields, if there were any
  db.updateDatabase();
  res.send("Successfully uploaded!");
});

// Get all file names
app.get("/api/fileNames", (req, res) => {
  const directoryPath = path.join(__dirname, "uploads");
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.log("Unable to scan directory: " + err);
      res.status(500).send("Unable to scan directory");
      return;
    }
    const allowedFileTypes = [".txt", ".pdf", ".csv"];
    const filteredFiles = files.filter((file) =>
      allowedFileTypes.includes(path.extname(file))
    );
    res.json(filteredFiles);
  });
});

// Get one file by file name
app.get("/api/files", (req, res) => {
  const directoryPath = path.join(__dirname, "uploads");
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.log("Unable to scan directory: " + err);
      res.status(500).send("Unable to scan directory");
      return;
    }

    const allowedFileTypes = [".txt", ".pdf", ".csv"];
    const filteredFiles = files.filter((file) =>
      allowedFileTypes.includes(path.extname(file))
    );

    for (const file of filteredFiles) {
      if (file === req.query.filename) {
        // Send file to client
        res.sendFile(path.join(directoryPath, req.query.filename));
        return;
      }
    }

    // If we got here, file was not found
    res.status(404).send("File not found");
  });
});

// Create a question
app.post("/api/question", (req, res) => {
  try {
    const question = req.body.question;
    const answerType = req.body.answerType;
    db.createQuestion(question, answerType);
    res.status(200).json({ question, answerType });
  } catch {
    res.status(500);
  }
});

// Get all questions
app.get("/api/question", (req, res) => {
  const file_name = req.query.fileName;
  const questions = db.getAllQuestions();
  res.json(questions);
});

// Delete a question by itself
app.delete("/api/question", (req, res) => {
  const question = req.query.question;
  db.deleteQuestionAndAnswer(question);
  res.send("Successfully deleted");
});

// Update answer of a question in a designated file
app.patch("/api/answer", (req, res) => {
  const question = req.body.question;
  const answer = req.body.answer;
  const file_name = req.body.fileName;
  db.updateAnswer(file_name, question, answer);
  res.send("Successfully updated");
});

// Get everything
app.get("/api/everything", (req, res) => {
  const everything = db.getEverything();
  res.json(everything);
});

app.get("/api/qa", (req, res) => {
  const file_name = req.query.fileName;
  const qa = db.getAllQuestionAndAnswerFromFileName(file_name);
  res.json(qa);
});

// Update finished
app.patch("/api/addFinished", (req, res) => {
  const file_name = req.body.fileName;
  db.addFinished(file_name);
  res.send("Successfully updated");
});

// Delete from finished
app.patch("/api/deleteFinished", (req, res) => {
  const file_name = req.body.fileName;
  db.deleteFinished(file_name);
  res.send("Successfully updated");
});

// Get finished
app.get("/api/getFinished", (req, res) => {
  const finished = db.getAllFinishedFiles();
  res.json(finished);
});

// Thumbs up
app.patch("/api/thumbsUp", (req, res) => {
  const file_name = req.body.fileName;
  const question = req.body.question;
  db.thumbsUp(file_name, question);
  res.send("Successfully updated");
});

// Thumbs down
app.patch("/api/thumbsDown", (req, res) => {
  const file_name = req.body.fileName;
  const question = req.body.question;
  db.thumbsDown(file_name, question);
  res.send("Successfully updated");
});

app.delete("/api/deleteFiles", (req, res) => {
  const fileNames = req.body.fileNames; // Expect an array of filenames
  const directoryPath = path.join(__dirname, "uploads");

  let errors = [];

  const deleteNextFile = (index) => {
    if (index === fileNames.length) {
      if (errors.length) {
        res
          .status(500)
          .send(`Failed to delete some files: ${errors.join(", ")}`);
        return;
      }
      res.send("Files and their records successfully deleted");
      return;
    }

    const fileName = fileNames[index];

    // 1. Delete the file from the folder
    fs.unlink(path.join(directoryPath, fileName), (err) => {
      if (err) {
        console.error(`Failed to delete the file: ${err.message}`);
        errors.push(fileName);

        // Move to next file
        deleteNextFile(index + 1);
        return;
      }

      // 2. Delete the file record from the database
      db.deleteFileRecord(fileName, (dbErr) => {
        if (dbErr) {
          console.error(`Failed to delete the file record: ${dbErr.message}`);
          errors.push(fileName);
        }
        pw.deleteAllowedFileFromAllUsers(fileName);
        // Move to next file
        deleteNextFile(index + 1);
      });
    });
  };

  deleteNextFile(0);
});

module.exports = app;
