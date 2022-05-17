import React, { useEffect, useState } from "react";
import "./Search.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { arrayRemove, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
  UserIcon,
} from "@heroicons/react/outline";
import { CSVLink } from "react-csv";
import LogRocket from "logrocket";
import {
  FacebookFilled,
  LinkedinFilled,
  TwitterCircleFilled,
  TwitterSquareFilled,
} from "@ant-design/icons";
LogRocket.init("7ahtfn/leadzilla-search-console");

export default function Search() {
  const [selectedOrgchartNodeKeys, setSelectedOrgchartNodeKeys] = useState([]);

  const onSelect = (selectedKeys, info) => {
    console.log("selected", selectedKeys, info);
  };

  const onOrgchartNodeSelect = (selectedKeysValue, info) => {
    console.log("onSelect", info);
    setSelectedOrgchartNodeKeys(selectedKeysValue);
  };

  //filter selector values
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState([]);
  const [selectedCompanySize, setSelectedCompanySize] = useState([]);
  const [selectedCompanyRevenue, setSelectedCompanyRevenue] = useState([]);
  const [selectedName, setSelectedName] = useState([]);
  const [selectedFirstName, setSelectedFirstName] = useState([]);
  const [selectedLastName, setSelectedLastName] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState([]);
  const [selectedCity, setSelectedCity] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [selectedState, setSelectedState] = useState([]);
  const [selectedZipCode, setSelectedZipCode] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState([]);

  //filter setting states
  const [titleExactMatch, setTitleExactMatch] = useState(false);
  const [cursorMark, setCursorMark] = useState("");
  const [resultLimit, setResultLimit] = useState(15);
  const [totalContactsAvailable, setTotalContactsAvailable] = useState("");

  //misc states
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [orgChartDrawerVisible, setOrgChartDrawerVisible] = useState(false);
  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");
  // const [accessToken, setAccessToken] = useState("");

  let navigate = useNavigate();
  const { Option } = Select;
  const [searchParams, setSearchParams] = useSearchParams();

  // const serverURL = "http://localhost:6060";
  const serverURL = "https://leadzilla.herokuapp.com";

  var accessToken = "";
  var currentCredit = 0;

  // get filters from url use it to fetch latest contact data
  useEffect(() => {
    try {
      let filterFromUrl = JSON.parse(searchParams.get("filter"));
      console.log(filterFromUrl);
      if (
        filterFromUrl !== undefined &&
        filterFromUrl !== null &&
        filterFromUrl !== " "
      ) {
        setSelectedDomain(filterFromUrl.domain || []);
        setSelectedLevel(filterFromUrl.level || []);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const testDataSource = [
    {
      key: "1",
      name: "",
      level: "C Level",
      count: "3",
      child: false,
      children: [
        {
          key: "mflmbvkj",
          name: "Vikas",
          role: "CMO",
          level: "",
          linkedInId: "www.linkedin.com/in/satyanadella/",
          child: true,
        },
        {
          key: "wqguygdb",
          name: "Maruti",
          role: "CEO",
          level: "",
          linkedInId: "www.linkedin.com/in/satyanadella/",
          child: true,
        },
        {
          key: "sanmnfkjfk",
          name: "Naina",
          role: "CTO",
          level: "",
          linkedInId: "www.linkedin.com/in/satyanadella/",
          child: true,
        },
      ],
    },
    {
      key: "2",
      name: "",
      level: "Director Level",
      count: "0",
      child: false,
    },
    {
      key: "3",
      name: "",
      level: "VP Level",
      count: "0",
      child: false,
    },
    {
      key: "4",
      name: "",
      level: "Manager Level",
      count: "3",
      child: false,
      children: [
        {
          key: "mflmbvkj",
          name: "Vikas",
          role: "CMO",
          level: "",
          linkedInId: "www.linkedin.com/in/satyanadella/",
          child: true,
        },
        {
          key: "wqguygdb",
          name: "Maruti",
          role: "CEO",
          level: "",
          linkedInId: "www.linkedin.com/in/satyanadella/",
          child: true,
        },
        {
          key: "sanmnfkjfk",
          name: "Naina",
          role: "CTO",
          level: "",
          linkedInId: "www.linkedin.com/in/satyanadella/",
          child: true,
        },
      ],
    },
    {
      key: "5",
      name: "",
      level: "Staff Level",
      count: "0",
      child: false,
    },
    {
      key: "6",
      name: "",
      level: "Others",
      count: "0",
      child: false,
    },
  ];

  const testColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render(text, record) {
        return {
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              justifyContent: "flexStart",
              alignItems: "flexStart",
              padding: "5px 15px",
              margin: "5px 5px",
              marginLeft: record.child ? "70px" : "5px",
              border: "1px solid #e2e2e2",
              borderRadius: "5px",
              minHeight: "50px",
              minWidth: "200px",
              lineHeight: "5px",
              boxShadow: "0px 0px 10px 5px rgba(200, 200, 200, 0.2)",
            },
          },
          children: (
            <div
              style={{
                padding: "5px 15px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flexStart",
                alignItems: "flexStart",
              }}
            >
              <p>{record.name}</p>
              {record.level ? <p>{record.level}</p> : ""}
              <p>{record.count}</p>
              <p>{record.role}</p>

              {record.linkedInId ? (
                <a
                  href={"http://" + record.linkedInId}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  LinkedIn
                </a>
              ) : (
                ""
              )}
            </div>
          ),
        };
      },
    },
  ];

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
      onSnapshot(doc(db, "users", `${user.uid}`), (doc) => {
        // console.log("Current data: ", doc.data());
        if (currentCredit === 0) {
          //console.log("credit loaded");
          currentCredit = doc.data().credits;
        } else {
          //console.log("credit exists");
        }
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

  const [CSVHeaders] = useState([
    { label: "fullName", key: "fullName" },
    { label: "firstName", key: "firstName" },
    { label: "lastName", key: "lastName" },
    { label: "companyName", key: "companyName" },
    { label: "website", key: "primaryDomain" },
    // { label: "verificationStatus", key: "emailStatus" },
    { label: "jobTitle", key: "title" },
    { label: "emailId", key: "emailAddress" },
    { label: "phoneNumber", key: "phoneNumber" },
    { label: "phoneDirect", key: "phoneDirect" },
    { label: "phoneCompany", key: "phoneCompany" },
    { label: "phoneMobile", key: "phoneMobile" },
    { label: "uniqueLinkedinId", key: "linkedInId" },
    { label: "twitterId", key: "twitterId" },
    { label: "facebookId", key: "facebookId" },
  ]);

  const columns = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (text, record, index) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h4 className="contact-name">
            {record.firstName + " " + record.lastName}
          </h4>
          <p className="contact-role">{record.title}</p>

          <div>
            {record.dept?.map((department, index) => {
              return (
                <p className="contact-department" key={index}>
                  {department}
                </p>
              );
            })}
          </div>

          <span className="social-account-link-container">
            {record.linkedInId ? (
              <a
                href={"http://" + record.linkedInId}
                rel="noopener noreferrer"
                target="_blank"
              >
                <LinkedinFilled className="social-icons" color={"#6f4cef"} />
              </a>
            ) : (
              ""
            )}
            {record.facebookId ? (
              <a
                href={"http://" + record.facebookId}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FacebookFilled className="social-icons" color={"#6f4cef"} />
              </a>
            ) : (
              ""
            )}
            {record.twitterId ? (
              <a
                href={"http://" + record.twitterId}
                rel="noopener noreferrer"
                target="_blank"
              >
                <TwitterSquareFilled
                  className="social-icons"
                  color={"#6f4cef"}
                />
              </a>
            ) : (
              ""
            )}
          </span>
        </div>
      ),
    },
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      render: (text, record, index) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/**
           * Use clearbit api to fetch company logos using domain name
           */}
          <img
            style={{
              maxWidth: "30px",
              background: "#f6f6f6",
              marginBottom: "5px",
            }}
            src={
              "https://logo.clearbit.com/" + record.primaryDomain + "?size=30"
            }
            alt=""
          />

          {record.companyName ? (
            <Link to={`/company?domain=${record.primaryDomain}`}>
              <h1 className="company-name">{record.companyName}</h1>
            </Link>
          ) : (
            <Link to={`/company?domain=${record.primaryDomain}`}>
              <h1 className="company-name">
                {record.primaryDomain?.split(".")[0]}
              </h1>
            </Link>
          )}

          {record.city || record.country ? (
            <div className="company-address">
              <p className="company-details">
                {record.city}, {" " + record.country}
              </p>
            </div>
          ) : (
            ""
          )}

          <p className="company-details">{record.industry}</p>

          {record.companySize ? (
            <p className="company-details">{record.companySize} employees</p>
          ) : (
            ""
          )}

          <a
            href={"http://" + record.primaryDomain}
            rel="noopener noreferrer"
            target="_blank"
            className="company-url"
          >
            {record.primaryDomain}
          </a>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      render: (text, record, index) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p className="contact-email">
            {record.emailAddress || "***@" + record.primaryDomain}
          </p>
          {record.phoneDirect && record.phoneDirect !== "" ? (
            <div className="contact-container">
              <p className="contact-type">Direct</p>
              <p className="contact-data">{record.phoneDirect}</p>
            </div>
          ) : (
            ""
          )}
          {record.phoneCompany && record.phoneCompany !== "" ? (
            <div className="contact-container">
              <p className="contact-type">Company</p>
              <p className="contact-data">{record.phoneCompany}</p>
            </div>
          ) : (
            ""
          )}
          {record.phoneMobile && record.phoneMobile !== "" ? (
            <div className="contact-container">
              <p className="contact-type">Mobile</p>
              <p className="contact-data">{record.phoneMobile}</p>
            </div>
          ) : (
            ""
          )}

          {record.phoneNumber && record.phoneNumber !== "" ? (
            <div className="contact-container">
              <p className="contact-type">Other</p>
              <p className="contact-data">{record.phoneNumber}</p>
            </div>
          ) : (
            ""
          )}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record, index) => (
        <>
          <button
            style={{ margin: "2px 5px" }}
            className="secondary-button-active"
            onClick={(e) => {
              purchaseContact(index, record.id);
            }}
          >
            View
          </button>

          {/* <button
            style={{ margin: "2px 5px" }}
            className="secondary-button-active"
            onClick={(e) => {
              showOrgChart(
                record.level,
                record.companyName,
                record.primaryDomain
              );
              console.log("button-clicked");
            }}
          >
            Org Chart
          </button> */}
        </>
      ),
    },
  ];

  //User data row selection logic
  // rowSelection objects indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(
      //   `selectedRowKeys: ${selectedRowKeys}`,
      //   "selectedRows: ",
      //   selectedRows
      // );
      // save selected user data rows
      setSelectedUserData(selectedRows);
    },
    // onSelect: (record, selected, selectedRows) => {
    //   console.log(record, selected, selectedRows);
    // },
    // onSelectAll: (selected, selectedRows, changeRows) => {
    //   console.log(selected, selectedRows, changeRows);
    // },
  };

  var country_list = [
    {
      Name: "Afghanistan",
      Code: "AF",
    },
    {
      Name: "Åland Islands",
      Code: "AX",
    },
    {
      Name: "Albania",
      Code: "AL",
    },
    {
      Name: "Algeria",
      Code: "DZ",
    },
    {
      Name: "American Samoa",
      Code: "AS",
    },
    {
      Name: "Andorra",
      Code: "AD",
    },
    {
      Name: "Angola",
      Code: "AO",
    },
    {
      Name: "Anguilla",
      Code: "AI",
    },
    {
      Name: "Antarctica",
      Code: "AQ",
    },
    {
      Name: "Antigua and Barbuda",
      Code: "AG",
    },
    {
      Name: "Argentina",
      Code: "AR",
    },
    {
      Name: "Armenia",
      Code: "AM",
    },
    {
      Name: "Aruba",
      Code: "AW",
    },
    {
      Name: "Australia",
      Code: "AU",
    },
    {
      Name: "Austria",
      Code: "AT",
    },
    {
      Name: "Azerbaijan",
      Code: "AZ",
    },
    {
      Name: "Bahamas",
      Code: "BS",
    },
    {
      Name: "Bahrain",
      Code: "BH",
    },
    {
      Name: "Bangladesh",
      Code: "BD",
    },
    {
      Name: "Barbados",
      Code: "BB",
    },
    {
      Name: "Belarus",
      Code: "BY",
    },
    {
      Name: "Belgium",
      Code: "BE",
    },
    {
      Name: "Belize",
      Code: "BZ",
    },
    {
      Name: "Benin",
      Code: "BJ",
    },
    {
      Name: "Bermuda",
      Code: "BM",
    },
    {
      Name: "Bhutan",
      Code: "BT",
    },
    {
      Name: "Bolivia, Plurinational State of",
      Code: "BO",
    },
    {
      Name: "Bonaire, Sint Eustatius and Saba",
      Code: "BQ",
    },
    {
      Name: "Bosnia and Herzegovina",
      Code: "BA",
    },
    {
      Name: "Botswana",
      Code: "BW",
    },
    {
      Name: "Bouvet Island",
      Code: "BV",
    },
    {
      Name: "Brazil",
      Code: "BR",
    },
    {
      Name: "British Indian Ocean Territory",
      Code: "IO",
    },
    {
      Name: "Brunei Darussalam",
      Code: "BN",
    },
    {
      Name: "Bulgaria",
      Code: "BG",
    },
    {
      Name: "Burkina Faso",
      Code: "BF",
    },
    {
      Name: "Burundi",
      Code: "BI",
    },
    {
      Name: "Cambodia",
      Code: "KH",
    },
    {
      Name: "Cameroon",
      Code: "CM",
    },
    {
      Name: "Canada",
      Code: "CA",
    },
    {
      Name: "Cape Verde",
      Code: "CV",
    },
    {
      Name: "Cayman Islands",
      Code: "KY",
    },
    {
      Name: "Central African Republic",
      Code: "CF",
    },
    {
      Name: "Chad",
      Code: "TD",
    },
    {
      Name: "Chile",
      Code: "CL",
    },
    {
      Name: "China",
      Code: "CN",
    },
    {
      Name: "Christmas Island",
      Code: "CX",
    },
    {
      Name: "Cocos (Keeling) Islands",
      Code: "CC",
    },
    {
      Name: "Colombia",
      Code: "CO",
    },
    {
      Name: "Comoros",
      Code: "KM",
    },
    {
      Name: "Congo",
      Code: "CG",
    },
    {
      Name: "Congo, the Democratic Republic of the",
      Code: "CD",
    },
    {
      Name: "Cook Islands",
      Code: "CK",
    },
    {
      Name: "Costa Rica",
      Code: "CR",
    },
    {
      Name: "Côte d'Ivoire",
      Code: "CI",
    },
    {
      Name: "Croatia",
      Code: "HR",
    },
    {
      Name: "Cuba",
      Code: "CU",
    },
    {
      Name: "Curaçao",
      Code: "CW",
    },
    {
      Name: "Cyprus",
      Code: "CY",
    },
    {
      Name: "Czech Republic",
      Code: "CZ",
    },
    {
      Name: "Denmark",
      Code: "DK",
    },
    {
      Name: "Djibouti",
      Code: "DJ",
    },
    {
      Name: "Dominica",
      Code: "DM",
    },
    {
      Name: "Dominican Republic",
      Code: "DO",
    },
    {
      Name: "Ecuador",
      Code: "EC",
    },
    {
      Name: "Egypt",
      Code: "EG",
    },
    {
      Name: "El Salvador",
      Code: "SV",
    },
    {
      Name: "Equatorial Guinea",
      Code: "GQ",
    },
    {
      Name: "Eritrea",
      Code: "ER",
    },
    {
      Name: "Estonia",
      Code: "EE",
    },
    {
      Name: "Ethiopia",
      Code: "ET",
    },
    {
      Name: "Falkland Islands (Malvinas)",
      Code: "FK",
    },
    {
      Name: "Faroe Islands",
      Code: "FO",
    },
    {
      Name: "Fiji",
      Code: "FJ",
    },
    {
      Name: "Finland",
      Code: "FI",
    },
    {
      Name: "France",
      Code: "FR",
    },
    {
      Name: "French Guiana",
      Code: "GF",
    },
    {
      Name: "French Polynesia",
      Code: "PF",
    },
    {
      Name: "French Southern Territories",
      Code: "TF",
    },
    {
      Name: "Gabon",
      Code: "GA",
    },
    {
      Name: "Gambia",
      Code: "GM",
    },
    {
      Name: "Georgia",
      Code: "GE",
    },
    {
      Name: "Germany",
      Code: "DE",
    },
    {
      Name: "Ghana",
      Code: "GH",
    },
    {
      Name: "Gibraltar",
      Code: "GI",
    },
    {
      Name: "Greece",
      Code: "GR",
    },
    {
      Name: "Greenland",
      Code: "GL",
    },
    {
      Name: "Grenada",
      Code: "GD",
    },
    {
      Name: "Guadeloupe",
      Code: "GP",
    },
    {
      Name: "Guam",
      Code: "GU",
    },
    {
      Name: "Guatemala",
      Code: "GT",
    },
    {
      Name: "Guernsey",
      Code: "GG",
    },
    {
      Name: "Guinea",
      Code: "GN",
    },
    {
      Name: "Guinea-Bissau",
      Code: "GW",
    },
    {
      Name: "Guyana",
      Code: "GY",
    },
    {
      Name: "Haiti",
      Code: "HT",
    },
    {
      Name: "Heard Island and McDonald Islands",
      Code: "HM",
    },
    {
      Name: "Holy See (Vatican City State)",
      Code: "VA",
    },
    {
      Name: "Honduras",
      Code: "HN",
    },
    {
      Name: "Hong Kong",
      Code: "HK",
    },
    {
      Name: "Hungary",
      Code: "HU",
    },
    {
      Name: "Iceland",
      Code: "IS",
    },
    {
      Name: "India",
      Code: "IN",
    },
    {
      Name: "Indonesia",
      Code: "ID",
    },
    {
      Name: "Iran, Islamic Republic of",
      Code: "IR",
    },
    {
      Name: "Iraq",
      Code: "IQ",
    },
    {
      Name: "Ireland",
      Code: "IE",
    },
    {
      Name: "Isle of Man",
      Code: "IM",
    },
    {
      Name: "Israel",
      Code: "IL",
    },
    {
      Name: "Italy",
      Code: "IT",
    },
    {
      Name: "Jamaica",
      Code: "JM",
    },
    {
      Name: "Japan",
      Code: "JP",
    },
    {
      Name: "Jersey",
      Code: "JE",
    },
    {
      Name: "Jordan",
      Code: "JO",
    },
    {
      Name: "Kazakhstan",
      Code: "KZ",
    },
    {
      Name: "Kenya",
      Code: "KE",
    },
    {
      Name: "Kiribati",
      Code: "KI",
    },
    {
      Name: "Korea, Democratic People's Republic of",
      Code: "KP",
    },
    {
      Name: "Korea, Republic of",
      Code: "KR",
    },
    {
      Name: "Kuwait",
      Code: "KW",
    },
    {
      Name: "Kyrgyzstan",
      Code: "KG",
    },
    {
      Name: "Lao People's Democratic Republic",
      Code: "LA",
    },
    {
      Name: "Latvia",
      Code: "LV",
    },
    {
      Name: "Lebanon",
      Code: "LB",
    },
    {
      Name: "Lesotho",
      Code: "LS",
    },
    {
      Name: "Liberia",
      Code: "LR",
    },
    {
      Name: "Libya",
      Code: "LY",
    },
    {
      Name: "Liechtenstein",
      Code: "LI",
    },
    {
      Name: "Lithuania",
      Code: "LT",
    },
    {
      Name: "Luxembourg",
      Code: "LU",
    },
    {
      Name: "Macao",
      Code: "MO",
    },
    {
      Name: "Macedonia, the Former Yugoslav Republic of",
      Code: "MK",
    },
    {
      Name: "Madagascar",
      Code: "MG",
    },
    {
      Name: "Malawi",
      Code: "MW",
    },
    {
      Name: "Malaysia",
      Code: "MY",
    },
    {
      Name: "Maldives",
      Code: "MV",
    },
    {
      Name: "Mali",
      Code: "ML",
    },
    {
      Name: "Malta",
      Code: "MT",
    },
    {
      Name: "Marshall Islands",
      Code: "MH",
    },
    {
      Name: "Martinique",
      Code: "MQ",
    },
    {
      Name: "Mauritania",
      Code: "MR",
    },
    {
      Name: "Mauritius",
      Code: "MU",
    },
    {
      Name: "Mayotte",
      Code: "YT",
    },
    {
      Name: "Mexico",
      Code: "MX",
    },
    {
      Name: "Micronesia, Federated States of",
      Code: "FM",
    },
    {
      Name: "Moldova, Republic of",
      Code: "MD",
    },
    {
      Name: "Monaco",
      Code: "MC",
    },
    {
      Name: "Mongolia",
      Code: "MN",
    },
    {
      Name: "Montenegro",
      Code: "ME",
    },
    {
      Name: "Montserrat",
      Code: "MS",
    },
    {
      Name: "Morocco",
      Code: "MA",
    },
    {
      Name: "Mozambique",
      Code: "MZ",
    },
    {
      Name: "Myanmar",
      Code: "MM",
    },
    {
      Name: "Namibia",
      Code: "NA",
    },
    {
      Name: "Nauru",
      Code: "NR",
    },
    {
      Name: "Nepal",
      Code: "NP",
    },
    {
      Name: "Netherlands",
      Code: "NL",
    },
    {
      Name: "New Caledonia",
      Code: "NC",
    },
    {
      Name: "New Zealand",
      Code: "NZ",
    },
    {
      Name: "Nicaragua",
      Code: "NI",
    },
    {
      Name: "Niger",
      Code: "NE",
    },
    {
      Name: "Nigeria",
      Code: "NG",
    },
    {
      Name: "Niue",
      Code: "NU",
    },
    {
      Name: "Norfolk Island",
      Code: "NF",
    },
    {
      Name: "Northern Mariana Islands",
      Code: "MP",
    },
    {
      Name: "Norway",
      Code: "NO",
    },
    {
      Name: "Oman",
      Code: "OM",
    },
    {
      Name: "Pakistan",
      Code: "PK",
    },
    {
      Name: "Palau",
      Code: "PW",
    },
    {
      Name: "Palestine, State of",
      Code: "PS",
    },
    {
      Name: "Panama",
      Code: "PA",
    },
    {
      Name: "Papua New Guinea",
      Code: "PG",
    },
    {
      Name: "Paraguay",
      Code: "PY",
    },
    {
      Name: "Peru",
      Code: "PE",
    },
    {
      Name: "Philippines",
      Code: "PH",
    },
    {
      Name: "Pitcairn",
      Code: "PN",
    },
    {
      Name: "Poland",
      Code: "PL",
    },
    {
      Name: "Portugal",
      Code: "PT",
    },
    {
      Name: "Puerto Rico",
      Code: "PR",
    },
    {
      Name: "Qatar",
      Code: "QA",
    },
    {
      Name: "Réunion",
      Code: "RE",
    },
    {
      Name: "Romania",
      Code: "RO",
    },
    {
      Name: "Russian Federation",
      Code: "RU",
    },
    {
      Name: "Rwanda",
      Code: "RW",
    },
    {
      Name: "Saint Barthélemy",
      Code: "BL",
    },
    {
      Name: "Saint Helena, Ascension and Tristan da Cunha",
      Code: "SH",
    },
    {
      Name: "Saint Kitts and Nevis",
      Code: "KN",
    },
    {
      Name: "Saint Lucia",
      Code: "LC",
    },
    {
      Name: "Saint Martin (French part)",
      Code: "MF",
    },
    {
      Name: "Saint Pierre and Miquelon",
      Code: "PM",
    },
    {
      Name: "Saint Vincent and the Grenadines",
      Code: "VC",
    },
    {
      Name: "Samoa",
      Code: "WS",
    },
    {
      Name: "San Marino",
      Code: "SM",
    },
    {
      Name: "Sao Tome and Principe",
      Code: "ST",
    },
    {
      Name: "Saudi Arabia",
      Code: "SA",
    },
    {
      Name: "Senegal",
      Code: "SN",
    },
    {
      Name: "Serbia",
      Code: "RS",
    },
    {
      Name: "Seychelles",
      Code: "SC",
    },
    {
      Name: "Sierra Leone",
      Code: "SL",
    },
    {
      Name: "Singapore",
      Code: "SG",
    },
    {
      Name: "Sint Maarten (Dutch part)",
      Code: "SX",
    },
    {
      Name: "Slovakia",
      Code: "SK",
    },
    {
      Name: "Slovenia",
      Code: "SI",
    },
    {
      Name: "Solomon Islands",
      Code: "SB",
    },
    {
      Name: "Somalia",
      Code: "SO",
    },
    {
      Name: "South Africa",
      Code: "ZA",
    },
    {
      Name: "South Georgia and the South Sandwich Islands",
      Code: "GS",
    },
    {
      Name: "South Sudan",
      Code: "SS",
    },
    {
      Name: "Spain",
      Code: "ES",
    },
    {
      Name: "Sri Lanka",
      Code: "LK",
    },
    {
      Name: "Sudan",
      Code: "SD",
    },
    {
      Name: "Suriname",
      Code: "SR",
    },
    {
      Name: "Svalbard and Jan Mayen",
      Code: "SJ",
    },
    {
      Name: "Swaziland",
      Code: "SZ",
    },
    {
      Name: "Sweden",
      Code: "SE",
    },
    {
      Name: "Switzerland",
      Code: "CH",
    },
    {
      Name: "Syrian Arab Republic",
      Code: "SY",
    },
    {
      Name: "Taiwan, Province of China",
      Code: "TW",
    },
    {
      Name: "Tajikistan",
      Code: "TJ",
    },
    {
      Name: "Tanzania, United Republic of",
      Code: "TZ",
    },
    {
      Name: "Thailand",
      Code: "TH",
    },
    {
      Name: "Timor-Leste",
      Code: "TL",
    },
    {
      Name: "Togo",
      Code: "TG",
    },
    {
      Name: "Tokelau",
      Code: "TK",
    },
    {
      Name: "Tonga",
      Code: "TO",
    },
    {
      Name: "Trinidad and Tobago",
      Code: "TT",
    },
    {
      Name: "Tunisia",
      Code: "TN",
    },
    {
      Name: "Turkey",
      Code: "TR",
    },
    {
      Name: "Turkmenistan",
      Code: "TM",
    },
    {
      Name: "Turks and Caicos Islands",
      Code: "TC",
    },
    {
      Name: "Tuvalu",
      Code: "TV",
    },
    {
      Name: "Uganda",
      Code: "UG",
    },
    {
      Name: "Ukraine",
      Code: "UA",
    },
    {
      Name: "United Arab Emirates",
      Code: "AE",
    },
    {
      Name: "United Kingdom",
      Code: "GB",
    },
    {
      Name: "United States",
      Code: "US",
    },
    {
      Name: "United States Minor Outlying Islands",
      Code: "UM",
    },
    {
      Name: "Uruguay",
      Code: "UY",
    },
    {
      Name: "Uzbekistan",
      Code: "UZ",
    },
    {
      Name: "Vanuatu",
      Code: "VU",
    },
    {
      Name: "Venezuela, Bolivarian Republic of",
      Code: "VE",
    },
    {
      Name: "Viet Nam",
      Code: "VN",
    },
    {
      Name: "Virgin Islands, British",
      Code: "VG",
    },
    {
      Name: "Virgin Islands, U.S.",
      Code: "VI",
    },
    {
      Name: "Wallis and Futuna",
      Code: "WF",
    },
    {
      Name: "Western Sahara",
      Code: "EH",
    },
    {
      Name: "Yemen",
      Code: "YE",
    },
    {
      Name: "Zambia",
      Code: "ZM",
    },
    {
      Name: "Zimbabwe",
      Code: "ZW",
    },
  ];
  const countryOptions = [];
  country_list.forEach((country) => {
    countryOptions.push(<Option key={country.Name}>{country.Name}</Option>);
  });

  function customSelectTagUI(props) {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        color={"green"}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  }

  const departmentOptions = [
    <Option key={"Engineering"}>{"Engineering"}</Option>,
    <Option key={"Finance & Administration"}>
      {"Finance & Administration"}
    </Option>,
    <Option key={"Human Resources"}>{"Human Resources"}</Option>,
    <Option key={"IT & IS"}>{"IT & IS"}</Option>,
    <Option key={"Marketing"}>{"Marketing"}</Option>,
    <Option key={"Operations"}>{"Operations"}</Option>,
    <Option key={"Sales"}>{"Sales"}</Option>,
    <Option key={"Support"}>{"Support"}</Option>,
    <Option key={"Other"}>{"Other"}</Option>,
  ];

  const levelOptions = [
    <Option key={"C-Level"}>{"C-Level"}</Option>,
    <Option key={"VP-Level"}>{"VP-Level"}</Option>,
    <Option key={"Director-Level"}>{"Director-Level"}</Option>,
    <Option key={"Manager-Level"}>{"Manager-Level"}</Option>,
    <Option key={"Staff"}>{"Staff"}</Option>,
    <Option key={"Other"}>{"Other"}</Option>,
  ];

  const industryOptions = [
    <Option key={"Agriculture & Mining"}>{"Agriculture & Mining"}</Option>,
    <Option key={"Business Services"}>{"Business Services"}</Option>,
    <Option key={"Computers & Electronics"}>
      {"Computers & Electronics"}
    </Option>,
    <Option key={"Consumer Services"}>{"Consumer Services"}</Option>,
    <Option key={"Education"}>{"Education"}</Option>,
    <Option key={"Energy & Utilities"}>{"Energy & Utilities"}</Option>,
    <Option key={"Financial Services"}>{"Financial Services"}</Option>,
    <Option key={"Government"}>{"Government"}</Option>,
    <Option key={"Healthcare"}>{"Healthcare"}</Option>,
    <Option key={"Pharmaceuticals & Biotech"}>
      {"Pharmaceuticals & Biotech"}
    </Option>,
    <Option key={"Manufacturing"}>{"Manufacturing"}</Option>,
    <Option key={"Media & Entertainment"}>{"Media & Entertainment"}</Option>,
    <Option key={"Non-Profit"}>{"Non-Profit"}</Option>,
    <Option key={"Other"}>{"Other"}</Option>,
    <Option key={"Real Estate & Construction"}>
      {"Real Estate & Construction"}
    </Option>,
    <Option key={"Retail"}>{"Retail"}</Option>,
    <Option key={"Software & Internet"}>{"Software & Internet"}</Option>,
    <Option key={"Telecommunications"}>{"Telecommunications"}</Option>,
    <Option key={"Transportation & Storage"}>
      {"Transportation & Storage"}
    </Option>,
    <Option key={"Travel"}>{"Travel"}</Option>,
    <Option key={"Recreation and Leisure"}>{"Recreation and Leisure"}</Option>,
    <Option key={"Wholesale & Distribution"}>
      {"Wholesale & Distribution"}
    </Option>,
  ];

  const companySizeOptions = [
    <Option key={"0 - 25"}>{"0 - 25"}</Option>,
    <Option key={"25 - 100"}>{"25 - 100"}</Option>,
    <Option key={"100 - 250"}>{"100 - 250"}</Option>,
    <Option key={"250 - 1000"}>{"250 - 1000"}</Option>,
    <Option key={"1k - 10k"}>{"1k - 10k"}</Option>,
    <Option key={"10k - 50k"}>{"10k - 50k"}</Option>,
    <Option key={"50k - 100k"}>{"50k - 100k"}</Option>,
    <Option key={"> 100k"}>{"> 100k"}</Option>,
  ];

  const companyRevenueOptions = [
    <Option key={"$0 - 1M"}>{"$0 - 1M"}</Option>,
    <Option key={"$1 - 10M"}>{"$1 - 10M"}</Option>,
    <Option key={"$10 - 50M"}>{"$10 - 50M"}</Option>,
    <Option key={"$50 - 100M"}>{"$50 - 100M"}</Option>,
    <Option key={"$100 - 250M"}>{"$100 - 250M"}</Option>,
    <Option key={"$250 - 500M"}>{"$250 - 500M"}</Option>,
    <Option key={"$500M - 1B"}>{"$500M - 1B"}</Option>,
    <Option key={"> $1B"}>{"> $1B"}</Option>,
  ];

  const resultFetchLimitOptions = [
    <Option key={15}>15</Option>,
    <Option key={25}>25</Option>,
    <Option key={50}>50</Option>,
    <Option key={75}>75</Option>,
    <Option key={100}>100</Option>,
  ];

  const fetchSearchResult = async (
    selectedDepartment,
    selectedLevel,
    selectedIndustry,
    selectedCompany,
    selectedCompanySize,
    selectedCompanyRevenue,
    selectedName,
    selectedFirstName,
    selectedLastName,
    selectedTitle,
    selectedDomain,
    selectedCountry,
    titleExactMatch,
    cursorMark,
    resultLimit,
    fetchNext
  ) => {
    var data = {
      name: selectedName,
      firstName: selectedFirstName,
      lastName: selectedLastName,
      title: selectedTitle,
      dept: selectedDepartment,
      level: selectedLevel,
      companyName: selectedCompany,
      nameDomain: selectedDomain,
      numberOfEmployees: selectedCompanySize,
      revenue: selectedCompanyRevenue,
      industryName: selectedIndustry,
      city: [],
      country: selectedCountry,
      state: [],
      zipCode: [],
      dontDisplayDeadContacts: false,
      dontDisplayOwnedContacts: false,
      limit: resultLimit || 25,
      cursorMark: fetchNext === true ? cursorMark : "",
      titleExactMatch: titleExactMatch,
    };

    try {
      setLoading(true);
      await axios
        .post(`${serverURL}/contacts`, JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Autherization: "Bearer " + accessToken,
          },
        })
        .then((response) => {
          let searchResultData = response.data.result;

          // add extra data points that are needed in exported data (eg: fullName)
          searchResultData.forEach((data, index) => {
            data["fullName"] = data?.firstName + " " + data?.lastName;
          });

          console.log("search result : ", searchResultData);
          setSearchResult(searchResultData);
          setSelectedUserData([]);
          setCursorMark(response.data.cursorMark);
          setTotalContactsAvailable(response.data.hits);
        })
        .catch((error) => {
          console.log(error);
        });
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Purchase contact details for given contact. refer adapt.io purchase contact APIs
   * @param {index of element in data array} tableElementId
   * @param {adapt.io contact id used for purchasing that contact} contactId
   */
  const purchaseContact = async (tableElementId, contactId) => {
    try {
      setLoading(true);
      await axios
        .get(`${serverURL}/purchase?contactId=${contactId}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Autherization: "Bearer " + accessToken,
          },
        })
        .then((response) => {
          //update credits
          if (
            response.data.emailAddress !== "none" &&
            response.data.emailAddress !== null &&
            response.data.emailAddress !== undefined
          ) {
            // if logged in, decrement credits from db

            if (firebaseAuthUUID) {
              const userDataRef = doc(db, "users", `${firebaseAuthUUID}`);
              updateDoc(userDataRef, {
                credits: `${currentCredit - 1}`,
              });
            }
            currentCredit = `${currentCredit - 1}`;
            //console.log("current credit: ", currentCredit);
          }

          // save purchased(found) email/phone data
          let searchResultCopy = [...searchResult];

          if (response.data.emailAddress) {
            searchResultCopy[tableElementId]["emailAddress"] =
              response.data.emailAddress;
          } else {
            searchResultCopy[tableElementId]["emailAddress"] = "";
          }

          if (response.data.phoneDirect) {
            searchResultCopy[tableElementId]["phoneDirect"] =
              response.data.phoneDirect;
          } else {
            searchResultCopy[tableElementId]["phoneDirect"] = "";
          }

          if (response.data.phoneCompany) {
            searchResultCopy[tableElementId]["phoneCompany"] =
              response.data.phoneCompany;
          } else {
            searchResultCopy[tableElementId]["phoneCompany"] = "";
          }

          if (response.data.phoneMobile) {
            searchResultCopy[tableElementId]["phoneMobile"] =
              response.data.phoneMobile;
          } else {
            searchResultCopy[tableElementId]["phoneMobile"] = "";
          }

          if (response.data.phoneNumber) {
            searchResultCopy[tableElementId]["phoneNumber"] =
              response.data.phoneNumber;
          } else {
            searchResultCopy[tableElementId]["phoneNumber"] = "";
          }

          //update changes in search result
          setSearchResult(searchResultCopy);
        })
        .catch((error) => {
          console.log(error);
        });
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  // respond to changes on filter values
  useEffect(() => {
    let fetchNext = false;
    if (
      selectedDepartment.length > 0 ||
      selectedLevel.length > 0 ||
      selectedIndustry.length > 0 ||
      selectedCompanySize.length > 0 ||
      selectedCompanyRevenue.length > 0 ||
      selectedName.length > 0 ||
      selectedFirstName.length > 0 ||
      selectedLastName.length > 0 ||
      selectedTitle.length > 0 ||
      selectedDomain.length > 0 ||
      selectedCompany.length > 0 ||
      selectedCountry.length > 0
    ) {
      fetchSearchResult(
        selectedDepartment,
        selectedLevel,
        selectedIndustry,
        selectedCompany,
        selectedCompanySize,
        selectedCompanyRevenue,
        selectedName,
        selectedFirstName,
        selectedLastName,
        selectedTitle,
        selectedDomain,
        selectedCountry,
        titleExactMatch,
        cursorMark,
        resultLimit,
        fetchNext
      );
      // console.log(selectedDepartment);
      // console.log(selectedLevel);
      // console.log(selectedIndustry);
      // console.log(selectedCompanySize);
      // console.log(selectedCompanyRevenue);
      // console.log(selectedName);
      // console.log(selectedFirstName);
      // console.log(selectedLastName);
      // console.log(selectedTitle);
      // console.log(selectedDomain);
      // console.log(selectedCompany);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedDepartment,
    selectedLevel,
    selectedIndustry,
    selectedCompanySize,
    selectedCompanyRevenue,
    selectedName,
    selectedFirstName,
    selectedLastName,
    selectedTitle,
    selectedDomain,
    selectedCompany,
    selectedCountry,
    titleExactMatch,
    resultLimit,
  ]);

  const [treeData, setTreeData] = useState([
    {
      level: "C-Level",
      count: "",
      children: [
        {
          firstName: "vikas",
          title: "engineer",
          children: [],
        },
      ],
    },
    {
      level: "VP-Level",
      count: "",
      children: [
        {
          firstName: "vikas",
          title: "engineer",
          children: [],
        },
      ],
    },
    {
      level: "Director-Level",
      count: "",
      children: [
        {
          firstName: "vikas",
          title: "engineer",
          children: [],
        },
      ],
    },

    {
      level: "Manager-Level",
      count: "",
      children: [
        {
          firstName: "vikas",
          title: "engineer",
          children: [],
        },
      ],
    },

    {
      level: "Staff",
      count: "",
      children: [
        {
          firstName: "vikas",
          title: "engineer",
          children: [],
        },
      ],
    },
    {
      level: "Other",
      count: "",
      children: [
        {
          firstName: "vikas",
          title: "engineer",
          children: [],
        },
      ],
    },
  ]);

  // Org chart side drawer
  const showOrgChart = async (level, company, website) => {
    console.log("fetching org chart data");

    const employeeLevelType = [
      "C-Level",
      "VP-Level",
      "Director-Level",
      "Manager-Level",
      "Staff",
      "Other",
    ];

    let treeDataCopy = treeData;

    employeeLevelType.forEach(async (level, index) => {
      let orgChartData = await fetchOrgChartData(level, company, website);

      treeDataCopy[index].children.length = 0;
      treeDataCopy[index].children = orgChartData.data;
      treeDataCopy[index].count = orgChartData.count;
    });
    setTreeData([...treeDataCopy]);
    setOrgChartDrawerVisible(true);
  };

  const onClose = () => {
    setOrgChartDrawerVisible(false);
  };

  const fetchOrgChartData = async (level, company, website) => {
    var data = {
      name: [],
      firstName: [],
      lastName: [],
      title: [],
      dept: [],
      level: [level],
      companyName: [company],
      nameDomain: [website],
      numberOfEmployees: [],
      revenue: [],
      industryName: [],
      city: [],
      country: [],
      state: [],
      zipCode: [],
      dontDisplayDeadContacts: false,
      dontDisplayOwnedContacts: false,
      limit: 25,
    };

    var fetchedData = [];
    try {
      await axios
        .post(`${serverURL}/contacts`, JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Autherization: "Bearer " + accessToken,
          },
        })
        .then((response) => {
          let companyData = response.data.result;
          console.log(companyData);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
  };

  // handle changes on filter selectors
  function handleDepartmentChange(value) {
    setSelectedDepartment(value);
  }
  function handleLevelChange(value) {
    setSelectedLevel(value);
  }
  function handleIndustryChange(value) {
    setSelectedIndustry(value);
  }
  function handleCompanySizeChange(value) {
    setSelectedCompanySize(value);
  }
  function handleCompanyRevenueChange(value) {
    setSelectedCompanyRevenue(value);
  }
  function handleDomainChange(value) {
    setSelectedDomain(value);
  }
  function handleCompanyChange(value) {
    setSelectedCompany(value);
  }
  function handleNameChange(value) {
    setSelectedName(value);
  }
  function handleFirstNameChange(value) {
    setSelectedFirstName(value);
  }
  function handleLastNameChange(value) {
    setSelectedLastName(value);
  }
  function handleTitleChange(value) {
    setSelectedTitle(value);
  }

  function handleCountryChange(value) {
    setSelectedCountry(value);
  }

  function handleResultLimitChange(value) {
    setResultLimit(value);
  }

  const fetchNextPage = () => {
    let fetchNext = true;

    fetchSearchResult(
      selectedDepartment,
      selectedLevel,
      selectedIndustry,
      selectedCompany,
      selectedCompanySize,
      selectedCompanyRevenue,
      selectedName,
      selectedFirstName,
      selectedLastName,
      selectedTitle,
      selectedDomain,
      selectedCountry,
      titleExactMatch,
      cursorMark,
      resultLimit,
      fetchNext
    );
  };

  const viewAllSelectedContacts = (selectedUserData) => {
    // selectedUserData.forEach((userData) => {
    //   let indexOfThisElementInSearchResult = searchResult.indexOf(userData);
    //   purchaseContact(indexOfThisElementInSearchResult, userData.id);
    // });

    for (let i = 0; i < selectedUserData.length; i++) {
      let indexOfThisElementInSearchResult = searchResult.indexOf(
        selectedUserData[i]
      );
      purchaseContact(indexOfThisElementInSearchResult, selectedUserData[i].id);
    }
  };

  const exportData = (selectedUserData) => {
    console.log("exporting :", selectedUserData);
  };

  return loggedInUser ? (
    <div className="Search">
      <Topnav />
      <div className="content">
        <div className="search-cards-container">
          {/** Search filter card */}
          <div className="search-filter-card">
            <h1 className="filter-heading">COMPANY</h1>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <OfficeBuildingIcon
                  className="filter-icons"
                  color={"#6f4cef"}
                />
                <h1 className="filter-type">Company Name</h1>
              </span>
              <Select
                bordered={false}
                mode="tags"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Enter company name"
                onChange={handleCompanyChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              />
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <LinkIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">Company website</h1>
              </span>
              <Select
                bordered={false}
                mode="tags"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Enter company website"
                onChange={handleDomainChange}
                value={[...selectedDomain]}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              />
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <LibraryIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">Industry</h1>
              </span>
              <Select
                bordered={false}
                mode="multiple"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Select industry"
                onChange={handleIndustryChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              >
                {industryOptions}
              </Select>
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <UserGroupIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">Headcount</h1>
              </span>
              <Select
                bordered={false}
                mode="multiple"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Select employee headcount"
                onChange={handleCompanySizeChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              >
                {companySizeOptions}
              </Select>
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <TrendingUpIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">Revenue</h1>
              </span>
              <Select
                bordered={false}
                mode="multiple"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Select company revenue"
                onChange={handleCompanyRevenueChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              >
                {companyRevenueOptions}
              </Select>
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <LocationMarkerIcon
                  className="filter-icons"
                  color={"#6f4cef"}
                />
                <h1 className="filter-type">Country</h1>
              </span>
              <Select
                bordered={false}
                mode="tags"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Enter country of company"
                onChange={handleCountryChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              >
                {countryOptions}
              </Select>
            </span>

            {/** custom people filters */}
            <Divider />
            <h1 className="filter-heading">PEOPLE</h1>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <BriefcaseIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">Title</h1>
              </span>
              <Select
                bordered={false}
                mode="tags"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Enter title"
                onChange={handleTitleChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              />
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <StarIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">Seniority</h1>
              </span>
              <Select
                bordered={false}
                mode="multiple"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Select seniority"
                value={[...selectedLevel]}
                onChange={handleLevelChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              >
                {levelOptions}
              </Select>
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <UsersIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">Department</h1>
              </span>

              <Select
                bordered={false}
                mode="multiple"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Select department"
                onChange={handleDepartmentChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              >
                {departmentOptions}
              </Select>
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <UserIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">Full name</h1>
              </span>
              <Select
                bordered={false}
                mode="tags"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Enter full name"
                onChange={handleNameChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              />
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <UserIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">First name</h1>
              </span>
              <Select
                bordered={false}
                mode="tags"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Enter first name"
                onChange={handleFirstNameChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              />
            </span>

            <span className="search-filter-container">
              <span className="filter-label-container">
                <UserIcon className="filter-icons" color={"#6f4cef"} />
                <h1 className="filter-type">Last name</h1>
              </span>
              <Select
                bordered={false}
                mode="tags"
                tagRender={customSelectTagUI}
                allowClear
                placeholder="Enter last name"
                onChange={handleLastNameChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              />
            </span>
          </div>

          {/** Search result card */}
          <div className="search-result-card">
            <div className="search-result-card-controls">
              {totalContactsAvailable ? (
                <p
                  className="available-contact-count"
                  style={{ display: "block" }}
                >
                  {totalContactsAvailable} contacts
                </p>
              ) : (
                ""
              )}

              <CSVLink
                data={selectedUserData}
                headers={CSVHeaders}
                filename={"leadzilla-console-export.csv"}
                className="export-csv-button"
                target="_blank"
              >
                Export CSV
              </CSVLink>

              <Button
                style={{ display: "none", margin: "0px 10px" }}
                onClick={() => {
                  exportData(selectedUserData);
                }}
              >
                Export CSV
              </Button>

              <button
                className="primary-button"
                style={{ margin: "0px 20px" }}
                onClick={() => {
                  viewAllSelectedContacts(selectedUserData);
                }}
              >
                View Selected
              </button>

              <Select
                bordered={true}
                defaultValue={15}
                onChange={handleResultLimitChange}
                style={{ width: "80px", margin: "0px 10px 0px 5px" }}
              >
                {resultFetchLimitOptions}
              </Select>

              <button
                className="secondary-button-inactive"
                onClick={() => {
                  fetchNextPage();
                }}
              >
                Next
              </button>
            </div>

            <Table
              headers={false}
              size="large"
              columns={columns}
              loading={loading}
              rowKey="id"
              rowSelection={{ ...rowSelection }}
              dataSource={[...searchResult]}
              // pagination={{ pageSize: 100 }}
              pagination={false}
              scroll={{ y: "max-content" }}
            />
          </div>

          <Drawer
            title={"Org Chart"}
            placement="right"
            size={"large"}
            onClose={onClose}
            visible={orgChartDrawerVisible}
            extra={
              <Space>{/* <p>Tip: Use drag-drop and zoom gesture </p> */}</Space>
            }
          >
            {/* <Orgchart /> */}
            <Table
              showHeader={false}
              pagination={false}
              dataSource={testDataSource}
              columns={testColumns}
            />
            <Tree
              defaultSelectedKeys={["0-0-0"]}
              showLine={true}
              showIcon={false}
              treeData={treeData}
              onSelect={onOrgchartNodeSelect}
              selectedKeys={selectedOrgchartNodeKeys}
              titleRender={(treeNode) => {
                return (
                  <>
                    <span
                      className="title"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "5px 10px",
                        border: "1px solid #e2e2e2",
                        borderRadius: "5px",
                        minHeight: "50px",
                        minWidth: "200px",
                        boxShadow: "0px 0px 10px 5px rgba(200, 200, 200, 0.2)",
                      }}
                    >
                      <h4 className="contact-name">{treeNode.fullName}</h4>
                      <span className="contact-role">{treeNode.title}</span>
                      <span className="contact-role">{treeNode.level}</span>
                      <span className="contact-name">{treeNode.count}</span>

                      {treeNode.linkedInId ? (
                        <a
                          href={"http://" + treeNode.linkedInId}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          LinkedIn
                        </a>
                      ) : (
                        ""
                      )}
                    </span>
                  </>
                );
              }}
            />
          </Drawer>
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
