import React, { useState } from "react";
import "./Track.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase-config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { Button } from "antd";

export default function Track() {
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

  return user ? (
    <div className="Track">
      <Topnav />
      <div className="content">
        <h1>Track Page</h1>
      </div>
    </div>
  ) : (
    <Spin size="large" />
  );
}
