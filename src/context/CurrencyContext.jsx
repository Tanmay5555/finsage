"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rateFromINR: 1 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rateFromINR: 0.012 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rateFromINR: 0.011 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rateFromINR: 0.0095 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rateFromINR: 1.78 }
};

const CurrencyContext = createContext({
  currency: CURRENCIES.INR,
  setCurrencyCode: () => {},
  formatAmount: (amount) => `₹${amount}`,
  convertFromINR: (amount) => amount,
  currencies: CURRENCIES
});

export const CurrencyProvider = ({ children }) => {
  const [selectedCode, setSelectedCode] = useState("INR");

  useEffect(() => {
    const saved = localStorage.getItem("finsage_currency");
    if (saved && CURRENCIES[saved]) {
      setSelectedCode(saved);
    }
  }, []);

  const setCurrencyCode = (code) => {
    if (CURRENCIES[code]) {
      setSelectedCode(code);
      localStorage.setItem("finsage_currency", code);
    }
  };

  const currency = CURRENCIES[selectedCode] || CURRENCIES.INR;

  const convertFromINR = (amountInINR) => {
    const numeric = Number(amountInINR) || 0;
    return numeric * currency.rateFromINR;
  };

  const formatAmount = (amountInINR, decimals = 2) => {
    const converted = convertFromINR(amountInINR);
    const formattedNumber = converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    return `${currency.symbol}${formattedNumber}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrencyCode,
        formatAmount,
        convertFromINR,
        currencies: CURRENCIES
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
