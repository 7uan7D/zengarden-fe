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
import { useState, useEffect, useRef, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
//api task
import {
  GetTaskByUserTreeId,
  StartTask,
  PauseTask,
  CompleteTask,
  CreateTask,
} from "@/services/apiServices/taskService";
// thư viện kéo thả
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChangePriority } from "@/services/apiServices/taskService";
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

export default function TaskPage() {
  // Khai báo các state cần thiết
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);
  const [currentTree, setCurrentTree] = useState(0);
  const [userTrees, setUserTrees] = useState([]);
  const [trees, setTrees] = useState([]);
  const [isCreateTreeDialogOpen, setIsCreateTreeDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTreeName, setNewTreeName] = useState("");

  // Task
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskInfoDialogOpen, setIsTaskInfoDialogOpen] = useState(false);
  const [activeTabs, setActiveTabs] = useState({
    daily: "all",
    simple: "all",
    complex: "all",
    challenge: "all",
  });

  const [taskData, setTaskData] = useState({
    daily: [],
    simple: [],
    complex: [],
    challenge: [],
  });

  const [timers, setTimers] = useState({}); // state quản lý thời gian cho các task
  const [activeTaskKey, setActiveTaskKey] = useState(null); // key của task đang hoạt động
  const intervalRefs = useRef({}); // tham chiếu đến các interval để dọn dẹp sau này

  // Tree
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

  // Task từ đây xuống dưới

  // usertreeid cho task
  useEffect(() => {
    if (selectedTree?.userTreeId) {
      fetchTasks(selectedTree.userTreeId);
    }
  }, [selectedTree]);

  // lấy dữ liệu task
  const fetchTasks = async (userTreeId) => {
    try {
      const data = await GetTaskByUserTreeId(userTreeId);

      const groupedTasks = {
        daily: [],
        simple: [],
        complex: [],
        challenge: [],
      };

      data.forEach((task) => {
        const formattedTask = {
          taskId: task.taskId,
          taskName: task.taskName,
          taskDescription: task.taskDescription,
          startDate: new Date(task.startDate).toLocaleDateString("en-GB"),
          endDate: new Date(task.endDate).toLocaleDateString("en-GB"),
          status: task.status,
          focusMethodName: task.focusMethodName,
          totalDuration: task.totalDuration,
          workDuration: task.workDuration,
          breakTime: task.breakTime,
          userTreeName: task.userTreeName,
          taskTypeName: task.taskTypeName,
          remainingTime: convertToMinutes(task.remainingTime) * 60,
          priority: task.priority,
        };

        const type = task.taskTypeName?.toLowerCase();
        if (groupedTasks[type]) {
          groupedTasks[type].push(formattedTask);
        }
      });

      // Sắp xếp theo priority
      for (const type in groupedTasks) {
        groupedTasks[type].sort((a, b) => a.priority - b.priority);
      }

      setTaskData(groupedTasks);
    } catch (error) {
      console.error("Lỗi lấy task:", error);
    }
  };

  // Helper chuyển thời gian kiểu "00:30:00" thành phút
  const convertToMinutes = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
  };

  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach((intervalId) =>
        clearInterval(intervalId)
      );
    };
  }, []);

  // Hàm định dạng thời gian từ giây sang phút:giây
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle Start/Pause/Resume/Finish actions
  const handleTaskAction = async (columnKey, index, action) => {
    const taskKey = `${columnKey}-${index}`;
    const task = taskData[columnKey][index];

    try {
      if (action === "start" || action === "resume") {
        // Gọi API StartTask (cả khi start và resume đều gọi cùng API này)
        await StartTask(task.taskId);

        setActiveTaskKey(taskKey);
        setTimers((prev) => ({
          ...prev,
          [taskKey]: {
            isWorkPhase: true,
            currentWorkTime: task.workDuration * 60,
            currentBreakTime: task.breakTime * 60,
            remainingTime: task.remainingTime,
            overdueTime: 0,
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

            const currentDate = parseDate(getCurrentDateStr());
            const endDate = parseDate(task.endDate);
            if (currentDate > endDate) {
              clearInterval(intervalRefs.current[taskKey]);
              setTaskData((prevData) => {
                const newData = { ...prevData };
                newData[columnKey][index] = {
                  ...task,
                  status: 4,
                  remainingTime: 0,
                };
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
              overdueTime += 1;
            }

            setTaskData((prevData) => {
              const newData = { ...prevData };
              newData[columnKey][index] = { ...task, status: 1, remainingTime };
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
        await PauseTask(task.taskId);

        const currentTimer = timers[taskKey];

        setTimers((prev) => ({
          ...prev,
          [taskKey]: { ...prev[taskKey], isRunning: false },
        }));

        setTaskData((prevData) => {
          const newData = { ...prevData };
          newData[columnKey][index] = {
            ...task,
            status: 2,
            remainingTime: Math.round(currentTimer?.remainingTime || 0),
          };
          return newData;
        });

        if (intervalRefs.current[taskKey]) {
          clearInterval(intervalRefs.current[taskKey]);
          delete intervalRefs.current[taskKey];
        }
      } else if (action === "finish") {
        await CompleteTask(task.taskId, selectedTree.userTreeId);

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
    } catch (error) {
      console.error("Task action error:", error);
    }
  };

  useEffect(() => {
    const newTimers = {};
    Object.keys(taskData).forEach((columnKey) => {
      taskData[columnKey].forEach((task, index) => {
        const taskKey = `${columnKey}-${index}`;
        if (task.status === 1) {
          // đang chạy
          newTimers[taskKey] = {
            isWorkPhase: true,
            currentWorkTime: task.workDuration * 60,
            currentBreakTime: task.breakTime * 60,
            remainingTime: task.remainingTime,
            overdueTime: 0,
            isRunning: true,
            totalWorkCompleted: 0,
            totalBreakCompleted: 0,
          };
        } else if (task.status === 2) {
          // bị pause
          newTimers[taskKey] = {
            isWorkPhase: true,
            currentWorkTime: task.workDuration * 60,
            currentBreakTime: task.breakTime * 60,
            remainingTime: task.remainingTime,
            overdueTime: 0,
            isRunning: false,
            totalWorkCompleted: 0,
            totalBreakCompleted: 0,
          };
        }
      });
    });

    setTimers(newTimers);
  }, [taskData]);

  // State và logic cho Dialog tạo task
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskType, setTaskType] = useState("");
  const [taskCreateData, setTaskCreateData] = useState({
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
  const [step, setStep] = useState(1);
  const [focusSuggestion, setFocusSuggestion] = useState(null);

  useEffect(() => {
    setTaskCreateData((prev) => ({
      ...prev,
      userTreeId: selectedTree?.userTreeId || null,
    }));
  }, [selectedTree]);

  const handleOpen = (type, taskTypeId) => {
    setTaskType(type);
    setTaskCreateData((prev) => ({
      ...prev,
      taskTypeId: taskTypeId,
      userTreeId: selectedTree?.userTreeId || null,
    }));
    setIsTaskDialogOpen(true);
  };

  const handleNext = async () => {
    if (step === 1) {
      try {
        const response = await SuggestTaskFocusMethods(taskCreateData);
        setFocusSuggestion(response);
        setTaskCreateData((prev) => ({
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

  const handleCreateTask = async () => {
    try {
      const response = await CreateTask(taskCreateData);
      console.log("Task created successfully:", response);
      setIsTaskDialogOpen(false);
      setStep(1);
      setTaskCreateData({
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
      fetchTasks(selectedTree?.userTreeId);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleDateChange = useCallback((field, date) => {
    setTaskCreateData((prev) => ({
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
    setTaskCreateData((prev) => ({
      ...prev,
      [field]: prev[field]
        ? prev[field].split("T")[0] + "T" + time + ":00.000Z"
        : null,
    }));
  }, []);

  const renderTaskColumn = (title, taskList, columnKey) => {
    const filteredTasks =
      activeTabs[columnKey] === "all"
        ? taskList
        : activeTabs[columnKey] === "current"
        ? taskList.filter((task) => task.status !== 4 && task.status !== 3)
        : taskList.filter((task) => task.status === 3);

    // Sắp xếp theo priority
    const sortedTasks = [...filteredTasks].sort(
      (a, b) => a.priority - b.priority
    );

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
                const remainingTime = task.remainingTime || 0;
                const overdueTime = remainingTime < 0 ? -remainingTime : 0;
                const taskKey = `${columnKey}-${index}`;
                const timer = timers[taskKey] || {};
                const { totalWorkCompleted = 0, totalBreakCompleted = 0 } =
                  timer;

                const totalDurationSeconds = task.totalDuration * 60;
                const remainTime = task.remainingTime;
                const elapsedTime = totalDurationSeconds - remainTime;
                const cycleDuration = (task.workDuration + task.breakTime) * 60;
                const completedCycles = Math.floor(elapsedTime / cycleDuration);
                const timeInCurrentCycle = elapsedTime % cycleDuration;

                let isWorkPhase = true;
                let currentWorkTime = task.workDuration * 60;
                let currentBreakTime = task.breakTime * 60;

                if (timeInCurrentCycle < task.workDuration * 60) {
                  isWorkPhase = true;
                  currentWorkTime = task.workDuration * 60 - timeInCurrentCycle;
                } else {
                  isWorkPhase = false;
                  const timeIntoBreak =
                    timeInCurrentCycle - task.workDuration * 60;
                  currentBreakTime = task.breakTime * 60 - timeIntoBreak;
                }

                // Tạo mảng các phase để render thanh tiến độ xen kẽ
                const phases = [];

                for (let i = 0; i < completedCycles; i++) {
                  phases.push({
                    type: "work",
                    duration: task.workDuration * 60,
                  });
                  phases.push({ type: "break", duration: task.breakTime * 60 });
                }

                // current phase
                if (timeInCurrentCycle < task.workDuration * 60) {
                  phases.push({ type: "work", duration: timeInCurrentCycle });
                } else {
                  phases.push({
                    type: "work",
                    duration: task.workDuration * 60,
                  });
                  phases.push({
                    type: "break",
                    duration: timeInCurrentCycle - task.workDuration * 60,
                  });
                }

                const currentTaskStatus =
                  task.status === 1 ? 1 : task.status === 2 ? 2 : 0;
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
                      {["simple", "complex", "challenge"].includes(
                        columnKey
                      ) && (
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
                            <div className="progress-bar flex h-2 rounded overflow-hidden">
                              {phases.map((phase, idx) => (
                                <div
                                  key={idx}
                                  className={
                                    phase.type === "work"
                                      ? "bg-blue-500"
                                      : "bg-yellow-500"
                                  }
                                  style={{
                                    width: `${
                                      (phase.duration / totalDurationSeconds) *
                                      100
                                    }%`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          {task.status !== 4 &&
                            task.status !== 3 &&
                            !(
                              remainingTime <= 0 && currentTaskStatus !== 0
                            ) && (
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
                            {!(
                              remainingTime <= 0 && currentTaskStatus !== 0
                            ) && (
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

  // Task từ đây lên trên
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
                  (tree) =>
                    tree.treeStatus === 0 ||
                    tree.treeStatus === 1 ||
                    tree.treeStatus === 2
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
                (tree) =>
                  tree.treeStatus === 1 ||
                  tree.treeStatus === 2 ||
                  tree.treeStatus === 0
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

          {/* Dialog tạo task */}
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogContent className="max-w-lg bg-white rounded-xl shadow-2xl p-6 task-dialog">
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
                      value={taskCreateData.taskName}
                      onChange={(e) =>
                        setTaskCreateData({
                          ...taskCreateData,
                          taskName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      name="taskDescription"
                      placeholder="Describe your task"
                      value={taskCreateData.taskDescription}
                      onChange={(e) =>
                        setTaskCreateData({
                          ...taskCreateData,
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
                      value={taskCreateData.totalDuration}
                      onChange={(e) =>
                        setTaskCreateData({
                          ...taskCreateData,
                          totalDuration: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <DateTimePicker
                      label="Start Date"
                      date={taskCreateData.startDate}
                      onDateChange={(newDate) =>
                        handleDateChange("startDate", newDate)
                      }
                      onTimeChange={(time) =>
                        handleTimeChange("startDate", time)
                      }
                    />
                    <DateTimePicker
                      label="End Date"
                      date={taskCreateData.endDate}
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
                      value={taskCreateData.workDuration}
                      onChange={(e) =>
                        setTaskCreateData({
                          ...taskCreateData,
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
                      value={taskCreateData.breakTime}
                      onChange={(e) =>
                        setTaskCreateData({
                          ...taskCreateData,
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
                    <strong>Task Name:</strong> {taskCreateData.taskName}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {taskCreateData.taskDescription}
                  </p>
                  <p>
                    <strong>Total Duration:</strong>{" "}
                    {taskCreateData.totalDuration} minutes
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {taskCreateData.startDate.toString()}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {taskCreateData.endDate.toString()}
                  </p>
                  <p>
                    <strong>Focus Method:</strong>{" "}
                    {focusSuggestion?.focusMethodName}
                  </p>
                  <p>
                    <strong>Work Duration:</strong>{" "}
                    {taskCreateData.workDuration} minutes
                  </p>
                  <p>
                    <strong>Break Time:</strong> {taskCreateData.breakTime}{" "}
                    minutes
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
                    onClick={() => handleCreateTask(taskCreateData)}
                  >
                    Create
                  </Button>
                )}
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
              <DropdownMenuItem onClick={() => handleOpen("Simple Task", 2)}>
                Simple Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpen("Complex Task", 3)}>
                Complex Task
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
