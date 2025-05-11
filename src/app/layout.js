import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import "./globals.css";
import Header from "@/Components/Header";
import { GetCurrentUser } from "./actions";
import { UserProvider } from "@/context/userContext";
import { LoadingProvider } from "@/context/loadingContext";
const inter = Inter({ subsets: ["latin"], display: "swap" });

export default async function RootLayout({ children }) {
  const user = await GetCurrentUser();
  return (
    <html lang="en">
      <body className={`relative ${inter.className}`}>
        <AppRouterCacheProvider>
          <LoadingProvider>
            <UserProvider user={user}>
              <Header />
              {children}
            </UserProvider>
          </LoadingProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
