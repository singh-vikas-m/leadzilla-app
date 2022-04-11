import React, { useState } from "react";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase-config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { Button } from "antd";

export default function Home() {
  const [user, setUser] = useState(null);

  let navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("user logged in");
      setUser(user);
    } else {
      console.log("user not logged in");
      navigate("/login");
    }
  });

  const LogOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigate("/login");
      })
      .catch((error) => {
        // An error happened.
        console.log(error);
      });
  };

  return user ? (
    <div className="Home">
      <Topnav />
      <h1>Home Page</h1>

      <Button style={{ marginTop: "100px" }} danger onClick={LogOut}>
        Log out
      </Button>
    </div>
  ) : (
    <Spin size="large" />
  );
}
