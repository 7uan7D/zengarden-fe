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
  CircleCheckBig,
  CircleX,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { TimePicker } from "antd";
import moment from "moment";
import { SuggestTaskFocusMethods } from "@/services/apiServices/focusMethodsService";
import { CreateTask } from "@/services/apiServices/taskService";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Sample tree data
const sampleTree = {
  treeName: "Oak Tree",
  treeLevel: 5,
  experiencePoints: 250,
  maxExperiencePoints: 500,
  treeImage: "/images/lv5.png",
};

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
    remainingTime: 2 * 60,
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

// DateTimePicker Component
const DateTimePicker = ({ label, date, onDateChange, onTimeChange }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const selectedDate = date ? new Date(date) : undefined;
  const formattedTime = date
    ? moment(new Date(date)).format("HH:mm")
    : moment().format("HH:mm");

  const handleDateSelect = (newDate) => {
    if (newDate) {
      const updatedDate = new Date(newDate);
      updatedDate.setHours(
        selectedDate ? selectedDate.getHours() : 0,
        selectedDate ? selectedDate.getMinutes() : 0,
        0,
        0
      );
      onDateChange(updatedDate);
    }
    setIsPopoverOpen(false);
  };

  const handleTimeChange = (time, timeString) => {
    if (!timeString) return;
    const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeString)) return;
    const formattedTime = `${timeString}:00.000Z`;
    onTimeChange(formattedTime);
  };

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
          value={moment(formattedTime, "HH:mm")}
          format="HH:mm"
          className="h-10 w-[120px] text-center rounded-lg"
          showNow={false}
          allowClear={false}
        />
      </div>
    </div>
  );
};

