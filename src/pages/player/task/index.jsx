import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import addIcon from "/images/add.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { GetUserTreeByUserId } from "@/services/apiServices/userTreesService";
import { GetAllTrees } from "@/services/apiServices/treesService";
import { CreateUserTree } from "@/services/apiServices/userTreesService";
import { toast } from "sonner";
import parseJwt from "@/services/parseJwt";
import { useUserExperience } from "@/context/UserExperienceContext";
import { useTreeExperience } from "@/context/TreeExperienceContext";
import { CreateTask } from "@/services/apiServices/taskService";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { SuggestTaskFocusMethods } from "@/services/apiServices/focusMethodsService";
import { GetTaskByUserTreeId } from "@/services/apiServices/taskService";
import { StartTask } from "@/services/apiServices/taskService";
import { PauseTask } from "@/services/apiServices/taskService";
import "../task/index.css";

// Component con để chọn ngày và giờ cho task
const DateTimePicker = ({ label, date, onDateChange, onTimeChange }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const selectedDate = date ? new Date(date) : undefined;
  const formattedTime = date
    ? new Date(date).toISOString().split("T")[1].slice(0, 5)
    : "00:00";

  const handleDateSelect = useCallback(
    (newDate) => {
      onDateChange(newDate);
      setIsPopoverOpen(false);
    },
    [onDateChange]
  );

  const handleTimeChange = useCallback(
    (time) => {
      onTimeChange(time);
    },
    [onTimeChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-gray-700">{label}</Label>
      <div className="flex items-center gap-2">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[150px] h-10 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 shadow-md bg-white rounded-lg">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>

        <TimePicker
          onChange={handleTimeChange}
          value={formattedTime}
          disableClock={true}
          className="h-10 w-[100px] text-center border-gray-300 rounded-lg focus:border-green-500 focus:ring focus:ring-green-200 transition-all"
          clearIcon={null}
          clockIcon={null}
        />
      </div>
    </div>
  );
};

// Component chính quản lý giao diện Task
export default function TaskPage() {
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskType, setTaskType] = useState("");
  const [currentTree, setCurrentTree] = useState(0);
  const [userTrees, setUserTrees] = useState([]);
  const [trees, setTrees] = useState([]);

  // State cho bộ đếm thời gian
  const [currentTask, setCurrentTask] = useState(null); // Task đang chạy
  const [isRunning, setIsRunning] = useState(false); // Trạng thái chạy/pause
  const [dialogOpen, setDialogOpen] = useState(false); // Dialog xác nhận chuyển task
  const [pendingTask, setPendingTask] = useState(null); // Task chờ chuyển
  const [selectedTask, setSelectedTask] = useState(null); // Task được chọn để xem chi tiết
  const [isTaskInfoDialogOpen, setIsTaskInfoDialogOpen] = useState(false); // Dialog thông tin task
  const [activeTabs, setActiveTabs] = useState({
    daily: "all",
    simple: "all",
    complex: "all",
  });

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
  const [newTreeName, setNewTreeName] = useState("");
  const [isCreateTreeDialogOpen, setIsCreateTreeDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { refreshXp } = useUserExperience();
  const { treeExp, refreshTreeExp } = useTreeExperience();
  const [taskData, setTaskData] = useState({
    focusMethodId: null,
    taskTypeId: null,
    userTreeId: selectedTree?.userTreeId || null,
    taskName: "",
    taskDescription: "",
    totalDuration: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    workDuration: "",
    breakTime: "",
  });
  const [step, setStep] = useState(1); // Bước trong quy trình tạo task
  const [focusSuggestion, setFocusSuggestion] = useState(null);

  // Chuyển bước trong dialog tạo task
  const handleNext = async () => {
    if (step === 1) {
      try {
        const response = await SuggestTaskFocusMethods(taskData);
        setFocusSuggestion(response);
        setTaskData((prev) => ({
          ...prev,
          focusMethodId: response.focusMethodId,
          workDuration: response.defaultDuration,
          breakTime: response.defaultBreak,
        }));
        setStep(2);
      } catch (error) {
        console.error("Error fetching suggestions", error);
      }
    } else {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = useCallback((field, date) => {
    setTaskData((prev) => ({
      ...prev,
      [field]: date
        ? date.toISOString().split("T")[0] +
          "T" +
          (prev[field]?.split("T")[1] || "00:00:00.000Z")
        : null,
    }));
  }, []);

  const handleTimeChange = useCallback((field, time) => {
    if (!time) return;
    setTaskData((prev) => ({
      ...prev,
      [field]: prev[field]
        ? prev[field].split("T")[0] + "T" + time + ":00.000Z"
        : null,
    }));
  }, []);

  // Cập nhật task khi thay đổi cây
  useEffect(() => {
    if (currentTree) {
      const tree = userTrees.find((t) => t.userTreeId === currentTree);
      if (tree) {
        fetchTasks(tree.userTreeId);
      }
    }
  }, [currentTree]);

  // Lấy danh sách cây mẫu
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

  // Cập nhật kinh nghiệm cây
  useEffect(() => {
    if (currentTree) {
      (async () => {
        await refreshTreeExp(currentTree);
      })();
    }
  }, [currentTree]);

  // Lấy danh sách cây của người dùng
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

  // Cập nhật userTreeId khi chọn cây
  useEffect(() => {
    setTaskData((prev) => ({
      ...prev,
      userTreeId: selectedTree?.userTreeId || null,
    }));
  }, [selectedTree]);

  // Chọn cây mặc định khi khởi tạo
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

  const [tasks, setTasks] = useState({
    daily: [],
    simple: [],
    complex: [],
  });

  // Lấy danh sách task theo cây
  const fetchTasks = async (userTreeId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      let taskData = [];
      if (userTreeId) {
        taskData = await GetTaskByUserTreeId(userTreeId);
      } else {
        return;
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

  useEffect(() => {
    fetchTasks(selectedTree?.userTreeId);
  }, [selectedTree]);

  // Mở dialog tạo task
  const handleOpen = (type, taskTypeId) => {
    setTaskType(type);
    setTaskData((prev) => ({
      ...prev,
      taskTypeId: taskTypeId,
      userTreeId: selectedTree?.userTreeId || null,
    }));
    setIsTaskDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setIsTreeDialogOpen(true);
  };

  // Tạo cây mới
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

  // Tạo task mới
  const handleCreateTask = async () => {
    try {
      const response = await CreateTask(taskData);
      console.log("Task created successfully:", response);
      setIsTaskDialogOpen(false);
      setStep(1);
      setTaskData({});
      fetchTasks(selectedTree?.userTreeId);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // Định dạng thời gian cho bộ đếm
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = async (column, taskIndex) => {
    const task = tasks[column][taskIndex];
    console.log("StartTask => task:", task);
    const totalDurationSeconds = task.totalDuration * 60;

    try {
      await StartTask(task.taskId);
    } catch (error) {
      console.error("Failed to start task:", error);
    }

    // ✅ Cập nhật trạng thái task thành 'running'
    setTasks((prev) => {
      const updated = { ...prev };
      updated[column] = [...updated[column]];
      updated[column][taskIndex] = {
        ...updated[column][taskIndex],
        status: 1, // Running
      };
      return updated;
    });

    if (
      currentTask &&
      (currentTask.column !== column || currentTask.taskIndex !== taskIndex)
    ) {
      setPendingTask({ column, taskIndex });
      setDialogOpen(true);
    } else if (!currentTask) {
      setCurrentTask({ column, taskIndex, time: totalDurationSeconds });
      setIsRunning(true);
    }
  };

  const stopCurrentTimer = () => {
    setCurrentTask(null);
    setIsRunning(false);
  };

  const handleSwitchTask = () => {
    if (pendingTask) {
      stopCurrentTimer();
      startTimer(pendingTask.column, pendingTask.taskIndex);
      setDialogOpen(false);
      setPendingTask(null);
    }
  };

  const handleKeepCurrentTask = () => {
    setDialogOpen(false);
    setPendingTask(null);
  };

  const toggleTimer = async (column = null, taskIndex = null) => {
    const columnToUse = column ?? currentTask?.column;
    const indexToUse = taskIndex ?? currentTask?.taskIndex;

    if (columnToUse === null || indexToUse === null) return;

    const task = tasks[columnToUse][indexToUse];

    if (isRunning) {
      // Pause
      try {
        await PauseTask(task.taskId);
      } catch (error) {
        console.error("Failed to pause task:", error);
      }

      setTasks((prev) => {
        const updated = { ...prev };
        updated[columnToUse] = [...updated[columnToUse]];
        updated[columnToUse][indexToUse] = {
          ...updated[columnToUse][indexToUse],
          status: 2,
        };
        return updated;
      });

      setIsRunning(false);
    } else {
      // Resume
      try {
        await StartTask(task.taskId);
      } catch (error) {
        console.error("Failed to resume task:", error);
      }

      setTasks((prev) => {
        const updated = { ...prev };
        updated[columnToUse] = [...updated[columnToUse]];
        updated[columnToUse][indexToUse] = {
          ...updated[columnToUse][indexToUse],
          status: 1,
        };
        return updated;
      });

      setCurrentTask({
        column: columnToUse,
        taskIndex: indexToUse,
        time: currentTask?.time ?? task.totalDuration * 60,
      });
      setIsRunning(true);
    }
  };

  // Chạy bộ đếm thời gian
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTask && isRunning && currentTask.time > 0) {
        setCurrentTask((prev) => ({
          ...prev,
          time: prev.time - 1,
        }));
      } else if (currentTask && currentTask.time === 0) {
        stopCurrentTimer();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentTask, isRunning]);

  // Hiển thị cột task
  const renderTaskColumn = (title, taskList, columnKey) => {
    const filteredTasks =
      activeTabs[columnKey] === "all"
        ? taskList
        : activeTabs[columnKey] === "current"
        ? taskList.filter((task) => task.status !== 4)
        : taskList.filter((task) => task.status === 4);

    return (
      <motion.div
        className={`task-column ${columnKey}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2>{title}</h2>
          <div className="flex gap-2">
            <Button
              variant={activeTabs[columnKey] === "all" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setActiveTabs({ ...activeTabs, [columnKey]: "all" })
              }
            >
              All
            </Button>
            <Button
              variant={
                activeTabs[columnKey] === "current" ? "default" : "outline"
              }
              size="sm"
              onClick={() =>
                setActiveTabs({ ...activeTabs, [columnKey]: "current" })
              }
            >
              Current
            </Button>
            <Button
              variant={
                activeTabs[columnKey] === "complete" ? "default" : "outline"
              }
              size="sm"
              onClick={() =>
                setActiveTabs({ ...activeTabs, [columnKey]: "complete" })
              }
            >
              Complete
            </Button>
          </div>
        </div>
        <Separator className="mb-3" />
        <ScrollArea className="h-[400px] overflow-y-auto">
          <div className="grid gap-3">
            {filteredTasks.map((task, index) => {
              const realIndex = tasks[columnKey].findIndex(
                (t) => t.taskId === task.taskId
              );
              const realTask = tasks[columnKey][realIndex];
              const totalDurationSeconds = task.totalDuration * 60;
              const isCurrentTask =
                currentTask &&
                currentTask.column === columnKey &&
                currentTask.taskIndex === realIndex;
              const remainingTime = isCurrentTask
                ? currentTask.time
                : totalDurationSeconds;
              const workDurationSeconds = task.workDuration * 60;
              const breakTimeSeconds = task.breakTime * 60;
              const cycleDuration = workDurationSeconds + breakTimeSeconds;
              const completedCycles = Math.floor(
                (totalDurationSeconds - remainingTime) / cycleDuration
              );
              const remainingInCycle =
                (totalDurationSeconds - remainingTime) % cycleDuration;
              const workRemaining =
                remainingInCycle < workDurationSeconds
                  ? workDurationSeconds - remainingInCycle
                  : 0;
              const breakRemaining =
                remainingInCycle >= workDurationSeconds
                  ? cycleDuration - remainingInCycle
                  : breakTimeSeconds;
              const isTaskRunning = isCurrentTask && isRunning;

              return (
                <motion.div
                  key={realIndex}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: realIndex * 0.1 }}
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
                        <span className="text-sm text-gray-600">
                          Remaining: {formatTime(remainingTime)}
                        </span>
                        <div
                          className={`progress-bar-container ${
                            isTaskRunning ? "active" : ""
                          }`}
                        >
                          <div className="progress-bar">
                            <div
                              className="work-progress"
                              style={{
                                width: `${
                                  (task.workDuration / task.totalDuration) *
                                  100 *
                                  (completedCycles +
                                    (remainingInCycle < workDurationSeconds
                                      ? remainingInCycle / workDurationSeconds
                                      : 1))
                                }%`,
                              }}
                            />
                            <div
                              className="break-progress"
                              style={{
                                width: `${
                                  (task.breakTime / task.totalDuration) *
                                  100 *
                                  (completedCycles +
                                    (remainingInCycle >= workDurationSeconds
                                      ? (remainingInCycle -
                                          workDurationSeconds) /
                                        breakTimeSeconds
                                      : 0))
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex flex-col items-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isTaskRunning && (
                        <span className="text-sm text-gray-600">
                          {workRemaining > 0
                            ? `Work: ${formatTime(workRemaining)}`
                            : `Break: ${formatTime(breakRemaining)}`}
                        </span>
                      )}

                      {task.status === 4 ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Done</span>
                        </div>
                      ) : realTask.status === 1 ? (
                        <Button
                          onClick={() => toggleTimer(columnKey, realIndex)}
                        >
                          Pause
                        </Button>
                      ) : realTask.status === 2 ? (
                        <Button
                          onClick={() => toggleTimer(columnKey, realIndex)}
                        >
                          Resume
                        </Button>
                      ) : realTask.status === 0 ? (
                        <Button
                          onClick={() => startTimer(columnKey, realIndex)}
                        >
                          Start
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </motion.div>
    );
  };

  const handleBeforeUnload = (e) => {
    if (isRunning && currentTask) {
      const task = tasks[currentTask.column]?.[currentTask.taskIndex];

      if (task) {
        const now = Date.now();
        const dataToSave = {
          taskId: task.taskId,
          column: currentTask.column,
          taskIndex: currentTask.taskIndex,
          time: currentTask.time,
          lastUpdated: now,
        };
        localStorage.setItem("pausedTask", JSON.stringify(dataToSave));

        // ✅ Gửi request dùng fetch có keepalive
        fetch(
          `https://zengarden-be.onrender.com/api/Task/pause/${task.taskId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
            keepalive: true, // Cho phép gửi khi tab đang đóng hoặc refresh
          }
        )
          .then(() => {
            console.log("Paused task via fetch keepalive");
          })
          .catch((err) => {
            console.error("PauseTask (fetch) failed", err);
          });
      }
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning, currentTask, tasks]);

  useEffect(() => {
    const saved = localStorage.getItem("pausedTask");
    if (saved) {
      const { taskId, column, taskIndex } = JSON.parse(saved);

      // 🔥 Gọi API để lấy task mới nhất
      fetch(`https://zengarden-be.onrender.com/api/Task/by-id/${taskId}`)
        .then((res) => res.json())
        .then((taskFromBE) => {
          console.log("[RESTORE] Fetched task from BE:", taskFromBE);

          setCurrentTask({
            column,
            taskIndex,
            time: taskFromBE.remainingTime * 60,
          });

          setIsRunning(false); // Đã pause

          // Cập nhật vào tasks
          setTasks((prev) => {
            const updatedColumn = [...(prev[column] || [])];
            const targetTask = updatedColumn[taskIndex];
            if (targetTask) {
              targetTask.status = 2; // Paused
              targetTask.remainingTime = taskFromBE.remainingTime;
            }
            return {
              ...prev,
              [column]: updatedColumn,
            };
          });
        });
    }
  }, []);

  const progress = treeExp
    ? (treeExp.totalXp / (treeExp.totalXp + treeExp.xpToNextLevel)) * 100
    : 0;

  // Giao diện chính
  return (
    <motion.div
      className="p-6 max-w-full mx-auto w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md"></div>
      <div className="pt-10">
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

          {/* Dialog chọn cây */}
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
                (tree) => tree.treeStatus === 0 || tree.treeStatus === 1
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
                  <strong>Start Date:</strong>{" "}
                  {new Date(selectedTask?.startDate).toLocaleString()}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {new Date(selectedTask?.endDate).toLocaleString()}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedTask?.status === 3 ? "Completed" : "In Progress"}
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
                {selectedTask?.taskNote && (
                  <p>
                    <strong>Task Note:</strong> {selectedTask?.taskNote}
                  </p>
                )}
                {selectedTask?.taskResult && (
                  <p>
                    <strong>Task Result:</strong> {selectedTask?.taskResult}
                  </p>
                )}
                {selectedTask?.remainingTime !== null && (
                  <p>
                    <strong>Remaining Time:</strong>{" "}
                    {selectedTask?.remainingTime} minutes
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
                  {[1, 2, 3].map((item) => (
                    <span
                      key={item}
                      className="text-xs bg-[#83aa6c] text-white px-3 py-1 rounded-full shadow hover:opacity-90 transition"
                    >
                      Item {item}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm italic text-gray-500">
                Haven't chosen any tree yet
              </p>
            )}
          </div>

          {/* Dropdown tạo task */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="absolute right-6 top-6 bg-black text-white hover:bg-gray-800">
                Create Task
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpen("Simple Task", 2)}>
                Simple Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpen("Complex Task", 3)}>
                Complex Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dialog tạo task */}
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogContent className="max-w-lg bg-white rounded-xl shadow-2xl p-6">
              <DialogHeader className="relative bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-t-xl shadow-md">
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                  {step === 3 ? "Confirm Task" : "Create Task"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-100 mt-1">
                  {step === 1 && "Fill in the details for your new task."}
                  {step === 2 && "Suggested focus method based on your task."}
                  {step === 3 && "Review and confirm your task details."}
                </DialogDescription>
              </DialogHeader>

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label>Task Name</Label>
                    <Input
                      name="taskName"
                      placeholder="Enter task name"
                      value={taskData.taskName}
                      onChange={(e) =>
                        setTaskData({ ...taskData, taskName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      name="taskDescription"
                      placeholder="Describe your task"
                      value={taskData.taskDescription}
                      onChange={(e) =>
                        setTaskData({
                          ...taskData,
                          taskDescription: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      placeholder="Task duration"
                      value={taskData.totalDuration}
                      onChange={(e) =>
                        setTaskData({
                          ...taskData,
                          totalDuration: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <DateTimePicker
                      label="Start Date"
                      date={taskData.startDate}
                      onDateChange={(newDate) =>
                        handleDateChange("startDate", newDate)
                      }
                      onTimeChange={(time) =>
                        handleTimeChange("startDate", time)
                      }
                    />
                    <DateTimePicker
                      label="End Date"
                      date={taskData.endDate}
                      onDateChange={(newDate) =>
                        handleDateChange("endDate", newDate)
                      }
                      onTimeChange={(time) => handleTimeChange("endDate", time)}
                    />
                  </div>
                </div>
              )}

              {step === 2 && focusSuggestion && (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {focusSuggestion.focusMethodName}
                    </p>
                    <p>XP Multiplier: {focusSuggestion.xpMultiplier}</p>
                    <p className="text-sm text-gray-500">
                      Min Duration: {focusSuggestion.minDuration} mins, Max
                      Duration: {focusSuggestion.maxDuration} mins
                    </p>
                    <p className="text-sm text-gray-500">
                      Min Break: {focusSuggestion.minBreak} mins, Max Break:{" "}
                      {focusSuggestion.maxBreak} mins
                    </p>
                  </div>
                  <div>
                    <Label>Work Duration (minutes)</Label>
                    <Input
                      type="number"
                      min={focusSuggestion.minDuration}
                      max={focusSuggestion.maxDuration}
                      value={taskData.workDuration}
                      onChange={(e) =>
                        setTaskData({
                          ...taskData,
                          workDuration: Number(e.target.value),
                        })
                      }
                    />
                    <p className="text-sm text-gray-500">
                      Recommended: {focusSuggestion.defaultDuration} mins
                    </p>
                  </div>
                  <div>
                    <Label>Break Time (minutes)</Label>
                    <Input
                      type="number"
                      min={focusSuggestion.minBreak}
                      max={focusSuggestion.maxBreak}
                      value={taskData.breakTime}
                      onChange={(e) =>
                        setTaskData({
                          ...taskData,
                          breakTime: Number(e.target.value),
                        })
                      }
                    />
                    <p className="text-sm text-gray-500">
                      Recommended: {focusSuggestion.defaultBreak} mins
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p>
                    <strong>Task Name:</strong> {taskData.taskName}
                  </p>
                  <p>
                    <strong>Description:</strong> {taskData.taskDescription}
                  </p>
                  <p>
                    <strong>Total Duration:</strong> {taskData.totalDuration}{" "}
                    minutes
                  </p>
                  <p>
                    <strong>Start Date:</strong> {taskData.startDate.toString()}
                  </p>
                  <p>
                    <strong>End Date:</strong> {taskData.endDate.toString()}
                  </p>
                  <p>
                    <strong>Focus Method:</strong>{" "}
                    {focusSuggestion?.focusMethodName}
                  </p>
                  <p>
                    <strong>Work Duration:</strong> {taskData.workDuration}{" "}
                    minutes
                  </p>
                  <p>
                    <strong>Break Time:</strong> {taskData.breakTime} minutes
                  </p>
                </div>
              )}

              <DialogFooter>
                {step > 1 && (
                  <Button
                    variant="ghost"
                    className="bg-white border-black"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
                {step < 3 && (
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
                {step === 3 && (
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleCreateTask(taskData)}
                  >
                    Create
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Hiển thị các cột task */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {renderTaskColumn("Daily Task", tasks.daily, "daily")}
        {renderTaskColumn("Simple Task", tasks.simple, "simple")}
        {renderTaskColumn("Complex Task", tasks.complex, "complex")}
      </div>

      {/* Dialog xác nhận chuyển task */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Task</DialogTitle>
            <DialogDescription>
              Bạn có muốn dừng task hiện tại và chuyển sang task mới không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleKeepCurrentTask}>
              Không
            </Button>
            <Button onClick={handleSwitchTask}>Có</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
