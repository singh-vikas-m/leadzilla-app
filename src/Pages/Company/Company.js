import React, { useState, useEffect, useContext } from "react";
import "./Company.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { auth, saveCompany } from "../../firebase-config";
import { signOut } from "firebase/auth";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Spin, Button, Skeleton, Popover } from "antd";
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

  const [UserId, setUserId] = useContext(UserIdContext);
  let [searchParams, setSearchParams] = useSearchParams();
  let navigate = useNavigate();

  // const serverURL = "http://localhost:6060";
  const serverURL = "https://leadzilla.herokuapp.com";

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
    fetchCompanyDetails(companyWebsite);
  }, []);

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
      setLoading(false);
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
              <Skeleton />
            ) : (
              <div>
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
                  </span>
                </div>

                <Popover
                  title={"Save to"}
                  placement="rightTop"
                  content={
                    <button
                      style={{ margin: "2px 5px" }}
                      className="secondary-button-active"
                      onClick={(e) => {
                        // purchaseContact(index, record.id);
                        saveCompany(
                          "1xMRg7MhS6Q1ShVS95G6BsJK6mO2",
                          "Test List",
                          companyDetails.domain,
                          companyDetails.domain?.split(".")[0]
                        );
                      }}
                    >
                      Save
                    </button>
                  }
                  trigger="click"
                >
                  <button
                    className="primary-button"
                    style={{ marginRight: "10px", padding: "0px 20px" }}
                  >
                    Save company
                  </button>
                </Popover>

                {/** open website button */}
                <a
                  href={"http://" + companyDetails.domain}
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
