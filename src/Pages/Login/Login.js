import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import {
  signInWithGoogle,
  auth,
  createCraeteUserInFirestore,
} from "../../firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  let navigate = useNavigate();

  // redirect on main page when login state change
  auth.onAuthStateChanged((user) => {
    if (user) {
      navigate("/home");
    }
  });

  const handleEmailInputChange = (e) => {
    e.preventDefault();
    setEmail(e.target.value);
  };

  const handlePasswordInputChange = (e) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const logInWithEmailPassword = async (email, password) => {
    console.log("login with email password");
    // Signed in
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        console.log(error.message);
        console.log(error.code);
        setErrorMessage(`${error.code.replace("auth/", "")}`);
      });
  };

  const signUpWithEmailPassword = async (email, password) => {
    console.log("signup with email password");
    // Signup
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        createCraeteUserInFirestore(user.uid, user.email);
      })
      .then(() => {
        logInWithEmailPassword(email, password);
      })
      .catch((error) => {
        console.log(error.message);
        console.log(error.code);
        setErrorMessage(`${error.code.replace("auth/", "")}`);
      });
  };

  return (
    <div className="Login">
      <div className="card">
        <input
          type="email"
          placeholder="Email"
          onChange={handleEmailInputChange}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={handlePasswordInputChange}
        />

        <h1 className="auth-error-message">{errorMessage}</h1>

        <button
          className="login-button"
          onClick={() => {
            signUpWithEmailPassword(email, password);
          }}
        >
          Create Account
        </button>
        <button
          className="login-button"
          onClick={() => {
            logInWithEmailPassword(email, password);
          }}
        >
          Login
        </button>
        <h3>OR</h3>
        <button className="google-auth-button" onClick={signInWithGoogle}>
          Sign in with google
        </button>
      </div>
    </div>
  );
}

export default Login;
