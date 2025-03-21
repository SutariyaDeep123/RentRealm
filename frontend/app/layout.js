"use client"
import { ToastContainer } from "react-toastify";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { UserProvider } from "@/components/ui/UserContext";



export default function RootLayout({ children }) {
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
