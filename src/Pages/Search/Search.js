import React, { useEffect, useState } from "react";
import "./Search.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { Button, Table, Select, Space } from "antd";
import axios from "axios";

export default function Search() {
  const [user, setUser] = useState(null);
  const [checkStrictly, setCheckStrictly] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState([]);
  const [selectedCompanySize, setSelectedCompanySize] = useState([]);
  const [selectedCompanyRevenue, setSelectedCompanyRevenue] = useState([]);
  const [selectedName, setSelectedName] = useState([]);

  let navigate = useNavigate();
  const { Option } = Select;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("user logged in");
      setUser(user);
    } else {
      console.log("user not logged in");
      navigate("/login");
    }
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      width: "12%",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      width: "30%",
      key: "contact",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record, index) => (
        <Space size="middle">
          <Button
            onClick={(e) => {
              console.log("user name is :", record.name);
            }}
          >
            View contact
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: 1,
      name: "Vikas Singh",
      company: "Leadzilla",
      contact: "",
    },
    {
      key: 2,
      name: "Saurav Gupta",
      company: "Leadzilla",
      address: "",
    },
    {
      key: 3,
      name: "Mark Spector",
      company: "Marvel",
      contact: "",
    },
    {
      key: 4,
      name: "Walt Disney",
      company: "Disney",
      address: "",
    },
  ];

  // rowSelection objects indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    onSelect: (record, selected, selectedRows) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log(selected, selectedRows, changeRows);
    },
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
    selectedCompanySize,
    selectedCompanyRevenue
  ) => {
    var data = JSON.stringify({
      email: "sam@sendzilla.io",
      apiKey: "601987e7e9ec744810232dd2",
      name: [],
      firstName: [],
      lastName: [],
      title: [],
      dept: [],
      level: [],
      companyName: [],
      nameDomain: [],
      numberOfEmployees: [],
      revenue: [],
      industryName: ["Education"],
      city: [],
      country: [],
      state: [],
      zipCode: [],
    });

    try {
      await axios
        .post("https://www.adapt.io/api/filter/contacts", data, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
        .then((response) => {
          const adaptEmailAPIData = response.data;
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
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
      selectedCompanyRevenue.length > 0
    ) {
      fetchSearchResult();
      console.log(selectedDepartment);
      console.log(selectedLevel);
      console.log(selectedIndustry);
      console.log(selectedCompanySize);
      console.log(selectedCompanyRevenue);
    }
  }, [
    selectedDepartment,
    selectedLevel,
    selectedIndustry,
    selectedCompanySize,
    selectedCompanyRevenue,
  ]);

  // handle changes on filter selectors
  function handleDepartmentChange(value) {
    setSelectedDepartment([value]);
  }

  function handleLevelChange(value) {
    setSelectedLevel([value]);
  }

  function handleIndustryChange(value) {
    setSelectedIndustry([value]);
  }

  function handleCompanySizeChange(value) {
    setSelectedCompanySize([value]);
  }

  function handleCompanyRevenueChange(value) {
    setSelectedCompanyRevenue([value]);
  }

  function handleChange(value) {
    setSelectedName([value]);
  }

  return user ? (
    <div className="Search">
      <Topnav />
      <div className="content">
        <div className="search-cards-container">
          {/** Search filter card */}
          <div className="search-filter-card">
            <h1 className="filter-heading">COMPANY</h1>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "80%", margin: "0px 0px 10px 10px" }}
              placeholder="Department"
              onChange={handleDepartmentChange}
            >
              {departmentOptions}
            </Select>

            <Select
              mode="multiple"
              allowClear
              style={{ width: "80%", margin: "10px" }}
              placeholder="Level"
              onChange={handleLevelChange}
            >
              {levelOptions}
            </Select>

            <Select
              mode="multiple"
              allowClear
              style={{ width: "80%", margin: "10px" }}
              placeholder="Industry"
              onChange={handleIndustryChange}
            >
              {industryOptions}
            </Select>

            <Select
              mode="multiple"
              allowClear
              style={{ width: "80%", margin: "10px" }}
              placeholder="Company Size"
              onChange={handleCompanySizeChange}
            >
              {companySizeOptions}
            </Select>

            <Select
              mode="multiple"
              allowClear
              style={{ width: "80%", margin: "10px" }}
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
              placeholder="Full name"
              onChange={handleChange}
              style={{ width: "80%", margin: "10px" }}
            />
          </div>

          {/** Search result card */}
          <div className="search-result-card">
            <Table
              size="large"
              columns={columns}
              rowSelection={{ ...rowSelection, checkStrictly }}
              dataSource={data}
              pag
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
