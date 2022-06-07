/**
Stores the firebase UUID for loggedin user
 */

import React, { useState, createContext } from "react";

export const CreditCountContext = createContext();

export const CreditCountContextProvider = (props) => {
  const [CreditCount, setCreditCount] = useState("0");

  return (
    <CreditCountContext.Provider value={[CreditCount, setCreditCount]}>
      {props.children}
    </CreditCountContext.Provider>
  );
};
