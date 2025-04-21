import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import addIcon from "/images/add.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GetUserTreeByUserId } from "@/services/apiServices/userTreesService";
import { GetAllTrees } from "@/services/apiServices/treesService";
import { CreateUserTree } from "@/services/apiServices/userTreesService";
import { toast } from "sonner";
import parseJwt from "@/services/parseJwt";
import { useUserExperience } from "@/context/UserExperienceContext";
import { useTreeExperience } from "@/context/TreeExperienceContext";
import { GetBagItems } from "@/services/apiServices/itemService";
import { CircleCheckBig, CircleX } from "lucide-react";
import "../task/index.css";

// Dữ liệu cứng cho các cột task
const tasks = {
  daily: [],
  simple: [
    {
      taskName: "Complete Project Proposal",
      taskDescription: "Draft and finalize project proposal for client meeting",
      startDate: "01/04/2025",
      endDate: "05/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 60,
      workDuration: 25,
      breakTime: 5,
      userTreeName: "Chilly",
      taskTypeName: "Simple",
      remainingTime: 60 * 60, // 60 minutes in seconds
    },
    {
      taskName: "Code Review",
      taskDescription: "Review team member's code for new feature",
      startDate: "03/04/2025",
      endDate: "04/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 45,
      workDuration: 20,
      breakTime: 10,
      userTreeName: "Chilly",
      taskTypeName: "Simple",
      remainingTime: 45 * 60,
    },
    {
      taskName: "Update Documentation",
      taskDescription: "Update API documentation for version 2.0",
      startDate: "02/04/2025",
      endDate: "06/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 90,
      workDuration: 30,
      breakTime: 15,
      userTreeName: "Chilly",
      taskTypeName: "Simple",
      remainingTime: 90 * 60,
    },
    {
      taskName: "Write Unit Tests",
      taskDescription: "Write unit tests for authentication module",
      startDate: "01/04/2025",
      endDate: "10/04/2025",
      status: 4, // Expired
      focusMethodName: "Pomodoro",
      totalDuration: 50,
      workDuration: 20,
      breakTime: 5,
      userTreeName: "Chilly",
      taskTypeName: "Simple",
      remainingTime: 0, // Expired tasks typically have no remaining time
    },
  ],
  complex: [
    {
      taskName: "Develop New Feature",
      taskDescription: "Implement user authentication module",
      startDate: "01/04/2025",
      endDate: "10/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 120,
      workDuration: 45,
      breakTime: 15,
      userTreeName: "Chilly",
      taskTypeName: "Complex",
      remainingTime: 120 * 60,
    },
    {
      taskName: "Database Optimization",
      taskDescription: "Optimize database queries for performance",
      startDate: "02/04/2025",
      endDate: "08/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 100,
      workDuration: 40,
      breakTime: 10,
      userTreeName: "Chilly",
      taskTypeName: "Complex",
      remainingTime: 100 * 60,
    },
    {
      taskName: "UI Redesign",
      taskDescription: "Redesign dashboard for better UX",
      startDate: "04/04/2025",
      endDate: "12/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 80,
      workDuration: 35,
      breakTime: 10,
      userTreeName: "Chilly",
      taskTypeName: "Complex",
      remainingTime: 80 * 60,
    },
    {
      taskName: "Implement Payment Gateway",
      taskDescription: "Integrate payment gateway for e-commerce platform",
      startDate: "01/04/2025",
      endDate: "15/04/2025",
      status: 3, // Done
      focusMethodName: "Pomodoro",
      totalDuration: 150,
      workDuration: 50,
      breakTime: 10,
      userTreeName: "Chilly",
      taskTypeName: "Complex",
      remainingTime: 0, // Completed tasks have no remaining time
    },
  ],
  challenge: [
    {
      taskName: "30-Day Coding Challenge",
      taskDescription: "Complete one coding problem daily for 30 days",
      startDate: "01/04/2025",
      endDate: "30/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 90,
      workDuration: 30,
      breakTime: 10,
      userTreeName: "Chilly",
      taskTypeName: "Challenge",
      remainingTime: 90 * 60,
    },
    {
      taskName: "Open Source Contribution",
      taskDescription: "Contribute to an open-source project",
      startDate: "05/04/2025",
      endDate: "20/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 110,
      workDuration: 40,
      breakTime: 15,
      userTreeName: "Chilly",
      taskTypeName: "Challenge",
      remainingTime: 110 * 60,
    },
    {
      taskName: "Learn New Framework",
      taskDescription: "Learn and build a project with a new framework",
      startDate: "03/04/2025",
      endDate: "25/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 100,
      workDuration: 35,
      breakTime: 10,
      userTreeName: "Chilly",
      taskTypeName: "Challenge",
      remainingTime: 100 * 60,
    },
  ],
};

