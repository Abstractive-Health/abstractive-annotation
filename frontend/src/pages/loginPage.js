import React, { useState, useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import "../styling/Login.css"

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        fetch(`${process.env.API_HOST}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username: username, password: password})
        })
        .then((res) => res.json()) // parsing the response
        .then((data) => {
            if (data.error) {
                if (data.status === 401) {
                    alert("User not found")
                } else if (data.status === 402) {
                    alert("Incorrect username or password")
                }
            } else {
                Cookies.set('session_token', data.session_token); // setting the cookie
                navigate('/')
                alert("Successfully logged in")
            }
        })
    }
    return (
        <div className="container">
        <div className="login">
          <h2>Login Form</h2>
          <div>
            <label>Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <button type="submit" onClick={handleSubmit}>
              Login
            </button>
          </div>

          <div>
            <p>
              To create a new account
              <a href="/signup"> Sign Up</a>
            </p>
          </div>
        </div>
        </div>
      );
    };

export default LoginPage;