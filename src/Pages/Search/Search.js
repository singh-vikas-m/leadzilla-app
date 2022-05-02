import React, { useEffect, useState } from "react";
import "./Search.css";
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

  let navigate = useNavigate();
  const { Option } = Select;

  //const serverURL = "http://localhost:6060";
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
          {record.facebookId ? (
            <a
              href={"http://" + record.facebookId}
              rel="noopener noreferrer"
              target="_blank"
            >
              Facebook
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
              Twitter
            </a>
          ) : (
            ""
          )}
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
          <h1 className="company-name">{record.companyName}</h1>
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

          <button
            style={{ margin: "2px 5px" }}
            className="secondary-button-active"
            onClick={(e) => {
              showOrgChart(
                record.level,
                record.companyName,
                record.primaryDomain
              );
            }}
          >
            Org Chart
          </button>
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
    <Option key={"0 - 1M"}>{"0 - 1M"}</Option>,
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
            console.log("current credit: ", currentCredit);
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
      let fetchAvailableContacts = await fetchOrgChartData(
        level,
        company,
        website
      );

      if (fetchAvailableContacts.length === 0) {
        delete treeDataCopy[index];
      } else {
        treeDataCopy[index].children.length = 0;
        treeDataCopy[index].children = fetchAvailableContacts;
        treeDataCopy[index].count = fetchAvailableContacts.length;
      }
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
          },
        })
        .then((response) => {
          let searchResultData = response.data.result;

          // add extra data points that are needed in exported data (eg: fullName)
          searchResultData.forEach((data, index) => {
            data["fullName"] = data?.firstName + " " + data?.lastName;
          });

          //console.log("org chart raw result : ", searchResultData);
          fetchedData = searchResultData;
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
    return fetchedData;
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
                allowClear
                placeholder="Enter company website"
                onChange={handleDomainChange}
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
                allowClear
                placeholder="Enter country of company"
                onChange={handleCountryChange}
                style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              />
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
                allowClear
                placeholder="Select seniority"
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
              pagination={{ pageSize: 100 }}
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
              <Space>
                <p>Tip: Use drag-drop and zoom gesture </p>
              </Space>
            }
          >
            {/* <Orgchart /> */}

            {/* <DirectoryTree
              checkable={false}
              className="treeSelect"
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
                        boxShadow: "0px 0px 10px 5px rgba(200, 200, 200, 0.2)",
                      }}
                    >
                      <span className="text">{treeNode.title}</span>
                      <span className="text">{treeNode.department}</span>
                    </span>
                  </>
                );
              }}
            /> */}

            <Tree
              defaultSelectedKeys={["0-0-0"]}
              showLine={true}
              showIcon={false}
              treeData={[...treeData]}
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
                      <span className="contact-role">{treeNode.level}</span>
                      <span className="contact-name">{treeNode.count}</span>
                      <span className="contact-name">{treeNode.fullName}</span>
                      <span className="contact-role">{treeNode.title}</span>

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
