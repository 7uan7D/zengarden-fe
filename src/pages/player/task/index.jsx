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
import { useState, useEffect, useRef } from "react";
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

// Hàm chuyển đổi startDate sang định dạng so sánh được (YYYYMMDD)
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return year * 10000 + month * 100 + day;
};

// Hàm lấy ngày hiện tại ở định dạng DD/MM/YYYY
const getCurrentDateStr = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

// Dữ liệu cứng với priority được gán theo startDate
const initialTasks = {
  daily: [],
  simple: [
    {
      taskName: "Complete Project Proposal",
      taskDescription: "Draft and finalize project proposal for client meeting",
      startDate: "01/04/2025",
      endDate: "22/04/2025",
      status: null,
      focusMethodName: "Pomodoro",
      totalDuration: 0.5,
      workDuration: 0.5,
      breakTime: 0,
      userTreeName: "Chilly",
      taskTypeName: "Simple",
      remainingTime: 0.5 * 60,
      priority: 1,
    },
    {
      taskName: "Write Unit Tests",
      taskDescription: "Write unit tests for authentication module",
      startDate: "01/04/2025",
      endDate: "10/04/2025",
      status: 4,
      focusMethodName: "Pomodoro",
      totalDuration: 50,
      workDuration: 20,
      breakTime: 5,
      userTreeName: "Chilly",
      taskTypeName: "Simple",
      remainingTime: 0,
      priority: 2,
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
      priority: 3,
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
      priority: 4,
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
      priority: 1,
    },
    {
      taskName: "Implement Payment Gateway",
      taskDescription: "Integrate payment gateway for e-commerce platform",
      startDate: "01/04/2025",
      endDate: "15/04/2025",
      status: 3,
      focusMethodName: "Pomodoro",
      totalDuration: 150,
      workDuration: 50,
      breakTime: 10,
      userTreeName: "Chilly",
      taskTypeName: "Complex",
      remainingTime: 0,
      priority: 2,
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
      priority: 3,
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
      priority: 4,
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
      priority: 1,
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
      priority: 2,
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
      priority: 3,
    },
  ],
};

