import React, { useState, useEffect, useContext } from "react";
import "./Track.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  createCompanyList,
  fetchCompanyList,
  fetchSavedCompanies,
  deleteCompanyList,
  deleteSavedCompany,
} from "../../firebase-config";
import {
  useNavigate,
  Link,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { FireIcon } from "@heroicons/react/solid";
import { MoreOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  Spin,
  Table,
  Tabs,
  Drawer,
  Modal,
  Popover,
  Button,
  Select,
  Tag,
  List,
  Avatar,
} from "antd";
import { UserIdContext } from "../../Context/UserIdContext";

export default function Track() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyListName, setcompanyListName] = useState("");
  const [companyListDescription, setcompanyListDescription] = useState("");
  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [jobKeywordsList, setJobKeywordsList] = useState([]);
  const [titleKeywordsList, setTitleKeywordsList] = useState([]);
  const [signalsDrawerVisible, setSignalsDrawerVisible] = useState(false);

  const [signalDataForDrawer, setSignalDataForDrawer] = useState("");

  const [UserId, setUserId] = useContext(UserIdContext);
  let [searchParams, setSearchParams] = useSearchParams();
  let navigate = useNavigate();
  const { TabPane } = Tabs;
  var { list_type, list_name } = useParams();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("user logged in");
        setUser(user);
        setFirebaseAuthUUID(user.uid);
        setUserId(user.uid);
      } else {
        console.log("user not logged in");
        navigate("/login");
      }
    });
  }, []);

  useEffect(() => {
    console.log(UserId);
  }, [UserId]);

  useEffect(() => {
    getCompanyList();
  }, [UserId]);

  const getCompanyList = async () => {
    setLoading(true);
    const list = await fetchCompanyList(UserId);
    setcompanyList(list);
    setLoading(false);
  };

  useEffect(() => {
    //console.log(list_type, list_name);
  }, [list_type]);

  const [companyList, setcompanyList] = useState([
    // {
    //   key: "1",
    //   listName: "TestList",
    //   accountCount: 32,
    //   listDescription: "testing 12nsijis",
    // },
    // {
    //   key: "2",
    //   listName: "Vikas Outreach",
    //   accountCount: 42,
    //   listDescription: "tester hsjahjsh",
    // },
  ]);

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

  function handleJobKeywordsInput(value) {
    setJobKeywordsList(value);
  }

  function handleTitleKeywordsInput(value) {
    setTitleKeywordsList(value);
  }

  const companyListTableColumn = [
    {
      title: "Name",
      dataIndex: "listName",
      key: "listName",
      render: (record, index) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Link to={`/track/company/${record}`}>{record}</Link>
        </div>
      ),
    },

    {
      title: "Description",
      dataIndex: "listDescription",
      key: "listDescription",
      render: (record, index) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h4>{record}</h4>
        </div>
      ),
    },
    // {
    //   title: "Accounts",
    //   dataIndex: "accountCount",
    //   key: "accountCount",
    //   render: (record, index) => (
    //     <div style={{ display: "flex", flexDirection: "column" }}>
    //       <h4>{record}</h4>
    //     </div>
    //   ),
    // },

    {
      title: "Action",
      key: "action",
      render: (text, record, index) => (
        <>
          <Popover
            title={"Setting"}
            placement="rightTop"
            content={
              <button
                style={{ margin: "2px 5px" }}
                className="secondary-button-active"
                onClick={async (e) => {
                  // purchaseContact(index, record.id);
                  await deleteCompanyList(
                    UserId,
                    record.listName,
                    record.listDescription
                  );
                  console.log(
                    "deleting",
                    record.listName,
                    record.listDescription
                  );
                  await getCompanyList();
                }}
              >
                Delete
              </button>
            }
            trigger="hover"
          >
            <MoreOutlined
              style={{
                fontSize: "20px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            />
          </Popover>
        </>
      ),
    },
  ];

  const handleCompanyListNameInputChange = (e) => {
    e.preventDefault();
    setcompanyListName(e.target.value);
  };

  const handleCompanyListDescriptionInputChange = (e) => {
    e.preventDefault();
    setcompanyListDescription(e.target.value);
  };

  function onTabChange(key) {
    // change url route as tab changes
    // console.log(key);
    if (key === "company") {
      navigate("/track/company");
    } else if (key === "people") {
      navigate("/track/people");
    }
  }

  const saveCompanyList = async () => {
    await createCompanyList(
      UserId,
      companyListName,
      companyListDescription,
      jobKeywordsList,
      titleKeywordsList
    );
    setConfirmLoading(false);
    setcompanyListName("");
    setcompanyListDescription("");
    setJobKeywordsList([]);
    setTitleKeywordsList([]);
  };

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    await saveCompanyList();
    setVisible(false);
    getCompanyList();
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setVisible(false);
  };

  const handleSignalsDrawerOpen = async (companySignalData) => {
    setSignalsDrawerVisible(true);
    console.log("signals data:", companySignalData);

    //morph raw signals data & put all signals in one array for List component
    let formattedSignals = [];
    companySignalData.signals.promotions.forEach((promotion) => {
      formattedSignals.push({ type: "Promotion", data: promotion });
    });

    companySignalData.signals.newhires.forEach((newHire) => {
      formattedSignals.push({ type: "New Hire", data: newHire });
    });

    companySignalData.signals.jobsposted.forEach((jobPosted) => {
      formattedSignals.push({ type: "Job Posted", data: jobPosted });
    });

    companySignalData.signals.fundings.forEach((funding) => {
      formattedSignals.push({ type: "Funding", data: funding });
    });

    //TODO: Also add news alerts to morphed signal list data

    console.log("signals for list->", formattedSignals);
    setSignalDataForDrawer(formattedSignals);
  };

  return user ? (
    <div className="Track">
      <Modal
        title="Create Company List"
        visible={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={false}
            loading={confirmLoading}
            onClick={handleOk}
          >
            Save
          </Button>,
        ]}
      >
        <div
          style={{
            margin: "20px 0px 20px 0px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="List name"
            onChange={handleCompanyListNameInputChange}
            style={{ width: "350px" }}
          />
          <input
            type="text"
            placeholder="Description"
            onChange={handleCompanyListDescriptionInputChange}
            style={{ width: "350px" }}
          />
          <span
            style={{
              margin: "20px 0px 0px 0px",
              width: "350px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <h3>Alert setting</h3>
          </span>
          <Select
            bordered={false}
            mode="tags"
            tagRender={customSelectTagUI}
            allowClear
            placeholder="Job keyword Eg: sales development, sales enablement"
            onChange={handleJobKeywordsInput}
            className="modal-select"
            style={{ width: "350px" }}
          />

          <Select
            bordered={false}
            mode="tags"
            tagRender={customSelectTagUI}
            allowClear
            placeholder="Title keyword Eg: SDR Manager, Head of Sales"
            onChange={handleTitleKeywordsInput}
            className="modal-select"
            style={{ width: "350px" }}
          />
        </div>
      </Modal>

      <Topnav />
      <div className="bottom-nav">
        <Tabs
          style={{ margin: "2px 0px 0px 5.5vw" }}
          defaultActiveKey="company"
          onChange={onTabChange}
          size={"medium"}
        >
          <TabPane tab="Companies" key="company" />
          <TabPane tab="People" key="people" />
        </Tabs>

        <button
          onClick={() => {
            console.log("add list");
            showModal();
          }}
          className="secondary-button-inactive add-list-button"
        >
          Create list
        </button>
      </div>
      <div className="content">
        <div className="track-cards-container">
          {/**card */}
          <div className="track-filter-card">
            {/** Render company or people list as per param in url */}
            {list_type === "company" ? (
              <CompanyList
                companyListTableColumn={companyListTableColumn}
                loading={loading}
                companyList={companyList}
                listName={list_name}
                setSignalsDrawerVisible={setSignalsDrawerVisible}
                handleSignalsDrawerOpen={handleSignalsDrawerOpen}
              />
            ) : (
              <PeopleList />
            )}

            <Drawer
              title={signalDataForDrawer.domain || "Signals"}
              placement="right"
              onClose={() => {
                setSignalsDrawerVisible(false);
              }}
              visible={signalsDrawerVisible}
            >
              <List
                itemLayout="horizontal"
                dataSource={signalDataForDrawer}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar src="https://joeschmoe.io/api/v1/random" />
                      }
                      title={<a href="https://ant.design">{item.type}</a>}
                      description={
                        <span>
                          {item.type === "Funding" ? (
                            <>
                              <h4>
                                Raised {item.data.currency}
                                {item.data.amount} {item.data.type}
                              </h4>
                              <p>
                                on{" "}
                                {moment
                                  .utc(item.data.date)
                                  .local()
                                  .format("MMM Do YYYY")}
                              </p>
                              <p>from {item.data.investors}</p>
                              {item.data.news_url ? (
                                <a
                                  href={item.data.news_url}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  check news
                                </a>
                              ) : (
                                ""
                              )}
                            </>
                          ) : (
                            <a
                              href={
                                item.type === "Job Posted"
                                  ? item.data.jobUrl
                                  : item.data.linkedinUrl
                              }
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {item.type === "Job Posted"
                                ? item.data.jobUrl
                                : item.data.linkedinUrl}
                            </a>
                          )}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            </Drawer>
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

function CompanyList(props) {
  var { list_name } = useParams();

  return (
    <>
      {list_name ? (
        <>
          <SavedCompanies
            listName={list_name}
            setSignalsDrawerVisible={props.setSignalsDrawerVisible}
            handleSignalsDrawerOpen={props.handleSignalsDrawerOpen}
          />
        </>
      ) : (
        <Table
          headers={false}
          style={{ padding: "0px 30px" }}
          size="large"
          columns={props.companyListTableColumn}
          loading={props.loading}
          rowKey="index"
          // rowSelection={{ ...rowSelection }}
          dataSource={[...props.companyList]}
          // pagination={{ pageSize: 100 }}
          pagination={true}
          scroll={{ y: "max-content" }}
        />
      )}
    </>
  );
}

function SavedCompanies(props) {
  const [savedCompanies, setSavedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  var { list_name } = useParams();
  const [UserId, setUserId] = useContext(UserIdContext);

  const savedCompaniesListColumn = [
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      render: (text, record, index) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/**
           * Use clearbit api to fetch company logos using domain name
           */}
          <img
            style={{
              maxWidth: "40px",
              background: "#f6f6f6",
              marginRight: "10px",
            }}
            src={"https://logo.clearbit.com/" + record.domain + "?size=40"}
            alt=""
          />
          <Link to={`/company?domain=${record.domain}`}>{record.company}</Link>
        </div>
      ),
    },

    {
      title: "Website",
      dataIndex: "domain",
      key: "domain",
      render: (text, record, index) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h4>{record.domain}</h4>
        </div>
      ),
    },

    {
      title: "Signals",
      dataIndex: "signals",
      key: "signals",
      render: (text, record, index) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            cursor: "pointer",
          }}
          onClick={() => {
            props.handleSignalsDrawerOpen(record);
            props.setSignalsDrawerVisible(true);
          }}
        >
          <FireIcon
            style={{ height: "20px", margin: "0px 5px 0px 0px" }}
            color={"#4659ff"}
          />
          <h4>
            {record.signals.fundings.length +
              record.signals.jobsposted.length +
              record.signals.newhires.length +
              record.signals.newsmentions.length +
              record.signals.promotions.length}
          </h4>
        </div>
      ),
    },

    {
      title: "Action",
      key: "action",
      render: (text, record, index) => (
        <>
          <Popover
            title={"Setting"}
            placement="rightTop"
            trigger="hover"
            content={
              <button
                style={{ margin: "2px 5px" }}
                className="secondary-button-active"
                onClick={async (e) => {
                  // purchaseContact(index, record.id);
                  await deleteSavedCompany(
                    UserId,
                    list_name,
                    record.company,
                    record.domain
                  );
                  await getSavedCompanies();
                }}
              >
                Delete
              </button>
            }
          >
            <MoreOutlined
              style={{
                fontSize: "20px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            />
          </Popover>
        </>
      ),
    },
  ];

  useEffect(() => {
    getSavedCompanies();
  }, [list_name, UserId]);

  const getSavedCompanies = async () => {
    console.log("fetching lists...", list_name);
    try {
      setLoading(true);
      let companies = await fetchSavedCompanies(UserId, list_name);
      console.log(companies);
      setSavedCompanies(companies);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Table
        headers={false}
        style={{ padding: "0px 30px" }}
        loading={loading}
        size="large"
        columns={savedCompaniesListColumn}
        rowKey="index"
        // rowSelection={{ ...rowSelection }}
        dataSource={[...savedCompanies]}
        // pagination={{ pageSize: 100 }}
        pagination={true}
        scroll={{ y: "max-content" }}
      />
    </>
  );
}

function PeopleList(props) {
  return <h3>Coming soon ..</h3>;
}
