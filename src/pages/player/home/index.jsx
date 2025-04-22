import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, ShoppingCart, Leaf, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import "../home/index.css";
import { GetTaskByUserTreeId, StartTask, PauseTask } from "@/services/apiServices/taskService";
import { GetUserTreeByOwnerId } from "@/services/apiServices/userTreesService";
import { GetAllTrees } from "@/services/apiServices/treesService";
import { GetAllItems } from "@/services/apiServices/itemService";
import parseJwt from "@/services/parseJwt";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [currentTree, setCurrentTree] = useState(null);
  const [tasks, setTasks] = useState({
    daily: [],
    simple: [],
    complex: [],
  });
  const [currentTask, setCurrentTask] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [userTrees, setUserTrees] = useState([]);
  const [allTrees, setAllTrees] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Lấy danh sách task theo cây
  const fetchTasks = async (userTreeId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let taskData = [];
      if (userTreeId) {
        taskData = await GetTaskByUserTreeId(userTreeId);
        taskData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      }

      const categorizedTasks = {
        daily: taskData.filter((task) => task.taskTypeName === "Daily"),
        simple: taskData.filter((task) => task.taskTypeName === "Simple"),
        complex: taskData.filter((task) => task.taskTypeName === "Complex"),
      };

      setTasks(categorizedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  // Lấy danh sách cây sở hữu và tất cả cây
  const fetchUserTrees = async (ownerId) => {
    try {
      const [ownedTrees, allTrees] = await Promise.all([
        GetUserTreeByOwnerId(ownerId),
        GetAllTrees(),
      ]);
      setUserTrees(ownedTrees || []);
      setAllTrees(allTrees || []);
    } catch (error) {
      console.error("Failed to fetch trees", error);
    }
  };

  // Lấy danh sách items từ Marketplace
  const fetchMarketplaceItems = async () => {
    try {
      const items = await GetAllItems();
      const typeMap = {
        Items: [0, 1],
        Avatar: [2],
        Background: [3],
        Music: [4],
      };
      const filteredItems = Object.keys(typeMap).map((category) => {
        const firstItem = items.find((item) => typeMap[category].includes(item.type));
        return firstItem ? { ...firstItem, category } : null;
      }).filter(Boolean);
      setMarketplaceItems(filteredItems);
    } catch (error) {
      console.error("Failed to fetch marketplace items", error);
    }
  };

  // Cập nhật useEffect để lấy dữ liệu
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userId = parseJwt(token).sub;
      setUser({ username: "Farmer" });

      fetchUserTrees(userId);
      fetchMarketplaceItems();

      const savedTreeId = localStorage.getItem("selectedTreeId");
      if (savedTreeId) {
        setCurrentTree(parseInt(savedTreeId));
        fetchTasks(parseInt(savedTreeId));
      }
    }
  }, []);

  // Tự động chuyển slide
  useEffect(() => {
    if (marketplaceItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % marketplaceItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [marketplaceItems.length]);

  // Hàm điều hướng carousel
  const goToPrevious = () => {
    setCurrentSlideIndex((prevIndex) =>
      prevIndex === 0 ? marketplaceItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % marketplaceItems.length);
  };

  const goToSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  // Logic Timer
  const startTimer = async (column, taskIndex) => {
    const task = tasks[column][taskIndex];
    const totalDurationSeconds = task.totalDuration * 60;
    const initialTime = task.remainingTime
      ? typeof task.remainingTime === "string"
        ? timeStringToSeconds(task.remainingTime)
        : task.remainingTime * 60
      : totalDurationSeconds;

    try {
      await StartTask(task.taskId);
    } catch (error) {
      console.error("Failed to start task:", error);
      return;
    }

    setCurrentTask({
      column,
      taskIndex,
      time: initialTime,
      totalTime: totalDurationSeconds,
    });
    setIsRunning(true);
  };

  const toggleTimer = async (column = null, taskIndex = null) => {
    const columnToUse = column ?? currentTask?.column;
    const indexToUse = taskIndex ?? currentTask?.taskIndex;

    if (columnToUse === null || indexToUse === null) return;

    const task = tasks[columnToUse][indexToUse];
    const totalDurationSeconds = task.totalDuration * 60;

    if (isRunning) {
      try {
        await PauseTask(task.taskId);
      } catch (error) {
        console.error("Failed to pause task:", error);
      }
      setIsRunning(false);
    } else {
      try {
        await StartTask(task.taskId);
      } catch (error) {
        console.error("Failed to resume task:", error);
      }
      setCurrentTask({
        column: columnToUse,
        taskIndex: indexToUse,
        time: task.remainingTime
          ? typeof task.remainingTime === "string"
            ? timeStringToSeconds(task.remainingTime)
            : task.remainingTime * 60
          : totalDurationSeconds,
        totalTime: totalDurationSeconds,
      });
      setIsRunning(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTask && isRunning && currentTask.time > 0) {
        setCurrentTask((prev) => ({
          ...prev,
          time: prev.time - 1,
        }));
      } else if (currentTask && currentTask.time === 0) {
        toast.success(`Task '${tasks[currentTask.column][currentTask.taskIndex].taskName}' completed!`);
        setCurrentTask(null);
        setIsRunning(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTask, isRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const timeStringToSeconds = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Tìm cây mặc định để hiển thị
  const displayedTree = allTrees.find(
    (tree) => tree.treeId === userTrees.find((ut) => ut.finalTreeId)?.finalTreeId
  ) || { name: "No Tree", imageUrl: "/tree-1.png", level: 0 };

  // Map màu cho rarity
  const rarityColorMap = {
    common: "text-gray-600",
    rare: "text-blue-600",
    epic: "text-purple-800",
    legendary: "text-orange-500",
  };

  return (
    <motion.div
      className="p-6 pt-2 mt-20 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome back, {user?.username || "Farmer"}!
        </h1>
        <p className="text-gray-500 mt-1">
          Let's grow your garden and achieve your goals today.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Task Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow lg:col-span-2">
          <div className="flex items-center gap-3 dimenticaremb-4">
            <Clock className="w-6 h-6 text-cyan-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Your Tasks</h2>
          </div>
          <div className="space-y-2">
            {["daily", "simple", "complex"].map((type) => (
              tasks[type].length > 0 && (
                <div key={type} className="flex items-center">
                  <span
                    className={`inline-block w-24 text-center py-2 font-medium text-sm rounded-tl-lg rounded-bl-lg ${
                      type === "daily"
                        ? "bg-cyan-100 text-cyan-700"
                        : type === "simple"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                  <Card className="flex-1 p-4 bg-gray-50 rounded-tr-lg rounded-br-lg border-t-2 border-b-2 border-l-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 font-medium">
                          {tasks[type][0].taskName}
                        </span>
                        <div className="flex items-center gap-2">
                          {currentTask?.column === type && currentTask?.taskIndex === 0 ? (
                            <>
                              <span className="text-sm text-gray-600 font-mono">
                                {formatTime(currentTask.time)}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-cyan-600 border-cyan-600 hover:bg-cyan-50"
                                onClick={() => toggleTimer(type, 0)}
                              >
                                {isRunning ? "Pause" : "Resume"}
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-cyan-600 text-white hover:bg-cyan-700"
                              onClick={() => startTimer(type, 0)}
                              disabled={currentTask !== null}
                            >
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                      {currentTask?.column === type && currentTask?.taskIndex === 0 && (
                        <div className="flex flex-col gap-1">
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-cyan-600 rounded-full"
                              style={{
                                width: `${
                                  ((currentTask.totalTime - currentTask.time) / currentTask.totalTime) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTime(currentTask.time)} / {formatTime(currentTask.totalTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )
            ))}
          </div>
          <Button
            className="mt-6 w-full bg-cyan-600 text-white hover:bg-cyan-700"
            asChild
          >
            <Link to="/task">View All Tasks</Link>
          </Button>
        </Card>

        {/* Trees Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Your Tree</h2>
          </div>
          <div className="text-center">
            <img
              src={displayedTree.imageUrl || "/tree-1.png"}
              alt={displayedTree.name}
              className="w-32 h-32 mx-auto mb-4"
            />
            <p className="font-semibold text-gray-800">
              {displayedTree.name}
            </p>
            <p className="text-sm text-gray-500">
              {userTrees.length > 0 ? `You owned ${userTrees.length} trees in your garden` : "No trees owned"}
            </p>
          </div>
          <Button
            className="mt-4 w-full bg-green-600 text-white hover:bg-green-700"
            asChild
          >
            <Link to="/tree">Manage Trees</Link>
          </Button>
        </Card>

        {/* Challenges Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Challenges</h2>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Stay Hydrated</p>
            <p className="text-sm text-gray-500">Reward: 71 EXP</p>
            <div className="h-16 w-16 bg-yellow-100 rounded-full mx-auto mt-4 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <Button
            className="mt-4 w-full bg-yellow-600 text-white hover:bg-yellow-700"
            asChild
          >
            <Link to="/challenges">View Challenges</Link>
          </Button>
        </Card>

        {/* Calendar Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Mar 25: Task Deadline
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Mar 28: Challenge Starts
            </li>
          </ul>
          <Button
            className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700"
            asChild
          >
            <Link to="/calendar">View Calendar</Link>
          </Button>
        </Card>

        {/* Marketplace Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Marketplace</h2>
          </div>
          <div className="text-center">
            {marketplaceItems.length > 0 ? (
              <div className="carousel-container">
                <div className="highlight-banner">
                  <span>Highlight</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlideIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="carousel-slide"
                  >
                    {(() => {
                      const item = marketplaceItems[currentSlideIndex];
                      return (
                        <>
                          {item.category === "Music" ? (
                            <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mx-auto mb-4">
                              <button
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm"
                                onClick={() => {
                                  const audio = new Audio(item.itemDetail.mediaUrl);
                                  audio.currentTime = 0;
                                  audio.play();
                                  audio.ontimeupdate = () => {
                                    if (audio.currentTime > 15) {
                                      audio.pause();
                                      audio.currentTime = 0;
                                    }
                                  };
                                }}
                              >
                                ▶️ Preview
                              </button>
                            </div>
                          ) : (
                            <img
                              src={item.itemDetail.mediaUrl}
                              alt={item.name}
                              className={`mx-auto mb-4 ${
                                item.category === "Background" ? "w-64 h-16 object-cover rounded-lg" : "h-16 w-16 object-cover rounded-lg"
                              }`}
                            />
                          )}
                          <p className={`font-semibold ${rarityColorMap[item.rarity?.toLowerCase()] || "text-gray-400"}`}>
                            {item.rarity}
                          </p>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500 flex items-center justify-center">
                            <img src="public\images\coin.png" alt="Coin" className="w-5 h-5 mr-1" />
                            {item.cost}
                          </p>
                        </>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>
                <motion.button
                  className="carousel-btn prev"
                  onClick={goToPrevious}
                >
                  ❮
                </motion.button>
                <motion.button
                  className="carousel-btn next"
                  onClick={goToNext}
                >
                  ❯
                </motion.button>
                <div className="carousel-dots">
                  {marketplaceItems.map((_, index) => (
                    <motion.span
                      key={index}
                      className={`dot ${index === currentSlideIndex ? "active" : ""}`}
                      onClick={() => goToSlide(index)}
                      whileHover={{ scale: 1 }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No items available</p>
            )}
          </div>
          <Button
            className="mt-4 w-full bg-purple-600 text-white hover:bg-purple-700"
            asChild
          >
            <Link to="/marketplace">View Marketplace</Link>
          </Button>
        </Card>
      </div>
    </motion.div>
  );
};

export default HomePage;