export default function TaskPage() {
  // Khai báo các state cần thiết
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
  const [taskData, setTaskData] = useState(initialTasks);
  const [timers, setTimers] = useState({}); // state quản lý thời gian cho các task
  const [activeTaskKey, setActiveTaskKey] = useState(null); // key của task đang hoạt động
  const intervalRefs = useRef({}); // tham chiếu đến các interval để dọn dẹp sau này

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

  // Fetch trees và user data
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

  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach((intervalId) =>
        clearInterval(intervalId)
      );
    };
  }, []);

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

  // Hàm định dạng thời gian từ giây sang phút:giây
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle Start/Pause/Resume/Finish actions
  const handleTaskAction = (columnKey, index, action) => {
    const taskKey = `${columnKey}-${index}`;
    const task = taskData[columnKey][index];

    if (action === "start") {
      setActiveTaskKey(taskKey);
      setTimers((prev) => ({
        ...prev,
        [taskKey]: {
          isWorkPhase: true,
          currentWorkTime: task.workDuration * 60,
          currentBreakTime: task.breakTime * 60,
          remainingTime: task.remainingTime,
          overdueTime: 0, // Initialize overdue time
          isRunning: true,
          totalWorkCompleted: 0,
          totalBreakCompleted: 0,
        },
      }));

      intervalRefs.current[taskKey] = setInterval(() => {
        setTimers((prev) => {
          const timer = prev[taskKey];
          if (!timer || !timer.isRunning) return prev;

          let {
            isWorkPhase,
            currentWorkTime,
            currentBreakTime,
            remainingTime,
            overdueTime,
            totalWorkCompleted,
            totalBreakCompleted,
          } = timer;

          // Check if task has passed endDate
          const currentDate = parseDate(getCurrentDateStr());
          const endDate = parseDate(task.endDate);
          if (currentDate > endDate) {
            clearInterval(intervalRefs.current[taskKey]);
            setTaskData((prevData) => {
              const newData = { ...prevData };
              newData[columnKey][index] = { ...task, status: 4, remainingTime: 0 };
              return newData;
            });
            setActiveTaskKey(null);
            return {
              ...prev,
              [taskKey]: { ...timer, isRunning: false },
            };
          }

          if (remainingTime > 0) {
            if (isWorkPhase) {
              currentWorkTime -= 1;
              remainingTime -= 1;
              if (currentWorkTime <= 0) {
                totalWorkCompleted += task.workDuration * 60;
                isWorkPhase = false;
                currentWorkTime = task.workDuration * 60;
                currentBreakTime = task.breakTime * 60;
              }
            } else {
              currentBreakTime -= 1;
              remainingTime -= 1;
              if (currentBreakTime <= 0) {
                totalBreakCompleted += task.breakTime * 60;
                isWorkPhase = true;
                currentWorkTime = task.workDuration * 60;
                currentBreakTime = task.breakTime * 60;
              }
            }
          } else {
            // Task is overdue
            overdueTime += 1;
          }

          setTaskData((prevData) => {
            const newData = { ...prevData };
            newData[columnKey][index] = { ...task, remainingTime };
            return newData;
          });

          return {
            ...prev,
            [taskKey]: {
              ...timer,
              isWorkPhase,
              currentWorkTime,
              currentBreakTime,
              remainingTime,
              overdueTime,
              totalWorkCompleted,
              totalBreakCompleted,
            },
          };
        });
      }, 1000);
    } else if (action === "pause") {
      setTimers((prev) => ({
        ...prev,
        [taskKey]: { ...prev[taskKey], isRunning: false },
      }));
      clearInterval(intervalRefs.current[taskKey]);
    } else if (action === "resume") {
      setTimers((prev) => ({
        ...prev,
        [taskKey]: { ...prev[taskKey], isRunning: true },
      }));
      intervalRefs.current[taskKey] = setInterval(() => {
        setTimers((prev) => {
          const timer = prev[taskKey];
          if (!timer || !timer.isRunning) return prev;

          let {
            isWorkPhase,
            currentWorkTime,
            currentBreakTime,
            remainingTime,
            overdueTime,
            totalWorkCompleted,
            totalBreakCompleted,
          } = timer;

          // Check if task has passed endDate
          const currentDate = parseDate(getCurrentDateStr());
          const endDate = parseDate(task.endDate);
          if (currentDate > endDate) {
            clearInterval(intervalRefs.current[taskKey]);
            setTaskData((prevData) => {
              const newData = { ...prevData };
              newData[columnKey][index] = { ...task, status: 4, remainingTime: 0 };
              return newData;
            });
            setActiveTaskKey(null);
            return {
              ...prev,
              [taskKey]: { ...timer, isRunning: false },
            };
          }

          if (remainingTime > 0) {
            if (isWorkPhase) {
              currentWorkTime -= 1;
              remainingTime -= 1;
              if (currentWorkTime <= 0) {
                totalWorkCompleted += task.workDuration * 60;
                isWorkPhase = false;
                currentWorkTime = task.workDuration * 60;
                currentBreakTime = task.breakTime * 60;
              }
            } else {
              currentBreakTime -= 1;
              remainingTime -= 1;
              if (currentBreakTime <= 0) {
                totalBreakCompleted += task.breakTime * 60;
                isWorkPhase = true;
                currentWorkTime = task.workDuration * 60;
                currentBreakTime = task.breakTime * 60;
              }
            }
          } else {
            // Task is overdue
            overdueTime += 1;
          }

          setTaskData((prevData) => {
            const newData = { ...prevData };
            newData[columnKey][index] = { ...task, remainingTime };
            return newData;
          });

          return {
            ...prev,
            [taskKey]: {
              ...timer,
              isWorkPhase,
              currentWorkTime,
              currentBreakTime,
              remainingTime,
              overdueTime,
              totalWorkCompleted,
              totalBreakCompleted,
            },
          };
        });
      }, 1000);
    } else if (action === "finish") {
      clearInterval(intervalRefs.current[taskKey]);
      setTimers((prev) => ({
        ...prev,
        [taskKey]: { ...prev[taskKey], isRunning: false },
      }));
      setTaskData((prevData) => {
        const newData = { ...prevData };
        newData[columnKey][index] = { ...task, status: 3, remainingTime: 0 };
        return newData;
      });
      setActiveTaskKey(null);
    }
  };

  const renderTaskColumn = (title, taskList, columnKey) => {
    const filteredTasks =
      activeTabs[columnKey] === "all"
        ? taskList
        : activeTabs[columnKey] === "current"
        ? taskList.filter((task) => task.status !== 4 && task.status !== 3)
        : taskList.filter((task) => task.status === 3);

    // Sắp xếp theo priority
    const sortedTasks = [...filteredTasks].sort((a, b) => a.priority - b.priority);

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
              {sortedTasks.map((task, index) => {
                const totalDurationSeconds = task.totalDuration * 60;
                const taskKey = `${columnKey}-${index}`;
                const timer = timers[taskKey] || {};
                const {
                  isWorkPhase = true,
                  currentWorkTime = task.workDuration * 60,
                  currentBreakTime = task.breakTime * 60,
                  remainingTime = task.remainingTime,
                  overdueTime = 0,
                  totalWorkCompleted = 0,
                  totalBreakCompleted = 0,
                } = timer;

                // Tính tiến độ mỗi giây
                const workProgress =
                  ((totalWorkCompleted +
                    (isWorkPhase ? task.workDuration * 60 - currentWorkTime : 0)) /
                    totalDurationSeconds) * 100;
                const breakProgress =
                  ((totalBreakCompleted +
                    (!isWorkPhase ? task.breakTime * 60 - currentBreakTime : 0)) /
                    totalDurationSeconds) * 100;

                const currentTaskStatus = timer.isRunning
                  ? 1
                  : timer.currentWorkTime !== undefined
                  ? 2
                  : 0;

                // Hàm chuyển priority thành nhãn (1st, 2nd, 3rd,...)
                const getPriorityLabel = (priority) => {
                  switch (priority) {
                    case 1:
                      return "1st";
                    case 2:
                      return "2nd";
                    case 3:
                      return "3rd";
                    case 4:
                      return "4th";
                    default:
                      return `${priority}th`;
                  }
                };

                return (
                  <motion.div
                    key={`${task.taskName}-${task.priority}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="task-item relative">
                      {/* Thêm nhãn priority, chỉ áp dụng cho Simple, Complex, Challenge */}
                      {["simple", "complex", "challenge"].includes(columnKey) && (
                        <div
                          className={`priority-label priority-${
                            task.priority <= 2
                              ? "high"
                              : task.priority <= 4
                              ? "medium"
                              : "low"
                          } absolute top-0 right-0 font-bold text-white px-2 py-1 rounded priority_custom`}
                        >
                          {getPriorityLabel(task.priority)}
                        </div>
                      )}
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
                          <span
                            className={`text-sm ${
                              task.status === 4 ||
                              (remainingTime <= 0 && currentTaskStatus !== 0)
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {task.status !== 3 &&
                              (task.status === 4
                                ? `Overdue: ${formatTime(overdueTime)}`
                                : remainingTime <= 0 && currentTaskStatus !== 0
                                ? `Overdue: ${formatTime(overdueTime)}`
                                : `Remaining: ${formatTime(remainingTime)}`)}
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
                          {task.status !== 4 &&
                            task.status !== 3 &&
                            !(remainingTime <= 0 && currentTaskStatus !== 0) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {currentTaskStatus === 0 ? (
                                  <span className="text-gray-400">
                                    Not Started
                                  </span>
                                ) : isWorkPhase ? (
                                  <span className="text-blue-500 font-medium">
                                    Work: {formatTime(currentWorkTime)}
                                  </span>
                                ) : (
                                  <span className="text-yellow-500 font-medium">
                                    Break: {formatTime(currentBreakTime)}
                                  </span>
                                )}
                              </div>
                            )}
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
                          <div className="flex gap-2">
                            {!(remainingTime <= 0 && currentTaskStatus !== 0) && (
                              <Button
                                onClick={() =>
                                  handleTaskAction(
                                    columnKey,
                                    index,
                                    currentTaskStatus === 0
                                      ? "start"
                                      : currentTaskStatus === 1
                                      ? "pause"
                                      : "resume"
                                  )
                                }
                                className={
                                  currentTaskStatus === 1
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : currentTaskStatus === 2
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-green-500 hover:bg-green-600"
                                }
                                disabled={
                                  currentTaskStatus === 0 &&
                                  activeTaskKey !== null &&
                                  activeTaskKey !== taskKey
                                }
                              >
                                {currentTaskStatus === 0
                                  ? "Start"
                                  : currentTaskStatus === 1
                                  ? "Pause"
                                  : "Resume"}
                              </Button>
                            )}
                            {remainingTime <= 120 &&
                              remainingTime >= 0 &&
                              currentTaskStatus !== 0 && (
                                <Button
                                  onClick={() =>
                                    handleTaskAction(columnKey, index, "finish")
                                  }
                                  className="bg-orange-500 hover:bg-orange-600"
                                >
                                  Finish
                                </Button>
                              )}
                          </div>
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
                className={`object-contain ${userTrees.length > 0 && (treeLevel === 1 || treeLevel === 2)
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
                <p>
                  <strong>Priority:</strong> {selectedTask?.priority}
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
                        : `${treeExp.totalXp} / ${treeExp.totalXp + treeExp.xpToNextLevel
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
              <DropdownMenuItem onClick={() => { }}>
                Daily Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { }}>
                Simple Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { }}>
                Complex Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { }}>
                Challenge Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-4 gap-4 w-full">
          {renderTaskColumn("Daily Task", taskData.daily, "daily")}
          {renderTaskColumn("Simple Task", taskData.simple, "simple")}
          {renderTaskColumn("Complex Task", taskData.complex, "complex")}
          {renderTaskColumn("Challenge Task", taskData.challenge, "challenge")}
        </div>
      </div>
    </motion.div>
  );
}