import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { BadgeCheck, X } from "lucide-react";
import parseJwt from "@/services/parseJwt";
import { GetUserInfo } from "@/services/apiServices/userService";
import { GetUserConfigByUserId } from "@/services/apiServices/userConfigService";
import { useUserExperience } from "@/context/UserExperienceContext";
import NotificationBell from "@/components/notification/NotificationBell";
import LoginForm from "./loginForm";
import ProfileDialog from "./profileDialog";
import InventoryDialog from "./inventoryDialog";
import "@/components/header/index.css";
import { toast } from "sonner";
import RegisterButton from "@/pages/common/hero/registerButton";
import TreeXPLogDialog from "./TreeXPLogDialog";
import UserXPLogDialog from "./UserXPLogDialog";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openProfile, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("https://github.com/shadcn.png");
  const navigate = useNavigate();
  const location = useLocation();
  const { totalXp, levelId, xpToNextLevel, refreshXp } = useUserExperience();
  const [navItems, setNavItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let role = null;

    if (token) {
      try {
        // Sử dụng parseJwt để giải mã token
        const decoded = parseJwt(token);
        role = decoded?.role; // Lấy role từ payload
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }

    if (role === "Player") {
      setNavItems([
        { path: "/home", label: "Home", hasUpdate: false },
        // { path: "/task", label: "Tasks", hasUpdate: false },
        { path: "/workspace", label: "Workspace", hasUpdate: false },
        { path: "/tree", label: "Trees", hasUpdate: false },
        // { path: "/calendar", label: "Calendar", hasUpdate: false },
        { path: "/marketplace", label: "Marketplace", hasUpdate: false },
        { path: "/challenges", label: "Challenges", hasUpdate: false },
      ]);
    } else {
      setNavItems([
        { path: "#", label: "Get Started", onClick: () => setIsOpen(true) },
        { path: "/faq", label: "FAQ" },
      ]);
    }
  }, []);

  useEffect(() => {
    const calendarHasUpdate =
      localStorage.getItem("calendarHasUpdate") === "true";

    setNavItems((prev) =>
      prev.map((item) =>
        item.path === "/calendar"
          ? { ...item, hasUpdate: calendarHasUpdate }
          : item
      )
    );
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    setNavItems((prev) =>
      prev.map((item) =>
        item.path === currentPath ? { ...item, hasUpdate: false } : item
      )
    );
  }, [location.pathname]);

  useEffect(() => {
    refreshXp();
  }, []);

  useEffect(() => {
    const fetchUserConfig = async () => {
      const token = localStorage.getItem("token");
      const parsed = parseJwt(token);
      const userId = parsed?.sub;

      if (!userId) return;

      try {
        const config = await GetUserConfigByUserId(userId);
        if (config?.imageUrl) {
          setAvatarUrl(config.imageUrl);
        }
      } catch (error) {
        console.error("❌ Failed to fetch user config:", error);
      }
    };

    fetchUserConfig();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = parseJwt(token);
    const userId = decoded?.sub;
    if (!userId) return;
    GetUserInfo(userId)
      .then((data) => {
        setUser(data);
        setWalletBalance(data.wallet?.balance || 0);
      })
      .catch((error) => console.log("Failed to load user:", error));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("backgroundUrl");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("selectedTreeId");

    toast.success("Signed out!");
    navigate("/");
    window.location.reload();
  };

  const [isTreeXPLogOpen, setIsTreeXPLogOpen] = useState(false);
  const [isUserXPLogOpen, setIsUserXPLogOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <nav className="flex items-center justify-between w-full p-6 py-2 custom-nav">
        {/* Logo và Nav Items */}
        <div className="flex items-center">
          <a href="/" className="p-1.5">
            <span className="sr-only">Your Company</span>
            <img
              className="h-12 w-auto"
              src="/logo/zengarden-logo.png"
              alt="Logo"
            />
          </a>
          <div className="hidden lg:flex ml-4 gap-x-8 pl-4">
            {navItems.map((item) => (
              <div
                key={item.path}
                onClick={() => {
                  if (item.path === "#") {
                    setIsOpen(true); // Nếu là "Get Started", mở RegisterButton
                  } else {
                    navigate(item.path); // Điều hướng nếu không phải "Get Started"
                  }
                }}
                className={`relative text-sm font-semibold cursor-pointer transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "text-green-600 font-bold"
                    : "text-gray-900 hover:text-green-600"
                }`}
              >
                {item.label}

                {/* Chấm đỏ nếu có update */}
                {item.hasUpdate && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
            ))}
          </div>
          {isOpen && <RegisterButton isOpen={isOpen} setIsOpen={setIsOpen} />}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              inert={!mobileMenuOpen ? "true" : "false"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-xs">
                  <h2 className="text-sm font-bold text-gray-800">
                    {user?.userName || "Guest"}
                  </h2>
                  <div className="flex items-center gap-1 mt-0">
                    <span className="text-[11px] font-semibold text-gray-700">
                      Level {levelId}
                    </span>
                    <Progress
                      value={(totalXp / (totalXp + xpToNextLevel)) * 100}
                      className="w-20 h-1"
                    />
                    <span className="text-[11px] text-gray-500">
                      {totalXp} / {totalXp + xpToNextLevel} XP
                    </span>
                  </div>
                  <div className="mt-0 text-[14px] text-gray-600 flex items-center gap-0.5">
                    <img
                      src="/images/coin.png"
                      alt="Coin"
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">{walletBalance ?? 0}</span>
                    <button
                      className="ml-1 text-white font-bold text-lg hover:bg-[#609994] transition-colors bg-[#83aa6c] rounded-full w-5 h-5 flex items-center justify-center outline-none focus:ring-0 focus:outline-none"
                      onClick={() => navigate("/marketplace?tab=Package")}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <NotificationBell setNavItems={setNavItems} />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={avatarUrl} alt="User Avatar" />
                      <AvatarFallback>
                        {user?.userName
                          ? user.userName.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        className="justify-start border-solid hover:bg-gray-100 focus:border-none focus:ring-0 bg-white"
                        onClick={() => setProfileOpen(true)}
                      >
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start border-none hover:bg-gray-100 focus:border-none focus:ring-0 bg-white"
                        onClick={() => setIsInventoryOpen(true)}
                      >
                        Inventory
                      </Button>

                      <>
                        <Button
                          variant="ghost"
                          className="justify-start border-none hover:bg-gray-100 focus:border-none focus:ring-0 bg-white"
                          onClick={() => setIsUserXPLogOpen(true)}
                        >
                          User XP Log
                        </Button>

                        <UserXPLogDialog
                          open={isUserXPLogOpen}
                          onOpenChange={setIsUserXPLogOpen}
                        />
                      </>

                      <>
                        <Button
                          variant="ghost"
                          className="justify-start border-none hover:bg-gray-100 focus:border-none focus:ring-0 bg-white"
                          onClick={() => setIsTreeXPLogOpen(true)}
                        >
                          Tree XP Log
                        </Button>

                        <TreeXPLogDialog
                          open={isTreeXPLogOpen}
                          onOpenChange={setIsTreeXPLogOpen}
                        />
                      </>

                      <Button
                        variant="ghost"
                        className="justify-start border-none hover:bg-gray-100 focus:border-none focus:ring-0 text-red-500 bg-white"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <ProfileDialog
                open={openProfile}
                setOpen={setProfileOpen}
                user={user}
                setUser={setUser}
              />
              <InventoryDialog
                open={isInventoryOpen}
                setOpen={setIsInventoryOpen}
                user={user}
              />
            </>
          ) : (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild onClick={() => setIsSheetOpen(true)}>
                <motion.div
                  className="farmer-badge"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BadgeCheck className="icon" />
                  <span>Farmer Verified</span>
                </motion.div>
              </SheetTrigger>
              <LoginForm
                setIsLoggedIn={setIsLoggedIn}
                setIsSheetOpen={setIsSheetOpen}
              />
            </Sheet>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            <div className="lg:hidden">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`block py-2 text-sm font-semibold transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "text-green-600 font-bold"
                      : "text-gray-900 hover:text-green-600"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-6 flex flex-col items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage
                          src={
                            user?.imageUrl || "https://github.com/shadcn.png"
                          }
                          alt="User Avatar"
                        />
                        <AvatarFallback>
                          {user?.userName
                            ? user.userName.charAt(0).toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => setProfileOpen(true)}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => setIsInventoryOpen(true)}
                        >
                          Inventory
                        </Button>

                        <>
                          <Button
                            variant="ghost"
                            className="justify-start"
                            onClick={() => setIsTreeXPLogOpen(true)}
                          >
                            Tree XP Log
                          </Button>

                          <TreeXPLogDialog
                            open={isTreeXPLogOpen}
                            onOpenChange={setIsTreeXPLogOpen}
                          />
                        </>

                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => console.log("Settings clicked")}
                        >
                          Settings
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start text-red-500"
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <ProfileDialog
                    open={openProfile}
                    setOpen={setProfileOpen}
                    user={user}
                    setUser={setUser}
                  />
                  <InventoryDialog
                    open={isInventoryOpen}
                    setOpen={setIsInventoryOpen}
                    user={user}
                  />
                </>
              ) : (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild onClick={() => setIsSheetOpen(true)}>
                    <motion.div
                      className="farmer-badge"
                      whileHover={{ scale: 1.1, rotate: 2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <BadgeCheck className="icon" />
                      <span>Farmer Verified</span>
                    </motion.div>
                  </SheetTrigger>
                  <LoginForm
                    setIsLoggedIn={setIsLoggedIn}
                    setIsSheetOpen={setIsSheetOpen}
                  />
                </Sheet>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
