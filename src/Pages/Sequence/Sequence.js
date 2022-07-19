import React, { useState } from "react";
import "./Sequence.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Spin, List, Divider, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import axios from "axios";

export default function Sequence() {
  //misc states
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [generatedCopyList, setGeneratedCopyList] = useState([]);
  const [copyLoading, setCopyLoading] = useState(false);
  const [emailGenerationAPICallCount, setEmailGenerationAPICallCount] =
    useState(0);

  let navigate = useNavigate();

  // const serverURL = "http://localhost:6060";
  const serverURL = "https://leadzilla.herokuapp.com";

  var accessToken = "";
  var currentCredit = 0;

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
      onSnapshot(doc(db, "users", `${user.uid}`), (doc) => {
        // console.log("Current data: ", doc.data());
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

  const handleCompanyNameInputChange = (e) => {
    e.preventDefault();
    setCompanyName(e.target.value);
  };

  const handleCompanyDescriptionInputChange = (e) => {
    e.preventDefault();
    setCompanyDescription(e.target.value);
  };

  // reset email generation api call count
  setInterval(function () {
    // console.log(new Date());
    setEmailGenerationAPICallCount(0);
    // console.log(emailGenerationAPICallCount);
  }, 60000);

  const fetchEmailTemplates = async (companyName, companyDescription) => {
    /**
     * data contains paragraph as sample data, and other open ai
     * related setting taken directly from opan ai playground
     */

    var productData = {
      companyName: companyName,
      companyDescription: companyDescription,
      userId: firebaseAuthUUID,
    };

    let generatedCopy = {};

    try {
      // setCopyLoading(true);
      await axios
        .post(`${serverURL}/email`, JSON.stringify(productData), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            //Autherization: "Bearer " + accessToken,
          },
        })
        .then((response) => {
          let rawData = response?.data;

          let emailData = rawData?.choices[0]?.text?.split("Email:");
          let emailSubject = emailData[0],
            emailBody = emailData[1];

          generatedCopy = {
            subject: emailSubject,
            body: emailBody,
          };
        })
        .catch((error) => {
          console.log(error);
        });
      return generatedCopy;
    } catch (err) {
      console.log(err);
    }
  };

  const checkUserInput = async (companyName, companyDescription) => {
    var isContentOK = null;

    try {
      await axios
        .post(
          `${serverURL}/check_content`,
          JSON.stringify({
            companyName: companyName,
            companyDescription: companyDescription,
            userId: firebaseAuthUUID,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              //Autherization: "Bearer " + accessToken,
            },
          }
        )
        .then((response) => {
          var rawData = response?.data;
          //console.log(rawData);
          isContentOK = rawData;
          return rawData;
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
    return isContentOK;
  };

  const createEmailCopyList = async () => {
    if (
      companyName.length > 0 &&
      companyDescription.length > 0 &&
      emailGenerationAPICallCount < 60 &&
      copyLoading === false
    ) {
      setEmailGenerationAPICallCount(emailGenerationAPICallCount - 10);

      let emailCopyList = [];
      setCopyLoading(true);

      var isContentGood = await checkUserInput(companyName, companyDescription);

      if (isContentGood) {
        for (let i = 0; i < 10; i++) {
          let generatedEmail = await fetchEmailTemplates(
            companyName,
            companyDescription
          );
          emailCopyList.push(generatedEmail);
          setGeneratedCopyList(emailCopyList);
        }
      } else {
        console.log("please dont use offensive words");
        notification["warning"]({
          message: "Offensive words detected!",
          description:
            "Please rephrase your input to avoid the use of offensive words.",
        });
      }
      //console.log(emailCopyList);
      setCopyLoading(false);
    } else {
      if (emailGenerationAPICallCount < 60 && copyLoading === false) {
        console.log("Please dont leave company and description empty");
        notification["warning"]({
          message: "Empty company name or description!",
        });
      } else {
        notification["warning"]({
          message: "Rate limit, try after sometime!",
        });
      }
    }
  };

  return loggedInUser ? (
    <div className="Sequence">
      <Topnav />
      <div className="content">
        <div className="sequence-cards-container">
          <div className="sequence-input-card">
            <p>What is your product called ?</p>
            <input
              type="text"
              placeholder="eg: Leadzilla"
              maxLength="500"
              onChange={handleCompanyNameInputChange}
            />

            <p>Describe your product ?</p>

            <textarea
              type="text"
              className="input-large"
              maxLength="500"
              placeholder="eg: An AI powered tool for better sales prospecting and engagement"
              onChange={handleCompanyDescriptionInputChange}
            />
            <button
              className="primary-button"
              onClick={() => {
                createEmailCopyList();
              }}
            >
              Create copy
            </button>
          </div>
          <div className="sequence-result-card">
            <h3>AI generated copy</h3>
            <Divider />

            {copyLoading ? (
              <span>
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{
                        fontSize: 40,
                        fontWeight: 600,
                      }}
                      spin
                    />
                  }
                />{" "}
                <p>
                  AI can take around 20 seconds to generate emails completely :)
                </p>
              </span>
            ) : (
              ""
            )}

            <span>
              <List
                itemLayout="vertical"
                dataSource={[...generatedCopyList]}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      // eslint-disable-next-line react/jsx-no-target-blank
                      <a
                        href={decodeURI(
                          "https://mail.google.com/mail/?view=cm&fs=1&su=" +
                            item.subject +
                            "&body=" +
                            item.body
                        )}
                        target="_blank"
                      >
                        Open Email
                      </a>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.subject}
                      description={item.body}

                      // description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                    />
                  </List.Item>
                )}
              />
            </span>
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
