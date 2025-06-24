import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import "./globals.css";
import Header from "@/Components/Header";
import { GetCurrentUser } from "./actions";
import { UserProvider } from "@/context/userContext";
import { LoadingProvider } from "@/context/loadingContext";
import Footer from "@/Components/Footer";
const inter = Inter({ subsets: ["latin"], display: "swap" });

export default async function RootLayout({ children }) {
  const user = await GetCurrentUser();
  return (
    <html lang="en">
      <body
        className={`relative ${inter.className} flex flex-col min-h-screen`}
      >
        <AppRouterCacheProvider>
          <LoadingProvider>
            <UserProvider user={user}>
              <Header />
              <main className="flex-1 pb-16 relative">{children}</main>
              <Footer />
            </UserProvider>
          </LoadingProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
