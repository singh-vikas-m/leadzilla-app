import React, { useState } from "react";
import "./App.css";
import { Layout, Menu, Card } from "antd";
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  FireOutlined,
  ApiOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import LeadzillaIconFull from "./Assets/leadzilla-full-logo.png";
import LeadzillaIconShort from "./Assets/leadzilla-logo.png";
const { Header, Content, Sider } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);

  const onCollapse = (collapsed) => {
    setCollapsed(collapsed);
  };

  const fullLogoStyle = {
    width: "80%",
    marginLeft: "20px",
    marginTop: "15px",
    marginBottom: "30px",
  };

  const shortLogoStyle = {
    marginLeft: "15px",
    marginTop: "15px",
    marginBottom: "30px",
  };

  const sidenavIconStyle = {
    fontSize: "25px",
    fontWeight: "700",
  };

  return (
    <div className="App">
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}
          width={250}
          style={{
            boxShadow: "rgba(0, 0, 0, 0.5) 0px 5px 15px",
          }}
        >
          <img
            src={collapsed ? LeadzillaIconShort : LeadzillaIconFull}
            style={collapsed ? shortLogoStyle : fullLogoStyle}
            alt="logo"
          />
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
            <Menu.Item
              className="antd-menu-item"
              key="1"
              icon={<PieChartOutlined style={sidenavIconStyle} />}
            >
              Dashboard
            </Menu.Item>

            <Menu.Item
              key="2"
              className="antd-menu-item"
              icon={<FireOutlined style={sidenavIconStyle} />}
            >
              Campagins
            </Menu.Item>

            <Menu.Item
              className="antd-menu-item"
              key="3"
              icon={<TeamOutlined style={sidenavIconStyle} />}
            >
              Accounts
            </Menu.Item>

            <Menu.Item
              className="antd-menu-item"
              key="5"
              icon={<ApiOutlined style={sidenavIconStyle} />}
            >
              Integration
            </Menu.Item>

            <Menu.Item
              className="antd-menu-item"
              key="6"
              icon={<CreditCardOutlined style={sidenavIconStyle} />}
            >
              Plans
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="antd-layout-header" style={{ padding: 0 }}>
            <div className="credits">
              <h1>100</h1>
              <p>credits</p>
            </div>
          </Header>
          <Content style={{ margin: "40px 16px" }}>
            <Card
              title="Card title"
              bordered={true}
              style={{ width: "95%", margin: "0px 0px 0px 20px" }}
              className="antd-card"
            >
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default App;