// TreeInfo Component
const TreeInfo = ({ tree }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg h-[493px]">
      <CardContent className="p-6 h-full flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-green-600">{tree.treeName}</h2>
          <img
            src={tree.treeImage}
            alt={tree.treeName}
            className="w-32 h-32 object-cover rounded-full border-2 border-green-300"
          />
          <div className="text-center">
            <p className="text-lg font-medium">Level: {tree.treeLevel}</p>
            <p className="text-sm text-gray-600">
              Experience: {tree.experiencePoints} / {tree.maxExperiencePoints}
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${
                    (tree.experiencePoints / tree.maxExperiencePoints) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

// TaskList Component
const TaskList = ({
  tasks,
  setTasks,
  timers,
  activeTaskKey,
  loadingTaskKey,
  handleTaskAction,
  setSelectedTask,
  setIsFinishDialogOpen,
  focusedTask,
}) => {
  const [activeTab, setActiveTab] = useState("Simple & Complex");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskType, setTaskType] = useState("");
  const [taskCreateData, setTaskCreateData] = useState({
    focusMethodId: null,
    taskTypeId: null,
    userTreeId: sampleTree.treeName,
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
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [selectedDurationOption, setSelectedDurationOption] = useState("");
  const [selectedWorkOption, setSelectedWorkOption] = useState("");
  const [selectedBreakOption, setSelectedBreakOption] = useState("");
  const [durationError, setDurationError] = useState("");
  const [workDurationError, setWorkDurationError] = useState("");
  const [breakTimeError, setBreakTimeError] = useState("");

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

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter and sort tasks to prioritize status 1
  const filteredTasks = tasks
    .filter((task) => {
      if (activeTab === "Simple & Complex") {
        return (
          task.taskTypeName === "Simple" || task.taskTypeName === "Complex"
        );
      } else if (activeTab === "Challenge") {
        return task.taskTypeName === "Challenge";
      }
      return false;
    })
    .sort((a, b) => {
      if (a.status === 1) return -1;
      if (b.status === 1) return 1;
      return a.priority - b.priority;
    });

  // Create Task Logic
  const simpleDurations = [30, 60, 90, 120, 150, 180];
  const complexDurations = [180, 195, 210, 225, 240, 255, 270];

  const durationOptions = taskType.includes("Simple")
    ? simpleDurations
    : taskType.includes("Complex")
    ? complexDurations
    : [];

  const generateTimeOptions = (min, max, step) => {
    const options = [];
    for (let i = min; i <= max; i += step) {
      options.push(i);
    }
    return options;
  };

  const validateDuration = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    const isSimple = taskType.includes("Simple");
    const minDuration = isSimple ? 30 : 180;
    const maxDuration = isSimple ? 180 : 360;

    if (numValue < minDuration) {
      return `Duration must be at least ${minDuration} minutes`;
    }
    if (numValue > maxDuration) {
      return `Duration must not exceed ${maxDuration} minutes`;
    }
    return "";
  };

  const validateWorkDuration = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (!focusSuggestion) return "";
    if (numValue < focusSuggestion.minDuration) {
      return `Work duration must be at least ${focusSuggestion.minDuration} minutes`;
    }
    if (numValue > focusSuggestion.maxDuration) {
      return `Work duration must not exceed ${focusSuggestion.maxDuration} minutes`;
    }
    return "";
  };

  const validateBreakTime = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (!focusSuggestion) return "";
    if (numValue < focusSuggestion.minBreak) {
      return `Break time must be at least ${focusSuggestion.minBreak} minutes`;
    }
    if (numValue > focusSuggestion.maxBreak) {
      return `Break time must not exceed ${focusSuggestion.maxBreak} minutes`;
    }
    return "";
  };

  const handleTotalDurationInput = (value) => {
    const numValue = Number(value);
    setTaskCreateData((prev) => ({
      ...prev,
      totalDuration: value,
    }));
    const error = validateDuration(value);
    setDurationError(error);
    if (!durationOptions.includes(numValue) && !error) {
      setSelectedDurationOption("custom");
    } else if (durationOptions.includes(numValue)) {
      setSelectedDurationOption(numValue.toString());
    }
  };

  const handleWorkDurationInput = (value) => {
    const numValue = Number(value);
    setTaskCreateData((prev) => ({
      ...prev,
      workDuration: numValue,
    }));
    const error = validateWorkDuration(numValue);
    setWorkDurationError(error);
    const workOptions = generateTimeOptions(
      focusSuggestion.minDuration,
      focusSuggestion.maxDuration,
      taskType.includes("Complex") ? 15 : 10
    );
    if (!workOptions.includes(numValue)) {
      setSelectedWorkOption("custom");
    }
  };

  const handleBreakTimeInput = (value) => {
    const numValue = Number(value);
    setTaskCreateData((prev) => ({
      ...prev,
      breakTime: numValue,
    }));
    const error = validateBreakTime(numValue);
    setBreakTimeError(error);
    const breakOptions = generateTimeOptions(
      focusSuggestion.minBreak,
      focusSuggestion.maxBreak,
      5
    );
    if (!breakOptions.includes(numValue)) {
      setSelectedBreakOption("custom");
    }
  };

  const isNextDisabled = () => {
    if (step === 1) {
      return (
        !taskCreateData.taskName ||
        !taskCreateData.taskDescription ||
        !taskCreateData.totalDuration ||
        durationError ||
        !taskCreateData.startDate ||
        !taskCreateData.endDate
      );
    } else if (step === 2) {
      return (
        !taskCreateData.workDuration ||
        !taskCreateData.breakTime ||
        workDurationError ||
        breakTimeError
      );
    }
    return false;
  };

  const handleOpen = (type, taskTypeId) => {
    setTaskType(type);
    setTaskCreateData({
      focusMethodId: null,
      taskTypeId: taskTypeId,
      userTreeId: sampleTree.treeName,
      taskName: "",
      taskDescription: "",
      totalDuration: "",
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      workDuration: "",
      breakTime: "",
    });
    setIsTaskDialogOpen(true);
    setStep(1);
    setSelectedDurationOption("");
    setSelectedWorkOption("");
    setSelectedBreakOption("");
    setDurationError("");
    setWorkDurationError("");
    setBreakTimeError("");
  };

  const handleNext = async () => {
    setIsLoadingNext(true);
    try {
      if (step === 1) {
        const response = await SuggestTaskFocusMethods(taskCreateData);
        setFocusSuggestion(response);
        setTaskCreateData((prev) => ({
          ...prev,
          focusMethodId: response.focusMethodId,
          workDuration: response.defaultDuration,
          breakTime: response.defaultBreak,
        }));
        setSelectedWorkOption(response.defaultDuration.toString());
        setSelectedBreakOption(response.defaultBreak.toString());
        setStep(2);
      } else {
        setStep(3);
      }
    } catch (error) {
      console.error("Error fetching suggestions", error);
      toast.error("Failed to fetch focus method suggestions");
    } finally {
      setIsLoadingNext(false);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const SimpleDateTimePicker = ({
    label,
    value,
    onDateChange,
    onTimeChange,
  }) => {
    const dateStr = value ? new Date(value).toISOString().split("T")[0] : "";
    const timeStr = value ? new Date(value).toTimeString().slice(0, 5) : "";

    return (
      <div className="flex flex-col gap-1">
        <label className="font-semibold">{label}</label>
        <input
          type="date"
          value={dateStr}
          onChange={(e) => onDateChange(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="time"
          value={timeStr}
          onChange={(e) => onTimeChange(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>
    );
  };

  const handleDateChange = (field, dateStr) => {
    const oldDate = taskCreateData[field]
      ? new Date(taskCreateData[field])
      : new Date();
    const [year, month, day] = dateStr.split("-").map(Number);

    const newDate = new Date(oldDate);
    newDate.setFullYear(year);
    newDate.setMonth(month - 1);
    newDate.setDate(day);

    setTaskCreateData((prev) => ({ ...prev, [field]: newDate }));
  };

  const handleTimeChange = (field, timeStr) => {
    const oldDate = taskCreateData[field]
      ? new Date(taskCreateData[field])
      : new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);

    const newDate = new Date(oldDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    setTaskCreateData((prev) => ({ ...prev, [field]: newDate }));
  };

  const handleCreateTask = async () => {
    try {
      setIsCreatingTask(true);
      const response = await CreateTask(taskCreateData);
      const newTask = {
        taskId: response.taskId || `temp-${Date.now()}`,
        taskName: taskCreateData.taskName,
        taskDescription: taskCreateData.taskDescription,
        startDate: taskCreateData.startDate,
        endDate: taskCreateData.endDate,
        status: 0,
        focusMethodName: focusSuggestion?.focusMethodName || "Pomodoro",
        totalDuration: Number(taskCreateData.totalDuration),
        workDuration: Number(taskCreateData.workDuration),
        breakTime: Number(taskCreateData.breakTime),
        userTreeName: sampleTree.treeName,
        taskTypeName: taskType.includes("Simple") ? "Simple" : "Complex",
        taskNote: "",
        taskResult: null,
        remainingTime: Number(taskCreateData.totalDuration) * 60,
        priority: tasks.length + 1,
      };
      setTasks((prev) => [...prev, newTask]);
      setIsTaskDialogOpen(false);
      setStep(1);
      setTaskCreateData({
        focusMethodId: null,
        taskTypeId: null,
        userTreeId: sampleTree.treeName,
        taskName: "",
        taskDescription: "",
        totalDuration: "",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        workDuration: "",
        breakTime: "",
      });
      setFocusSuggestion(null);
      setSelectedDurationOption("");
      setSelectedWorkOption("");
      setSelectedBreakOption("");
      setDurationError("");
      setWorkDurationError("");
      setBreakTimeError("");
      toast.success("Task created successfully!");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: focusedTask ? false : filteredTasks.length > 3,
    speed: 500,
    slidesToShow: focusedTask ? 1 : Math.min(filteredTasks.length, 1),
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: filteredTasks.length > 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: filteredTasks.length > 1,
        },
      },
    ],
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
      <CardContent className="p-6">
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "Simple & Complex"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab("Simple & Complex")}
              >
                Simple & Complex
              </Button>
              <Button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "Challenge"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setActiveTab("Challenge")}
              >
                Challenge
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Create Task
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => handleOpen("Simple Task", 2)}>
                  Simple Task <br />
                  (30-180 minutes)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpen("Complex Task", 3)}>
                  Complex Task <br />
                  (Above 180 minutes)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="task-column-container" style={{ maxHeight: "410px" }}>
            {filteredTasks.length === 0 ? (
              <p className="text-gray-500">No tasks available</p>
            ) : (
              <Slider {...sliderSettings}>
                {filteredTasks.map((task, index) => {
                  const taskKey = `task-${task.taskId}`; // Use taskId instead of index
                  if (focusedTask && focusedTask.taskId !== task.taskId) {
                    return null;
                  }

                  const remainingTime = task.remainingTime || 0;
                  const timer = timers[taskKey] || {};
                  const { totalWorkCompleted = 0, totalBreakCompleted = 0 } =
                    timer;

                  const totalDurationSeconds = task.totalDuration * 60;
                  const remainTime = task.remainingTime;
                  const elapsedTime = totalDurationSeconds - remainTime;
                  const cycleDuration =
                    (task.workDuration + task.breakTime) * 60;
                  const completedCycles = Math.floor(
                    elapsedTime / cycleDuration
                  );
                  const timeInCurrentCycle = elapsedTime % cycleDuration;

                  let isWorkPhase = true;
                  let currentWorkTime = task.workDuration * 60;
                  let currentBreakTime = task.breakTime * 60;

                  if (timeInCurrentCycle < task.workDuration * 60) {
                    isWorkPhase = true;
                    currentWorkTime =
                      task.workDuration * 60 - timeInCurrentCycle;
                  } else {
                    isWorkPhase = false;
                    const timeIntoBreak =
                      timeInCurrentCycle - task.workDuration * 60;
                    currentBreakTime = task.breakTime * 60 - timeIntoBreak;
                  }

                  const phases = [];
                  const workDurationSeconds = task.workDuration * 60;
                  const breakDurationSeconds = task.breakTime * 60;
                  for (let i = 0; i < completedCycles; i++) {
                    phases.push({
                      type: "work",
                      duration: workDurationSeconds,
                    });
                    phases.push({
                      type: "break",
                      duration: breakDurationSeconds,
                    });
                  }
                  if (timeInCurrentCycle < workDurationSeconds) {
                    phases.push({ type: "work", duration: timeInCurrentCycle });
                  } else {
                    phases.push({
                      type: "work",
                      duration: workDurationSeconds,
                    });
                    phases.push({
                      type: "break",
                      duration: timeInCurrentCycle - workDurationSeconds,
                    });
                  }

                  const circumference = 276.46;
                  let cumulativeOffset = 0;

                  const currentTaskStatus =
                    task.status === 1 ? 1 : task.status === 2 ? 2 : 0;

                  return (
                    <motion.div
                      key={task.taskId}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="task-item relative mb-3 p-4">
                        {["Simple", "Complex", "Challenge"].includes(
                          task.taskTypeName
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
                            {getPriorityLabel(task.priority || 1)}
                          </div>
                        )}
                        <div className="w-full h-full flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ClipboardList className="w-5 h-5 text-green-600" />
                              <span className="text-lg font-semibold text-gray-700">
                                {task.taskName}
                              </span>
                            </div>
                          </div>

                          {currentTaskStatus ===
                            0 /* chỗ này hiển thị task detail*/ && (
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex flex-col text-lg gap-4">
                                <p className="text-left">
                                  <strong>Description:</strong>{" "}
                                  {task.taskDescription ||
                                    "No description provided"}
                                </p>
                                <p className="text-left">
                                  <strong>Start Date:</strong>{" "}
                                  {task.startDate
                                    ? formatDate(task.startDate)
                                    : "N/A"}
                                </p>
                                <p className="text-left">
                                  <strong>End Date:</strong>{" "}
                                  {task.endDate
                                    ? formatDate(task.endDate)
                                    : "N/A"}
                                </p>
                                <p className="text-left">
                                  <strong>Focus Method:</strong>{" "}
                                  {task.focusMethodName || "N/A"}
                                </p>
                              </div>
                              <div className="flex flex-col gap-4 text-lg">
                                <p className="text-left">
                                  <strong>Remaining Time:</strong>{" "}
                                  {formatTime(remainingTime)}
                                </p>
                                <p className="text-left">
                                  <strong>Tree:</strong>{" "}
                                  {task.userTreeName || "N/A"}
                                </p>
                                <p className="text-left">
                                  <strong>Task Type:</strong>{" "}
                                  {task.taskTypeName || "N/A"}
                                </p>
                                <p className="text-left">
                                  <strong>Note:</strong>{" "}
                                  {task.taskNote || "No note provided"}
                                </p>
                              </div>
                            </div>
                          )}

                          {(currentTaskStatus === 1 ||
                            currentTaskStatus === 2) && (
                            <div className="flex justify-center">
                              <div className="relative w-40 h-40">
                                <svg
                                  className="w-full h-full"
                                  viewBox="0 0 100 100"
                                >
                                  <circle
                                    className="text-gray-200"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="44"
                                    cx="50"
                                    cy="50"
                                  />
                                  {phases.map((phase, idx) => {
                                    const phaseDuration = phase.duration;
                                    const phasePercentage =
                                      (phaseDuration / totalDurationSeconds) *
                                      100;
                                    const dashLength =
                                      (phasePercentage / 100) * circumference;
                                    const dashOffset = cumulativeOffset;
                                    cumulativeOffset += dashLength;

                                    return (
                                      <circle
                                        key={idx}
                                        className={
                                          phase.type === "work"
                                            ? "text-blue-500"
                                            : "text-yellow-500"
                                        }
                                        strokeWidth="8"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="44"
                                        cx="50"
                                        cy="50"
                                        strokeDasharray={`${dashLength} ${circumference}`}
                                        strokeDashoffset={-dashOffset}
                                        transform="rotate(-90 50 50)"
                                      />
                                    );
                                  })}
                                </svg>
                                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center">
                                  <span className="text-lg font-bold text-gray-700">
                                    {formatTime(remainingTime)}
                                  </span>
                                  <span
                                    className={`text-sm ${
                                      isWorkPhase
                                        ? "text-blue-500"
                                        : "text-yellow-500"
                                    } font-medium`}
                                  >
                                    {isWorkPhase ? "Work" : "Break"}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {isWorkPhase
                                      ? formatTime(currentWorkTime)
                                      : formatTime(currentBreakTime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-center gap-4">
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
                            ) : task.status === 0 ? (
                              <>
                                <Button
                                  style={{
                                    width: "100px",
                                    height: "45px",
                                  }}
                                  onClick={() =>
                                    handleTaskAction(task, index, "start")
                                  }
                                  className="bg-green-500 hover:bg-green-600"
                                  disabled={
                                    (activeTaskKey !== null &&
                                      activeTaskKey !== taskKey) ||
                                    loadingTaskKey === taskKey
                                  }
                                >
                                  {loadingTaskKey === taskKey ? (
                                    <svg
                                      className="animate-spin h-5 w-5 text-white mx-auto"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                      />
                                    </svg>
                                  ) : (
                                    "Start"
                                  )}
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  style={{
                                    width: "100px",
                                    height: "45px",
                                  }}
                                  onClick={() =>
                                    handleTaskAction(
                                      task,
                                      index,
                                      currentTaskStatus === 1
                                        ? "pause"
                                        : "resume"
                                    )
                                  }
                                  className={
                                    currentTaskStatus === 1
                                      ? "bg-yellow-500 hover:bg-yellow-600"
                                      : "bg-blue-500 hover:bg-blue-600"
                                  }
                                  disabled={loadingTaskKey === taskKey}
                                >
                                  {loadingTaskKey === taskKey ? (
                                    <svg
                                      className="animate-spin h-5 w-5 text-white mx-auto"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                      />
                                    </svg>
                                  ) : currentTaskStatus === 1 ? (
                                    "Pause"
                                  ) : (
                                    "Resume"
                                  )}
                                </Button>
                                {remainingTime <= 120 && remainingTime >= 0 && (
                                  <Button
                                    style={{
                                      width: "100px",
                                      height: "45px",
                                    }}
                                    onClick={() => {
                                      setSelectedTask({ task, index });
                                      setIsFinishDialogOpen(true);
                                    }}
                                    className="bg-orange-500 hover:bg-orange-600"
                                    disabled={loadingTaskKey === taskKey}
                                  >
                                    {loadingTaskKey === taskKey ? (
                                      <svg
                                        className="animate-spin h-5 w-5 text-white mx-auto"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        />
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                      </svg>
                                    ) : (
                                      "Finish"
                                    )}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </Slider>
            )}
          </div>

          {/* Create Task Dialog */}
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogContent className="max-w-lg bg-white rounded-xl shadow-2xl p-6 task-dialog">
              <DialogHeader className="relative bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-t-xl shadow-md">
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                  {step === 3 ? "Confirm Task" : "Create Task"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-100 mt-1">
                  {step === 1 && "Fill in the details for your new task."}
                  {step == 2 && "Suggested focus method based on your task."}
                  {step == 3 && "Review and confirm your task details."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-between items-center my-2 mb-0">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        s < step
                          ? "bg-green-500 text-white"
                          : s === step
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {s < step ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        s
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        s === step
                          ? "text-green-600 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {s === 1 && "Task Details"}
                      {s === 2 && "Focus Method"}
                      {s === 3 && "Confirm"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute top-[140px] left-0 right-0 h-1 bg-gray-200 -mt-4">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{
                    width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
                  }}
                ></div>
              </div>

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
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <Input
                          type="number"
                          placeholder="Enter duration"
                          value={taskCreateData.totalDuration}
                          onChange={(e) =>
                            handleTotalDurationInput(e.target.value)
                          }
                          className={durationError ? "invalid-input" : ""}
                        />
                      </div>
                      <Select
                        onValueChange={(value) => {
                          setSelectedDurationOption(value);
                          if (value !== "custom") {
                            setTaskCreateData({
                              ...taskCreateData,
                              totalDuration: Number(value),
                            });
                            setDurationError("");
                          }
                        }}
                        value={selectedDurationOption}
                      >
                        <SelectTrigger className="w-1/2">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map((duration) => (
                            <SelectItem
                              key={duration}
                              value={duration.toString()}
                            >
                              {duration} minutes
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Your custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {durationError && (
                      <p className="text-red-500 text-sm validate_mess">
                        {durationError}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <SimpleDateTimePicker
                      label="Start Date"
                      value={taskCreateData.startDate}
                      onDateChange={(dateStr) =>
                        handleDateChange("startDate", dateStr)
                      }
                      onTimeChange={(timeStr) =>
                        handleTimeChange("startDate", timeStr)
                      }
                    />
                    <SimpleDateTimePicker
                      label="End Date"
                      value={taskCreateData.endDate}
                      onDateChange={(dateStr) =>
                        handleDateChange("endDate", dateStr)
                      }
                      onTimeChange={(timeStr) =>
                        handleTimeChange("endDate", timeStr)
                      }
                    />
                  </div>
                </div>
              )}

              {step === 2 && focusSuggestion && (
                <div className="space-y-2">
                  <div className="border rounded-xl p-3 bg-gray-50 space-y-2 shadow-sm">
                    <h2 className="text-xl font-bold text-primary">
                      Focus Method: {focusSuggestion.focusMethodName}
                    </h2>
                    <p className="text-sm text-gray-700">
                      {focusSuggestion.reason}
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        ⏱️ Work Duration: {focusSuggestion.minDuration} –{" "}
                        {focusSuggestion.maxDuration} mins
                      </p>
                      <p>
                        ☕ Break Time: {focusSuggestion.minBreak} –{" "}
                        {focusSuggestion.maxBreak} mins
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Work Duration (minutes)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min={focusSuggestion.minDuration}
                        max={focusSuggestion.maxDuration}
                        value={taskCreateData.workDuration}
                        onChange={(e) =>
                          handleWorkDurationInput(e.target.value)
                        }
                        className={workDurationError ? "invalid-input" : ""}
                      />
                      <Select
                        value={selectedWorkOption}
                        onValueChange={(value) => {
                          setSelectedWorkOption(value);
                          if (value !== "custom") {
                            setTaskCreateData({
                              ...taskCreateData,
                              workDuration: Number(value),
                            });
                            setWorkDurationError("");
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select work duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions(
                            focusSuggestion.minDuration,
                            focusSuggestion.maxDuration,
                            taskType.includes("Complex") ? 15 : 10
                          ).map((duration) => (
                            <SelectItem
                              key={duration}
                              value={duration.toString()}
                            >
                              {duration} minutes
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Your custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {workDurationError && (
                      <p className="text-red-500 text-sm">
                        {workDurationError}
                      </p>
                    )}
                    <p className="text-xs text-blue-600 italic">
                      🔹 Recommended: {focusSuggestion.defaultDuration} mins
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Break Time (minutes)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min={focusSuggestion.minBreak}
                        max={focusSuggestion.maxBreak}
                        value={taskCreateData.breakTime}
                        onChange={(e) => handleBreakTimeInput(e.target.value)}
                        className={breakTimeError ? "invalid-input" : ""}
                      />
                      <Select
                        value={selectedBreakOption}
                        onValueChange={(value) => {
                          setSelectedBreakOption(value);
                          if (value !== "custom") {
                            setTaskCreateData({
                              ...taskCreateData,
                              breakTime: Number(value),
                            });
                            setBreakTimeError("");
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select break time" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions(
                            focusSuggestion.minBreak,
                            focusSuggestion.maxBreak,
                            5
                          ).map((duration) => (
                            <SelectItem
                              key={duration}
                              value={duration.toString()}
                            >
                              {duration} minutes
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Your custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {breakTimeError && (
                      <p className="text-red-500 text-sm">{breakTimeError}</p>
                    )}
                    <p className="text-xs text-blue-600 italic">
                      🔹 Recommended: {focusSuggestion.defaultBreak} mins
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
                    {format(new Date(taskCreateData.startDate), "PPP HH:mm")}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {format(new Date(taskCreateData.endDate), "PPP HH:mm")}
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
                    disabled={isLoadingNext}
                  >
                    Back
                  </Button>
                )}
                {step < 3 && (
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={handleNext}
                    disabled={isNextDisabled() || isLoadingNext}
                  >
                    {isLoadingNext ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : (
                      "Next"
                    )}
                  </Button>
                )}
                {step === 3 && (
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={handleCreateTask}
                    disabled={isCreatingTask}
                  >
                    {isCreatingTask ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : (
                      "Create"
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default function Workspace() {
  const [tasks, setTasks] = useState(sampleTasks);
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

  const handleTaskAction = (task, index, action) => {
    const taskKey = `task-${task.taskId}`; // Use taskId instead of index
    try {
      setLoadingTaskKey(taskKey);

      if (action === "start" || action === "resume") {
        console.log("Starting task:", task.taskId, "taskKey:", taskKey);
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
        console.log("Pausing task:", task.taskId, "taskKey:", taskKey);
        console.log("Current timer:", timers[taskKey]);
        console.log("Interval ref:", intervalRefs.current[taskKey]);
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
                <TreeInfo tree={sampleTree} />
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
