import React, { useEffect, useState } from "react";
import "./Search.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { Button, Table, Select, Space } from "antd";
import axios from "axios";

export default function Search() {
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

  //misc states
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [creditCount, setCreditCount] = useState(0);
  const [creditsFromDB, setCreditsFromDB] = useState("");

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
        setCreditsFromDB(doc.data().credits);

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

  const columns = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (text, record, index) => (
        <Space size="middle">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h4>{record.firstName + " " + record.lastName}</h4>
            <p>{record.title}</p>
            <a
              href={"http://" + record.linkedInId}
              rel="noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
          </div>
        </Space>
      ),
    },
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      render: (text, record, index) => (
        <Space size="middle">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h4>{record.companyName}</h4>
            <img
              style={{ maxWidth: "30px" }}
              src={
                "https://www." + record.primaryDomain + "/favicon.ico" ||
                "https://" + record.primaryDomain + "/favicon.ico"
              }
              alt=""
            />
            <a
              href={"http://" + record.primaryDomain}
              rel="noopener noreferrer"
              target="_blank"
            >
              {record.primaryDomain}
            </a>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      render: (text, record, index) => (
        <Space size="middle">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h4>{record.emailAddress || "*****@" + record.primaryDomain}</h4>
            {record.phoneDirect && record.phoneDirect !== "" ? (
              <p>Direct Dial {record.phoneDirect}</p>
            ) : (
              ""
            )}
            {record.phoneCompany && record.phoneCompany !== "" ? (
              <p>Company Line {record.phoneCompany}</p>
            ) : (
              ""
            )}
            {record.phoneMobile && record.phoneMobile !== "" ? (
              <p> Mobile Number {record.phoneMobile}</p>
            ) : (
              ""
            )}

            {record.phoneNumber && record.phoneNumber !== "" ? (
              <p> Other Number {record.phoneNumber}</p>
            ) : (
              ""
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record, index) => (
        <Space size="middle">
          <Button
            onClick={(e) => {
              purchaseContact(index, record.id);
            }}
          >
            View
          </Button>
        </Space>
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
    titleExactMatch
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
      limit: 25,
      cursorMark: cursorMark || "",
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
          console.log(response.data.result);

          setSearchResult(response.data.result);
          setCursorMark(response.data.cursorMark);
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
        cursorMark
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
  ]);

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

  const fetchNextPage = () => {
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
      cursorMark
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

  return loggedInUser ? (
    <div className="Search">
      <Topnav />
      <div className="content">
        <div className="search-cards-container">
          {/** Search filter card */}
          <div className="search-filter-card">
            <h1 className="filter-heading">COMPANY</h1>
            <Select
              bordered={true}
              mode="tags"
              allowClear
              placeholder="Company Website"
              onChange={handleDomainChange}
              style={{ width: "90%", margin: "10px" }}
            />

            <Select
              mode="tags"
              allowClear
              placeholder="Company Name"
              onChange={handleCompanyChange}
              style={{ width: "90%", margin: "10px" }}
            />
            <Select
              mode="multiple"
              allowClear
              style={{ width: "90%", margin: "10px" }}
              placeholder="Department"
              onChange={handleDepartmentChange}
            >
              {departmentOptions}
            </Select>

            <Select
              mode="multiple"
              allowClear
              style={{ width: "90%", margin: "10px" }}
              placeholder="Industry"
              onChange={handleIndustryChange}
            >
              {industryOptions}
            </Select>

            <Select
              mode="multiple"
              allowClear
              style={{ width: "90%", margin: "10px" }}
              placeholder="Company Size"
              onChange={handleCompanySizeChange}
            >
              {companySizeOptions}
            </Select>

            <Select
              mode="multiple"
              allowClear
              style={{ width: "90%", margin: "10px" }}
              placeholder="Company Revenue"
              onChange={handleCompanyRevenueChange}
            >
              {companyRevenueOptions}
            </Select>

            {/** custom people filters */}
            <h1 className="filter-heading">PEOPLE</h1>

            <Select
              mode="tags"
              allowClear
              placeholder="Title"
              onChange={handleTitleChange}
              style={{ width: "90%", margin: "10px" }}
            />

            <Select
              mode="multiple"
              allowClear
              style={{ width: "90%", margin: "10px" }}
              placeholder="Level"
              onChange={handleLevelChange}
            >
              {levelOptions}
            </Select>

            <Select
              mode="tags"
              allowClear
              placeholder="Full name"
              onChange={handleNameChange}
              style={{ width: "90%", margin: "10px" }}
            />

            <Select
              mode="tags"
              allowClear
              placeholder="First name"
              onChange={handleFirstNameChange}
              style={{ width: "90%", margin: "10px" }}
            />

            <Select
              mode="tags"
              allowClear
              placeholder="Last name"
              onChange={handleLastNameChange}
              style={{ width: "90%", margin: "10px" }}
            />
            <Select
              mode="tags"
              allowClear
              placeholder="Country"
              onChange={handleCountryChange}
              style={{ width: "90%", margin: "10px" }}
            />
          </div>

          {/** Search result card */}
          <div className="search-result-card">
            <div className="search-result-card-controls">
              <Button
                style={{ margin: "0px 10px" }}
                onClick={() => {
                  viewAllSelectedContacts(selectedUserData);
                }}
              >
                View Selected
              </Button>
              <Button
                onClick={() => {
                  fetchNextPage();
                }}
              >
                Next
              </Button>
            </div>

            <Table
              size="large"
              columns={columns}
              loading={loading}
              rowKey="id"
              rowSelection={{ ...rowSelection }}
              dataSource={[...searchResult]}
              pagination={{ pageSize: 50 }}
              scroll={{ y: "max-content" }}
            />
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
