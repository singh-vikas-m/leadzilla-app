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
} from "firebase/firestore";

import "firebase/firestore";
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
  listDescription
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
 * All firebase helper queries regarding saved companies
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
        });
        // console.log("Document written with ID: ", docRef.id);
      }
    }
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
