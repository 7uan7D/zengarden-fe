import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GetUserInfo,
  UpdateUserInfo,
} from "@/services/apiServices/userService";
import parseJwt from "@/services/parseJwt";
import { toast } from "sonner";
import { Calendar, ShoppingCart, Leaf, Trophy, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import "../home/index.css";

const HomePage = () => {
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [timers, setTimers] = useState({
    daily: null,
    simple: null,
    complex: null,
  });
  const [isRunning, setIsRunning] = useState({
    daily: false,
    simple: false,
    complex: false,
  });

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

  const startTimer = (taskType) => {
    if (!timers[taskType]) {
      setTimers((prev) => ({ ...prev, [taskType]: 600 }));
      setIsRunning((prev) => ({ ...prev, [taskType]: true }));
    }
  };

  const toggleTimer = (taskType) => {
    setIsRunning((prev) => ({ ...prev, [taskType]: !prev[taskType] }));
  };

  const stopTimer = (taskType) => {
    setTimers((prev) => ({ ...prev, [taskType]: null }));
    setIsRunning((prev) => ({ ...prev, [taskType]: false }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach((taskType) => {
          if (isRunning[taskType] && newTimers[taskType] > 0) {
            newTimers[taskType] -= 1;
          } else if (newTimers[taskType] === 0) {
            newTimers[taskType] = null;
            setIsRunning((prev) => ({ ...prev, [taskType]: false }));
            toast.success(
              `Task '${
                taskType === "daily"
                  ? "Do exercise"
                  : taskType === "simple"
                  ? "Make Lemonade"
                  : "Workout 3 times a week"
              }' completed!`
            );
          }
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

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
    <motion.div
      className="p-6 mt-20 max-w-full mx-auto homepage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header của Homepage */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.username || "Player"}!
        </h1>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Task Widget */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3 md:col-span-1" // Chiếm 3 cột trên LG, 1 cột trên MD
        >
          <Card className="p-4 h-full flex flex-col">
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-cyan-600" />
                <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
              </div>
              <p className="text-gray-600 mb-4">Your current tasks:</p>
              <div className="task-container">
                <span className="task-type daily">Daily</span>
                <Card className="task-detail p-4 flex justify-between items-center">
                  <span>Do exercise</span>
                  {timers.daily !== null ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={() => toggleTimer("daily")}
                      >
                        {formatTime(timers.daily)}{" "}
                        {isRunning.daily ? "(Pause)" : "(Resume)"}
                      </span>
                      <Button
                        size="sm"
                        className="bg-gray-900 text-white hover:bg-gray-700"
                        onClick={() => stopTimer("daily")}
                      >
                        Stop
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={() => startTimer("daily")}
                    >
                      Start
                    </Button>
                  )}
                </Card>
              </div>
              <div className="task-container">
                <span className="task-type simple">Simple</span>
                <Card className="task-detail p-4 flex justify-between items-center">
                  <span>Make Lemonade</span>
                  {timers.simple !== null ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={() => toggleTimer("simple")}
                      >
                        {formatTime(timers.simple)}{" "}
                        {isRunning.simple ? "(Pause)" : "(Resume)"}
                      </span>
                      <Button
                        size="sm"
                        className="bg-gray-900 text-white hover:bg-gray-700"
                        onClick={() => stopTimer("simple")}
                      >
                        Stop
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={() => startTimer("simple")}
                    >
                      Start
                    </Button>
                  )}
                </Card>
              </div>
              <div className="task-container">
                <span className="task-type complex">Complex</span>
                <Card className="task-detail p-4 flex justify-between items-center">
                  <span>Workout 3 times a week</span>
                  {timers.complex !== null ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={() => toggleTimer("complex")}
                      >
                        {formatTime(timers.complex)}{" "}
                        {isRunning.complex ? "(Pause)" : "(Resume)"}
                      </span>
                      <Button
                        size="sm"
                        className="bg-gray-900 text-white hover:bg-gray-700"
                        onClick={() => stopTimer("complex")}
                      >
                        Stop
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={() => startTimer("complex")}
                    >
                      Start
                    </Button>
                  )}
                </Card>
              </div>
            </CardContent>
            <Button className="mt-2 text-white bg-gray-900 hover:bg-gray-700">
              <Link to="/task">View All Tasks</Link>
            </Button>
          </Card>
        </motion.div>

        {/* Trees Widget */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 md:col-span-1" // Chiếm 2 cột trên LG, 1 cột trên MD
        >
          <Card className="p-4 h-full flex flex-col">
            <CardContent className="flex-1 text-left">
              <div personally className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Trees</h2>
              </div>
              <p className="text-gray-600 mb-4">Your growing tree:</p>
              <img src="/tree-1.png" alt="Tree" className="w-24 h-24 mb-2" />
              <p className="font-semibold">Oak - Level 3</p>
              <p className="text-sm text-gray-500">120 / 200 XP</p>
            </CardContent>
            <Button className="mt-2 text-white bg-gray-900 hover:bg-gray-700">
              <Link to="/tree">Manage Trees</Link>
            </Button>
          </Card>
        </motion.div>

        {/* Calendar Widget */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 md:col-span-1" // Chiếm 2 cột trên LG, 1 cột trên MD
        >
          <Card className="p-4 h-full flex flex-col">
            <CardContent className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Calendar
                </h2>
              </div>
              <p className="text-gray-600 mb-4">Upcoming events:</p>
              <ul className="text-sm text-gray-600">
                <li>Mar 25: Task Deadline</li>
                <li>Mar 28: Challenge Starts</li>
              </ul>
            </CardContent>
            <Button className="mt-2 text-white bg-gray-900 hover:bg-gray-700">
              <Link to="/calendar">View Calendar</Link>
            </Button>
          </Card>
        </motion.div>

        {/* Marketplace Widget */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-1 md:col-span-1" // Chiếm 1 cột
        >
          <Card className="p-4 h-full flex flex-col">
            <CardContent className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Marketplace
                </h2>
              </div>
              <p className="text-gray-600 mb-4">Best Seller item:</p>
              <div className="h-16 w-16 bg-gray-300 rounded-lg mb-2"></div>
              <p className="font-semibold">Items Item 1</p>
              <p className="text-sm text-gray-500 flex items-center">
                <img
                  src="/src/assets/images/coin.png"
                  alt="Coin"
                  className="w-5 h-5 mr-1"
                />
                100
              </p>
            </CardContent>
            <Button className="mt-2 text-white bg-gray-900 hover:bg-gray-700">
              <Link to="/marketplace">View Marketplace</Link>
            </Button>
          </Card>
        </motion.div>

        {/* Challenges Widget */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 md:col-span-1" // Chiếm 2 cột trên LG, 1 cột trên MD
        >
          <Card className="p-4 h-full flex flex-col">
            <CardContent className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Challenges
                </h2>
              </div>
              <p className="text-gray-600 mb-4">Active challenge:</p>
              <p className="font-semibold">Stay Hydrated</p>
              <p className="text-sm text-gray-500">Reward: 71 EXP</p>
            </CardContent>
            <Button className="mt-2 text-white bg-gray-900 hover:bg-gray-700">
              <Link to="/challenges">View Challenges</Link>
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Avatar Dialog */}
      {/* <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Your Avatar</DialogTitle>
          </DialogHeader>
          <div className="flex justify-around p-4">
            <motion.div
              onClick={() => handleAvatarSelect("female")}
              className="cursor-pointer"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/src/assets/avatars/female.png"
                alt="Female Avatar"
                className="w-24 h-24 rounded-full"
              />
            </motion.div>
            <motion.div
              onClick={() => handleAvatarSelect("male")}
              className="cursor-pointer"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/src/assets/avatars/male.png"
                alt="Male Avatar"
                className="w-24 h-24 rounded-full"
              />
            </motion.div>
          </div>
        </DialogContent>
      </Dialog> */}
    </motion.div>
  );
};

export default HomePage;
