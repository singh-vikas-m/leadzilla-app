import React, { useEffect, useState } from "react";
import "./Sequence.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Table,
  Select,
  Drawer,
  Space,
  Divider,
  Spin,
  Tree,
  Switch,
} from "antd";
import axios from "axios";

export default function Sequence() {
  //misc states
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [orgChartDrawerVisible, setOrgChartDrawerVisible] = useState(false);
  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [copyLoading, setCopyLoading] = useState(false);

  let navigate = useNavigate();

  // const serverURL = "http://localhost:6060";
  const serverURL = "https://leadzilla.herokuapp.com";

  var currentCredit = 0;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      //console.log("user logged in");
      setLoggedInUser(user);
      setFirebaseAuthUUID(user.uid);
      onSnapshot(doc(db, "users", `${user.uid}`), (doc) => {
        // console.log("Current data: ", doc.data());
        if (currentCredit === 0) {
          //console.log("credit loaded");
          currentCredit = doc.data().credits;
        } else {
          //console.log("credit exists");
        }
      });
    } else {
      console.log("user not logged in");
      navigate("/login");
    }
  });

  const handleCompanyNameInputChange = (e) => {
    e.preventDefault();
    setCompanyName(e.target.value);
  };

  const handleCompanyDescriptionInputChange = (e) => {
    e.preventDefault();
    setCompanyDescription(e.target.value);
  };

  const fetchEmailTemplates = async (productName, productDescription) => {
    /**
     * data contains paragraph as sample data, and other open ai
     * related setting taken directly from opan ai playground
     */

    var gpt3_data = {
      prompt: `Write an impactful and convincing cold email based on the product name and product description.\n\nProduct name: FitnessMarketer\nProduct description: A marketing service to help your gym get new clients repeatably\nEmail body: When your gym is seeking new clients, you may be seeking a marketing service.\nOur team has over 10 years of experience making sure your gym gets new clients, with no financial risk. We can help you grow your business.\nWe offer free trials, so you can try them before you buy.\nClick here to learn more about our gym marketing services.\n\nProduct name: Roambee\nProduct description: Roambee is an IoT solution that helps companies track shipments and give them real-time visibility.\nEmail body: Roambee is an IoT solution that helps companies track shipments and give them real-time visibility\nRoambee offers an app that allows businesses to track their shipments like never before. With its hardware, they can even monitor which areas of the vehicles are getting hotter, colder, or when containers are in motion.\nBy installing this system, customers can cut costs by identifying vehicle breakdowns before they happen. They can also prevent theft by better monitoring the location of their cargo while they are in transit.\nSign up now to learn more about Roambee and how it can help your business run more efficiently!\n\nProduct name: ${productName}\nProduct description: ${productDescription}\nEmail body:`,
      temperature: 0.5,
      max_tokens: 500,
      top_p: 1,
      best_of: 5,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    try {
      setCopyLoading(true);
      await axios
        .post(`${serverURL}/email`, JSON.stringify(gpt3_data), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
        .then((response) => {
          let searchResultData = response?.data;
          //console.log(searchResultData);
          setGeneratedCopy(searchResultData?.choices[0]?.text);
          setCopyLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return loggedInUser ? (
    <div className="Sequence">
      <Topnav />
      <div className="content">
        <div className="sequence-cards-container">
          <div className="sequence-input-card">
            <p>What is your product called ?</p>
            <input
              type="text"
              placeholder="eg: Leadzilla"
              onChange={handleCompanyNameInputChange}
            />

            <p>Describe your product ?</p>

            <textarea
              type="text"
              className="input-large"
              placeholder="eg: An AI powered tool for better sales prospecting and engagement"
              onChange={handleCompanyDescriptionInputChange}
            />
            <button
              className="primary-button"
              onClick={() => {
                fetchEmailTemplates(companyName, companyDescription);
              }}
            >
              Create copy
            </button>
          </div>
          <div className="sequence-result-card">
            <h3>Generated copy</h3>
            {copyLoading ? <Spin /> : <p>{generatedCopy}</p>}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spin size="large" />
    </div>
  );
}
