import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UpdateUserInfo } from "@/services/apiServices/userService";
import { ChangePassword } from "@/services/apiServices/authService";

const ProfileDialog = ({ open, setOpen, user, setUser }) => {
  const [editUser, setEditUser] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (user) {
      setEditUser({
        userName: user.userName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

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
    <Dialog open={open} onOpenChange={setOpen}>
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
                      {user?.wallet ? (
                        <div className="flex items-center space-x-[2px] text-sm text-gray-700">
                          <img
                            src="/images/coin.png"
                            alt="Coin"
                            className="w-5 h-5"
                          />
                          <span>{user.wallet.balance}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No wallet available
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
                  Change your password here. After saving, you'll be logged out.
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
                  <Label htmlFor="confirm">Confirm New Password</Label>
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
  );
};

export default ProfileDialog;
