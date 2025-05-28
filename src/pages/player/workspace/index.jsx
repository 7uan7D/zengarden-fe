import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import MusicPlayerController, {
  FullMusicPlayer,
  globalAudioState,
} from "../../../components/musicPlayerController/index.jsx";
import "../home/index.css";
import QuillEditor from "@/components/quill_js/index.jsx";
import VideoPlayer from "@/components/react_player/index.jsx";
import PDFEditor from "@/components/react_pdf/index.jsx";
import TaskTab from "./task_tab.jsx";
import "../workspace/index.css";
import "../task/index.css";
import Pintura from "@/components/pintura/index.jsx";
import "@pqina/pintura/pintura.css";
import {
  LayoutDashboard,
  FileText,
  Video,
  BookOpen,
  Image,
  House,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import TaskList from "../workspace/taskList.jsx";
import TreeInfo from "../workspace/treeInfo.jsx";
import { GetTaskByUserTreeId } from "@/services/apiServices/taskService.js";
import { StartTask } from "@/services/apiServices/taskService.js";
import { PauseTask } from "@/services/apiServices/taskService.js";
import { CompleteTask } from "@/services/apiServices/taskService.js";

// Sample tasks data
const sampleTasks = [
  {
    taskId: 1,
    taskName: "Learn React Basics",
    taskDescription: "Study React hooks and components",
    startDate: "2025-05-20T09:00:00.000Z",
    endDate: "2025-05-20T12:00:00.000Z",
    status: 0,
    focusMethodName: "Pomodoro",
    totalDuration: 60,
    workDuration: 25,
    breakTime: 5,
    userTreeName: "Oak Tree",
    taskTypeName: "Simple",
    taskNote: "Focus on useState and useEffect",
    taskResult: null,
    remainingTime: 1 * 60,
    priority: 1,
  },
  {
    taskId: 2,
    taskName: "Review Codebase",
    taskDescription: "Analyze and review project codebase for improvements",
    startDate: "2025-05-21T10:00:00.000Z",
    endDate: "2025-05-21T12:00:00.000Z",
    status: 0,
    focusMethodName: "Pomodoro",
    totalDuration: 60,
    workDuration: 20,
    breakTime: 5,
    userTreeName: "Oak Tree",
    taskTypeName: "Simple",
    taskNote: "Check for code optimization opportunities",
    taskResult: null,
    remainingTime: 1 * 60,
    priority: 2,
  },
  {
    taskId: 3,
    taskName: "Write Documentation",
    taskDescription: "Document API endpoints and usage",
    startDate: "2025-05-22T08:30:00.000Z",
    endDate: "2025-05-22T11:30:00.000Z",
    status: 0,
    focusMethodName: "Pomodoro",
    totalDuration: 60,
    workDuration: 25,
    breakTime: 5,
    userTreeName: "Oak Tree",
    taskTypeName: "Complex",
    taskNote: "Include examples for each endpoint",
    taskResult: null,
    remainingTime: 3600,
    priority: 3,
  },
  {
    taskId: 4,
    taskName: "Test API Endpoints",
    taskDescription: "Perform integration tests on API endpoints",
    startDate: "2025-05-23T09:00:00.000Z",
    endDate: "2025-05-23T11:00:00.000Z",
    status: 3,
    focusMethodName: "Pomodoro",
    totalDuration: 60,
    workDuration: 25,
    breakTime: 5,
    userTreeName: "Oak Tree",
    taskTypeName: "Challenge",
    taskNote: "Ensure all endpoints return correct status codes",
    taskResult: null,
    remainingTime: 0,
    priority: 4,
  },
  {
    taskId: 5,
    taskName: "Fix UI Bugs",
    taskDescription: "Resolve UI alignment and responsiveness issues",
    startDate: "2025-05-24T14:00:00.000Z",
    endDate: "2025-05-24T16:00:00.000Z",
    status: 4,
    focusMethodName: "Pomodoro",
    totalDuration: 60,
    workDuration: 25,
    breakTime: 5,
    userTreeName: "Oak Tree",
    taskTypeName: "Simple",
    taskNote: "Focus on mobile responsiveness",
    taskResult: null,
    remainingTime: 0,
    priority: 5,
  },
  {
    taskId: 6,
    taskName: "Plan Sprint",
    taskDescription: "Prepare tasks and goals for the next sprint",
    startDate: "2025-05-25T11:00:00.000Z",
    endDate: "2025-05-25T13:00:00.000Z",
    status: 3,
    focusMethodName: "Pomodoro",
    totalDuration: 60,
    workDuration: 25,
    breakTime: 5,
    userTreeName: "Oak Tree",
    taskTypeName: "Challenge",
    taskNote: "Coordinate with team for task prioritization",
    taskResult: null,
    remainingTime: 0,
    priority: 6,
  },
];

export default function Workspace() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(globalAudioState.isPlaying);
  const [currentIndex, setCurrentIndex] = useState(
    globalAudioState.currentIndex
  );
  const [activeTab, setActiveTab] = useState("Your Space");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [editedImage, setEditedImage] = useState(null);
  const fileInputRef = useRef(null);
  const intervalRefs = useRef({});
  const [timers, setTimers] = useState({});
  const [activeTaskKey, setActiveTaskKey] = useState(null);
  const [loadingTaskKey, setLoadingTaskKey] = useState(null);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskNote, setTaskNote] = useState("");
  const [taskFile, setTaskFile] = useState(null);
  const [focusedTask, setFocusedTask] = useState(null);

  const [userTreeId, setUserTreeId] = useState(
    () => localStorage.getItem("selectedTreeId") || null
  );

  useEffect(() => {
    fetchTasks();
  }, [userTreeId]);

  const handleTreeChange = (newId) => {
    setUserTreeId(newId); // cập nhật state để trigger useEffect
  };

  const fetchTasks = async () => {
    try {
      if (!userTreeId) {
        console.warn("Không tìm thấy userTreeId trong localStorage.");
        return;
      }

      const data = await GetTaskByUserTreeId(userTreeId);
      console.log("Data from API:", data);

      const formattedTasks = data.map((task) => ({
        taskId: task.taskId,
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        startDate: task.startDate,
        endDate: task.endDate,
        status: task.status,
        focusMethodName: task.focusMethodName,
        totalDuration: task.totalDuration,
        workDuration: task.workDuration,
        breakTime: task.breakTime,
        userTreeName: task.userTreeName,
        taskTypeName: task.taskTypeName,
        taskNote: task.taskNote,
        taskResult: task.taskResult,
        remainingTime: convertToMinutes(task.remainingTime) * 60,
        priority: task.priority,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Lỗi lấy task:", error);
    }
  };

  const convertToMinutes = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
  };

  globalAudioState.setPlaying = setIsPlaying;
  globalAudioState.setCurrentIndex = setCurrentIndex;

  useEffect(() => {
    setCurrentIndex(globalAudioState.currentIndex);
  }, [globalAudioState.currentIndex]);

  useEffect(() => {
    // Restore active task from localStorage on page load
    const savedTask = localStorage.getItem("currentTask");
    if (savedTask) {
      const { taskId, index, taskKey, status, remainingTime } =
        JSON.parse(savedTask);
      const task = tasks.find((t) => t.taskId === taskId);
      if (task && index !== undefined && status === 1) {
        setActiveTaskKey(taskKey);
        setFocusedTask(task);
        setTasks((prevTasks) =>
          prevTasks.map((t, i) =>
            i === index ? { ...t, status: 1, remainingTime } : t
          )
        );
        setTimers((prev) => ({
          ...prev,
          [taskKey]: {
            isWorkPhase: true,
            currentWorkTime: task.workDuration * 60,
            currentBreakTime: task.breakTime * 60,
            remainingTime: remainingTime,
            isRunning: true,
            totalWorkCompleted: 0,
            totalBreakCompleted: 0,
          },
        }));

        // Resume timer
        intervalRefs.current[taskKey] = setInterval(() => {
          setTimers((prev) => {
            const timer = prev[taskKey];
            if (!timer || !timer.isRunning) return prev;

            let {
              isWorkPhase,
              currentWorkTime,
              currentBreakTime,
              remainingTime,
              totalWorkCompleted,
              totalBreakCompleted,
            } = timer;

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
              clearInterval(intervalRefs.current[taskKey]);
              setTasks((prevTasks) =>
                prevTasks.map((t, i) =>
                  i === index ? { ...t, status: 4, remainingTime: 0 } : t
                )
              );
              setActiveTaskKey(null);
              setFocusedTask(null);
              localStorage.removeItem("currentTask");
              return {
                ...prev,
                [taskKey]: { ...timer, isRunning: false },
              };
            }

            setTasks((prevTasks) =>
              prevTasks.map((t, i) =>
                i === index ? { ...t, status: 1, remainingTime } : t
              )
            );

            localStorage.setItem(
              "currentTask",
              JSON.stringify({
                taskId: task.taskId,
                taskName: task.taskName,
                remainingTime,
                status: 1,
                index,
                taskKey,
              })
            );

            return {
              ...prev,
              [taskKey]: {
                ...timer,
                isWorkPhase,
                currentWorkTime,
                currentBreakTime,
                remainingTime,
                totalWorkCompleted,
                totalBreakCompleted,
              },
            };
          });
        }, 1000);
      } else if (task && status === 2) {
        setTimers((prev) => ({
          ...prev,
          [taskKey]: {
            isWorkPhase: true,
            currentWorkTime: task.workDuration * 60,
            currentBreakTime: task.breakTime * 60,
            remainingTime: remainingTime,
            isRunning: false,
            totalWorkCompleted: 0,
            totalBreakCompleted: 0,
          },
        }));
        setTasks((prevTasks) =>
          prevTasks.map((t, i) =>
            i === index ? { ...t, status: 2, remainingTime } : t
          )
        );
      }
    }

    // Initialize timers for tasks with status 1 or 2
    const newTimers = {};
    sampleTasks.forEach((task, index) => {
      const taskKey = `task-${task.taskId}`; // Use taskId instead of index
      if (task.status === 1 && !savedTask) {
        newTimers[taskKey] = {
          isWorkPhase: true,
          currentWorkTime: task.workDuration * 60,
          currentBreakTime: task.breakTime * 60,
          remainingTime: task.remainingTime,
          isRunning: true,
          totalWorkCompleted: 0,
          totalBreakCompleted: 0,
        };
      } else if (task.status === 2) {
        newTimers[taskKey] = {
          isWorkPhase: true,
          currentWorkTime: task.workDuration * 60,
          currentBreakTime: task.breakTime * 60,
          remainingTime: task.remainingTime,
          isRunning: false,
          totalWorkCompleted: 0,
          totalBreakCompleted: 0,
        };
      }
    });
    setTimers(newTimers);

    // Cleanup intervals on unmount
    return () => {
      Object.values(intervalRefs.current).forEach((intervalId) =>
        clearInterval(intervalId)
      );
    };
  }, []);

  const handleBackgroundChange = (url) => {
    setBackgroundUrl(url);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => {
        setTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const formattedTime = time.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return (
      <div className="text-5xl font-semibold text-black drop-shadow-md text-center mt-2">
        {formattedTime}
      </div>
    );
  };

  const handleTaskAction = async (task, index, action) => {
    const taskKey = `task-${task.taskId}`; // Use taskId instead of index
    try {
      setLoadingTaskKey(taskKey);

      if (action === "start" || action === "resume") {
        await StartTask(task.taskId);
        setActiveTaskKey(taskKey);
        setFocusedTask(task);
        setTimers((prev) => ({
          ...prev,
          [taskKey]: {
            isWorkPhase: true,
            currentWorkTime: task.workDuration * 60,
            currentBreakTime: task.breakTime * 60,
            remainingTime: task.remainingTime,
            isRunning: action === "start" || action === "resume",
            totalWorkCompleted: 0,
            totalBreakCompleted: 0,
          },
        }));

        setTasks((prevTasks) =>
          prevTasks.map((t, i) => (i === index ? { ...t, status: 1 } : t))
        );

        if (intervalRefs.current[taskKey]) {
          clearInterval(intervalRefs.current[taskKey]);
        }

        intervalRefs.current[taskKey] = setInterval(() => {
          setTimers((prev) => {
            const timer = prev[taskKey];
            if (!timer || !timer.isRunning) return prev;

            let {
              isWorkPhase,
              currentWorkTime,
              currentBreakTime,
              remainingTime,
              totalWorkCompleted,
              totalBreakCompleted,
            } = timer;

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
              clearInterval(intervalRefs.current[taskKey]);
              setTasks((prevTasks) =>
                prevTasks.map((t, i) =>
                  i === index ? { ...t, status: 4, remainingTime: 0 } : t
                )
              );
              setActiveTaskKey(null);
              setFocusedTask(null);
              localStorage.removeItem("currentTask");
              return {
                ...prev,
                [taskKey]: { ...timer, isRunning: false },
              };
            }

            setTasks((prevTasks) =>
              prevTasks.map((t, i) =>
                i === index ? { ...t, status: 1, remainingTime } : t
              )
            );

            localStorage.setItem(
              "currentTask",
              JSON.stringify({
                taskId: task.taskId,
                taskName: task.taskName,
                remainingTime,
                status: 1,
                index,
                taskKey,
              })
            );

            return {
              ...prev,
              [taskKey]: {
                ...timer,
                isWorkPhase,
                currentWorkTime,
                currentBreakTime,
                remainingTime,
                totalWorkCompleted,
                totalBreakCompleted,
              },
            };
          });
        }, 1000);

        localStorage.setItem(
          "currentTask",
          JSON.stringify({
            taskId: task.taskId,
            taskName: task.taskName,
            remainingTime: task.remainingTime,
            status: 1,
            index,
            taskKey,
          })
        );
      } else if (action === "pause") {
        await PauseTask(task.taskId);
        const currentTimer = timers[taskKey];

        setTimers((prev) => {
          console.log("Updating timers for pause:", prev);
          return {
            ...prev,
            [taskKey]: { ...prev[taskKey], isRunning: false },
          };
        });

        setTasks((prevTasks) => {
          const updatedTasks = prevTasks.map((t) =>
            t.taskId === task.taskId
              ? {
                  ...t,
                  status: 2,
                  remainingTime: Math.round(currentTimer?.remainingTime || 0),
                }
              : t
          );
          console.log("Updated tasks after pause:", updatedTasks);
          return updatedTasks;
        });

        if (intervalRefs.current[taskKey]) {
          clearInterval(intervalRefs.current[taskKey]);
          delete intervalRefs.current[taskKey];
          console.log("Interval cleared for taskKey:", taskKey);
        }

        localStorage.setItem(
          "currentTask",
          JSON.stringify({
            taskId: task.taskId,
            taskName: task.taskName,
            remainingTime: Math.round(currentTimer?.remainingTime || 0),
            status: 2,
            index,
            taskKey,
          })
        );
      } else if (action === "finish") {
        const formData = new FormData();
        formData.append("UserTreeId", userTreeId);
        formData.append("TaskNote", taskNote || "");
        formData.append("TaskFile", taskFile);

        await CompleteTask(task.taskId, formData);
        clearInterval(intervalRefs.current[taskKey]);
        setTimers((prev) => ({
          ...prev,
          [taskKey]: { ...prev[taskKey], isRunning: false },
        }));
        setTasks((prevTasks) =>
          prevTasks.map((t, i) =>
            i === index ? { ...t, status: 3, remainingTime: 0 } : t
          )
        );
        localStorage.removeItem("currentTask");
        setActiveTaskKey(null);
        setFocusedTask(null);
        setIsFinishDialogOpen(false);
        setTaskNote("");
        setTaskFile(null);
        toast.success("Task completed successfully!");
      }
    } catch (error) {
      console.error("Task action error:", error);
      toast.error("Failed to perform task action");
    } finally {
      setLoadingTaskKey(null);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach((intervalId) =>
        clearInterval(intervalId)
      );
    };
  }, []);

  const sidebarTabs = [
    { name: "Your Space", icon: <LayoutDashboard size={24} /> },
    { name: "Task", icon: <ClipboardList size={24} /> },
    { name: "Rich Text", icon: <FileText size={24} /> },
    { name: "Watch Videos", icon: <Video size={24} /> },
    { name: "PDF Reader", icon: <BookOpen size={24} /> },
    { name: "Image Editor", icon: <Image size={24} /> },
    {
      name: "Return to Homepage",
      icon: <House size={24} />,
      action: () => navigate("/home"),
    },
  ];

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-green-100 to-green-200 relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        className="fixed top-0 left-0 h-full bg-white/90 backdrop-blur-md shadow-lg border-r-2 border-green-300 z-20"
        animate={{ width: isSidebarCollapsed ? 68 : 250 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4">
          {!isSidebarCollapsed && (
            <h2 className="text-lg font-semibold text-green-700">Workspace</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-green-700 bg-gray-300 hover:bg-green-200"
          >
            {isSidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
          </Button>
        </div>
        <nav className="flex flex-col gap-2 p-2">
          <TooltipProvider>
            {sidebarTabs.map((tab) => (
              <Tooltip key={tab.name}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.name
                        ? "bg-green-600 text-white"
                        : "text-green-700 bg-gray-300 hover:bg-green-100"
                    }`}
                    onClick={() => {
                      if (tab.action) {
                        tab.action();
                      } else {
                        setActiveTab(tab.name);
                      }
                    }}
                  >
                    {tab.icon}
                    {!isSidebarCollapsed && (
                      <span className="text-sm font-medium tab_span">
                        {tab.name}
                      </span>
                    )}
                  </motion.button>
                </TooltipTrigger>
                {isSidebarCollapsed && (
                  <TooltipContent side="right">
                    <p>{tab.name}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </motion.div>

      <div className="flex-1 p-6 pt-5 ml-[80px]">
        <div className="absolute top-0 left-0 w-full h-24 bg-[url('/leaf-pattern.png')] bg-repeat-x opacity-30 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 z-10"
        >
          <Clock />
        </motion.div>

        <div className="flex flex-1 flex-col gap-6 z-10">
          {activeTab === "Your Space" && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-[30%]">
                <TreeInfo onTreeSelect={handleTreeChange} />
              </div>
              <div className="md:w-[70%]">
                <TaskList
                  tasks={tasks}
                  setTasks={setTasks}
                  timers={timers}
                  activeTaskKey={activeTaskKey}
                  loadingTaskKey={loadingTaskKey}
                  handleTaskAction={handleTaskAction}
                  setSelectedTask={setSelectedTask}
                  setIsFinishDialogOpen={setIsFinishDialogOpen}
                  focusedTask={focusedTask}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute bottom-8 w-[91.5%] mx-auto"
              >
                <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                  <CardContent className="p-1">
                    <FullMusicPlayer
                      setPlaying={setIsPlaying}
                      setCurrentIndex={setCurrentIndex}
                      onBackgroundChange={handleBackgroundChange}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          <Dialog
            open={isFinishDialogOpen}
            onOpenChange={setIsFinishDialogOpen}
          >
            <DialogContent className="max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Finish Task
                </DialogTitle>
                <DialogDescription>
                  Provide a note and upload a file to complete the task.
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Note
                </Label>
                <Textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  rows={4}
                  value={taskNote}
                  onChange={(e) => setTaskNote(e.target.value)}
                  placeholder="Enter your task note..."
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Task File
                </Label>
                <input
                  type="file"
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  onChange={(e) => setTaskFile(e.target.files[0])}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsFinishDialogOpen(false);
                    setTaskNote("");
                    setTaskFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className={`bg-orange-500 hover:bg-orange-600 text-white ${
                    !taskFile ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    if (taskFile) {
                      handleTaskAction(
                        selectedTask.task,
                        selectedTask.index,
                        "finish"
                      );
                    }
                  }}
                  disabled={!taskFile}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {activeTab === "Task" && (
            <div className="flex-1">
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardContent>
                  <TaskTab />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "Rich Text" && (
            <div className="flex-1">
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardContent className="mt-4">
                  <QuillEditor />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "Watch Videos" && (
            <div className="flex-1">
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-700">Watch Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoPlayer />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "PDF Reader" && (
            <div className="flex-1">
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardContent>
                  <PDFEditor />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "Image Editor" && (
            <div className="flex-1">
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardContent>
                  <Pintura />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-300/30 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
