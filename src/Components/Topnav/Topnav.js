import React from "react";
import "./Topnav.css";
import leadzillaIcon from "../../Assets/leadzilla-logo.png";

export default function Topnav() {
  return (
    <div className="Topnav">
      <img
        className="leadzilla-logo"
        src={leadzillaIcon}
        alt="leadzilla-logo"
      />
      {/* <h1>Leadzilla</h1> */}
    </div>
  );
}
