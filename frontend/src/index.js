import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/homePage";
import UploadPage from "./pages/uploadPage";
import AnnotatePage from "./pages/annotatePage";
import DownloadPage from "./pages/downloadPage";
import CustomizePage from "./pages/customizePage";
import LoginPage from "./pages/loginPage";
import SignupPage from "./pages/signupPage";
import AdminPage from "./pages/adminPage"
import ReviewPage from "./pages/reviewPage"
import ReviewAnnotatePage from "./pages/reviewAnnotatePage";
import "./index.css";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/customize",
        element: <CustomizePage />,
      },
      {
        path: "/upload",
        element: <UploadPage />,
      },
      {
        path: "/annotate",
        element: <AnnotatePage />,
      },
      {
        path: "/download",
        element: <DownloadPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/admin",
        element: <AdminPage />,
      },
      {
        path: "/review",
        element: <ReviewPage />,
      },
      {
        path: "/reviewAnnotate",
        element: <ReviewAnnotatePage />,
      }
    ]
  },
]);

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
