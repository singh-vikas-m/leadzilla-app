import React, { useState, useEffect, useContext } from "react";
import "./Company.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { auth, saveCompany, fetchCompanyList } from "../../firebase-config";
import { signOut } from "firebase/auth";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Spin,
  Button,
  Skeleton,
  Popover,
  Select,
  Divider,
  Drawer,
  Table,
  notification,
} from "antd";
import { ExportOutlined, PoweroffOutlined } from "@ant-design/icons";
import { UserIdContext } from "../../Context/UserIdContext";

export default function Company() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState("");
  const [decisionMakerList, setDecisionMakerList] = useState([]);
  const [decisionMakerCount, setDecisionMakerCount] = useState([]);
  const [availableContactCount, setAvailableContactCount] = useState("");
  const [availableContacts, setAvailableContacts] = useState([]);

  const [alertDrawerVisible, setAlertDrawerVisible] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const [linkedInPageDetails, setLinkedInPageDetails] = useState({});

  const [savedCompanyList, setSavedCompanyList] = useState([]);
  const [isSaveCompanyPopoverVisible, setIsSaveCompanyPopoverVisible] =
    useState(false);

  const [UserId, setUserId] = useContext(UserIdContext);
  let [searchParams, setSearchParams] = useSearchParams();
  let navigate = useNavigate();
  const { Option } = Select;

  // const serverURL = "http://localhost:6060";
  const serverURL = "https://leadzilla.herokuapp.com";

  var selectedCompanyList = "";

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("user logged in");
      setUser(user);
      setUserId(user.uid);
    } else {
      console.log("user not logged in");
      navigate("/login");
    }
  });

  useEffect(() => {
    let companyWebsite = searchParams.get("domain");
    fetchAllData(companyWebsite);
  }, []);

  const fetchAllData = async (companyWebsite) => {
    setLoading(true);
    await fetchCompanyDetails(companyWebsite);

    //disabling this to save nubela credits
    //await fetchCompanyLinkedInProfile(companyWebsite);
    setLoading(false);
  };

  useEffect(() => {
    fetchSavedListNames();
  }, [UserId]);

  const alertTableColumns = [
    {
      title: "Alert",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Profile",
      dataIndex: "linkedinUrl",
      key: "linkedinUrl",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record, index) => (
        <>
          <a
            href={`https://${record.linkedinUrl}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open LinkedIn
          </a>
        </>
      ),
    },
  ];

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

  //notification component
  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
    });
  };

  function handleSaveCompanySelectChange(value) {
    console.log(value);
    selectedCompanyList = value;
  }

  const fetchCompanyDetails = async (domain) => {
    var data = {
      name: [],
      firstName: [],
      lastName: [],
      title: [],
      dept: [],
      level: [],
      companyName: [],
      nameDomain: [`${domain}`],
      numberOfEmployees: [],
      revenue: [],
      industryName: [],
      city: [],
      country: [],
      state: [],
      zipCode: [],
      dontDisplayDeadContacts: false,
      dontDisplayOwnedContacts: false,
      limit: 15,
      cursorMark: "",
      titleExactMatch: false,
    };

    try {
      //setLoading(true);
      await axios
        .post(`${serverURL}/contactsV2`, JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Autherization: "Bearer " + accessToken,
          },
        })
        .then((response) => {
          let searchResultData = response.data;

          // company details
          let companyDetails = {
            availableContacts: searchResultData.hits,
            city: searchResultData.result[0].city,
            state: searchResultData.result[0].state,
            country: searchResultData.result[0].country,
            companyName: searchResultData.result[0].companyName || "",
            companyRevenue: searchResultData.result[0].companyRevenue,
            companySize: searchResultData.result[0].companySize,
            industry: searchResultData.result[0].industry,
            sector: searchResultData.result[0].sector,
            domain: searchResultData.result[0].primaryDomain,
          };

          // decision maker details
          let decisionMakerList = [];
          searchResultData.result.forEach(async (contact, index) => {
            if (
              contact.level === "C-Level" ||
              contact.level === "VP-Level" ||
              contact.level === "Director-Level"
            ) {
              decisionMakerList.push(contact);
            }
          });

          setDecisionMakerList(decisionMakerList);
          setDecisionMakerCount(decisionMakerList.length);

          setAvailableContacts(searchResultData.result);
          setAvailableContactCount(searchResultData.result.length);

          setAvailableContactCount(searchResultData.hits);
          setCompanyDetails(companyDetails);
        })
        .catch((error) => {
          console.log(error);
        });
      //setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCompanyLinkedInProfile = async (domain) => {
    var data = {
      domainName: `${domain}`,
    };

    try {
      //setLoading(true);
      await axios
        .post(`${serverURL}/company`, JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Autherization: "Bearer " + accessToken,
          },
        })
        .then((response) => {
          let linkedInPageRData = response.data;
          console.log(linkedInPageRData);

          //linkedin page details

          let linkedInPageDetails = {
            description: linkedInPageRData.description || "",
            tagline: linkedInPageRData.tagline || "",
            companyType: linkedInPageRData.company_type || "",
            categories: linkedInPageRData.categories || "",
            backgroundImageUrl:
              linkedInPageRData.background_cover_image_url || "",
            companyEmail: linkedInPageRData.extra.contact_email || "",
            crunchbaseRank: linkedInPageRData.extra.crunchbase_rank || "",
            foundingDate: linkedInPageRData.extra.founding_date || "",
            phoneNumber: linkedInPageRData.extra.phone_number || "",
            totalFundsRaised:
              linkedInPageRData.extra.total_funding_amount ||
              linkedInPageRData.extra.total_fund_raised ||
              "",
            facebookId: linkedInPageRData.extra.facebook_id || "",
            twitterId: linkedInPageRData.extra.twitter_id || "",
            foundingYear: linkedInPageRData.founded_year || "",
            fundingData: linkedInPageRData.funding_data || "",
            industry: linkedInPageRData.industry || "",
            companyLogo: linkedInPageRData.profile_pic_url || "",
            similarCompanies: linkedInPageRData.similar_companies || "",
          };

          setLinkedInPageDetails(linkedInPageDetails);
          console.log(linkedInPageDetails);
        })
        .catch((error) => {
          console.log(error);
        });
      //setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCompanyAlerts = async (domain) => {
    var data = {
      domainName: [`${domain}`],
    };

    try {
      setAlertLoading(true);
      await axios
        .post(`${serverURL}/companySignals`, JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Autherization: "Bearer " + accessToken,
          },
        })
        .then((response) => {
          let alertsData = response.data;
          console.log(alertsData);

          let combinedAlertData = [];
          for (const alertGroup in alertsData) {
            var alertType = alertGroup;
            if (alertsData[alertGroup].length > 0) {
              alertsData[alertGroup].forEach((alert) => {
                alert["type"] = alertGroup;
                combinedAlertData.push(alert);
              });
            }
          }
          setAlerts(combinedAlertData);
          console.log(combinedAlertData);
        })
        .catch((error) => {
          console.log(error);
        });
      setAlertLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return user ? (
    <div className="Company">
      <Topnav />
      <div className="content">
        <div className="company-cards-container">
          <div className="company-filter-card">
            {loading === true ? (
              <Skeleton active />
            ) : (
              <div>
                <Drawer
                  title="Alerts"
                  placement={"right"}
                  size={"large"}
                  closable={true}
                  onClose={() => {
                    setAlertDrawerVisible(false);
                  }}
                  visible={alertDrawerVisible}
                  key={"right"}
                >
                  {alertLoading ? (
                    <>
                      <Spin />
                      Loading alerts please wait
                    </>
                  ) : (
                    <>
                      <Table
                        headers={true}
                        style={{ padding: "0px 0px" }}
                        size="large"
                        columns={alertTableColumns}
                        loading={loading}
                        rowKey="id"
                        dataSource={[...alerts]}
                        // pagination={{ pageSize: 100 }}
                        pagination={true}
                        scroll={{ y: "max-content" }}
                      />
                    </>
                  )}
                </Drawer>

                {/**
                 * Use clearbit api to fetch company logos using domain name
                 */}

                {/** company logo */}
                <div className="company-info-container">
                  <img
                    className="company-logo"
                    src={
                      "https://logo.clearbit.com/" +
                      searchParams.get("domain") +
                      "?size=100"
                    }
                    alt=""
                  />

                  <span className="company-info-text">
                    {/** company name */}
                    {companyDetails.companyName ? (
                      <h1 className="text-1">{companyDetails.companyName}</h1>
                    ) : (
                      <h1 className="text-1">
                        {companyDetails.domain?.split(".")[0]}
                      </h1>
                    )}

                    {/** company revenue */}
                    {companyDetails.companyRevenue ? (
                      <h1 className="text-2">
                        {companyDetails.companyRevenue}
                      </h1>
                    ) : (
                      ""
                    )}

                    {/** company headcount */}
                    {companyDetails.companySize ? (
                      <h1 className="text-2">
                        {companyDetails.companySize} employees
                      </h1>
                    ) : (
                      ""
                    )}

                    {/** company industry */}
                    {companyDetails.industry ? (
                      <h1 className="text-2">{companyDetails.industry}</h1>
                    ) : (
                      ""
                    )}

                    {/** company sector */}
                    {companyDetails.sector
                      ? companyDetails.sector.map((sector, index) => {
                          return (
                            <h1 className="text-2" key={index}>
                              {companyDetails.sector}
                            </h1>
                          );
                        })
                      : ""}

                    {/** company address */}
                    {companyDetails.city ||
                    companyDetails.state ||
                    companyDetails.country ? (
                      <h1 className="text-2">
                        {(companyDetails.city
                          ? companyDetails.city + ", "
                          : "") +
                          (companyDetails.state
                            ? companyDetails.state + ", "
                            : "") +
                          (companyDetails.country
                            ? companyDetails.country
                            : "")}
                      </h1>
                    ) : (
                      ""
                    )}

                    {/** company website */}
                    <h1 className="text-2">{searchParams.get("domain")}</h1>

                    {/** company email */}
                    {linkedInPageDetails.companyEmail ? (
                      <h1 className="text-2">
                        {linkedInPageDetails.companyEmail}
                      </h1>
                    ) : (
                      ""
                    )}

                    {/** company phone */}
                    {linkedInPageDetails.phoneNumber ? (
                      <h1 className="text-2">
                        {linkedInPageDetails.phoneNumber}
                      </h1>
                    ) : (
                      ""
                    )}

                    {/** founding year */}
                    {linkedInPageDetails.foundingYear ? (
                      <h1 className="text-2">
                        founded in {linkedInPageDetails.foundingYear}
                      </h1>
                    ) : (
                      ""
                    )}
                  </span>
                  {/** 
                  <span className="side-container">
                    <div className="funding-detail-container">
                      // funding type 
                      {linkedInPageDetails.fundingData?.length > 0 ? (
                        <>
                          <h1 className="text-1">Funding</h1>

                          <h1 className="text-2">
                            {
                              linkedInPageDetails.fundingData[
                                linkedInPageDetails.fundingData.length - 1
                              ].funding_type
                            }
                          </h1>
                        </>
                      ) : (
                        ""
                      )}
                      // funding amount
                      {linkedInPageDetails.fundingData?.length > 0 ? (
                        <h1 className="text-2">
                          {linkedInPageDetails.fundingData[
                            linkedInPageDetails.fundingData.length - 1
                          ].money_raised + " $"}
                        </h1>
                      ) : (
                        ""
                      )}
                      //funding data 
                      {linkedInPageDetails.fundingData?.length > 0 ? (
                        <h1 className="text-2">
                          {linkedInPageDetails.fundingData[
                            linkedInPageDetails.fundingData.length - 1
                          ].announced_date?.day +
                            " / " +
                            linkedInPageDetails.fundingData[
                              linkedInPageDetails.fundingData.length - 1
                            ].announced_date?.month +
                            " / " +
                            linkedInPageDetails.fundingData[
                              linkedInPageDetails.fundingData.length - 1
                            ].announced_date?.year}
                        </h1>
                      ) : (
                        ""
                      )}

                      <button
                        className="primary-button"
                        style={{
                          marginRight: "10px",
                          marginTop: "30px",
                          padding: "0px 20px",
                        }}
                        onClick={() => {
                          setAlertDrawerVisible(true);
                          if (alerts.length === 0) {
                            console.log(alerts);
                            fetchCompanyAlerts(companyDetails.domain);
                          }
                        }}
                      >
                        View Hiring, Promotion & Job change alerts
                      </button>
                    </div>
                  </span> */}
                </div>

                {/** company tagline */}
                {linkedInPageDetails.tagline ? (
                  <h1 className="text-3">{linkedInPageDetails.tagline}</h1>
                ) : (
                  ""
                )}
                {/** company description */}
                {linkedInPageDetails.description ? (
                  <h1 className="text-3">{linkedInPageDetails.description}</h1>
                ) : (
                  ""
                )}
                <Divider />

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
                        className="secondary-button-active"
                        onClick={async (e) => {
                          // purchaseContact(index, record.id);
                          const isCompanySaved = await saveCompany(
                            UserId,
                            selectedCompanyList,
                            companyDetails.domain,
                            companyDetails.domain?.split(".")[0]
                          );

                          if (isCompanySaved === true) {
                            openNotificationWithIcon(
                              "success",
                              "Saved",
                              "Company saved for tracking"
                            );
                          } else {
                            openNotificationWithIcon(
                              "error",
                              "Not saved",
                              "Could not save this company for tracking, contact support"
                            );
                          }

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
                    style={{ marginRight: "10px", padding: "0px 20px" }}
                    onClick={() => {
                      setIsSaveCompanyPopoverVisible(true);
                    }}
                  >
                    Save company
                  </button>
                </Popover>

                {/** open website button */}
                <a
                  href={"https://" + companyDetails.domain}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <button
                    className="secondary-button-inactive"
                    style={{ marginRight: "10px", padding: "0px 20px" }}
                  >
                    Visit website <ExportOutlined />
                  </button>
                </a>

                <h1 className="section-text">Search Leads</h1>
                <span className="actions">
                  {/** available contacts in leadzilla */}
                  <Link
                    to={`/search/people?filter={"domain":["${companyDetails.domain}"]}`}
                  >
                    {companyDetails.availableContacts ? (
                      <h1 className="link">
                        Available people ({availableContactCount})
                      </h1>
                    ) : (
                      ""
                    )}
                  </Link>

                  <h1 className="link">.</h1>
                  <Link
                    to={`/search/people?filter={"domain":["${companyDetails.domain}"], "level":["C-Level", "VP-Level", "Director-Level"]}`}
                  >
                    <h1 className="link">
                      Decision makers ({decisionMakerCount})
                    </h1>
                  </Link>
                </span>
                <Divider />
              </div>
            )}
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
