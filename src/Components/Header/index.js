"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import SearchIcon from "@/../public/search-icon.svg";
import BurgerMenuIcon from "@/../public/burger-menu.svg";
import UserIcon from "@/../public/user-icon.svg";
import WishlistIcon from "@/../public/wishlist-icon.svg";
import CartIcon from "@/../public/cart-icon.svg";
import OrderIcon from "@/../public/order-icon.svg";
import LogoutIcon from "@/../public/logout-icon.svg";
import ReviewIcon from "@/../public/reviews-icon.svg";
import cn from "@/utils/cn";
import { logout } from "@/app/actions";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGlobalLoading } from "@/context/loadingContext";
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

const navItems = [
  { pageName: "Home", href: "/" },
  { pageName: "About", href: "/about" },
  { pageName: "Contact", href: "/contact" },
];

const Header = () => {
  const { setIsLoading } = useGlobalLoading();
  const router = useRouter();
  const user = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMenuOpen);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      {/* Overlay */}
      {(isUserMenuOpen || isMenuOpen) && (
        <div
          className={cn(
            "fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 md:hidden",
            { "md:block bg-opacity-0": isUserMenuOpen },
            {}
          )}
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}

      {/* Header */}
      <header
        onClick={() => {
          setIsUserMenuOpen(false);
          setIsMenuOpen(false);
        }}
        className="sticky top-0 flex justify-between items-center w-full h-16 bg-item_background shadow-md px-6 z-30"
      >
        <Link className="text-xl font-bold text-black" href="./">
          Exclusive
        </Link>

        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-12 justify-center items-center max-md:hidden flex">
          {navItems.map((item) => (
            <Link
              key={item.pageName}
              href={item.href}
              className={`${poppins.className} relative group text-base text-black`}
            >
              {item.pageName}
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-black transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-center gap-1">
          <div className="flex bg-white rounded-r-sm border z-10 max-lg:hidden">
            <input
              className="p-2 text-[14px] w-56"
              placeholder="what are you looking for?"
            />
            <div className="px-2 flex items-center justify-center cursor-pointer border">
              <SearchIcon />
            </div>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Link href="/wishlist" className="relative">
              <WishlistIcon />
              <div className="h-4 w-4 bg-primary rounded-full text-white text-sm flex items-center justify-center absolute -top-[0.5px] -right-[1.1px]">
                0
              </div>
            </Link>
            <Link href="/cart" className="relative">
              <CartIcon />
              <div className="h-4 w-4 bg-primary rounded-full text-white text-sm flex items-center justify-center absolute -top-[0.5px] -right-[1.1px]">
                0
              </div>
            </Link>
            <div className="relative flex items-center justify-center">
              <div
                className={cn(
                  "h-8 w-8 rounded-full text-black flex justify-center items-center cursor-pointer overflow-hidden",
                  { "border border-primary": user !== null }
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (user) {
                    if (isMenuOpen) setIsMenuOpen(false);
                    setIsUserMenuOpen((prev) => !prev);
                  } else {
                    router.push("/login");
                  }
                }}
              >
                {user?.imageUrl ? (
                  <Image
                    src={user?.imageUrl}
                    alt="user"
                    width={0}
                    height={0}
                    className="w-full h-full"
                    priority={true}
                    sizes="100vw"
                  />
                ) : (
                  <UserIcon />
                )}
              </div>
              <div
                onClick={() => {
                  setIsUserMenuOpen(false);
                }}
                className={cn(
                  `hidden absolute top-3 right-2 w-56 z-10000  flex-col z-40  drop-shadow-sm bg-primary bg-opacity-35 backdrop-blur-md rounded-md text-white py-4  pl-4 ${poppins.className} text-[15px]`,
                  { flex: isUserMenuOpen }
                )}
              >
                <Link
                  className="flex items-center gap-3  p-1 hover:border-white hover:scale-[1.01] border-2 border-transparent rounded-md hover:shadow-sm hover:border-opacity-10"
                  href="/account"
                >
                  <UserIcon />
                  Manage My Account
                </Link>
                <Link
                  className="flex items-center  gap-3  p-1 hover:border-white hover:scale-[1.01] border-2 border-transparent rounded-md hover:shadow-sm hover:border-opacity-10"
                  href="/order"
                >
                  <OrderIcon />
                  My Order
                </Link>
                <Link
                  className="flex items-center  gap-3 p-1 hover:border-white hover:scale-[1.01] border-2 border-transparent rounded-md hover:shadow-sm hover:border-opacity-10"
                  href="/reviews"
                >
                  <ReviewIcon />
                  My Reviews
                </Link>
                <button
                  className="flex items-center  gap-3 p-1 hover:border-white hover:scale-[1.01] border-2 border-transparent rounded-md hover:shadow-sm hover:border-opacity-10"
                  onClick={async () => {
                    setIsLoading(true);
                    await logout();
                    setIsLoading(false);
                  }}
                >
                  <LogoutIcon />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isUserMenuOpen) setIsUserMenuOpen(false);
              toggleMenu();
            }}
            aria-label="Toggle menu"
          >
            <BurgerMenuIcon className="h-8 w-8" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 right-0 h-full w-[40%] bg-white shadow-md flex flex-col items-start p-4 md:hidden z-30 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {navItems.map((item) => (
          <Link
            key={item.pageName}
            href={item.href}
            className={`${poppins.className} relative group text-base w-full`}
          >
            {item.pageName}
            <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-black transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Header;
