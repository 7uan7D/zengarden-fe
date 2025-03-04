import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetClose,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
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

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [openProfile, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // Login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

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
    } catch (err) {
      setError("Please check the information again!");
      toast.error("Login failed!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Signed out!");
    navigate("/");
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
              fullName: data.fullName || "",
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
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await ChangePassword(
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Đảm bảo có Bearer
            "Content-Type": "application/json", // Đảm bảo Content-Type đúng
          },
        }
      );

      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.log("Failed to change password:", error);
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
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
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
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
          <a href="#" className="text-sm font-semibold text-gray-900">
            Features
          </a>
          <a href="#" className="text-sm font-semibold text-gray-900">
            Marketplace
          </a>
          <a href="#" className="text-sm font-semibold text-gray-900">
            Company
          </a>
        </div>

        {/* Login Button */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center">
          {isLoggedIn ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
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
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                  id="fullName"
                                  value={editUser.fullName}
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
                          <form onSubmit={handleChangePassword}>
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
                            <CardFooter>
                              <Button
                                type="submit"
                                className="bg-[#83aa6c] text-white"
                                disabled={isLoading}
                              >
                                {isLoading ? "Saving..." : "Save Password"}
                              </Button>
                            </CardFooter>
                          </form>
                        </CardContent>
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
                    <Switch checked={usePhone} onCheckedChange={setUsePhone} />
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
                        value={usePhone ? credentials.phone : credentials.email}
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
                    <Button type="submit">Login</Button>{" "}
                  </SheetFooter>
                </form>
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
          <a
            href="#"
            className="block py-2 text-sm font-semibold text-gray-900"
          >
            Features
          </a>
          <a
            href="#"
            className="block py-2 text-sm font-semibold text-gray-900"
          >
            Marketplace
          </a>
          <a
            href="#"
            className="block py-2 text-sm font-semibold text-gray-900"
          >
            Company
          </a>

          {/* Avatar & Farmer Certified Badge */}
          <div className="mt-6 flex flex-col items-center gap-4">
            {isLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
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
                                  <Label htmlFor="fullName">Full Name</Label>
                                  <Input
                                    id="fullName"
                                    value={editUser.fullName}
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
                            <form>
                              <div className="space-y-1">
                                <Label htmlFor="current">
                                  Current Password
                                </Label>
                                <Input
                                  id="current"
                                  type="password"
                                  placeholder="Current Password"
                                  className="bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="new">New Password</Label>
                                <Input
                                  id="new"
                                  type="password"
                                  placeholder="New Password"
                                  className="bg-white"
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
                                />
                              </div>
                            </form>
                          </CardContent>
                          <CardFooter>
                            <Button className="bg-[#83aa6c] text-white">
                              Save Password
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
                    {/* Toggle giữa Email và Phone */}
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
                      <Button type="submit">Login</Button>{" "}
                    </SheetFooter>
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
