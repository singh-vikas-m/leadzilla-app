/**
 * Company contact search tab
 *
 */

import React, { useEffect, useState, useContext } from "react";
import { db, auth, fetchCompanyList, saveCompany } from "../../firebase-config";
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

export default function CompanySearch({ credits }) {
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
  const [selectedIndustry, setSelectedIndustry] = useState([]);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState([]);
  const [selectedCompanySize, setSelectedCompanySize] = useState([]);
  const [selectedCompanyRevenue, setSelectedCompanyRevenue] = useState([]);
  const [selectedCity, setSelectedCity] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [selectedState, setSelectedState] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState([]);

  // advance filter selector values
  const [selectedTechnology, setSelectedTechnology] = useState([]);
  const [selectedSimilarTo, setSelectedSimilarTo] = useState([]);
  const [advanceSearchLimit, setAdvanceSearchLimit] = useState(15);
  const [advanceSearchCursorMark, setAdvanceSearchCursorMark] = useState(0);

  //filter setting states
  const [cursorMark, setCursorMark] = useState("");
  const [resultLimit, setResultLimit] = useState(15);
  const [totalContactsAvailable, setTotalContactsAvailable] = useState("");

  //misc states
  const [searchResult, setSearchResult] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState([]);

  const [savedCompanyList, setSavedCompanyList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [orgChartDrawerVisible, setOrgChartDrawerVisible] = useState(false);
  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");
  const [UserId, setUserId] = useContext(UserIdContext);
  const [CreditCount, setCreditCount] = useContext(CreditCountContext);

  // const [accessToken, setAccessToken] = useState("");

  const { Option } = Select;
  var { search_type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  var selectedCompanyList = "";
  // const serverURL = "http://localhost:6060";
  const serverURL = "https://leadzilla.herokuapp.com";

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
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchSavedListNames();
  }, [UserId]);

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
              "https://logo.clearbit.com/" + record.companyWebsite + "?size=30"
            }
            alt=""
          />

          {record.companyName ? (
            <Link to={`/company?domain=${record.companyWebsite}`}>
              <h1 className="company-name">{record.companyName}</h1>
            </Link>
          ) : (
            <Link to={`/company?domain=${record.companyWebsite}`}>
              <h1 className="company-name">
                {record.companyWebsite?.split(".")[0]}
              </h1>
            </Link>
          )}
          <p className="contact-role">{record.industry}</p>

          <span className="social-account-link-container">
            {record.linkedInId ? (
              <a
                href={"http://" + record.linkedInId}
                rel="noopener noreferrer"
                target="_blank"
              >
                <LinkedinFilled className="social-icons" color={"#4659ff"} />
              </a>
            ) : (
              ""
            )}
            {record.facebook ? (
              <a
                href={"http://" + record.facebook}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FacebookFilled className="social-icons" color={"#4659ff"} />
              </a>
            ) : (
              ""
            )}
            {record.twitter ? (
              <a
                href={"http://" + record.twitter}
                rel="noopener noreferrer"
                target="_blank"
              >
                <TwitterSquareFilled
                  className="social-icons"
                  color={"#4659ff"}
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

          <div>
            {record.subIndustry?.map((subInd, index) => {
              return (
                <p className="contact-department" key={index}>
                  {subInd}
                </p>
              );
            })}
          </div>

          {record.companyHeadCount ? (
            <p className="company-details">
              {record.companyHeadCount} employees
            </p>
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
          {
            <h1 className="contact-department" style={{ marginBottom: "10px" }}>
              {record.numberOfContacts} employee contacts
            </h1>
          }

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
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/** save company to list */}
          <Popover
            title={"Save to"}
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
                      record.companyWebsite?.split(".")[1] +
                        "." +
                        record.companyWebsite?.split(".")[2],
                      record.companyWebsite?.split(".")[1]
                    );

                    console.log(
                      UserId,
                      selectedCompanyList,
                      record.companyWebsite?.split(".")[1] +
                        "." +
                        record.companyWebsite?.split(".")[2],
                      record.companyWebsite?.split(".")[1]
                    );
                  }}
                >
                  Save
                </Button>
              </>
            }
          >
            <button
              className="primary-button"
              style={{ margin: "2px 5px", padding: "0px 20px" }}
            >
              Save company
            </button>
          </Popover>

          <Link
            to={`/search/people?filter={"domain":["${record.companyWebsite}"]}`}
          >
            <button
              style={{
                margin: "2px 5px",
                padding: "0px 20px",
              }}
              className="secondary-button-active"
            >
              View employees
            </button>
          </Link>
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
        </div>
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

  // Credit decrement for similar companies & technographics
  const decrementCredits = async () => {
    if (UserId && CreditCount > 0) {
      const userDataRef = doc(db, "users", `${UserId}`);
      updateDoc(userDataRef, {
        credits: `${credits - 1}`,
      });
    }
    credits = `${credits - 1}`;
  };

  const fetchSearchResult = async (
    selectedSimilarTo,
    selectedTechnology,
    selectedCompany,
    selectedDomain,
    selectedCompanySize,
    selectedCompanyRevenue,
    selectedIndustry,
    selectedSubIndustry,
    selectedCountry,
    resultLimit,
    cursorMark,
    fetchNext
  ) => {
    console.log("cursorMarkadat", cursorMark);

    var data = {
      similarTo: selectedSimilarTo,
      technographics: selectedTechnology,
      companyName: selectedCompany,
      nameDomain: selectedDomain,
      numberOfEmployees: selectedCompanySize,
      revenue: selectedCompanyRevenue,
      industryName: selectedIndustry,
      subIndustry: selectedSubIndustry,
      city: [],
      country: selectedCountry,
      state: [],
      limit: resultLimit || 25,
      cursorMark: fetchNext === true ? cursorMark : "",
    };

    try {
      setLoading(true);

      if (credits > 0) {
        await axios
          .post(`${serverURL}/search/company`, JSON.stringify(data), {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              // Autherization: "Bearer " + accessToken,
            },
          })
          .then((response) => {
            var searchResultData = response.data.result;

            console.log("company search result : ", searchResultData);
            setSearchResult(searchResultData);
            setSelectedUserData([]);
            setCursorMark(response.data.cursorMark);
            setTotalContactsAvailable(response.data.hits);

            //update credits for adavance filter usage
            if (searchResultData.length > 0) {
              if (selectedSimilarTo.length > 0) {
                decrementCredits();
              }
              if (selectedTechnology.length > 0) {
                decrementCredits();
              }
            }
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

  const fetchNextPage = () => {
    let fetchNext = true;

    fetchSearchResult(
      selectedSimilarTo,
      selectedTechnology,
      selectedCompany,
      selectedDomain,
      selectedCompanySize,
      selectedCompanyRevenue,
      selectedIndustry,
      selectedSubIndustry,
      selectedCountry,
      resultLimit,
      cursorMark,
      fetchNext
    );
  };

  // respond to changes on filter values
  useEffect(() => {
    let fetchNext = false;
    if (
      selectedSimilarTo.length > 0 ||
      selectedTechnology.length > 0 ||
      selectedIndustry.length > 0 ||
      selectedSubIndustry.length > 0 ||
      selectedCompanySize.length > 0 ||
      selectedCompanyRevenue.length > 0 ||
      selectedDomain.length > 0 ||
      selectedCompany.length > 0 ||
      selectedCountry.length > 0
    ) {
      fetchSearchResult(
        selectedSimilarTo,
        selectedTechnology,
        selectedCompany,
        selectedDomain,
        selectedCompanySize,
        selectedCompanyRevenue,
        selectedIndustry,
        selectedSubIndustry,
        selectedCountry,
        resultLimit,
        cursorMark,
        fetchNext
      );
      // console.log(selectedIndustry);
      // console.log(selectedCompanySize);
      // console.log(selectedCompanyRevenue);
      // console.log(selectedDomain);
      // console.log(selectedCompany);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSimilarTo,
    selectedTechnology,
    selectedIndustry,
    selectedSubIndustry,
    selectedCompanySize,
    selectedCompanyRevenue,
    selectedDomain,
    selectedCompany,
    selectedCountry,
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
  function handleCountryChange(value) {
    setSelectedCountry(value);
  }
  function handleResultLimitChange(value) {
    setResultLimit(value);
  }

  // handle changes on adavance filter selectors
  function handleTechnologyChange(value) {
    setSelectedTechnology(value);
    console.log(value);
  }
  function handleSimilarToChange(value) {
    setSelectedSimilarTo(value);
    console.log(value);
  }

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
              <OfficeBuildingIcon className="filter-icons" color={"#4659ff"} />
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
              <LinkIcon className="filter-icons" color={"#4659ff"} />
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
              <LibraryIcon className="filter-icons" color={"#4659ff"} />
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
              <LibraryIcon className="filter-icons" color={"#4659ff"} />
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
              <UserGroupIcon className="filter-icons" color={"#4659ff"} />
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
              <TrendingUpIcon className="filter-icons" color={"#4659ff"} />
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
              <LocationMarkerIcon className="filter-icons" color={"#4659ff"} />
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

          <Divider />
          <h1 className="filter-heading">
            Advanced filters (1 Credit/Company)
          </h1>
          <span
            className="search-filter-container"
            style={{ background: "#e8eef4" }}
          >
            <span className="filter-label-container">
              <UsersIcon className="filter-icons" color={"#4659ff"} />
              <h1 className="filter-type">Similar companies</h1>
            </span>
            <Select
              bordered={false}
              mode="tags"
              tagRender={customSelectTagUI}
              allowClear
              placeholder="Eg: ikea.com"
              onChange={handleSimilarToChange}
              style={{ width: "100%", margin: "5px 0px 0px 5px" }}
            />
          </span>
          <span
            className="search-filter-container"
            style={{ background: "#e8eef4" }}
          >
            <span className="filter-label-container">
              <ServerIcon className="filter-icons" color={"#4659ff"} />
              <h1 className="filter-type">Technology</h1>
            </span>
            <Select
              bordered={false}
              mode="tags"
              tagRender={customSelectTagUI}
              allowClear
              placeholder="Eg: shopify"
              onChange={handleTechnologyChange}
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
                {totalContactsAvailable} companies
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
              style={{ display: "none" }}
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

        {/** Org chart UI */}
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
