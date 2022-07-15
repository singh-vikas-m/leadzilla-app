import React, { useEffect, useState, useContext } from "react";
import "./Integration.css";
import Topnav from "../../Components/Topnav/Topnav";
import salesforceIcon from "../../Assets/integration-icons/salesforce-icon.svg";
import hubspotIcon from "../../Assets/integration-icons/hubspot-icon.svg";
import pipedriveIcon from "../../Assets/integration-icons/pipedrive-icon.svg";

import { onAuthStateChanged } from "firebase/auth";
import {
  db,
  auth,
  getUserSavedIntegrationSettings,
} from "../../firebase-config";
import { arrayRemove, doc, onSnapshot, updateDoc } from "firebase/firestore";

import { useNavigate, Link } from "react-router-dom";
import { Button, Card, Divider, Spin, Popover, Col, Row } from "antd";

import { UserIdContext } from "../../Context/UserIdContext";
import { CreditCountContext } from "../../Context/CreditCountContext";

var accessToken = "";
var currentCredit = 0;

export default function Integration() {
  //misc states
  const [loggedInUser, setLoggedInUser] = useState(false);

  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");
  const [UserId, setUserId] = useContext(UserIdContext);
  const [CreditCount, setCreditCount] = useContext(CreditCountContext);
  const [savedIntegrationSettings, setSavedIntegrationSettings] = useState("");

  // const [accessToken, setAccessToken] = useState("");

  let navigate = useNavigate();

  var salesforceSetupUrl = "";

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      //console.log("user logged in");

      //fetch and saved firebase auth access token
      await user.getIdToken().then((token) => {
        // setAccessToken(token);
        accessToken = token;
        //console.log(token);
      });

      setLoggedInUser(user);
      setFirebaseAuthUUID(user.uid);
      setUserId(user.uid);

      salesforceSetupUrl = `https://leadzilla-dev-ed.my.salesforce.com/services/oauth2/authorize?client_id=3MVG95mg0lk4batiqacSAs_HER2CCOTyocoK5omFHsmm56xdJNCvTUDPAyHNKogAJHyzudoZaog2.3VXPKJbl&redirect_uri=http://localhost:6060/salesforce-leadzilla-redirect&response_type=code&state=${firebaseAuthUUID}`;

      console.log(salesforceSetupUrl);

      onSnapshot(doc(db, "users", `${user.uid}`), (doc) => {
        //console.log("Current data: ", doc.data());
        currentCredit = doc.data().credits;
        setCreditCount(currentCredit);
        //console.log("credit Count", currentCredit);
      });
    } else {
      console.log("user not logged in");
      navigate("/login");
    }
  });

  // get users saved integrations setting
  useEffect(() => {
    let integrationSettings = getUserSavedIntegrationSettings(firebaseAuthUUID);
    setSavedIntegrationSettings(integrationSettings);
  }, [firebaseAuthUUID]);

  return loggedInUser ? (
    <div className="Integration">
      <Topnav />
      <div className="content">
        <div className="header">
          <h1>Connect Leadzilla with your tools</h1>
          <h3>
            Quit switching tools and work from one place. Integrate to any tool
            in 60 seconds and supercharge your workflows in 1 click.
          </h3>
        </div>

        <div className="integration-card-container">
          <IntegrationCard
            integrationImg={salesforceIcon}
            integrationName={"Salesforce"}
            integrationDescription={
              "Instantly save the right lead data to Salesforce."
            }
            // for dev this oauth url
            //integrationUrl={`https://leadzilla-dev-ed.my.salesforce.com/services/oauth2/authorize?client_id=3MVG95mg0lk4batiqacSAs_HER2CCOTyocoK5omFHsmm56xdJNCvTUDPAyHNKogAJHyzudoZaog2.3VXPKJbl&redirect_uri=http://localhost:6060/salesforce-leadzilla-redirect&response_type=code&state=${firebaseAuthUUID}`}

            // for prod this oauth url
            integrationUrl={`https://leadzilla-dev-ed.my.salesforce.com/services/oauth2/authorize?client_id=3MVG95mg0lk4batiqacSAs_HER2CCOTyocoK5omFHsmm56xdJNCvTUDPAyHNKogAJHyzudoZaog2.3VXPKJbl&redirect_uri=https://leadzilla.herokuapp.com/salesforce-leadzilla-redirect&response_type=code&state=${firebaseAuthUUID}`}
            integrationStatus={false}
          />

          <IntegrationCard
            integrationImg={hubspotIcon}
            integrationName={"Hubspot"}
            integrationDescription={
              "Easily push leads from leadzilla to hubspot contacts"
            }
            // for dev this oauth url
            //integrationUrl={`https://app.hubspot.com/oauth/authorize?client_id=4c2fc1a6-5362-44f1-bbb2-e03475330544&redirect_uri=http://localhost:6060/hubspot-leadzilla-redirect&response_type=code&scope=crm.objects.contacts.write&state=${firebaseAuthUUID}`}

            // for prod this oauth url
            integrationUrl={`https://app.hubspot.com/oauth/authorize?client_id=4c2fc1a6-5362-44f1-bbb2-e03475330544&redirect_uri=https://leadzilla.herokuapp.com/hubspot-leadzilla-redirect&response_type=code&scope=crm.objects.contacts.write&state=${firebaseAuthUUID}`}
            integrationStatus={false}
          />

          <IntegrationCard
            integrationImg={pipedriveIcon}
            integrationName={"Pipedrive"}
            integrationDescription={
              "Bulk save prospect lists to your database & book meetings"
            }
            // for dev this oauth url
            //integrationUrl={`https://leadzilla-dev-ed.my.salesforce.com/services/oauth2/authorize?client_id=3MVG95mg0lk4batiqacSAs_HER2CCOTyocoK5omFHsmm56xdJNCvTUDPAyHNKogAJHyzudoZaog2.3VXPKJbl&redirect_uri=http://localhost:6060/salesforce-leadzilla-redirect&response_type=code&state=${firebaseAuthUUID}`}

            // for prod this oauth url
            integrationUrl={"https://leadzilla.ai"}
            integrationStatus={"Coming soon"}
          />
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

function IntegrationCard(props) {
  return (
    <div className="IntegrationCard">
      <Card className="card">
        <span className="integration-card-name">
          <img src={props.integrationImg} style={{ height: "40px" }} alt="" />
          <h1>{props.integrationName}</h1>
        </span>

        <p>{props.integrationDescription}</p>
        <a
          href={props.integrationUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Button type="primary">
            {props.integrationStatus === true
              ? "Connected"
              : props.integrationStatus === false
              ? "Connect"
              : "Coming soon"}
          </Button>
        </a>
      </Card>
    </div>
  );
}