export default function TaskPage() {
  // State declarations
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);
  const [currentTree, setCurrentTree] = useState(0);
  const [userTrees, setUserTrees] = useState([]);
  const [trees, setTrees] = useState([]);
  const [isCreateTreeDialogOpen, setIsCreateTreeDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTreeName, setNewTreeName] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskInfoDialogOpen, setIsTaskInfoDialogOpen] = useState(false);
  const [activeTabs, setActiveTabs] = useState({
    daily: "all",
    simple: "all",
    complex: "all",
    challenge: "all",
  });
  const [taskStatus, setTaskStatus] = useState({}); // Track status of each task (0: Not started, 1: Running, 2: Paused)

  const { refreshXp } = useUserExperience();
  const { treeExp, refreshTreeExp } = useTreeExperience();

  const selectedTree = userTrees.find(
    (tree) => tree.userTreeId === currentTree
  );
  const treeLevel = selectedTree?.levelId;
  const finalTreeId = selectedTree?.finalTreeId;
  const selectedFinalTree = trees.find((t) => t.treeId === finalTreeId);
  const treeImageSrc =
    treeLevel && treeLevel < 4
      ? `/images/lv${treeLevel}.png`
      : selectedFinalTree?.imageUrl || "/images/default.png";

  // Fetch all trees and user trees on component mount
  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const allTrees = await GetAllTrees();
        setTrees(allTrees);
      } catch (error) {
        console.error("Error fetching trees:", error);
      }
    };
    fetchTrees();
  }, []);

  useEffect(() => {
    if (currentTree) {
      (async () => {
        await refreshTreeExp(currentTree);
      })();
    }
  }, [currentTree]);

  useEffect(() => {
    const fetchTrees = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const userId = parseJwt(token).sub;
        const responseData = await GetUserTreeByUserId(userId);
        if (responseData) {
          setUserTrees(responseData);
        }
      }
    };
    fetchTrees();
  }, []);

  useEffect(() => {
    if (userTrees.length > 0) {
      const savedTreeId = localStorage.getItem("selectedTreeId");
      const found = userTrees.find(
        (tree) => tree.userTreeId === parseInt(savedTreeId)
      );
      if (found) {
        setCurrentTree(found.userTreeId);
      } else {
        setCurrentTree(userTrees[0].userTreeId);
        localStorage.setItem("selectedTreeId", userTrees[0].userTreeId);
      }
    }
  }, [userTrees]);

  const handleCreateTree = async () => {
    try {
      setIsCreating(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in!");
        return;
      }
      const userId = parseJwt(token).sub;
      const result = await CreateUserTree(userId, newTreeName);
      if (result) {
        toast.success("Tree created successfully!");
        setIsCreateTreeDialogOpen(false);
        setNewTreeName("");
        const updatedUserTrees = await GetUserTreeByUserId(userId);
        setUserTrees(updatedUserTrees);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the tree!");
    } finally {
      setIsCreating(false);
      refreshXp();
      refreshTreeExp(currentTree);
    }
  };

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle Start/Pause/Resume button click
  const handleTaskAction = (columnKey, index) => {
    const taskKey = `${columnKey}-${index}`;
    setTaskStatus((prev) => {
      const currentStatus = prev[taskKey] || 0;
      if (currentStatus === 0) {
        return { ...prev, [taskKey]: 1 }; // Start -> Running
      } else if (currentStatus === 1) {
        return { ...prev, [taskKey]: 2 }; // Running -> Paused
      } else {
        return { ...prev, [taskKey]: 1 }; // Paused -> Running
      }
    });
  };

  const renderTaskColumn = (title, taskList, columnKey) => {
    const filteredTasks =
      activeTabs[columnKey] === "all"
        ? taskList
        : activeTabs[columnKey] === "current"
        ? taskList.filter((task) => task.status !== 4 && task.status !== 3)
        : taskList.filter((task) => task.status === 4 || task.status === 3);

    return (
      <div className="task-column-container">
        <div className="flex justify-between items-center mb-1">
          <h2 className={`task-column-title ${columnKey}`}>{title}</h2>
          <Tabs
            value={activeTabs[columnKey]}
            onValueChange={(value) =>
              setActiveTabs({ ...activeTabs, [columnKey]: value })
            }
          >
            <TabsList className="bg-transparent flex">
              {/** Phần hiển thị active tab của cột Task */}
              <TabsTrigger
                value="all"
                className="data-[state=active]:text-green-500 border-none px-2 text-sm"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="current"
                className="data-[state=active]:text-green-500 border-none px-2 text-sm"
              >
                Current
              </TabsTrigger>
              <TabsTrigger
                value="complete"
                className="data-[state=active]:text-green-500 border-none px-2 text-sm"
              >
                Complete
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Separator className="mb-3" />
        <motion.div
          className={`task-column ${columnKey}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ScrollArea className="h-[400px] overflow-y-auto">
            <div className="grid gap-3">
              {filteredTasks.map((task, index) => {
                const totalDurationSeconds = task.totalDuration * 60; //  Convert minutes to seconds
                const remainingTime = task.remainingTime; // Remaining time in seconds
                const workDurationSeconds = task.workDuration * 60; // Convert minutes to seconds
                const breakTimeSeconds = task.breakTime * 60; // Convert minutes to seconds
                const cycleDuration = workDurationSeconds + breakTimeSeconds; // phần thời gian của 1 chu kỳ làm việc và nghỉ ngơi
                const completedCycles = Math.floor(
                  (totalDurationSeconds - remainingTime) / cycleDuration // phần số chu kỳ đã hoàn thành
                );
                const remainingInCycle =
                  (totalDurationSeconds - remainingTime) % cycleDuration; // phần thời gian còn lại trong chu kỳ hiện tại

                let workProgress, breakProgress;
                if (task.status === 4 || task.status === 3) {
                  const totalCycles = Math.ceil(
                    totalDurationSeconds / cycleDuration // phần số chu kỳ hoàn thành
                  );
                  workProgress =
                    (workDurationSeconds / totalDurationSeconds) *
                    100 *
                    totalCycles; // phần trăm thời gian làm việc đã hoàn thành
                  breakProgress =
                    (breakTimeSeconds / totalDurationSeconds) * 100 * totalCycles; // phần trăm thời gian nghỉ ngơi đã hoàn thành
                } else {
                  workProgress =
                    (task.workDuration / task.totalDuration) *
                    100 *
                    (completedCycles +
                      (remainingInCycle < workDurationSeconds
                        ? remainingInCycle / workDurationSeconds
                        : 1)); 
                  breakProgress =
                    (task.breakTime / task.totalDuration) *
                    100 *
                    (completedCycles +
                      (remainingInCycle >= workDurationSeconds
                        ? (remainingInCycle - workDurationSeconds) /
                          breakTimeSeconds
                        : 0));
                }

                const taskKey = `${columnKey}-${index}`; // Unique key for each task
                const currentTaskStatus = taskStatus[taskKey] || 0; // 0: Not started, 1: Running, 2: Paused

                return (
                  <motion.div
                    key={index}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="task-item">
                      <div className="flex-1 flex flex-col justify-between text-left">
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsTaskInfoDialogOpen(true);
                          }}
                        >
                          <span className="text-gray-700 font-medium">
                            {task.taskName}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 text-left">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            Remaining: {formatTime(remainingTime)}
                          </span>
                          <div className="progress-bar-container">
                            <div className="progress-bar">
                              <div
                                className="work-progress bg-blue-500"
                                style={{
                                  width: `${Math.min(workProgress, 100)}%`,
                                }}
                              />
                              <div
                                className="break-progress bg-yellow-500"
                                style={{
                                  width: `${Math.min(breakProgress, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {task.status === 3 ? (
                          <span
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "#22c55e" }}
                          >
                            <CircleCheckBig className="w-4 h-4" />
                            Done
                          </span>
                        ) : task.status === 4 ? (
                          <span
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "#ef4444" }}
                          >
                            <CircleX className="w-4 h-4" />
                            Expired
                          </span>
                        ) : (
                          <Button
                            onClick={() => handleTaskAction(columnKey, index)}
                            className={
                              currentTaskStatus === 1
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : currentTaskStatus === 2
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-green-500 hover:bg-green-600"
                            }
                          >
                            {currentTaskStatus === 0
                              ? "Start"
                              : currentTaskStatus === 1
                              ? "Pause"
                              : "Resume"}
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </motion.div>
      </div>
    );
  };

  const progress = treeExp
    ? (treeExp.totalXp / (treeExp.totalXp + treeExp.xpToNextLevel)) * 100
    : 0;

  const [equippedItems, setEquippedItems] = useState([]);

  useEffect(() => {
    const fetchEquippedItems = async () => {
      const token = localStorage.getItem("token");
      const payload = parseJwt(token);
      const bagId = payload?.sub;

      if (!bagId) return;

      try {
        const items = await GetBagItems(bagId);
        const filtered = items.filter((item) => item.isEquipped);
        setEquippedItems(filtered);
      } catch (err) {
        console.error("Failed to fetch bag items:", err);
      }
    };

    fetchEquippedItems();
  }, []);

  // Giao diện chính của TaskPage
  return (
    <motion.div
      className="p-6 max-w-full mx-auto w-full min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md"></div>
      {/* Task Tree Header */}
      <div className="py-10 flex-grow">
        <div className="bg-[#CCFFCC] text-black p-6 rounded-lg shadow-md mb-6 flex items-center gap-6 relative mt-6">
          <div
            className="relative cursor-pointer"
            onClick={() => {
              if (userTrees.length === 0) {
                setIsTreeDialogOpen(false);
                setIsCreateTreeDialogOpen(true);
              } else {
                setIsTreeDialogOpen(true);
              }
            }}
          >
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-green-300 shadow-md flex items-center justify-center hover:scale-110 transition-transform">
              <img
                src={userTrees.length > 0 ? treeImageSrc : addIcon}
                className={`object-contain ${
                  userTrees.length > 0 && (treeLevel === 1 || treeLevel === 2)
                    ? "w-10 h-10"
                    : "w-30 h-30"
                }`}
              />
            </div>
          </div>

          <Dialog open={isTreeDialogOpen} onOpenChange={setIsTreeDialogOpen}>
            <DialogContent className="max-w-xl w-full flex gap-4 justify-center p-6 flex-wrap">
              <DialogTitle className="text-center w-full">
                Choose your tree
              </DialogTitle>
              {userTrees
                .filter(
                  (tree) => tree.treeStatus === 0 || tree.treeStatus === 1
                )
                .map((tree) => {
                  const totalNeeded = tree.totalXp + tree.xpToNextLevel;
                  const progress =
                    totalNeeded > 0 ? (tree.totalXp / totalNeeded) * 100 : 0;
                  const finalTree = trees.find(
                    (t) => t.treeId === tree.finalTreeId
                  );
                  const treeImageSrc =
                    tree.levelId < 4
                      ? `/images/lv${tree.levelId}.png`
                      : finalTree?.imageUrl || "/images/default.png";

                  return (
                    <div
                      key={tree.userTreeId}
                      className="p-4 bg-white rounded-lg shadow-lg w-48 text-center cursor-pointer transition-transform hover:scale-105"
                      onClick={() => {
                        setCurrentTree(tree.userTreeId);
                        localStorage.setItem("selectedTreeId", tree.userTreeId);
                        setIsTreeDialogOpen(false);
                      }}
                    >
                      <div className="w-20 h-20 mx-auto rounded-full border-2 border-green-300 shadow-sm flex items-center justify-center">
                        <img
                          src={treeImageSrc}
                          alt={`${tree.name}`}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <h3 className="font-bold mt-2">{tree.name}</h3>
                      <p>Level: {tree.levelId}</p>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm mt-1">
                        XP: {tree.totalXp} / {totalNeeded}
                      </p>
                    </div>
                  );
                })}
              {userTrees.filter(
                (tree) => tree.treeStatus === 1 || tree.treeStatus === 2
              ).length < 2 && (
                <div
                  className="p-4 bg-white rounded-lg shadow-lg w-48 text-center cursor-pointer transition-transform hover:scale-105 flex flex-col items-center justify-center"
                  onClick={() => {
                    setIsTreeDialogOpen(false);
                    setIsCreateTreeDialogOpen(true);
                  }}
                >
                  <img
                    src={addIcon}
                    alt="Add New Tree"
                    className="w-20 h-20 mx-auto opacity-80 hover:opacity-100"
                  />
                  <h3 className="font-bold mt-2 text-green-600">
                    Create New Tree
                  </h3>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateTreeDialogOpen}
            onOpenChange={setIsCreateTreeDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new tree</DialogTitle>
                <DialogDescription>Fill in the tree details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="treeName">Tree Name</Label>
                <Input
                  id="treeName"
                  placeholder="Enter tree name"
                  value={newTreeName}
                  onChange={(e) => setNewTreeName(e.target.value)}
                />
                <Button
                  onClick={handleCreateTree}
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isTaskInfoDialogOpen}
            onOpenChange={setIsTaskInfoDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedTask?.taskName}</DialogTitle>
                <DialogDescription>
                  {selectedTask?.taskDescription}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Start Date:</strong> {selectedTask?.startDate}
                </p>
                <p>
                  <strong>End Date:</strong> {selectedTask?.endDate}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedTask?.status === 3
                    ? "Completed"
                    : selectedTask?.status === 4
                    ? "Expired"
                    : "In Progress"}
                </p>
                <p>
                  <strong>Focus Method:</strong> {selectedTask?.focusMethodName}
                </p>
                <p>
                  <strong>Total Duration:</strong> {selectedTask?.totalDuration}{" "}
                  minutes
                </p>
                <p>
                  <strong>Work Duration:</strong> {selectedTask?.workDuration}{" "}
                  minutes
                </p>
                <p>
                  <strong>Break Time:</strong> {selectedTask?.breakTime} minutes
                </p>
                <p>
                  <strong>Tree:</strong> {selectedTask?.userTreeName}
                </p>
                <p>
                  <strong>Task Type:</strong> {selectedTask?.taskTypeName}
                </p>
                {selectedTask?.remainingTime !== null && (
                  <p>
                    <strong>Remaining Time:</strong>{" "}
                    {formatTime(selectedTask?.remainingTime)}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsTaskInfoDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex-1">
            {selectedTree ? (
              <>
                <h2 className="text-3xl font-bold text-[#609994] tracking-wide flex items-center gap-3">
                  {selectedTree.name}
                  <span className="text-base font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shadow-inner">
                    Level {selectedTree.levelId}
                  </span>
                </h2>
                {treeExp && (
                  <div className="relative w-full mt-3 h-4 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-[#a1d99b] via-[#f9d976] to-[#f49a8c] rounded-full"
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 drop-shadow-sm">
                      {selectedTree.levelId === 4
                        ? "Level Max"
                        : `${treeExp.totalXp} / ${
                            treeExp.totalXp + treeExp.xpToNextLevel
                          } XP`}
                    </span>
                  </div>
                )}
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">
                    Equipped Items:
                  </span>
                  {equippedItems.map((item) => {
                    const { bagItemId, item: itemData } = item;
                    const { name, type, itemDetail } = itemData || {};
                    const mediaUrl = itemDetail?.mediaUrl;

                    return (
                      <span
                        key={bagItemId}
                        className="text-xs bg-[#83aa6c] text-white px-3 py-1 rounded-full shadow hover:opacity-90 transition flex items-center"
                      >
                        {type !== 4 && mediaUrl && (
                          <img
                            src={mediaUrl}
                            alt={name}
                            className="w-5 h-5 mr-2 object-contain"
                          />
                        )}
                        {name}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm italic text-gray-500">
                Haven't chosen any tree yet
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="absolute right-6 top-6 bg-black text-white hover:bg-gray-800">
                Create Task
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                Daily Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                Simple Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                Complex Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                Challenge Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-4 gap-3 w-full">
          {renderTaskColumn("Daily Task", tasks.daily, "daily")}
          {renderTaskColumn("Simple Task", tasks.simple, "simple")}
          {renderTaskColumn("Complex Task", tasks.complex, "complex")}
          {renderTaskColumn("Challenge Task", tasks.challenge, "challenge")}
        </div>
      </div>
    </motion.div>
  );
}