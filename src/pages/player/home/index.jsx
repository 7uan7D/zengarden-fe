import React, { useEffect, useState } from "react";
import Header from "../../../components/header/index.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  GetUserInfo,
  UpdateUserInfo,
} from "@/services/apiServices/userService";
import parseJwt from "@/services/parseJwt";
import { toast } from "sonner";

const HomePage = () => {
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const decoded = parseJwt(token);
    const userId = decoded?.sub;

    GetUserInfo(userId)
      .then((data) => {
        setUser(data);

        if (!data.imageUrl || data.imageUrl.trim() === "") {
          setShowAvatarDialog(true);
        }
      })
      .catch((error) => console.error("Failed to load user:", error));
  }, []);

  const handleAvatarSelect = async (avatar) => {
    if (!user) return;

    try {
      const updatedUser = await UpdateUserInfo({
        userId: user.userId,
        imageUrl: `/src/assets/avatars/${avatar}.png`,
      });
      setUser(updatedUser);
      setShowAvatarDialog(false);
      toast.success("Avatar updated successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      toast.error("Failed to update avatar!");
    }
  };

  return (
    <div>
      <main className="p-4 homepage">
        <h1 className="text-2xl font-bold">Welcome to Player Home</h1>
        <p className="text-gray-600">This is the player home page.</p>
      </main>

      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Your Avatar</DialogTitle>
          </DialogHeader>
          <div className="flex justify-around p-4">
            <div
              onClick={() => handleAvatarSelect("female")}
              className="cursor-pointer"
            >
              <img
                src="/src/assets/avatars/female.png"
                alt="Female Avatar"
                className="w-24 h-24 rounded-full transition-transform duration-200 hover:scale-110"
              />
            </div>
            <div
              onClick={() => handleAvatarSelect("male")}
              className="cursor-pointer"
            >
              <img
                src="/src/assets/avatars/male.png"
                alt="Male Avatar"
                className="w-24 h-24 rounded-full transition-transform duration-200 hover:scale-110"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
