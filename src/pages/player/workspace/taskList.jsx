import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
import { ClipboardList, CircleCheckBig, CircleX } from "lucide-react";
import { useTreeExperience } from "@/context/TreeExperienceContext";
import "./taskList.css"; // Import custom CSS
import { GetAllFocusMethods } from "@/services/apiServices/focusMethodsService";
import { CreateMultipleTask } from "@/services/apiServices/taskService";

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
  const userTreeId = localStorage.getItem("selectedTreeId");
  const [taskCreateData, setTaskCreateData] = useState({
    focusMethodId: null,
    taskTypeId: null,
    userTreeId: userTreeId || null,
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

  const { currentTree } = useTreeExperience(); // Get selected tree from context

  // Update taskCreateData with currentTree's userTreeId
  useEffect(() => {
    setTaskCreateData((prev) => ({
      ...prev,
      userTreeId: userTreeId || null,
    }));
  }, [userTreeId]);

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
          (task.taskTypeName === "Simple" || task.taskTypeName === "Complex") &&
          task.status === 0
        );
      } else if (activeTab === "Challenge") {
        return task.taskTypeName === "Challenge" && task.status === 0;
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
      const disabled =
        !taskCreateData.taskName ||
        !taskCreateData.taskDescription ||
        !taskCreateData.totalDuration ||
        durationError ||
        !taskCreateData.startDate ||
        !taskCreateData.endDate ||
        !taskCreateData.userTreeId;
      return disabled;
    } else if (step === 2) {
      const disabled =
        !taskCreateData.workDuration ||
        !taskCreateData.breakTime ||
        workDurationError ||
        breakTimeError;
      return disabled;
    }
    return false;
  };

  const handleOpen = (type, taskTypeId) => {
    setTaskType(type);
    setTaskCreateData({
      focusMethodId: null,
      taskTypeId: taskTypeId,
      userTreeId: userTreeId || null,
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

  const [allFocusMethods, setAllFocusMethods] = useState([]);
  const [suggestedFocusMethod, setSuggestedFocusMethod] = useState(null);

  const handleNext = async () => {
    setIsLoadingNext(true);
    try {
      if (step === 1) {
        const response = await SuggestTaskFocusMethods(taskCreateData);
        setSuggestedFocusMethod(response);
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
      if (step === 3) {
        setStep(4);
      }
    } catch (error) {
      console.error("Error fetching suggestions", error);
      toast.error("Failed to fetch focus method suggestions");
    } finally {
      setIsLoadingNext(false);
    }
  };

  useEffect(() => {
    const fetchFocusMethods = async () => {
      try {
        const methods = await GetAllFocusMethods();
        const filtered = methods.filter(
          (method) =>
            method.defaultDuration + method.defaultBreak <=
            taskCreateData.totalDuration
        );
        setAllFocusMethods(filtered);
      } catch (error) {
        console.error("Failed to fetch all focus methods", error);
      }
    };

    if (step === 2) {
      fetchFocusMethods();
    }
  }, [step, taskCreateData.totalDuration]);

  const handleBack = () => {
    setStep(step - 1);
  };

  const getInitialSubtasks = (totalDuration) => {
    if (totalDuration > 240) return 3;
    if (totalDuration > 120) return 2;
    return 1;
  };

  const handleCreateTask = async () => {
    try {
      setIsCreatingTask(true);

      const taskData =
        subtasks.length > 0
          ? subtasks.map((subtask) => ({
              focusMethodId: taskCreateData.focusMethodId,
              taskTypeId: taskCreateData.taskTypeId,
              userTreeId: userTreeId,
              taskName: subtask.title,
              taskDescription: taskCreateData.taskDescription,
              totalDuration: subtask.duration,
              startDate: taskCreateData.startDate,
              endDate: taskCreateData.endDate,
              workDuration: taskCreateData.workDuration,
              breakTime: taskCreateData.breakTime,
            }))
          : [taskCreateData]; // fallback nếu không có subtasks

      await CreateMultipleTask(taskData);

      setIsTaskDialogOpen(false);
      setStep(1);
      setTaskCreateData({
        focusMethodId: null,
        taskTypeId: null,
        userTreeId: userTreeId || null,
        taskName: "",
        taskDescription: "",
        totalDuration: "",
        startDate: "",
        endDate: "",
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
      setSubtasks([]);
      toast.success("Task created successfully!");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const [subtasks, setSubtasks] = useState([]);

  useEffect(() => {
    if (step === 3 && taskCreateData.taskName && subtasks.length === 0) {
      const count = getInitialSubtasks(taskCreateData.totalDuration);
      const defaultDuration = Math.floor(taskCreateData.totalDuration / count);
      const baseName = taskCreateData.taskName;

      const initial = Array.from({ length: count }, (_, i) => ({
        id: i,
        title: count > 1 ? `${baseName} (${i + 1})` : baseName,
        duration: defaultDuration,
      }));

      setSubtasks(initial);
    }
  }, [
    step,
    taskCreateData.totalDuration,
    taskCreateData.taskName,
    subtasks.length,
  ]);

  const handleSubtaskChange = (index, field, value) => {
    const updated = [...subtasks];

    if (field === "duration") {
      const newDuration = Number(value);
      const otherTotal = subtasks.reduce(
        (sum, t, i) => (i !== index ? sum + t.duration : sum),
        0
      );
      const remaining = taskCreateData.totalDuration - newDuration;

      if (remaining < 0) return;

      updated[index].duration = newDuration;

      const others = updated.filter((_, i) => i !== index);
      const totalOther = others.reduce((sum, t) => sum + t.duration, 0);

      if (totalOther > 0) {
        // Tỷ lệ mới
        updated.forEach((t, i) => {
          if (i !== index) {
            const ratio = t.duration / totalOther;
            t.duration = Math.floor(remaining * ratio);
          }
        });

        const totalNow = updated.reduce((sum, t) => sum + t.duration, 0);
        const diff = taskCreateData.totalDuration - totalNow;
        if (diff !== 0) {
          const firstOther = updated.find((_, i) => i !== index);
          if (firstOther) firstOther.duration += diff;
        }
      }
    } else {
      updated[index][field] = value;
    }

    setSubtasks(updated);
  };

  const handleAddSubtask = () => {
    const baseName = taskCreateData.taskName || "Task";
    const nextIndex = subtasks.length + 1;
    setSubtasks((prev) => [
      ...prev,
      {
        id: prev.length,
        title: `${baseName} (${nextIndex})`,
        duration: 0,
      },
    ]);
  };

  const handleRemoveSubtask = (index) => {
    if (subtasks.length <= 1) return; // không cho xóa hết
    const updated = [...subtasks];
    updated.splice(index, 1);

    // Cập nhật lại durations để vẫn đúng tổng (nếu cần)
    const totalDuration = taskCreateData.totalDuration;
    const totalNow = updated.reduce((sum, t) => sum + t.duration, 0);
    const diff = totalDuration - totalNow;

    if (diff > 0 && updated.length > 0) {
      // cộng phần dư vào task đầu
      updated[0].duration += diff;
    }

    setSubtasks(updated);
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
          className="border px-2 py-1 rounded bg-white text-black"
        />
        <input
          type="time"
          value={timeStr}
          onChange={(e) => onTimeChange(e.target.value)}
          className="border px-2 py-1 rounded bg-white text-black"
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

  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: focusedTask ? false : filteredTasks.length > 3,
    speed: 500,
    slidesToShow: focusedTask ? 1 : Math.min(filteredTasks.length, 1),
    slidesToScroll: 1,
    arrows: true,
    className: "task-slider", // Custom class for styling
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
              <DropdownMenuContent className="w-48 relative">
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
                  const taskKey = `task-${task.taskId}`;
                  if (focusedTask && (focusedTask.taskId !== task.taskId || focusedTask.status !== 0)) {
                    return null;
                  } // Skip tasks that are not focused or not in status 0

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
                      <Card
                        className="task-item relative mb-3 p-4"
                        style={{ height: "375px" }}
                      >
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
                            } absolute top-0 right-0 font-bold text-white px-3 py-1 rounded priority_custom`}
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

                          {currentTaskStatus === 0 && (
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex flex-col text-lg gap-4">
                                <p
                                  className="text-left task-description"
                                  title={
                                    task.taskDescription ||
                                    "No description provided"
                                  }
                                >
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
                                        d="M4 12a8 8 0 018-8V4a4 4 0 00-4 4H4z"
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
                                        d="M4 12a8 8 0 018-8V4a4 4 0 00-4 4H4z"
                                      />
                                    </svg>
                                  ) : currentTaskStatus === 1 ? (
                                    "Pause"
                                  ) : (
                                    "Resume"
                                  )}
                                </Button>
                                {remainingTime <= 300 && remainingTime >= 0 && (
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
                                          d="M4 12a8 8 0 018-8V4a4 4 0 00-4 4H4z"
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
                  {step === 4 ? "Confirm Task" : "Create Task"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-100 mt-1">
                  {step === 1 && "Fill in the details for your new task."}
                  {step === 2 && "Suggested focus method based on your task."}
                  {step === 3 && "Break down your tasks if required."}
                  {step === 4 && "Review and confirm your task details."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-between items-center my-2 mb-0">
                {[1, 2, 3, 4].map((s) => (
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
                      {s === 3 && "Break Task"}
                      {s === 4 && "Confirm"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute top-[140px] left-0 right-0 h-1 bg-gray-200 -mt-4">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{
                    width:
                      step === 1
                        ? "25%"
                        : step === 2
                        ? "50%"
                        : step === 3
                        ? "75%"
                        : "100%",
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
                  <div className="flex flex-row gap-4"> {/* Date and Time Pickers - đổi hiển thị ngang dọc */}
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

                  <div className="space-y-1">
                    <Label>Focus Method</Label>
                    <Select
                      value={taskCreateData.focusMethodId?.toString() ?? ""}
                      onValueChange={(value) => {
                        const selected = allFocusMethods.find(
                          (method) => method.focusMethodId.toString() === value
                        );

                        if (selected) {
                          const isSuggested =
                            suggestedFocusMethod &&
                            selected.focusMethodId ===
                              suggestedFocusMethod.focusMethodId;

                          const reason = isSuggested
                            ? suggestedFocusMethod.reason
                            : selected.description;

                          setFocusSuggestion({
                            ...selected,
                            reason,
                          });

                          setTaskCreateData((prev) => ({
                            ...prev,
                            focusMethodId: selected.focusMethodId,
                            workDuration: selected.defaultDuration,
                            breakTime: selected.defaultBreak,
                          }));

                          setSelectedWorkOption(
                            selected.defaultDuration.toString()
                          );
                          setSelectedBreakOption(
                            selected.defaultBreak.toString()
                          );
                          setWorkDurationError("");
                          setBreakTimeError("");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a focus method" />
                      </SelectTrigger>
                      <SelectContent>
                        {allFocusMethods.map((method) => (
                          <SelectItem
                            key={method.focusMethodId}
                            value={method.focusMethodId.toString()}
                          >
                            {method.focusMethodName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <h2 className="text-lg font-semibold text-primary">
                    🔧 Break your task into smaller parts
                  </h2>
                  <p className="text-sm text-gray-600 italic">
                    🧠 Recommended: Split into at least{" "}
                    {getInitialSubtasks(taskCreateData.totalDuration)}{" "}
                    subtask(s)
                  </p>

                  {subtasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="border p-3 rounded-xl bg-gray-50 space-y-2 shadow-sm relative"
                    >
                      {subtasks.length >
                        getInitialSubtasks(taskCreateData.totalDuration) && (
                        <button
                          className="absolute top-2 right-2 text-sm text-red-500 hover:underline"
                          onClick={() => handleRemoveSubtask(index)}
                        >
                          ❌ Remove
                        </button>
                      )}
                      <Input
                        value={task.title}
                        onChange={(e) =>
                          handleSubtaskChange(index, "title", e.target.value)
                        }
                        placeholder="Subtask title"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={task.duration}
                        onChange={(e) =>
                          handleSubtaskChange(
                            index,
                            "duration",
                            Number(e.target.value)
                          )
                        }
                        placeholder="Duration (minutes)"
                      />
                    </div>
                  ))}

                  <Button
                    onClick={handleAddSubtask}
                    variant="outline"
                    className="mt-2"
                  >
                    ➕ Add another subtask
                  </Button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-primary">
                    📝 Review Your Task
                  </h2>

                  {subtasks.length > 1 ? (
                    <>
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

                      <div className="space-y-2">
                        <h3 className="font-semibold text-md mt-2">
                          📌 Subtasks:
                        </h3>
                        {subtasks.map((subtask, index) => (
                          <div
                            key={subtask.id}
                            className="border p-3 rounded-xl bg-gray-50 shadow-sm"
                          >
                            <p>
                              <strong>{index + 1}. Title:</strong>{" "}
                              {subtask.title}
                            </p>
                            <p>
                              <strong>Duration:</strong> {subtask.duration}{" "}
                              minutes
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    // Nếu chỉ 1 hoặc 0 subtask thì hiển thị thông tin taskCreateData
                    <>
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
                    </>
                  )}

                  {/* Các phần luôn hiển thị */}
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
                {step < 4 && (
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
                          d="M4 12a8 8 0 018-8V4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : (
                      "Next"
                    )}
                  </Button>
                )}

                {step === 4 && (
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
                          d="M4 12a8 8 0 018-8V4a4 4 0 00-4 4H4z"
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

export default TaskList;
