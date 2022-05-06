import React, { useState, useEffect } from "react";
import "./Topnav.css";
import leadzillaIcon from "../../Assets/leadzilla-logo.png";
import { signOut } from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { Popover, Button } from "antd";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";
import { CurrencyDollarIcon } from "@heroicons/react/solid";

export default function Topnav() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [creditCount, setCreditCount] = useState(0);

  const serverURL = process.env.REACT_APP_SERVER_URL;

  let navigate = useNavigate();
  const loggedInUser = auth.currentUser;

  const accountPopupContent = (
    <div>
      <p>{userName}</p>
      <p>{userEmail}</p>
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
        setCreditCount(doc.data().credits);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Topnav">
      {/* <img
        className="leadzilla-logo"
        src={leadzillaIcon}
        alt="leadzilla-logo"
      /> */}

      <div className="leadzilla-logo">
        <svg
          style={{ display: "none" }}
          className="leadzilla-logo"
          width="70"
          height="70"
          viewBox="0 0 70 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="35"
            cy="35"
            r="32.5"
            fill="#6F4CEF"
            stroke="white"
            strokeWidth="5"
          />
          <path
            d="M14.0156 39.2235C12.6155 46.8235 11.9165 57.0833 11.9998 61C17.5997 67.8 27.5832 69.0833 31.5 69.5C31.7 64.3 32.0157 59.5568 32.2657 57.4735C33.2657 49.9735 34.0157 46.2235 34.7657 42.9735C35.3657 40.3735 35.8918 40.4735 36.7657 40.4735C37.8442 40.4735 41.3491 41.3902 43.0157 41.7235C46.6157 42.3235 49.4987 41.7235 50.9987 41.2499C53.2487 40.7499 56.0994 37.9487 56.4987 37.25C57.4987 35.5 57.9987 32.2499 57.2657 29.9735C55.6657 26.1735 54.7487 24.995 51.2657 22.4735C47.9987 20.1082 42.9324 18.4735 40.7657 17.7235C33.2486 15.75 29.6824 17.0569 28.0157 17.7235C24.0157 18.9235 20.6824 23.0569 19.5157 24.9735C15.9157 30.1735 14.3489 36.6402 14.0156 39.2235Z"
            fill="white"
          />
          <path
            d="M42.998 35C44.8277 37.6412 49.2892 41.3388 52.498 35H42.998Z"
            fill="#6F4CEF"
          />
          <circle cx="44.248" cy="27.25" r="1.25" fill="#6F4CEF" />
          <circle cx="50.248" cy="27.25" r="1.25" fill="#6F4CEF" />
          <path
            d="M29.5919 21.3156C28.5354 13.1621 31.4884 3.09905 38.8557 21.3647L29.5919 21.3156Z"
            fill="white"
            stroke="white"
          />
          <path
            d="M24.7649 22.1224C22.6279 16.945 20.5875 9.1445 29.5221 19.3622L24.7649 22.1224Z"
            fill="white"
            stroke="white"
          />
          <path
            d="M19.6595 25.1163C17.0537 21.9902 14.1062 16.7657 23.1628 20.8764L19.6595 25.1163Z"
            fill="white"
            stroke="white"
          />
          <path
            d="M18.1926 31.1864C14.5239 29.4248 9.673 25.8961 19.6188 25.8746L18.1926 31.1864Z"
            fill="white"
            stroke="white"
          />
          <path
            d="M17.2886 44.3765C14.7476 43.9128 11.7673 43.3947 17.624 41.5L17.2886 44.3765Z"
            fill="white"
            stroke="white"
          />
          <path
            d="M15.2139 40.8765C12.6729 40.4128 9.69262 39.8947 15.5493 38L15.2139 40.8765Z"
            fill="white"
            stroke="white"
          />
          <path
            d="M15.0729 35.7499C12.532 35.2862 9.82297 34.3947 15.6797 32.4999L15.0729 35.7499Z"
            fill="white"
            stroke="white"
          />
        </svg>

        <svg
          className="leadzilla-logo"
          width="70"
          height="70"
          viewBox="0 0 70 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="35"
            cy="35"
            r="32.5"
            fill="white"
            stroke="#6F4CEF"
            strokeWidth="5"
          />
          <path
            d="M14.0156 39.2235C12.6155 46.8235 11.9165 57.0833 11.9998 61C17.5997 67.8 27.5832 69.0833 31.5 69.5C31.7 64.3 32.0157 59.5568 32.2657 57.4735C33.2657 49.9735 34.0157 46.2235 34.7657 42.9735C35.3657 40.3735 35.8918 40.4735 36.7657 40.4735C37.8442 40.4735 41.3491 41.3902 43.0157 41.7235C46.6157 42.3235 49.4987 41.7235 50.9987 41.2499C53.2487 40.7499 56.0994 37.9487 56.4987 37.25C57.4987 35.5 57.9987 32.2499 57.2657 29.9735C55.6657 26.1735 54.7487 24.995 51.2657 22.4735C47.9987 20.1082 42.9324 18.4735 40.7657 17.7235C33.2486 15.75 29.6824 17.0569 28.0157 17.7235C24.0157 18.9235 20.6824 23.0569 19.5157 24.9735C15.9157 30.1735 14.3489 36.6402 14.0156 39.2235Z"
            fill="#6F4CEF"
          />
          <path
            d="M42.998 35C44.8277 37.6412 49.2892 41.3388 52.498 35H42.998Z"
            fill="white"
          />
          <circle cx="44.248" cy="27.25" r="1.25" fill="white" />
          <circle cx="50.248" cy="27.25" r="1.25" fill="white" />
          <path
            d="M29.5909 21.3156C28.5344 13.1621 31.4875 3.09905 38.8547 21.3647L29.5909 21.3156Z"
            fill="#6F4CEF"
            stroke="#6F4CEF"
          />
          <path
            d="M24.7644 22.1224C22.6274 16.945 20.5871 9.1445 29.5216 19.3622L24.7644 22.1224Z"
            fill="#6F4CEF"
            stroke="#6F4CEF"
          />
          <path
            d="M19.659 25.1163C17.0532 21.9902 14.1057 16.7657 23.1624 20.8764L19.659 25.1163Z"
            fill="#6F4CEF"
            stroke="#6F4CEF"
          />
          <path
            d="M18.1921 31.1864C14.5234 29.4248 9.67252 25.8961 19.6183 25.8746L18.1921 31.1864Z"
            fill="#6F4CEF"
            stroke="#6F4CEF"
          />
          <path
            d="M17.2876 44.3765C14.7467 43.9128 11.7664 43.3947 17.6231 41.5L17.2876 44.3765Z"
            fill="#6F4CEF"
            stroke="#6F4CEF"
          />
          <path
            d="M15.2134 40.8765C12.6724 40.4128 9.69214 39.8947 15.5488 38L15.2134 40.8765Z"
            fill="#6F4CEF"
            stroke="#6F4CEF"
          />
          <path
            d="M15.0724 35.7499C12.5315 35.2862 9.82248 34.3947 15.6792 32.4999L15.0724 35.7499Z"
            fill="#6F4CEF"
            stroke="#6F4CEF"
          />
        </svg>
      </div>

      <div className="nav-links">
        <Link to="/search">
          <h1 className="nav-link">Search</h1>
        </Link>
        <Link to="/email_writer">
          <h1 className="nav-link">Email Writer</h1>
        </Link>
      </div>

      <div className="account-info">
        <button onClick={getChargebeeHostedPageInfo}>
          <CurrencyDollarIcon
            style={{ height: "25px" }}
            className="heroicons"
            color={"#ffffff"}
          />
          Billing
        </button>

        <div className="credits">
          <h1>{creditCount}</h1>
          {creditCount !== null ? <p>credits</p> : ""}
        </div>

        <div className="profile-pic">
          <Popover
            placement="bottomRight"
            content={accountPopupContent}
            title="Account"
            trigger="hover"
          >
            {userPhoto ? (
              <img src={userPhoto} className="user-profile-photo" alt="user" />
            ) : (
              // <Avatar size={45} icon={<UserOutlined />} />
              <Avatar
                size={45}
                style={{ background: "#fff", color: "#6f4cef" }}
                icon={<UserOutlined />}
              />
            )}
          </Popover>
        </div>
      </div>

      {/* <h1>Leadzilla</h1> */}
    </div>
  );
}
