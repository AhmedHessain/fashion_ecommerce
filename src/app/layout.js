import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import "./globals.css";
import Header from "@/Components/Header";
import { UserProvider } from "@/context/userContext";
import { LoadingProvider } from "@/context/loadingContext";
import Footer from "@/Components/Footer";
import { GetCurrentUser } from "@/app/actions";
import { NotificationProvider } from "@/context/NotificationContext";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default async function RootLayout({ children }) {
  const currentUser = await GetCurrentUser();
  return (
    <html lang="en">
      <body
        className={`relative ${inter.className} flex flex-col min-h-screen`}
      >
        <AppRouterCacheProvider>
          <LoadingProvider>
            <UserProvider currentUser={currentUser}>
              <NotificationProvider>
                <Header />
                <main className="flex-1 pb-16 relative">{children}</main>
                <Footer />
              </NotificationProvider>
            </UserProvider>
          </LoadingProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
