// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  where,
  query,
  collection,
  deleteDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import moment from "moment";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAR933WHOV8rPS0LC-cOaCpfP4NYFMuTZc",
  authDomain: "leadzilla-4c8c9.firebaseapp.com",
  projectId: "leadzilla-4c8c9",
  storageBucket: "leadzilla-4c8c9.appspot.com",
  messagingSenderId: "149985000313",
  appId: "1:149985000313:web:ae31fbdd0562630ed74da8",
  measurementId: "G-M041H29TN4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

//SignIn with google
export const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // The signed-in user info.
      const user = result.user;
      console.log(user);
      createUserInFirestore(user.uid, user.email);
    })
    .catch((error) => {
      // Handle Errors here.
      console.log(error);
    });
};

//save user data
export const createUserInFirestore = async (
  firebaseUserUUID,
  firebaseUserEmail
) => {
  try {
    console.log("user exists, getting user document");
    const docSnap = await getDoc(doc(db, "users", `${firebaseUserUUID}`));
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No user data!, creating one");
      // Add a new document in collection "Users"
      await setDoc(doc(db, "users", `${firebaseUserUUID}`), {
        credits: 20,
        base_credits: 0,
        account: "business",
        salesforce: {
          instance_url: "",
          refresh_token: "",
          enabled: false,
        },
        email: `${firebaseUserEmail}`,
        firebase_auth_uuid: `${firebaseUserUUID}`,
        subscription_id: "none",
      });
    }
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

export const getCreditsInfo = async (firebaseUserUUID) => {
  const docSnap = await getDoc(doc(db, "users", `${firebaseUserUUID}`));
  let credits = docSnap.credits;
  return credits;
};

/**
 * All firebase helper queries regarding company lists
 */

export const createCompanyList = async (
  firebaseUserUUID,
  listName,
  listDescription,
  jobKeywordsList,
  titleKeywordsList
) => {
  try {
    // check if this list already exists in db
    const querySnapshot = await getDocs(
      query(
        collection(db, "company_list"),
        where("firebase_auth_uuid", "==", firebaseUserUUID),
        where("listName", "==", listName)
      )
    );
    console.log(querySnapshot.docs.length);
    if (querySnapshot.docs.length === 0) {
      //console.log(firebaseUserUUID, listName, listDescription);
      //check if content are not empty
      if (
        (firebaseUserUUID.length > 0,
        listName.length > 0,
        listDescription.length > 0)
      ) {
        // Save list
        const docRef = await addDoc(collection(db, "company_list"), {
          contentCount: 0,
          listName: `${listName}`,
          listDescription: `${listDescription}`,
          firebase_auth_uuid: `${firebaseUserUUID}`,
          jobKeywords: [...jobKeywordsList],
          titleKeywords: [...titleKeywordsList],
        });
        // console.log("Document written with ID: ", docRef.id);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const fetchCompanyList = async (firebaseUserUUID) => {
  let list = [];
  try {
    // check if this list already exists in db
    const querySnapshot = await getDocs(
      query(
        collection(db, "company_list"),
        where("firebase_auth_uuid", "==", firebaseUserUUID)
      )
    );
    console.log(querySnapshot.docs);
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
      //console.log(doc.data());
      // console.log(doc.id, " => ", doc.data());
    });

    //console.log(list);
  } catch (err) {
    console.log(err);
  }
  return list;
};

/**
 * Deletes an entrie company list
 * first deletes all the saved companies inside that list one by one(inefficeint than bulk delete)
 * then deletes the company list itself
 */
export const deleteCompanyList = async (
  firebaseUserUUID,
  listName,
  listDescription
) => {
  try {
    //console.log(firebaseUserUUID, listName, listDescription);
    //check if content are not empty
    if (
      (firebaseUserUUID.length > 0,
      listName.length > 0,
      listDescription.length > 0)
    ) {
      //first delete all the saved companies inside that list

      //get all saved companies in this list
      let companies = await fetchSavedCompanies(firebaseUserUUID, listName);
      console.log(companies);

      // delete each company one by one
      companies.forEach(async (company) => {
        // console.log(
        //   firebaseUserUUID,
        //   company.listName,
        //   company.company,
        //   company.domain
        // );

        await deleteSavedCompany(
          firebaseUserUUID,
          company.listName,
          company.company,
          company.domain
        );
      });

      //now delete the actual list
      const listQuery = query(
        collection(db, "company_list"),
        where("firebase_auth_uuid", "==", firebaseUserUUID),
        where("listName", "==", listName),
        where("listDescription", "==", listDescription)
      );
      const listQuerySnapshot = await getDocs(listQuery);
      listQuerySnapshot.forEach(async (record) => {
        //console.log(record.data());
        await deleteDoc(doc(db, "company_list", `${record.id}`));
      });
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * Deletes an entrie company list
 * first deletes all the saved companies inside that list in bulk(efficent)
 * then deletes the company list itself
 */
export const deleteCompanyListBulk = async (
  firebaseUserUUID,
  listName,
  listDescription
) => {
  try {
    const batch = writeBatch(db);

    console.log("deleting ->", listName, listDescription);
    //console.log(firebaseUserUUID, listName, listDescription);
    //check if content are not empty
    if (
      (firebaseUserUUID.length > 0,
      listName.length > 0,
      listDescription.length > 0)
    ) {
      //first delete all the saved companies inside that list

      // check if this list already exists in db get their ids
      const querySnapshot = await getDocs(
        query(
          collection(db, "companies"),
          where("firebase_auth_uuid", "==", firebaseUserUUID),
          where("listName", "==", listName)
        )
      );

      // prepare batch delete with theri ids
      querySnapshot.forEach(async (record) => {
        //console.log(record.data());
        //console.log(record.id);
        let companyRef = doc(db, "companies", `${record.id}`);
        batch.delete(companyRef);
      });

      //commit all delete of companies in one go
      await batch.commit();

      //Now delete the actual list(eg: name description )
      const listQuery = query(
        collection(db, "company_list"),
        where("firebase_auth_uuid", "==", firebaseUserUUID),
        where("listName", "==", listName),
        where("listDescription", "==", listDescription)
      );
      const listQuerySnapshot = await getDocs(listQuery);
      listQuerySnapshot.forEach(async (record) => {
        //console.log(record.data());
        await deleteDoc(doc(db, "company_list", `${record.id}`));
      });
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * Save a single company(domain) inside a given company list for tracking
 */

export const saveCompany = async (
  firebaseUserUUID,
  listName,
  domain,
  company
) => {
  try {
    console.log("saving this company to list");

    console.log(firebaseUserUUID, listName, domain, company);
    // check if this list already exists in db
    const querySnapshot = await getDocs(
      query(
        collection(db, "companies"),
        where("firebase_auth_uuid", "==", firebaseUserUUID),
        where("listName", "==", listName),
        where("company", "==", company),
        where("domain", "==", domain)
      )
    );
    if (querySnapshot.docs.length === 0) {
      //check if content are not empty
      if ((firebaseUserUUID.length > 0, listName.length > 0)) {
        // Save list

        const docRef = await addDoc(collection(db, "companies"), {
          listName: `${listName}`,
          domain: `${domain}` || "",
          firebase_auth_uuid: `${firebaseUserUUID}`,
          company: `${company}`,
          /** Set lastSyncTime to prev year so that backend-cron job fetches
           * alerts for the first time
           */
          lastSyncTime: moment().subtract(1, "years").toDate(),
          signals: {
            domain: `${domain}` || "",
            promotions: [],
            newhires: [],
            jobsposted: [],
            fundings: [],
            newsmentions: [],
          },
        });
        // console.log("Document written with ID: ", docRef.id);
      }
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

/**
 * Saves multiple companies in a singal batch firestore
 */

export const saveCompanyInBulk = async (
  firebaseUserUUID,
  listName,
  companies
) => {
  try {
    const batch = writeBatch(db);
    companies.forEach(async (company) => {
      console.log("bulk: saving this company to list");

      console.log(firebaseUserUUID, listName, company.domain, company.company);

      //check if content are not empty
      if ((firebaseUserUUID.length > 0, listName.length > 0)) {
        // Save list

        const companyRef = doc(collection(db, "companies"));
        console.log("companyRef---->", companyRef);

        batch.set(companyRef, {
          listName: `${listName}`,
          domain: `${company.domain}` || "",
          firebase_auth_uuid: `${firebaseUserUUID}`,
          company: `${company.company}`,
          /** Set lastSyncTime to prev year so that backend-cron job fetches
           * alerts for the first time
           */
          lastSyncTime: moment().subtract(1, "years").toDate(),
          signals: {
            domain: `${company.domain}` || "",
            promotions: [],
            newhires: [],
            jobsposted: [],
            fundings: [],
            newsmentions: [],
          },
        });
        // console.log("Document written with ID: ", docRef.id);
      }
    });
    await batch.commit();
  } catch (err) {
    console.log(err);
  }
};

export const fetchSavedCompanies = async (
  firebaseUserUUID,
  companyListName
) => {
  let list = [];

  try {
    // check if this list already exists in db
    const querySnapshot = await getDocs(
      query(
        collection(db, "companies"),
        where("firebase_auth_uuid", "==", firebaseUserUUID),
        where("listName", "==", companyListName)
      )
    );
    console.log(querySnapshot.docs);
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
      //console.log(doc.data());
      // console.log(doc.id, " => ", doc.data());
    });

    //console.log(list);
  } catch (err) {
    console.log(err);
  }
  return list;
};

export const deleteSavedCompany = async (
  firebaseUserUUID,
  listName,
  company,
  domain
) => {
  try {
    console.log(firebaseUserUUID, listName, domain, company);

    const q = query(
      collection(db, "companies"),
      where("firebase_auth_uuid", "==", firebaseUserUUID),
      where("listName", "==", listName),
      where("company", "==", company),
      where("domain", "==", domain)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (record) => {
      //console.log(record.data());
      await deleteDoc(doc(db, "companies", `${record.id}`));
    });
  } catch (err) {
    console.log(err);
  }
};

export const UpdateUserProfileWithNewData = async (firebaseUserUUID) => {
  let userList = [];
  try {
    /**
     * Fetch All user data and save in list
     * */
    // check if this list already exists in db
    const querySnapshot = await getDocs(query(collection(db, "users")));
    //console.log(querySnapshot.docs);
    querySnapshot.forEach((doc) => {
      userList.push({
        id: doc.id,
        data: doc.data(),
      });
      //console.log(doc.data());
      // console.log(doc.id, " => ", doc.data());
    });

    console.log(userList);

    /**
     * Update above fetched profiles with new data & fields
     * */
    userList.forEach(async (userData, index) => {
      // do this for first 100 contacts
      if (index <= 100) {
        await updateDoc(doc(db, "users", `${userData.id}`), {
          // account: "business",
          salesforce: {
            instance_url: "",
            refresh_token: "",
            enabled: false,
          },
        });
        console.log(index, "->", userData.id);
      }
    });
    console.log("doc update done");
  } catch (err) {
    console.log(err);
  }
};

/**
 * Get saved integartions config for loggedIn user
 */
export const getUserSavedIntegrationSettings = async (firebaseUserUUID) => {
  var userData = {};
  try {
    // Get users data
    const docSnap = await getDoc(doc(db, "users", `${firebaseUserUUID}`));
    if (docSnap.exists()) {
      // if user exists update credit info
      console.log("user document exists in db");
      //console.log(docSnap.data());
      let rawData = docSnap.data();
      userData["salesforce"] = rawData?.salesforce || "";
      userData["hubspot"] = rawData?.hubspot || "";
    } else {
      // doc.data() will be undefined in this case
      console.log("No user data!");
    }
  } catch (error) {
    console.error("Error adding document: ", error);
  }
  return userData;
};
