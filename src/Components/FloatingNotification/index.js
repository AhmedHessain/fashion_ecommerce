"use client";
import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Fade, Paper } from "@mui/material";

const FloatingNotification = ({ _id, title, message, link, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // start auto-close timer
    timerRef.current = setTimeout(() => {
      if (!hovered) {
        setVisible(false);
        onClose?.();
      }
    }, 3000);

    return () => clearTimeout(timerRef.current);
  }, [hovered, onClose]);

  const handleMouseEnter = () => {
    setHovered(true);
    clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 1500);
  };

  const markAsRead = async () => {
    try {
      await fetch(`/api/notifications/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  const handleClick = async () => {
    await markAsRead();
    if (link) window.location.href = link;
    onClose?.();
  };

  return (
    <Fade in={visible} timeout={400}>
      <Paper
        elevation={8}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: "fixed",
          bottom: 28,
          right: 28,
          minWidth: 300,
          maxWidth: 380,
          p: 1.8,
          borderRadius: "16px",
          backgroundColor: "#fff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          zIndex: 2000,
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.4,
          }}
        >
          {message}
        </Typography>
      </Paper>
    </Fade>
  );
};

export default FloatingNotification;
