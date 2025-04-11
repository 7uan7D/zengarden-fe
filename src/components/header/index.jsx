import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import "@/components/header/index.css";
import { X } from "lucide-react";
import { LoginService } from "@/services/apiServices/authService";
import parseJwt from "@/services/parseJwt";
import { GetUserInfo } from "@/services/apiServices/userService";
import { UpdateUserInfo } from "@/services/apiServices/userService";
import { ChangePassword } from "@/services/apiServices/authService";
import RegisterButton from "@/pages/common/hero/registerButton";
import { Progress } from "@/components/ui/progress";
import {
  ForgotPassword,
  ResetPassword,
} from "@/services/apiServices/authService";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useUserExperience } from "@/context/UserExperienceContext";
import NotificationBell from "@/components/notification/NotificationBell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GetBagItems } from "@/services/apiServices/itemService";
import { GetItemDetailByItemId } from "@/services/apiServices/itemService";
import { UseItem } from "@/services/apiServices/itemService";
import { GetUserConfigByUserId } from "@/services/apiServices/userConfigService";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const stepConfig = {
    login: { title: "Login", description: "Sign in to manage your ZenGarden." },
    forgot: {
      title: "Forgot Password",
      description: "Enter your email to reset password.",
    },
    otp: {
      title: "Enter OTP",
      description: "Enter the OTP sent to your email.",
    },
    "new-password": {
      title: "New Password",
      description: "Enter your new password.",
    },
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  };

  const [error, setError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openProfile, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bagId, setBagId] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [editUser, setEditUser] = useState({
    userName: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); // Thêm state cho item được chọn
  const navItems = [
    { path: "/task", label: "Tasks" },
    { path: "/workspace", label: "Workspace" },
    { path: "/tree", label: "Trees" },
    { path: "/calendar", label: "Calendar" },
    { path: "/marketplace", label: "Marketplace" },
    { path: "/challenges", label: "Challenges" },
  ];
  const { totalXp, levelId, xpToNextLevel, refreshXp } = useUserExperience();

  const [notificationCount, setNotificationCount] = useState(0);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("https://github.com/shadcn.png");

  useEffect(() => {
    // Gọi để đảm bảo XP luôn mới nhất mỗi khi component mount
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

  // Component InventoryItemCard
  const InventoryItemCard = ({ item, onSelect, isSelected }) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => onSelect(item)}
              className={`p-4 flex flex-col items-center gap-2 cursor-pointer rounded-lg transition-all ${
                isSelected
                  ? "bg-green-100 border-green-500"
                  : "hover:bg-gray-100 border-gray-200"
              } border`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-600">{item.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Component hiển thị chi tiết item
  const ItemDetail = ({ selectedItem }) => {
    if (!selectedItem) {
      return (
        <div className="flex-1 flex items-center justify-center h-full">
          <p className="text-gray-500">Select an item to view details</p>
        </div>
      );
    }

    const isOwned = selectedItem.quantity > 0;
    const isEquippable =
      selectedItem?.itemType === "avatars" ||
      selectedItem?.itemType === "backgrounds" ||
      selectedItem?.itemType === "music" ||
      selectedItem?.itemType === "items"; // thêm items để xử lý logic dưới
    const isItemType = selectedItem?.itemType === "items";

    const isAnotherItemEquipped = isItemType
      ? inventoryItems.some(
          (item) =>
            item.itemType === "items" &&
            item.isEquipped &&
            item.bagItemId !== selectedItem.bagItemId
        )
      : false;

    const disableEquip = isItemType && isAnotherItemEquipped;
    const handleUseItem = async () => {
      try {
        const result = await UseItem(selectedItem.bagItemId);
        console.log("Use item result:", result);
        fetchInventoryData();
        // Có thể thêm toast hoặc cập nhật UI sau khi dùng
      } catch (error) {
        console.error("Error using item:", error);
        // Hiện thông báo lỗi nếu cần
      }
    };
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center gap-4"
      >
        <img
          src={selectedItem.image}
          alt={selectedItem.name}
          className="w-32 h-32 object-cover rounded-lg"
        />
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800">
            {selectedItem.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedItem.description}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {isOwned ? `Quantity: ${selectedItem.quantity}` : "Not Owned"}
          </p>
          {selectedItem.isEquipped && isOwned && (
            <p className="text-sm text-green-600 font-medium mt-1">
              Currently Equipped
            </p>
          )}
        </div>

        {isOwned ? (
          <Button
            className="mt-4 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            onClick={handleUseItem}
            disabled={disableEquip}
          >
            {isEquippable ? "Equip" : "Use"}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="mt-4 text-green-600 border-green-600 hover:bg-green-50"
          >
            Purchase
          </Button>
        )}
      </motion.div>
    );
  };

  const renderInventoryList = (type) => {
    const filteredItems = inventoryItems.filter(
      (item) => item.itemType === type
    );

    if (filteredItems.length === 0) {
      return <div className="p-4">No items found for {type}</div>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {filteredItems.map((item) => (
          <div
            key={item.itemId}
            className="border rounded-xl p-3 cursor-pointer hover:bg-gray-100"
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-24 object-cover rounded"
            />
            <div className="mt-2 font-semibold text-sm truncate">
              {item.name}
            </div>
            <div className="text-xs text-gray-500">x{item.quantity}</div>
            {item.isEquipped && (
              <div className="text-xs text-green-600 font-medium">Equipped</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email!");
    try {
      await ForgotPassword(email);
      toast.success("OTP has been sent to your email.");
      setStep("otp");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Try again!"
      );
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return toast.error("Please enter OTP!");
    try {
      toast.success("OTP verified!");
      setStep("new-password");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Try again!");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return toast.error("Please enter a new password!");
    if (!otp) return toast.error("Please enter OTP!");
    try {
      await ResetPassword(email, otp, newPassword);
      toast.success("Password reset successful. Please login.");
      setStep("login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password!");
    }
  };

  const fetchInventoryData = async () => {
    try {
      const bagId = user?.bag?.bagId;
      console.log("Bag ID:", bagId);

      const bagItemsResponse = await GetBagItems(bagId);
      const bagItems = bagItemsResponse?.data || bagItemsResponse || [];

      const inventoryPromises = bagItems.map(async (bagItem) => {
        const item = bagItem.item || {};
        let itemDetail = {};
        try {
          const detailResponse = await GetItemDetailByItemId(
            item.itemId || bagItem.itemId
          );
          itemDetail = detailResponse?.itemDetail || {};
        } catch (err) {
          console.warn("Không lấy được chi tiết item", item.itemId, err);
        }

        return {
          bagItemId: bagItem.bagItemId,
          itemId: item.itemId || bagItem.itemId,
          name: item.name || "Unknown",
          image: itemDetail.mediaUrl || "/images/fallback.png",
          itemType: getTypeTextFromTypeId(item.type),
          quantity: bagItem.quantity || 0,
          isEquipped: bagItem.isEquipped,
          rarity: item.rarity,
          cost: item.cost,
          effect: itemDetail.effect,
          duration: itemDetail.duration,
          isUnique: itemDetail.isUnique,
        };
      });

      const inventory = await Promise.all(inventoryPromises);
      setInventoryItems(inventory);
    } catch (error) {
      console.error("❌ Lỗi khi lấy inventory:", error);
    }
  };

  // 2. Gọi fetch trong useEffect như cũ
  useEffect(() => {
    if (isInventoryOpen) {
      fetchInventoryData();
    }
  }, [isInventoryOpen]);

  const getTypeTextFromTypeId = (type) => {
    switch (type) {
      case 0:
      case 1:
        return "items";
      case 2:
        return "avatars";
      case 3:
        return "backgrounds";
      case 4:
        return "music";
      default:
        return "others"; // hoặc "trees" nếu bạn muốn gán vào tab đó
    }
  };

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
    if (token) {
      const decoded = parseJwt(token);
      const userId = decoded?.sub;
      if (userId) {
        GetUserInfo(userId)
          .then((data) => {
            setUser(data);
          })
          .catch((error) => console.log("Failed to load user:", error));
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const payload = { password: credentials.password };
      if (usePhone) payload.phone = credentials.phone;
      else payload.email = credentials.email;
      const data = await LoginService(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      setIsLoggedIn(true);
      toast.success("Login Successfully!");
      setIsSheetOpen(false);
      navigate("/home");
      window.location.reload();
    } catch (err) {
      setError("Please check the information again!");
      toast.error("Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Signed out!");
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      const userId = decoded?.sub;
      if (userId) {
        GetUserInfo(userId)
          .then((data) => {
            setUser(data);
            setEditUser({
              userName: data.userName || "",
              email: data.email || "",
              phone: data.phone || "",
            });
          })
          .catch((error) => console.log("Failed to load user:", error));
      }
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setEditUser((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      const userId = decoded?.sub;
      if (userId) {
        setIsLoading(true);
        try {
          const updatedUser = await UpdateUserInfo({
            userId: userId,
            ...editUser,
          });
          setUser(updatedUser);
          toast.success("The information has been updated successfully!");
        } catch (error) {
          console.log("Failed to update user:", error);
          toast.error("Update information failed!");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (newPassword !== confirmPassword) {
      toast.error("Confirmation password does not match!");
      return;
    }
    setIsLoading(true);
    try {
      const response = await ChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Password changed successfully! Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.log("Failed to change password:", error);
      toast.error(error.response?.data?.message || "Password change failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <nav className="flex items-center justify-between w-full p-6 py-2 custom-nav">
        {/* Logo và Nav Items */}
        <div className="flex items-center">
          <a href="/home" className="p-1.5">
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
                onClick={() => navigate(item.path)}
                className={`text-sm font-semibold cursor-pointer transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "text-green-600 font-bold"
                    : "text-gray-900 hover:text-green-600"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>
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
                      className="ml-1 text-white font-bold text-lg hover:bg-[#609994] transition-colors bg-[#83aa6c] rounded-full w-5 h-5 flex items-center justify-center outline-none focus:ring-0 focus:outline-none!important"
                      onClick={() => navigate("/marketplace?tab=Package")}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <NotificationBell />
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
                      <Button
                        variant="ghost"
                        className="justify-start border-none hover:bg-gray-100 focus:border-none focus:ring-0 bg-white"
                        onClick={() => console.log("Settings clicked")}
                      >
                        Wallet
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start border-none hover:bg-gray-100 focus:border-none focus:ring-0 bg-white"
                        onClick={() => console.log("Settings clicked")}
                      >
                        Settings
                      </Button>
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
              <Dialog open={openProfile} onOpenChange={setProfileOpen}>
                <DialogContent className="dialog-overlay">
                  <DialogHeader>
                    <DialogTitle>Profile</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="account" className="w-[462px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                      <Card>
                        <CardHeader>
                          <CardTitle>Account</CardTitle>
                          <CardDescription>
                            View and update your account details here.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {user ? (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label htmlFor="userName">Username</Label>
                                <Input
                                  id="userName"
                                  value={editUser.userName}
                                  onChange={handleChange}
                                  className="bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  value={editUser.email}
                                  onChange={handleChange}
                                  className="bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                  id="phone"
                                  value={editUser.phone}
                                  onChange={handleChange}
                                  className="bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Wallet</Label>
                                {user?.wallet?.length > 0 ? (
                                  <ul className="list-disc list-inside text-sm text-gray-700">
                                    {user.wallet.map((wallet, index) => (
                                      <li key={index}>{wallet}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    No wallets available
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p>Loading user data...</p>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="bg-[#83aa6c] text-white"
                            onClick={handleSaveChanges}
                            disabled={isLoading}
                          >
                            {isLoading ? "Saving..." : "Save Changes"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    <TabsContent value="password">
                      <Card>
                        <CardHeader>
                          <CardTitle>Password</CardTitle>
                          <CardDescription>
                            Change your password here. After saving, you'll be
                            logged out.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="space-y-1">
                            <Label htmlFor="current">Current Password</Label>
                            <Input
                              id="current"
                              type="password"
                              placeholder="Current Password"
                              className="bg-white"
                              value={passwords.currentPassword}
                              onChange={(e) =>
                                setPasswords({
                                  ...passwords,
                                  currentPassword: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="new">New Password</Label>
                            <Input
                              id="new"
                              type="password"
                              placeholder="New Password"
                              className="bg-white"
                              value={passwords.newPassword}
                              onChange={(e) =>
                                setPasswords({
                                  ...passwords,
                                  newPassword: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="confirm">
                              Confirm New Password
                            </Label>
                            <Input
                              id="confirm"
                              type="password"
                              placeholder="Confirm New Password"
                              className="bg-white"
                              value={passwords.confirmPassword}
                              onChange={(e) =>
                                setPasswords({
                                  ...passwords,
                                  confirmPassword: e.target.value,
                                })
                              }
                            />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={handleChangePassword}
                            className="bg-[#83aa6c] text-white"
                            disabled={isLoading}
                          >
                            {isLoading ? "Saving..." : "Save Password"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              {/* Dialog Inventory mới */}
              <Dialog open={isInventoryOpen} onOpenChange={setIsInventoryOpen}>
                <DialogContent className="max-w-5xl max-h-[80vh] p-0 overflow-hidden">
                  <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold">
                      Inventory
                    </DialogTitle>
                  </DialogHeader>
                  <Tabs
                    defaultValue="trees"
                    className="flex flex-col md:flex-row h-[60vh] overflow-hidden"
                  >
                    {/* List filter (10-20%) */}
                    <div className="w-full md:w-[15%] bg-gray-50 border-r overflow-y-auto">
                      <TabsList className="grid grid-cols-1 gap-2 p-4 bg-gray-50">
                        <TabsTrigger value="items" className="text-sm py-3">
                          Items
                        </TabsTrigger>
                        <TabsTrigger
                          value="backgrounds"
                          className="text-sm py-3"
                        >
                          Backgrounds
                        </TabsTrigger>
                        <TabsTrigger value="music" className="text-sm py-3">
                          Music
                        </TabsTrigger>
                        <TabsTrigger value="avatars" className="text-sm py-3">
                          Avatars
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    {/* Danh sách items dạng grid (60-70%) */}
                    <div className="w-full md:w-[50%] border-r overflow-y-auto">
                      <TabsContent value="items">
                        {renderInventoryList("items")}
                      </TabsContent>
                      <TabsContent value="backgrounds">
                        {renderInventoryList("backgrounds")}
                      </TabsContent>
                      <TabsContent value="music">
                        {renderInventoryList("music")}
                      </TabsContent>
                      <TabsContent value="avatars">
                        {renderInventoryList("avatars")}
                      </TabsContent>
                    </div>
                    {/* Chi tiết item (phần còn lại, khoảng 15-25%) */}
                    <div className="w-full md:w-[35%] p-6 overflow-y-auto">
                      <ItemDetail selectedItem={selectedItem} />
                    </div>
                  </Tabs>
                </DialogContent>
              </Dialog>
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
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{stepConfig[step]?.title}</SheetTitle>
                  <SheetDescription>
                    {stepConfig[step]?.description}
                  </SheetDescription>
                </SheetHeader>
                <AnimatePresence mode="wait">
                  {step === "login" && (
                    <motion.div
                      key="login"
                      variants={stepVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <form onSubmit={handleLogin}>
                        <div className="flex items-center justify-between py-2">
                          <span>Use Phone Number</span>
                          <Switch
                            checked={usePhone}
                            onCheckedChange={setUsePhone}
                          />
                        </div>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor={usePhone ? "phone" : "email"}
                              className="text-right"
                            >
                              {usePhone ? "Phone Number" : "Email"}
                            </Label>
                            <Input
                              id={usePhone ? "phone" : "email"}
                              type={usePhone ? "tel" : "email"}
                              placeholder={
                                usePhone ? "0123456789" : "example@email.com"
                              }
                              className="col-span-3"
                              value={
                                usePhone ? credentials.phone : credentials.email
                              }
                              onChange={(e) =>
                                setCredentials({
                                  ...credentials,
                                  [usePhone ? "phone" : "email"]:
                                    e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                              Password
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              className="col-span-3"
                              value={credentials.password}
                              onChange={(e) =>
                                setCredentials({
                                  ...credentials,
                                  password: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        {error && (
                          <p className="text-red-500 text-sm">{error}</p>
                        )}
                        <SheetFooter>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <span className="animate-spin w-4 h-4 border-2 border-t-transparent border-white rounded-full" />
                                Loading...
                              </div>
                            ) : (
                              "Login"
                            )}
                          </Button>
                        </SheetFooter>
                        <div className="flex justify-end mt-2">
                          <span
                            className="text-sm text-green-600 cursor-pointer"
                            onClick={() => setStep("forgot")}
                          >
                            Forgot Password?
                          </span>
                        </div>
                        <div className="mt-4 text-left text-sm text-gray-500">
                          <RegisterButton
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                          />
                        </div>
                      </form>
                    </motion.div>
                  )}
                  {step === "forgot" && (
                    <motion.div
                      key="forgot"
                      variants={stepVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <div className="grid gap-4">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <SheetFooter>
                          <Button
                            onClick={handleForgotPassword}
                            disabled={isLoading}
                          >
                            Send OTP
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setStep("login")}
                          >
                            Back to Login
                          </Button>
                        </SheetFooter>
                      </div>
                    </motion.div>
                  )}
                  {step === "otp" && (
                    <motion.div
                      key="otp"
                      variants={stepVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <div className="grid gap-4">
                        <Label>OTP</Label>
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={setOtp}
                          autoFocus
                          className="flex justify-center gap-2"
                        >
                          <InputOTPGroup>
                            {[...Array(6)].map((_, i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                        <SheetFooter>
                          <Button
                            onClick={handleVerifyOTP}
                            disabled={isLoading}
                          >
                            Verify OTP
                          </Button>
                        </SheetFooter>
                      </div>
                    </motion.div>
                  )}
                  {step === "new-password" && (
                    <motion.div
                      key="new-password"
                      variants={stepVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <div className="grid gap-4">
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <SheetFooter>
                          <Button
                            onClick={handleResetPassword}
                            disabled={isLoading}
                          >
                            Reset Password
                          </Button>
                        </SheetFooter>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SheetContent>
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
                  <Dialog open={openProfile} onOpenChange={setProfileOpen}>
                    <DialogContent className="dialog-overlay">
                      <DialogHeader>
                        <DialogTitle>Profile</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="account" className="w-[462px]">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="account">Account</TabsTrigger>
                          <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                          <Card>
                            <CardHeader>
                              <CardTitle>Account</CardTitle>
                              <CardDescription>
                                View and update your account details here.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {user ? (
                                <div className="space-y-2">
                                  <div className="space-y-1">
                                    <Label htmlFor="userName">Username</Label>
                                    <Input
                                      id="userName"
                                      value={editUser.userName}
                                      onChange={handleChange}
                                      className="bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                      id="email"
                                      value={editUser.email}
                                      onChange={handleChange}
                                      className="bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                      id="phone"
                                      value={editUser.phone}
                                      onChange={handleChange}
                                      className="bg-white"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Wallet</Label>
                                    {user?.wallet?.length > 0 ? (
                                      <ul className="list-disc list-inside text-sm text-gray-700">
                                        {user.wallet.map((wallet, index) => (
                                          <li key={index}>{wallet}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-sm text-gray-500">
                                        No wallets available
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p>Loading user data...</p>
                              )}
                            </CardContent>
                            <CardFooter>
                              <Button
                                className="bg-[#83aa6c] text-white"
                                onClick={handleSaveChanges}
                                disabled={isLoading}
                              >
                                {isLoading ? "Saving..." : "Save Changes"}
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                        <TabsContent value="password">
                          <Card>
                            <CardHeader>
                              <CardTitle>Password</CardTitle>
                              <CardDescription>
                                Change your password here. After saving, you'll
                                be logged out.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="space-y-1">
                                <Label htmlFor="current">
                                  Current Password
                                </Label>
                                <Input
                                  id="current"
                                  type="password"
                                  placeholder="Current Password"
                                  className="bg-white"
                                  value={passwords.currentPassword}
                                  onChange={(e) =>
                                    setPasswords({
                                      ...passwords,
                                      currentPassword: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="new">New Password</Label>
                                <Input
                                  id="new"
                                  type="password"
                                  placeholder="New Password"
                                  className="bg-white"
                                  value={passwords.newPassword}
                                  onChange={(e) =>
                                    setPasswords({
                                      ...passwords,
                                      newPassword: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="confirm">
                                  Confirm New Password
                                </Label>
                                <Input
                                  id="confirm"
                                  type="password"
                                  placeholder="Confirm New Password"
                                  className="bg-white"
                                  value={passwords.confirmPassword}
                                  onChange={(e) =>
                                    setPasswords({
                                      ...passwords,
                                      confirmPassword: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button
                                onClick={handleChangePassword}
                                className="bg-[#83aa6c] text-white"
                                disabled={isLoading}
                              >
                                {isLoading ? "Saving..." : "Save Password"}
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                  {/* Dialog Inventory mới */}
                  <Dialog
                    open={isInventoryOpen}
                    onOpenChange={setIsInventoryOpen}
                  >
                    <DialogContent className="max-w-5xl max-h-[80vh] p-0 overflow-hidden">
                      <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-bold">
                          Inventory
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col md:flex-row h-[60vh] overflow-hidden">
                        {/* Danh sách danh mục */}
                        <div className="w-full md:w-1/3 bg-gray-50 border-r overflow-y-auto">
                          <Tabs defaultValue="trees" className="w-full">
                            <TabsList className="grid grid-cols-3 md:grid-cols-1 gap-2 p-4 bg-gray-50">
                              <TabsTrigger value="items" className="text-sm">
                                Items
                              </TabsTrigger>
                              <TabsTrigger
                                value="backgrounds"
                                className="text-sm"
                              >
                                Backgrounds
                              </TabsTrigger>
                              <TabsTrigger value="music" className="text-sm">
                                Music
                              </TabsTrigger>
                              <TabsTrigger value="avatars" className="text-sm">
                                Avatars
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="trees">
                              {renderInventoryList("trees")}
                            </TabsContent>
                            <TabsContent value="items">
                              {renderInventoryList("items")}
                            </TabsContent>
                            <TabsContent value="backgrounds">
                              {renderInventoryList("backgrounds")}
                            </TabsContent>
                            <TabsContent value="music">
                              {renderInventoryList("music")}
                            </TabsContent>
                            <TabsContent value="avatars">
                              {renderInventoryList("avatars")}
                            </TabsContent>
                          </Tabs>
                        </div>
                        {/* Chi tiết item */}
                        <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                          <ItemDetail selectedItem={selectedItem} />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Login</SheetTitle>
                      <SheetDescription>
                        Sign in to manage your ZenGarden.
                      </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleLogin}>
                      <div className="flex items-center justify-between py-2">
                        <span>Use Phone Number</span>
                        <Switch
                          checked={usePhone}
                          onCheckedChange={setUsePhone}
                        />
                      </div>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor={usePhone ? "phone" : "email"}
                            className="text-right"
                          >
                            {usePhone ? "Phone Number" : "Email"}
                          </Label>
                          <Input
                            id={usePhone ? "phone" : "email"}
                            type={usePhone ? "tel" : "email"}
                            placeholder={
                              usePhone ? "0123456789" : "example@email.com"
                            }
                            className="col-span-3"
                            value={
                              usePhone ? credentials.phone : credentials.email
                            }
                            onChange={(e) =>
                              setCredentials({
                                ...credentials,
                                [usePhone ? "phone" : "email"]: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">
                            Password
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="col-span-3"
                            value={credentials.password}
                            onChange={(e) =>
                              setCredentials({
                                ...credentials,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <SheetFooter>
                        <Button type="submit">Login</Button>
                      </SheetFooter>
                      <div className="mt-4 text-left text-sm text-gray-500">
                        <RegisterButton isOpen={isOpen} setIsOpen={setIsOpen} />
                      </div>
                    </form>
                  </SheetContent>
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
