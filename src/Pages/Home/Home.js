import React, { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";

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

  return user ? (
    <div className="Home">
      <h1>Home Page</h1>
    </div>
  ) : (
    <Spin size="large" />
  );
}
