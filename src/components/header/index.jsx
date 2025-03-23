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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
import "./index.css";
import { X } from "lucide-react";
import { LoginService } from "@/services/apiServices/authService";
import parseJwt from "@/services/parseJwt";
import { GetUserInfo } from "@/services/apiServices/userService";
import { UpdateUserInfo } from "@/services/apiServices/userService";
import { ChangePassword } from "@/services/apiServices/authService";
import RegisterButton from "@/pages/common/hero/registerButton";
import { Progress } from "@/components/ui/progress";
import { GetUserExperiencesInfo } from "@/services/apiServices/userExperienceService";
import {
  ForgotPassword,
  ResetPassword,
} from "@/services/apiServices/authService";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "@/components/ui/input-otp";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const stepConfig = {
    login: {
      title: "Login",
      description: "Sign in to manage your ZenGarden.",
    },
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
    initial: { opacity: 0, x: 50 }, // Bắt đầu từ bên phải
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } }, // Hiển thị mượt mà
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }, // Rời đi sang trái
  };

  const [error, setError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openProfile, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [xpToNextLevel, setXpToNextLevel] = useState(50);
  const [walletBalance, setWalletBalance] = useState(0);
  const [editUser, setEditUser] = useState({
    userName: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [levelId, setLevelId] = useState(null);
  const navItems = [
    { path: "/task", label: "Tasks" },
    { path: "/tree", label: "Trees" },
    { path: "/calendar", label: "Calendar" },
    { path: "/marketplace", label: "Marketplace" },
    { path: "/challenges", label: "Challenges" },
  ];
  //Forgot Password
  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email!");

    try {
      await ForgotPassword(email);
      toast.success("OTP has been sent to your email.");
      setStep("otp"); // Chuyển sang bước nhập OTP
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Try again!"
      );
    }
  };

  // 🚀 Xác thực OTP (Bước này cần API riêng để kiểm tra OTP, nếu BE không có thì bỏ qua)
  const handleVerifyOTP = async () => {
    if (!otp) return toast.error("Please enter OTP!");

    try {
      // Nếu BE có API riêng để verify OTP thì gọi ở đây, nếu không thì bỏ qua bước này
      toast.success("OTP verified!");
      setStep("new-password"); // Chuyển sang bước nhập mật khẩu mới
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Try again!");
    }
  };

  // 🚀 Đặt lại mật khẩu mới
  const handleResetPassword = async () => {
    if (!newPassword) return toast.error("Please enter a new password!");
    if (!otp) return toast.error("Please enter OTP!"); // OTP cần có để reset password

    try {
      await ResetPassword(email, otp, newPassword);
      toast.success("Password reset successful. Please login.");
      setStep("login"); // Chuyển về màn hình đăng nhập
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password!");
    }
  };
  //Scroll header logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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

        GetUserExperiencesInfo(userId)
          .then(({ totalXp, levelId }) => {
            setTotalXp(totalXp);
            setLevelId(levelId);
          })
          .catch((error) =>
            console.log("Failed to load user experience:", error)
          );
      }
    }
  }, []);
  // Login
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
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8 custom-nav">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <a href="/home" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img
              className="h-12 w-auto"
              src="/src/assets/logo/zengarden-logo.png"
              alt=""
            />
          </a>
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
              inert={!mobileMenuOpen}
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
        <div className="hidden lg:flex lg:gap-x-12">
          <nav className="hidden lg:flex lg:gap-x-12">
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
          </nav>
        </div>

        {/* Login Button */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3">
                {/* Tên người dùng */}
                <div className="flex flex-col text-sm">
                  {" "}
                  {/* Giảm kích thước tổng thể */}
                  <h2 className="text-base font-bold text-gray-800">
                    {" "}
                    {/* Giảm từ text-xl xuống base */}
                    {user?.userName || "Guest"}
                  </h2>
                  {/* Level & Progress Bar */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {" "}
                    {/* Giảm khoảng cách */}
                    <span className="text-xs font-semibold text-gray-700">
                      {" "}
                      {/* Giảm size chữ */}
                      Level {levelId}
                    </span>
                    <Progress
                      value={(totalXp / xpToNextLevel) * 100}
                      className="w-24 h-1.5"
                    />
                    <span className="text-xs text-gray-500">
                      {totalXp} / {xpToNextLevel} XP
                    </span>
                  </div>
                </div>

                {/* Avatar + Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src={user?.imageUrl || "https://github.com/shadcn.png"}
                        alt="User Avatar"
                      />
                      <AvatarFallback>
                        {user?.userName
                          ? user.userName.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => console.log("Settings clicked")}
                    >
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-500"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Coin trong Wallet */}
                <div className="mt-0.5 text-xs text-gray-600 flex items-center gap-1">
                    <img
                      src="/src/assets/images/coin.png"
                      alt="Coin"
                      className="w-4 h-4"
                    />
                    <span className="font-semibold text-base">{walletBalance ?? 0}</span>
                  </div>
              </div>

              {/* Dialog chứa Tabs */}
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
      </nav>

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

          {/* Các link menu */}
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

          {/* Avatar & Farmer Certified Badge */}
          <div className="mt-6 flex flex-col items-center gap-4">
            {isLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src={user?.imageUrl || "https://github.com/shadcn.png"}
                        alt="User Avatar"
                      />
                      <AvatarFallback>
                        {user?.userName
                          ? user.userName.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => console.log("Settings clicked")}
                    >
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-500"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Dialog chứa Tabs */}
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
    </header>
  );
};

export default Header;
