import React, { useState } from "react";
import "./Sequence.css";
import Topnav from "../../Components/Topnav/Topnav";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Spin, List } from "antd";
import axios from "axios";

export default function Sequence() {
  //misc states
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [firebaseAuthUUID, setFirebaseAuthUUID] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [generatedCopyList, setGeneratedCopyList] = useState([]);
  const [copyLoading, setCopyLoading] = useState(false);

  let navigate = useNavigate();

  // const serverURL = "http://localhost:6060";
  const serverURL = "https://leadzilla.herokuapp.com";

  var currentCredit = 0;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      //console.log("user logged in");
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

  const fetchEmailTemplates = async (productName, productDescription) => {
    /**
     * data contains paragraph as sample data, and other open ai
     * related setting taken directly from opan ai playground
     */

    // var gpt3_data = {
    //   prompt: `Write an impactful and convincing cold email based on the product name and product description.\n\nProduct name: FitnessMarketer\nProduct description: A marketing service to help your gym get new clients repeatably\nEmail: Want to increase your gym clients? When your gym is seeking new clients, you may be seeking a marketing service.\nOur team has over 10 years of experience making sure your gym gets new clients, with no financial risk. We can help you grow your business.\nWe offer free trials, so you can try them before you buy.\nClick here to learn more about our gym marketing services.\n\nProduct name: Roambee\nProduct description: Roambee is an IoT solution that helps companies track shipments and give them real-time visibility.\nEmail: Want to track your shipments in real-time? Roambee is an IoT solution that helps companies track shipments and give them real-time visibility\nRoambee offers an app that allows businesses to track their shipments like never before. With its hardware, they can even monitor which areas of the vehicles are getting hotter, colder, or when containers are in motion.\nBy installing this system, customers can cut costs by identifying vehicle breakdowns before they happen. They can also prevent theft by better monitoring the location of their cargo while they are in transit.\nSign up now to learn more about Roambee and how it can help your business run more efficiently!\n\nProduct name: ${companyName}\nProduct description: ${companyDescription}.\nEmail: `,
    //   temperature: 0.5,
    //   max_tokens: 500,
    //   top_p: 1,
    //   best_of: 5,
    //   frequency_penalty: 0,
    //   presence_penalty: 0,
    // };

    var gpt3_data = {
      prompt: `Write an impactful and convincing cold email & subject based on the product name and product description.\n\nProduct name: FitnessMarketer\nProduct description: A marketing service to help your gym get new clients repeatably\nSubject: Want to increase your gym clients? \nEmail: When your gym is seeking new clients, you may be seeking a marketing service.\nOur team has over 10 years of experience making sure your gym gets new clients, with no financial risk. We can help you grow your business.\nWe offer free trials, so you can try them before you buy.\nClick here to learn more about our gym marketing services.\n\nProduct name: Roambee\nProduct description: Roambee is an IoT solution that helps companies track shipments and give them real-time visibility.\nSubject: Want to track your shipments in real-time?\nEmail: Roambee is an IoT solution that helps companies track shipments and give them real-time visibility\nRoambee offers an app that allows businesses to track their shipments like never before. With its hardware, they can even monitor which areas of the vehicles are getting hotter, colder, or when containers are in motion.\nBy installing this system, customers can cut costs by identifying vehicle breakdowns before they happen. They can also prevent theft by better monitoring the location of their cargo while they are in transit.\nSign up now to learn more about Roambee and how it can help your business run more efficiently!\n\nProduct name: ${companyName}\nProduct description: ${companyDescription}\nSubject:`,
      temperature: 0.5,
      max_tokens: 500,
      top_p: 1,
      best_of: 5,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    let generatedCopy = {};

    try {
      // setCopyLoading(true);
      await axios
        .post(`${serverURL}/email`, JSON.stringify(gpt3_data), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
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

  const createEmailCopyList = async () => {
    let emailCopyList = [];
    setCopyLoading(true);

    for (let i = 0; i < 10; i++) {
      let generatedEmail = await fetchEmailTemplates(
        companyName,
        companyDescription
      );
      emailCopyList.push(generatedEmail);
      setGeneratedCopyList(emailCopyList);
    }
    console.log(emailCopyList);
    setCopyLoading(false);
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
              onChange={handleCompanyNameInputChange}
            />

            <p>Describe your product ?</p>

            <textarea
              type="text"
              className="input-large"
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
            <h3>Generated copy</h3>
            {copyLoading ? (
              <span>
                <Spin />
                <p>This can take around 20 seconds to load completely :)</p>
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
                        href={decodeURIComponent(
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
