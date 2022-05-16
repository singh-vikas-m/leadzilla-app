import React from "react";
import "./App.css";
import Home from "./Pages/Home/Home.js";
import Search from "./Pages/Search/Search.js";
import Track from "./Pages/Track/Track.js";
import Company from "./Pages/Company/Company.js";

import Sequence from "./Pages/Sequence/Sequence.js";
import Login from "./Pages/Login/Login.js";
import { Routes, Route, Navigate } from "react-router-dom";

import LogRocket from "logrocket";
LogRocket.init("7ahtfn/leadzilla-search-console");

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/search" />} />
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/search" element={<Search />} />
        <Route path="/email_writer" element={<Sequence />} />
        <Route path="/track" element={<Track />} />
        <Route path="/company" element={<Company />} />
        <Route path="/Login" element={<Login />} />
        {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </div>
  );
}

export default App;
