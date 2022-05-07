import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import {
  signInWithGoogle,
  auth,
  createUserInFirestore,
} from "../../firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import LeadzillaLogo from "../../Assets/leadzilla-full-logo.png";
import { notification, Divider } from "antd";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  let navigate = useNavigate();

  // redirect on main page when login state change
  auth.onAuthStateChanged((user) => {
    if (user) {
      navigate("/");
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
        setErrorMessage(`${error.code.replace("auth/", "").replace("-", " ")}`);
      });
  };

  const signUpWithEmailPassword = async (email, password) => {
    console.log("signup with email password");
    // Signup
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        createUserInFirestore(user.uid, user.email);
      })
      .then(() => {
        logInWithEmailPassword(email, password);
      })
      .catch((error) => {
        console.log(error.message);
        console.log(error.code);
        setErrorMessage(`${error.code.replace("auth/", "").replace("-", " ")}`);
      });
  };

  const resetPassword = async (email) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log("password reset requested");
        // open notification
        notification["success"]({
          description: `Password reset link sent to ${email}`,
        });
      })
      .catch((error) => {
        console.log(error.message);
        setErrorMessage(`${error.code.replace("auth/", "").replace("-", " ")}`);
      });
  };

  return (
    <div className="Login">
      <img src={LeadzillaLogo} alt="" style={{ margin: "0 0 20px 0" }} />

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
        <Divider />
        <button className="google-auth-button" onClick={signInWithGoogle}>
          Sign in with google
        </button>
        <button
          className="button-link"
          onClick={() => {
            console.log("password reset email sent");
            resetPassword(email);
          }}
        >
          Forgot password ?
        </button>
      </div>
    </div>
  );
}

export default Login;
