/**
Stores the firebase UUID for loggedin user
 */

import React, { useState, createContext } from "react";

export const UserIdContext = createContext();

export const UserIdContextProvider = (props) => {
  const [userId, setUserId] = useState("");

  return (
    <UserIdContext.Provider value={[userId, setUserId]}>
      {props.children}
    </UserIdContext.Provider>
  );
};
