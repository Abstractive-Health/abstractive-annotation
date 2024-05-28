import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RedirectButton from "../components/redirectButton";
import "../styling/SignUp.css"

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const emailRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = (event) => {
    console.log("event")
    console.log(event)
    console.log("email")
    console.log(emailRef)
    console.log("password")
    console.log(passwordRef)
    event.preventDefault();
    const enteredEmail = emailRef.current.value;
    const enteredPassword = passwordRef.current.value;

    fetch(`${process.env.HOST}/api/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            },
        body: JSON.stringify({ username: enteredEmail, password: enteredPassword }),
    })
    .then((res) => {
        if (res.status === 401) {
            alert('User already exists');
        } else {
            navigate('/')
            alert('Successfully signed up');
        }
    });
  };

  return (
    <div className="App">
      <h1 className="abstractivetitle">Abstractive Health</h1>
      <nav>
        <RedirectButton buttonText="Home" buttonUrl="/home" />
        <RedirectButton buttonText="Upload" buttonUrl="/upload" />
        <RedirectButton buttonText="Customize" buttonUrl="/customize" />
        <RedirectButton buttonText="Annotate" buttonUrl="/annotate" />
        <RedirectButton buttonText="Download" buttonUrl="/download" />
      </nav>
      <div className='container'>
      <div className="signup">
        <form onSubmit={handleSubmit}>
          <h2>Sign Up Page</h2>
        <label htmlFor="email" style={{textAlign: "left"}}>Email:</label>
        <input
          id="email"
          type="email"
          ref={emailRef}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password" style={{textAlign: "left"}}>Password:</label>
        <input
          id="password"
          type="password"
          ref={passwordRef}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Sign Up</button>
      </form>
      </div>
      </div>
    </div>
  );
}

export default SignupPage;
