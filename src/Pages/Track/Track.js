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
  saveCompany,
} from "../../firebase-config";
import {
  useNavigate,
  Link,
  useSearchParams,
  useParams,
} from "react-router-dom";
import Papa from "papaparse";
import { FireIcon } from "@heroicons/react/solid";
import { MoreOutlined, InboxOutlined } from "@ant-design/icons";
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
  Form,
  Input,
  Upload,
  message,
} from "antd";
import { UserIdContext } from "../../Context/UserIdContext";

export default function Track() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyListName, setcompanyListName] = useState("");
  const [companyListDescription, setcompanyListDescription] = useState("");
  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");
  const [visible, setVisible] = useState(false);
  const [dataUploadModalVisible, setDataUploadModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [jobKeywordsList, setJobKeywordsList] = useState([]);
  const [titleKeywordsList, setTitleKeywordsList] = useState([]);
  const [signalsDrawerVisible, setSignalsDrawerVisible] = useState(false);
  const [rawCSVFileObjectList, setRawCSVFileObjectList] = useState([]);
  const [signalDataForDrawer, setSignalDataForDrawer] = useState("");
  const [UserId, setUserId] = useContext(UserIdContext);
  const [companyList, setcompanyList] = useState([]);

  let [searchParams, setSearchParams] = useSearchParams();
  let navigate = useNavigate();
  const { TabPane } = Tabs;
  const { Dragger } = Upload;
  const { Option } = Select;

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

  // saved company list options for selector
  const companyListOptions = [];
  companyList.forEach((companyList) => {
    companyListOptions.push(
      <Option key={companyList.listName}>{companyList.listName}</Option>
    );
  });

  useEffect(() => {
    //console.log(list_type, list_name);
  }, [list_type]);

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

  const saveCompanyList = async (
    companyListName,
    companyListDescription,
    jobKeywordsList,
    titleKeywordsList
  ) => {
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

  /**
   * Handles input data for create company list modal, saves new company list in firebase
   */
  const handleOk = async (
    companyListName,
    companyListDescription,
    jobKeywordsList,
    titleKeywordsList
  ) => {
    setConfirmLoading(true);
    await saveCompanyList(
      companyListName,
      companyListDescription,
      jobKeywordsList,
      titleKeywordsList
    );
    setVisible(false);
    getCompanyList();
  };

  /**
   * handle save company from csv logic, parses csv and saves companies
   */

  const handleParseCSV = async (
    companyList,
    websiteColumnHeaderList,
    companyNameColumnHeaderList
  ) => {
    //parsing logic

    rawCSVFileObjectList.forEach((rawFile) => {
      Papa.parse(rawFile.originFileObj, {
        complete: (results) => {
          console.log("papa parse result:", results.data);
          var parsedCSVData = results.data;
          var parsedCSVHeaders = results.data[0];

          var combinedCSVData = [];

          //get index of headers
          const domainNameHeaderIndex = parsedCSVHeaders.indexOf(
            websiteColumnHeaderList
          );
          const companyNameHeaderIndex = parsedCSVHeaders.indexOf(
            companyNameColumnHeaderList
          );

          console.log(domainNameHeaderIndex);
          console.log(companyNameHeaderIndex);

          parsedCSVData.forEach((csvRow, index) => {
            if (index !== 0) {
              //console.log(csvRow);
              let payload = {
                domain: csvRow[domainNameHeaderIndex] || "",
                company:
                  csvRow[companyNameHeaderIndex] ||
                  csvRow[domainNameHeaderIndex]?.split(".")[
                    csvRow[domainNameHeaderIndex]?.split(".")?.length - 2
                  ] ||
                  "",
              };
              combinedCSVData.push(payload);
            }
          });

          // use these data to save
          handleSaveCompaniesFromCSV(combinedCSVData, companyList);
        },
      });
    });
  };

  const handleSaveCompaniesFromCSV = async (combinedCSVData, companyList) => {
    console.log(console.log("final CSV data to save ->", combinedCSVData));
    combinedCSVData.forEach(async (row) => {
      await saveCompany(UserId, companyList, row.domain, row.company);
    });

    // for (let i = 0; i < combinedCSVData.length; i++) {
    //   console.log("api call->", i);
    //   saveCompany(
    //     UserId,
    //     companyList,
    //     combinedCSVData[i].domainName,
    //     combinedCSVData[i].companyName ||
    //       combinedCSVData[i].domainName?.split(".")[
    //         combinedCSVData[i].domainName?.split(".").length - 2
    //       ]
    //   );
    // }

    setConfirmLoading(false);
    setRawCSVFileObjectList([]);
    setDataUploadModalVisible(false);
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
    companySignalData?.signals?.promotions?.forEach((promotion) => {
      formattedSignals.push({ type: "Promotion", data: promotion });
    });

    companySignalData?.signals?.newhires?.forEach((newHire) => {
      formattedSignals.push({ type: "New Hire", data: newHire });
    });

    companySignalData?.signals?.jobsposted?.forEach((jobPosted) => {
      formattedSignals.push({ type: "Job Posted", data: jobPosted });
    });

    companySignalData?.signals?.fundings?.forEach((funding) => {
      formattedSignals.push({ type: "Funding", data: funding });
    });

    //TODO: Also add news alerts to morphed signal list data

    console.log("signals for list->", formattedSignals);
    setSignalDataForDrawer(formattedSignals);
  };

  const fileUploaderProps = {
    multiple: false,

    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log("file list", info.fileList);
        setRawCSVFileObjectList(info.fileList);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
      // Parse local CSV file
      // Papa.parse(e.dataTransfer.files[0], {
      //   complete: function (results) {
      //     console.log("papa parse result:", results.data);
      //   },
      // });
    },
  };

  return user ? (
    <div className="Track">
      {/** Create company list modal */}
      <Modal
        title=""
        visible={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          style={{
            margin: "30px 0px 10px 50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          name="basic"
          layout="vertical"
          labelCol={{
            span: 20,
          }}
          wrapperCol={{
            span: 20,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={(values) => {
            console.log("Success:", values);
            let companyListName = values["list-name"],
              companyListDescription = values["list-description"],
              jobKeywordsList = values["job-keywords"],
              titleKeywordsList = values["title-keywords"];
            handleOk(
              companyListName,
              companyListDescription,
              jobKeywordsList,
              titleKeywordsList
            );
          }}
          onFinishFailed={(errorInfo) => {
            console.log("Failed:", errorInfo);
          }}
          autoComplete="off"
        >
          <Form.Item
            name="list-name"
            label="List name"
            tooltip="Company list name"
            rules={[
              {
                required: true,
                message: "Please enter a list name!",
              },
            ]}
          >
            <Input placeholder="Enterprise accounts" />
          </Form.Item>

          <Form.Item
            name="list-description"
            label="List description"
            tooltip="Company list description"
            rules={[
              {
                required: true,
                message: "Please enter a list description!",
              },
            ]}
          >
            <Input placeholder="Account list of enterprise segment" />
          </Form.Item>

          <Form.Item
            name="job-keywords"
            label="Job keywords to track"
            tooltip="Leadzilla will send you job posting alerts for these keywords in job description"
            rules={[
              {
                required: true,
                message: "Please enter multiple job keywords!",
                type: "array",
              },
            ]}
          >
            <Select
              allowClear
              placeholder="sales development, sales enablement"
              mode="tags"
              tagRender={customSelectTagUI}
            ></Select>
          </Form.Item>

          <Form.Item
            name="title-keywords"
            label="Title keywords to track"
            tooltip="Leadzilla will send you promotion & new hire alerts for these keywords"
            rules={[
              {
                required: true,
                message: "Please enter multiple title keywords!",
                type: "array",
              },
            ]}
          >
            <Select
              allowClear
              placeholder="SDR Manager, Head of Sales"
              mode="tags"
              tagRender={customSelectTagUI}
            ></Select>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 20,
            }}
          >
            <Button type="primary" htmlType="submit" loading={confirmLoading}>
              Save list
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/** Company data upload modal */}

      <Modal
        title=""
        bodyStyle={{ minHeight: "500px" }}
        width={"800px"}
        visible={dataUploadModalVisible}
        onOk={() => {
          setDataUploadModalVisible(false);
        }}
        confirmLoading={confirmLoading}
        onCancel={() => {
          setDataUploadModalVisible(false);
        }}
        footer={null}
      >
        <Dragger {...fileUploaderProps} style={{ margin: "40px 0px 10px 0px" }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag CSVfile to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. CSV file should contain list of
            domain names of companies
          </p>
        </Dragger>
        <Form
          style={{
            margin: "30px 0px 10px 50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
          name="basic"
          layout="vertical"
          labelCol={{
            span: 20,
          }}
          wrapperCol={{
            span: 20,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={async (values) => {
            console.log("Success:", values);
            let companyList = values["destination-company-list"],
              websiteColumnHeaderList = values["website-header-names"],
              companyNameColumnHeaderList = values["company-header-names"];

            setConfirmLoading(true);
            //loop that parses csv in saves all companies by calling saveCompany api

            await handleParseCSV(
              companyList,
              websiteColumnHeaderList,
              companyNameColumnHeaderList
            );
          }}
          onFinishFailed={(errorInfo) => {
            console.log("Failed:", errorInfo);
          }}
          autoComplete="off"
        >
          <Form.Item
            name="destination-company-list"
            label="Destination company list"
            tooltip="This is where new companies from CSV are going to be saved"
            rules={[
              {
                required: true,
                message: "Please select a company list",
              },
            ]}
          >
            <Select placeholder="Select company list">
              {companyListOptions}
            </Select>
          </Form.Item>

          <Form.Item
            name="website-header-names"
            label="Website column header in CSVs"
            tooltip="Leadzilla will send you job posting alerts for these keywords in job description"
            rules={[
              {
                required: true,
                message: "Please enter multiple job keywords!",
              },
            ]}
          >
            <Input placeholder="eg: domainName" />
          </Form.Item>

          <Form.Item
            name="company-header-names"
            label="Company column header in CSVs"
            tooltip="Leadzilla will send you promotion & new hire alerts for these keywords"
            rules={[
              {
                required: false,
                message: "Please enter multiple title keywords!",
              },
            ]}
          >
            <Input placeholder="eg: companyName" />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 20,
            }}
          >
            <Button type="primary" htmlType="submit" loading={confirmLoading}>
              Add companies
            </Button>
          </Form.Item>
        </Form>
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

        <span className="cta-container">
          <button
            onClick={() => {
              console.log("upload data");
              setDataUploadModalVisible(true);
            }}
            className="secondary-button-inactive add-list-button"
            style={{ marginLeft: "auto" }}
          >
            Upload companies
          </button>
          <button
            onClick={() => {
              console.log("add list");
              showModal();
            }}
            className="secondary-button-inactive add-list-button"
          >
            Create list
          </button>
        </span>
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
            {record?.signals?.fundings?.length +
              record?.signals?.jobsposted?.length +
              record?.signals?.newhires?.length +
              record?.signals?.newsmentions?.length +
              record?.signals?.promotions?.length}
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
