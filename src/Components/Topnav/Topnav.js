import React, { useState, useEffect, useContext } from "react";
import "./Topnav.css";
import leadzillaIcon from "../../Assets/leadzilla-logo.svg";
import { signOut } from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Avatar, Divider, Popover, Button } from "antd";
import { RocketOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { Link } from "react-router-dom";
import { CurrencyDollarIcon, LinkIcon } from "@heroicons/react/solid";
import { CreditCountContext } from "../../Context/CreditCountContext";
import { UpdateUserProfileWithNewData } from "../../firebase-config.js";

export default function Topnav() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [credits, setCredits] = useState(0);

  const [CreditCount, setCreditCount] = useContext(CreditCountContext);

  const serverURL = process.env.REACT_APP_SERVER_URL;
  // const serverURL = "http://localhost:6060";

  let navigate = useNavigate();
  var location = useLocation();
  const loggedInUser = auth.currentUser;

  const navLinkSelectedStyle = {
    background: "#e2e8ff",
    color: "#3c67ff",
  };

  const navLinkUnselectedStyle = {
    background: "transparent",
  };
  const accountPopupContent = (
    <div className="popover-container">
      <h3 className="popover-text">{userName}</h3>
      <h3 className="popover-text">{userEmail}</h3>
      <Divider />

      <Link to="/integration">
        <div className="popover-link-containers">
          <LinkIcon
            style={{
              fontSize: "20px",
              height: "20px",
              margin: "0px 5px 0px 0px",
            }}
            color={"#4659ff"}
          />
          <h3 className="popover-text">Integrations</h3>
        </div>
      </Link>

      <a
        href="https://chrome.google.com/webstore/detail/leadzilla/mlknnmdepgmefemphhdombdflfgceejg"
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="popover-link-containers">
          <RocketOutlined
            style={{
              fontSize: "20px",
              height: "20px",
              margin: "0px 5px 0px 0px",
            }}
            color={"#4659ff"}
          />
          <h3 className="popover-text">Install Extension</h3>
        </div>
      </a>

      <Divider />
      <Button
        danger
        ghost
        onClick={() => {
          LogOut();
        }}
      >
        Log Out
      </Button>
    </div>
  );

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

  //fetch chargebee hosted page link
  const getChargebeeHostedPageInfo = async () => {
    try {
      // Get logged-in user data
      const loggedInUser = auth.currentUser;
      if (loggedInUser !== null) {
        const firebaseUUID = loggedInUser.uid;

        // request chargebee hosted page URL
        const response = await axios.get(
          `${serverURL}/new-subscription?firebase_uuid=${firebaseUUID}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);
        var hostedPageUrl = response.data.hosted_page.url;

        //? open new widnow with ChargeBee payment link
        window.open(`${hostedPageUrl}`, "_blank");
      } else {
        console.log("login first to start billing");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (loggedInUser !== null) {
      setUserName(loggedInUser.displayName);
      setUserEmail(loggedInUser.email);
      setUserPhoto(loggedInUser.photoURL);
      console.log(loggedInUser.photoURL);

      const uid = loggedInUser.uid;
      onSnapshot(doc(db, "users", `${uid}`), (doc) => {
        // console.log("Current data: ", doc.data());
        let credits = doc.data().credits;
        setCredits(credits);
        setCreditCount(credits);
        console.log("top nav credit info", credits);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="Topnav">
        <img
          className="leadzilla-logo"
          src={leadzillaIcon}
          alt="leadzilla-logo"
          onClick={() => {
            navigate("/search/people");
          }}
        />

        <div className="nav-links">
          <Link to="/search/people">
            <h1
              style={
                location.pathname.includes("/search")
                  ? navLinkSelectedStyle
                  : navLinkUnselectedStyle
              }
              className="nav-link"
            >
              Search
            </h1>
          </Link>

          <Link to="/track/company">
            <h1
              style={
                location.pathname.includes("/track")
                  ? navLinkSelectedStyle
                  : navLinkUnselectedStyle
              }
              // style={{ display: "none" }}
              className="nav-link"
            >
              Track
            </h1>
          </Link>

          <Link to="/email_writer">
            <h1
              style={
                location.pathname === "/email_writer"
                  ? navLinkSelectedStyle
                  : navLinkUnselectedStyle
              }
              className="nav-link"
            >
              Email Writer
            </h1>
          </Link>
        </div>

        <div className="account-info">
          <button onClick={getChargebeeHostedPageInfo}>
            <CurrencyDollarIcon style={{ height: "25px" }} color={"#4659ff"} />
            Billing
          </button>

          <div className="credits">
            <h1>{credits}</h1>
            {credits !== null ? <p>credits</p> : ""}
          </div>

          {/* <Button onClick={UpdateUserProfileWithNewData}>
            Update USER data (DEV)
          </Button> */}

          <div className="profile-pic">
            <Popover
              placement="bottomRight"
              content={accountPopupContent}
              title={false}
              trigger="hover"
            >
              {userPhoto ? (
                <img
                  src={userPhoto}
                  className="user-profile-photo"
                  alt="user"
                />
              ) : (
                // <Avatar size={45} icon={<UserOutlined />} />
                <Avatar
                  size={45}
                  style={{ background: "#4659ff", color: "#fff" }}
                  icon={<UserOutlined />}
                />
              )}
            </Popover>
          </div>
        </div>

        {/* <h1>Leadzilla</h1> */}
      </div>
    </>
  );
}
