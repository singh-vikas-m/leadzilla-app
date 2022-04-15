import React from "react";
import "./App.css";
import Home from "./Pages/Home/Home.js";
import Search from "./Pages/Search/Search.js";
import Login from "./Pages/Login/Login.js";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Search />} />
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/search" element={<Search />} />
        <Route path="/Login" element={<Login />} />
        Search
        {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </div>
  );
}

export default App;
