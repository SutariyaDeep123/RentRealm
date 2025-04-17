"use client"
import { ToastContainer } from "react-toastify";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { UserProvider } from "@/components/ui/UserContext";
import { useEffect } from 'react';
import { initializeAuth } from '@/utils/auth';

export default function RootLayout({ children }) {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <html lang="en">
      <body>
        <Theme>
          <UserProvider>
            <ToastContainer />

            {children}
          </UserProvider>
        </Theme>
      </body>
    </html>
  );
}
