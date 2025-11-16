"use client";
import React, { createContext, useContext, useState } from "react";
import FloatingNotification from "@/Components/FloatingNotification";

const NotificationContext = createContext(null);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notif, setNotif] = useState(null);

  const showNotification = (notification) => {
    setNotif({ ...notification, open: true });
  };

  const handleClose = () => setNotif(null);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notif && <FloatingNotification {...notif} onClose={handleClose} />}
    </NotificationContext.Provider>
  );
};
