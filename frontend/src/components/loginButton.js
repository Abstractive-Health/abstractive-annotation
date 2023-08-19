import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Cookies from 'js-cookie';
import '../styling/Home.css';

const LoginButton = (props) => {
  const [cookies, setCookie, removeCookie] = useCookies(['session_token']);
  const navigate = useNavigate();
  useEffect(() => {
    props.setIsSignedIn(cookies.session_token !== undefined);
  }, [cookies, props.isSignedIn]);

  const handleClick = () => {
    if (props.isSignedIn) {
      fetch('http://localhost:3000/api/logout', {
        method: 'GET',
      }).then((res) => {
        if (res.status === 200) {
          navigate('/');
          Cookies.remove('session_token')
          setCookie(null)
          window.location.reload();
        }
      });
    } else {
      navigate('/login')
    }
  }

  return (
    <div>
      <button onClick={handleClick} className='button-container'>
        {props.isSignedIn ? 'Logout' : 'Login'}
      </button>
    </div>
  );
};

export default LoginButton;
