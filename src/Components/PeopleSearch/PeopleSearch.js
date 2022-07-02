/**
 * People contact search tab
 */

import React, { useEffect, useState, useContext } from "react";
import {
  db,
  auth,
  fetchCompanyList,
  saveCompany,
  getUserSavedIntegrationSettings,
} from "../../firebase-config";
import { arrayRemove, doc, onSnapshot, updateDoc } from "firebase/firestore";
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
  notification,
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

import salesforceIcon from "../../Assets/integration-icons/salesforce-icon.svg";
import hubspotIcon from "../../Assets/integration-icons/hubspot-icon.svg";

import {
  industryCascaderOptions,
  country_list,
  isValid,
} from "../../Utils/list.js";
import {
  FacebookFilled,
  LinkedinFilled,
  TwitterSquareFilled,
} from "@ant-design/icons";
import { UserIdContext } from "../../Context/UserIdContext";
import { CreditCountContext } from "../../Context/CreditCountContext";

export default function PeopleSearch({ credits }) {
  console.log("props credits...", credits);

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
  const [selectedSubIndustry, setSelectedSubIndustry] = useState([]);

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

  const [savedCompanyList, setSavedCompanyList] = useState([]);
  const [isSaveCompanyPopoverVisible, setIsSaveCompanyPopoverVisible] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [orgChartDrawerVisible, setOrgChartDrawerVisible] = useState(false);
  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");
  const [UserId, setUserId] = useContext(UserIdContext);
  const [CreditCount, setCreditCount] = useContext(CreditCountContext);

  // const [accessToken, setAccessToken] = useState("");
  const [savedIntegrationSettings, setSavedIntegrationSettings] = useState({});

  const { Option } = Select;
  var { search_type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  var selectedCompanyList = "";
  const serverURL = "http://localhost:6060";
  //const serverURL = "https://leadzilla.herokuapp.com";

  var credits = CreditCount;

  useEffect(() => {
    console.log("params", search_type);
  }, [search_type]);

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

  // used when saving a company
  useEffect(() => {
    fetchSavedListNames();
  }, [UserId]);

  //
  // get users saved integrations setting on pageload
  useEffect(() => {
    getUserSavedIntegrationData();
  }, [UserId]);

  //notification component
  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
    });
  };

  const getUserSavedIntegrationData = async () => {
    let integrationSettings = await getUserSavedIntegrationSettings(UserId);
    console.log("integration data", integrationSettings);
    setSavedIntegrationSettings(integrationSettings);
  };

  const fetchSavedListNames = async () => {
    try {
      console.log("fetching saved list name");
      const list = await fetchCompanyList(UserId);
      setSavedCompanyList(list);
    } catch (err) {}
  };

  // saved company list options for selector
  const companyListOptions = [];
  savedCompanyList.forEach((country) => {
    companyListOptions.push(
      <Option key={country.listName}>{country.listName}</Option>
    );
  });

  function handleSaveCompanySelectChange(value) {
    console.log(value);
    selectedCompanyList = value;
  }

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

          <div>
            {record.subIndustry?.map((subInd, index) => {
              return (
                <p className="contact-department" key={index}>
                  {subInd}
                </p>
              );
            })}
          </div>
          <p className="company-details">{record.industry}</p>

          {record.companySize ? (
            <p className="company-details">{record.companySize} employees</p>
          ) : (
            ""
          )}

          {record.companyRevenue ? (
            <p className="company-details">{record.companyRevenue} revenue</p>
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
            style={{ margin: "2px 5px 2px 0px" }}
            className="secondary-button-active"
            onClick={(e) => {
              purchaseContact(index, record.id);
            }}
          >
            View
          </button>

          {/** save contact to crms */}
          <Popover
            title={"Save contact to"}
            placement="rightTop"
            trigger="hover"
            content={
              <>
                <span style={{ display: "flex", margin: "0px 0px 50px 0px" }}>
                  <img
                    src={salesforceIcon}
                    alt=""
                    style={{ height: "30px", marginRight: "10px" }}
                  />
                  <h3>Salesforce</h3>
                </span>

                <Button
                  style={{ margin: "2px 5px" }}
                  // className="secondary-button-active"
                  onClick={async (e) => {
                    // purchaseContact(index, record.id);

                    // let data = {
                    //   FirstName: isValid(record.firstName)
                    //     ? record.firstName
                    //     : " ",
                    //   LastName: isValid(record.lastName)
                    //     ? record.lastName
                    //     : " ",
                    //   Title: isValid(record.title) ? record.title : " ",
                    //   Company: isValid(record.companyName)
                    //     ? record.companyName
                    //     : " ",
                    //   Email: isValid(record.emailAddress)
                    //     ? record.emailAddress
                    //     : "***@" + record.primaryDomain,
                    //   Phone: `${
                    //     isValid(record.phoneDirect) ? record.phoneDirect : " "
                    //   } ${
                    //     isValid(record.phoneCompany) ? record.phoneCompany : " "
                    //   }`,
                    //   MobilePhone: `${
                    //     isValid(record.phoneMobile) ? record.phoneMobile : " "
                    //   } ${
                    //     isValid(record.phoneNumber) ? record.phoneNumber : " "
                    //   }`,
                    //   Industry: isValid(record.industry)
                    //     ? record.industry
                    //     : " ",
                    //   LeadSource: "Leadzilla",
                    //   Website: isValid(record.primaryDomain)
                    //     ? record.primaryDomain
                    //     : " ",
                    //   City: isValid(record.city) ? record.city : " ",
                    //   State: isValid(record.state) ? record.state : " ",
                    //   Country: isValid(record.country) ? record.country : " ",
                    //   // NumberOfEmployees: -10 || "",
                    //   // AnnualRevenue: 10000 || "",
                    // };

                    let data = {};

                    if (isValid(record.firstName)) {
                      data["FirstName"] = record.firstName;
                    }
                    if (isValid(record.lastName)) {
                      data["LastName"] = record.lastName;
                    } else {
                      data["LastName"] = "none";
                    }
                    if (isValid(record.companyName)) {
                      data["Company"] = record.companyName;
                    } else if (isValid(record.primaryDomain)) {
                      data["Company"] = record.primaryDomain;
                    }
                    if (isValid(record.title)) {
                      data["Title"] = record.title;
                    }
                    if (isValid(record.title)) {
                      data["Title"] = record.title;
                    }
                    if (isValid(record.emailAddress)) {
                      data["Email"] = record.emailAddress;
                    } else if (isValid(record.primaryDomain)) {
                      data["Email"] = "***@" + record.primaryDomain;
                    }
                    if (
                      isValid(record.phoneCompany) &&
                      isValid(record.phoneNumber)
                    ) {
                      data[
                        "Phone"
                      ] = `${record.phoneCompany} ${record.phoneNumber}`;
                    } else if (isValid(record.phoneCompany)) {
                      data["Phone"] = `${record.phoneCompany} `;
                    } else if (isValid(record.phoneNumber)) {
                      data["Phone"] = `${record.phoneNumber} `;
                    }

                    if (
                      isValid(record.phoneDirect) &&
                      isValid(record.phoneMobile)
                    ) {
                      data[
                        "MobilePhone"
                      ] = `${record.phoneDirect} ${record.phoneMobile}`;
                    } else if (isValid(record.phoneDirect)) {
                      data["MobilePhone"] = `${record.phoneDirect} `;
                    } else if (isValid(record.phoneMobile)) {
                      data["MobilePhone"] = `${record.phoneMobile} `;
                    }
                    if (isValid(record.industry)) {
                      data["Industry"] = record.industry;
                    }
                    if (isValid(record.primaryDomain)) {
                      data["Website"] = record.primaryDomain;
                    }
                    data["LeadSource"] = "Leadzilla";

                    if (isValid(record.city)) {
                      data["City"] = record.city;
                    }
                    if (isValid(record.city)) {
                      data["State"] = record.state;
                    }
                    if (isValid(record.city)) {
                      data["Country"] = record.country;
                    }

                    await saveLeadsOnSalesforce(data);

                    // await saveCompany(
                    //   UserId,
                    //   selectedCompanyList,
                    //   record.primaryDomain,
                    //   record.primaryDomain?.split(".")[0]
                    // );
                    setIsSaveCompanyPopoverVisible(false);
                  }}
                >
                  Save
                </Button>
              </>
            }
          >
            <button
              style={{ margin: "2px 5px 2px 0px" }}
              className="secondary-button-active"
              onClick={(e) => {
                //purchaseContact(index, record.id);
                setIsSaveCompanyPopoverVisible(true);
              }}
            >
              Save
            </button>
          </Popover>

          {/** save company to list */}
          <Popover
            title={"Save company to"}
            placement="rightTop"
            trigger="hover"
            content={
              <>
                <Select
                  bordered={true}
                  allowClear
                  placeholder="Select a company list"
                  onChange={handleSaveCompanySelectChange}
                  style={{ width: "100%", margin: "5px 10px 10px 5px" }}
                >
                  {companyListOptions}
                </Select>

                <Button
                  style={{ margin: "2px 5px" }}
                  // className="secondary-button-active"
                  onClick={async (e) => {
                    // purchaseContact(index, record.id);
                    await saveCompany(
                      UserId,
                      selectedCompanyList,
                      record.primaryDomain,
                      record.primaryDomain?.split(".")[0]
                    );
                    setIsSaveCompanyPopoverVisible(false);
                  }}
                >
                  Save
                </Button>
              </>
            }
          >
            <button
              className="primary-button"
              style={{ marginRight: "0px", padding: "0px 20px" }}
              onClick={() => {
                setIsSaveCompanyPopoverVisible(true);
              }}
            >
              Save company
            </button>
          </Popover>

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
        style={{
          fontWeight: "500",
          color: "green",
          margin: "3px 3px 3px 0px",
        }}
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
    <Option key={"Healthcare, Pharmaceuticals, & Biotech"}>
      {"Healthcare, Pharmaceuticals, & Biotech"}
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
    <Option key={"Travel, Recreation, and Leisure"}>
      {"Travel, Recreation, and Leisure"}
    </Option>,
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
    selectedSubIndustry,
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
      subIndustry: selectedSubIndustry,
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
        .post(`${serverURL}/contactsV2`, JSON.stringify(data), {
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
      if (credits > 0) {
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

              if (UserId && CreditCount > 0) {
                const userDataRef = doc(db, "users", `${UserId}`);
                updateDoc(userDataRef, {
                  credits: `${credits - 2}`,
                });
              }
              credits = `${credits - 2}`;
              //console.log("current credit: ", credits);
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
      } else {
        console.log("credits no enough");
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Save leads to salesforce CRM
   */

  const saveLeadsOnSalesforce = async (leadData) => {
    try {
      let apiPayload = {
        auth_uuid: `${UserId}`,
        lead_data: leadData,
      };
      await axios
        .post(
          `${serverURL}/salesforce-save-leads`,
          JSON.stringify(apiPayload),
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              // Autherization: "Bearer " + accessToken,
            },
          }
        )
        .then((response) => {
          let result = response.data;
          console.log("saleforce save leads", result);
          if (result[0] === "successful") {
            openNotificationWithIcon(
              "success",
              "Saved",
              "Contact saved successfully"
            );
          } else if (result[0] === "duplicate") {
            openNotificationWithIcon(
              "info",
              "Duplicate",
              "Contact is already saved"
            );
          } else if (result[0] === "unsuccessful") {
            openNotificationWithIcon(
              "error",
              "Not saved",
              "Could not save this contact check if you have configured integration"
            );
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
  };

  //respond to changes on filter values
  useEffect(() => {
    let fetchNext = false;
    if (
      selectedDepartment.length > 0 ||
      selectedLevel.length > 0 ||
      selectedIndustry.length > 0 ||
      selectedSubIndustry.length > 0 ||
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
        selectedSubIndustry,
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
    selectedSubIndustry,
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
        .post(`${serverURL}/contactsV2`, JSON.stringify(data), {
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
  function handleIndustryChange(value) {
    //console.log(value);

    let industry = [],
      subIndustry = [];

    value.forEach((filter) => {
      console.log(filter);
      if (filter.length > 1) {
        subIndustry.push(filter[1]);
      } else {
        industry.push(filter[0]);
      }
    });

    //console.log(industry, subIndustry);
    setSelectedIndustry(industry);
    setSelectedSubIndustry(subIndustry);
  }

  function handleDepartmentChange(value) {
    setSelectedDepartment(value);
  }
  function handleLevelChange(value) {
    setSelectedLevel(value);
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
      selectedSubIndustry,
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

  return (
    <>
      <h1>Company search</h1>
      <div className="search-cards-container">
        {/** Search filter card */}
        <div className="search-filter-card">
          <h1 className="filter-heading">COMPANY</h1>

          <span className="search-filter-container">
            <span className="filter-label-container">
              <OfficeBuildingIcon className="filter-icons" color={"#6f4cef"} />
              <h1 className="filter-type">Company name</h1>
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

          {/* <span className="search-filter-container">
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
            </span> */}

          <span className="search-filter-container">
            <span className="filter-label-container">
              <LibraryIcon className="filter-icons" color={"#6f4cef"} />
              <h1 className="filter-type">Industry</h1>
            </span>
            <Cascader
              bordered={false}
              multiple
              tagRender={customSelectTagUI}
              allowClear
              placeholder="Select industry"
              style={{ width: "100%", margin: "5px 0px 0px 5px" }}
              options={industryCascaderOptions}
              onChange={handleIndustryChange}
              showSearch={(inputValue, path) =>
                path.some(
                  (option) =>
                    option.label
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) > -1
                )
              }
            />
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
              <LocationMarkerIcon className="filter-icons" color={"#6f4cef"} />
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
            style={{ padding: "0px 30px" }}
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
    </>
  );
}
