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
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const user = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMenuOpen);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!searchValue) {
      // Show random products when search is empty but focused
      if (showSuggestions) {
        const fetchRandomProducts = async () => {
          try {
            const res = await fetch('/api/products?limit=6&fields=name,_id,mainImage');
            const data = await res.json();
            const randomProducts = (data.data || []).map((p) => ({
              type: "product",
              name: p.name,
              id: p._id,
              mainImage: p.mainImage,
            }));
            // Add "browse all products" option for random products
            randomProducts.push({ type: "see_more", query: "", isBrowseAll: true });
            setSuggestions(randomProducts);
          } catch (e) {
            setSuggestions([]);
          }
        };
        fetchRandomProducts();
      } else {
        setSuggestions([]);
      }
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?name=${encodeURIComponent(
            searchValue
          )}&limit=6&fields=name,_id,mainImage`
        );
        const data = await res.json();
        let suggs = (data.data || []).map((p) => ({
          type: "product",
          name: p.name,
          id: p._id,
          mainImage: p.mainImage,
        }));
        if (searchValue) {
          suggs = suggs.slice(0, 6);
          suggs.push({ type: "see_more", query: searchValue });
        }
        setSuggestions(suggs);
      } catch (e) {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [searchValue, showSuggestions]);

  const handleSuggestionClick = (sugg) => {
    setShowSuggestions(false);
    if (sugg.type === "product") {
      setSearchValue("");
      router.push(`/products/${sugg.id}`);
    } else if (sugg.type === "see_more") {
      if (pathname === "/products") {
        window.location.href = `/products?search=${encodeURIComponent(sugg.query)}`;
      } else {
        setSearchValue(sugg.query);
        router.push(`/products?search=${encodeURIComponent(sugg.query)}`);
      }
    }
  };

  const handleInputKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && searchValue) {
        setShowSuggestions(false);
        if (pathname === "/products") {
          window.location.href = `/products?search=${encodeURIComponent(searchValue)}`;
        } else {
          router.push(`/products?search=${encodeURIComponent(searchValue)}`);
          setSearchValue("");
        }
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else if (searchValue) {
        setShowSuggestions(false);
        if (pathname === "/products") {
          window.location.href = `/products?search=${encodeURIComponent(searchValue)}`;
        } else {
          router.push(`/products?search=${encodeURIComponent(searchValue)}`);
          setSearchValue("");
        }
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

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
          <div className="flex bg-white rounded-r-sm border z-10 max-lg:hidden relative">
            <input
              className="p-2 text-[14px] w-56"
              placeholder="what are you looking for?"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={handleInputKeyDown}
            />
            <div
              className="px-2 flex items-center justify-center cursor-pointer border"
              onClick={() => {
                if (pathname === "/products") {
                  if (searchValue) {
                    window.location.href = `/products?search=${encodeURIComponent(searchValue)}`;
                  } else {
                    window.location.href = "/products";
                  }
                  setShowSuggestions(false);
                } else {
                  if (searchValue) {
                    router.push(
                      `/products?search=${encodeURIComponent(searchValue)}`
                    );
                  } else {
                    router.push("/products");
                  }
                  setShowSuggestions(false);
                  setSearchValue("");
                }
              }}
            >
              <SearchIcon />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 top-full w-full bg-white border border-gray-200 rounded shadow-lg z-50 mt-1">
                {suggestions.map((sugg, idx) => (
                  <div
                    key={
                      sugg.type === "product"
                        ? sugg.id
                        : `see-more-${sugg.query}`
                    }
                    className={`flex items-center px-4 py-2 cursor-pointer gap-2 hover:bg-gray-100 ${
                      idx === highlightedIndex ? "bg-gray-100" : ""
                    }`}
                    onMouseDown={() => handleSuggestionClick(sugg)}
                  >
                    {sugg.type === "product" ? (
                      <>
                        {sugg.mainImage && (
                          <Image
                            src={sugg.mainImage}
                            alt={sugg.name}
                            height={0}
                            width={0}
                            quality={100}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] object-cover rounded mr-3 border"
                          />
                        )}
                        <span
                          className="break-words whitespace-pre-line"
                          style={{ wordBreak: "break-word" }}
                        >
                          {sugg.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <SearchIcon className="w-5 h-5 mr-2 text-primary" />
                        <span
                          className="break-words whitespace-pre-line flex-1"
                          style={{ wordBreak: "break-word" }}
                        >
                          {sugg.isBrowseAll ? "Browse all products" : `See more results for ${sugg.query}`}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
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
