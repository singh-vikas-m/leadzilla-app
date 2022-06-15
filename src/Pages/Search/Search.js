import React, { useEffect, useState, useContext } from "react";
import "./Search.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, fetchCompanyList, saveCompany } from "../../firebase-config";
import { arrayRemove, doc, onSnapshot, updateDoc } from "firebase/firestore";
import PeopleSearch from "../../Components/PeopleSearch/PeopleSearch";
import CompanySearch from "../../Components/CompanySearch/CompanySearch";

import {
  useNavigate,
  Link,
  useSearchParams,
  useParams,
} from "react-router-dom";
import {
  Button,
  Table,
  Select,
  Drawer,
  Space,
  Divider,
  Spin,
  Tree,
  Tag,
  Tabs,
  Popover,
  Cascader,
} from "antd";

import axios from "axios";
import {
  UserGroupIcon,
  LinkIcon,
  OfficeBuildingIcon,
  LibraryIcon,
  TrendingUpIcon,
  LocationMarkerIcon,
  BriefcaseIcon,
  StarIcon,
  UsersIcon,
  ServerIcon,
  UserIcon,
} from "@heroicons/react/outline";
import { CSVLink } from "react-csv";
import LogRocket from "logrocket";

import { industryCascaderOptions, country_list } from "../../Utils/list.js";
import {
  FacebookFilled,
  LinkedinFilled,
  TwitterSquareFilled,
} from "@ant-design/icons";
import { UserIdContext } from "../../Context/UserIdContext";
import { CreditCountContext } from "../../Context/CreditCountContext";

LogRocket.init("7ahtfn/leadzilla-search-console");

var accessToken = "";
var currentCredit = 0;

export default function Search() {
  //misc states
  const [loggedInUser, setLoggedInUser] = useState(false);

  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");
  const [UserId, setUserId] = useContext(UserIdContext);
  const [CreditCount, setCreditCount] = useContext(CreditCountContext);

  // const [accessToken, setAccessToken] = useState("");

  let navigate = useNavigate();
  const { TabPane } = Tabs;

  var { search_type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    console.log("params", search_type);
  }, [search_type]);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      //console.log("user logged in");

      //fetch and saved firebase auth access token
      await user.getIdToken().then((token) => {
        // setAccessToken(token);
        accessToken = token;
        //console.log(token);
      });

      setLoggedInUser(user);
      setFirebaseAuthUUID(user.uid);
      setUserId(user.uid);

      onSnapshot(doc(db, "users", `${user.uid}`), (doc) => {
        //console.log("Current data: ", doc.data());
        currentCredit = doc.data().credits;
        setCreditCount(currentCredit);
        console.log("test", currentCredit);
      });

      //identify user in logRocket
      LogRocket.identify(`${user.uid}`, {
        name: user.displayName || "none",
        email: user.email,
      });
    } else {
      console.log("user not logged in");
      navigate("/login");
    }
  });

  function onTabChange(key) {
    // change url route as tab changes
    //console.log(key);
    if (key === "company") {
      navigate("/search/company");
    } else if (key === "people") {
      navigate("/search/people");
    }
  }

  return loggedInUser ? (
    <div className="Search">
      <Topnav />
      <div className="bottom-nav">
        <Tabs
          style={{ margin: "2px 0px 0px 5.5vw" }}
          defaultActiveKey="people"
          onChange={onTabChange}
          size={"medium"}
        >
          <TabPane tab="People" key="people" />
          <TabPane tab="Companies" key="company" />
        </Tabs>
      </div>
      <div className="content">
        {search_type === "company" ? (
          <CompanySearch credits={currentCredit} />
        ) : (
          <PeopleSearch credits={currentCredit} />
        )}
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
