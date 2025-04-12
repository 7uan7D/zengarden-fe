// components/index.jsx
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import parseJwt from "@/services/parseJwt";
import { useUserExperience } from "@/context/UserExperienceContext";
import { useTreeExperience } from "@/context/TreeExperienceContext";
import { GetUserTreeByUserId } from "@/services/apiServices/userTreesService";
import { GetAllTrees } from "@/services/apiServices/treesService";
import { CreateUserTree } from "@/services/apiServices/userTreesService";
import { CreateTask } from "@/services/apiServices/taskService";
import { SuggestTaskFocusMethods } from "@/services/apiServices/focusMethodsService";
import { GetTaskByUserTreeId } from "@/services/apiServices/taskService";
import { StartTask } from "@/services/apiServices/taskService";
import { PauseTask } from "@/services/apiServices/taskService";
import { GetBagItems } from "@/services/apiServices/itemService";
import addIcon from "/images/add.png";
import { TreeSelectorDialog, CreateTreeDialog, TreeInfoHeader } from "./task_tree";
import { TaskColumn, TaskInfoDialog, TaskCreationDialog } from "../task/task_listOfTasks";
import { ConfirmCompletionDialog, WorkspaceSwitchDialog } from "../task/task_dialog"; // Thêm import
import "../task/index.css";

export default function TaskPage() {
  // State declarations (giữ nguyên)
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskType, setTaskType] = useState("");
  const [currentTree, setCurrentTree] = useState(0);
  const [userTrees, setUserTrees] = useState([]);
  const [trees, setTrees] = useState([]);
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false);
  const [taskToStart, setTaskToStart] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskInfoDialogOpen, setIsTaskInfoDialogOpen] = useState(false);
  const [activeTabs, setActiveTabs] = useState({
    daily: "all",
    simple: "all",
    complex: "all",
  });
  const [newTreeName, setNewTreeName] = useState("");
  const [isCreateTreeDialogOpen, setIsCreateTreeDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Context để quản lý XP của user và cây
  const { refreshXp } = useUserExperience();
  const { treeExp, refreshTreeExp } = useTreeExperience();

  // State dữ liệu task khi tạo mới
  const [taskData, setTaskData] = useState({
    focusMethodId: null,
    taskTypeId: null,
    userTreeId: null,
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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [tasks, setTasks] = useState({
    daily: [],
    simple: [],
    complex: [],
  });
  const [equippedItems, setEquippedItems] = useState([]);

  const selectedTree = userTrees.find(
    (tree) => tree.userTreeId === currentTree
  );

  //Tạo cây mới
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

  // Logic for Task Creation (giữ nguyên)
  const handleOpen = (type, taskTypeId) => {
    setTaskType(type);
    setTaskData((prev) => ({
      ...prev,
      taskTypeId: taskTypeId,
      userTreeId: selectedTree?.userTreeId || null,
    }));
    setIsTaskDialogOpen(true);
  };

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

  // Logic for Timer
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Bắt đầu chạy task
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
      workDuration: task.workDuration * 60,
      breakTime: task.breakTime * 60,
      lastUpdated: Date.now(),
    });
    setIsRunning(true);
  };

  // Chuyển đổi trạng thái chạy/pause của task
  const toggleTimer = async (column = null, taskIndex = null) => {
    const columnToUse = column ?? currentTask?.column;
    const indexToUse = taskIndex ?? currentTask?.taskIndex;

    if (columnToUse === null || indexToUse === null) return;

    const task = tasks[columnToUse][indexToUse];
    const totalDurationSeconds = task.totalDuration * 60;

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
      setCurrentTask((prev) => ({
        ...prev,
        lastUpdated: Date.now(),
      }));
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

      const initialTime = task.remainingTime
        ? typeof task.remainingTime === "string"
          ? timeStringToSeconds(task.remainingTime)
          : task.remainingTime * 60
        : totalDurationSeconds;

      setCurrentTask({
        column: columnToUse,
        taskIndex: indexToUse,
        time: initialTime,
        totalTime: totalDurationSeconds,
        workDuration: task.workDuration * 60,
        breakTime: task.breakTime * 60,
        lastUpdated: Date.now(),
      });
      setIsRunning(true);
    }
  };

  function timeStringToSeconds(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Fetch tasks
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

  useEffect(() => {
    if (currentTree) {
      const tree = userTrees.find((t) => t.userTreeId === currentTree);
      if (tree) {
        fetchTasks(tree.userTreeId);
      }
    }
  }, [currentTree]);

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
    setTaskData((prev) => ({
      ...prev,
      userTreeId: selectedTree?.userTreeId || null,
    }));
  }, [selectedTree]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        currentTask &&
        isRunning &&
        currentTask.time > 0 &&
        ![2, 3, 4].includes(currentTask.status) // <- kiểm tra status
      ) {
        const now = Date.now();
        const elapsed = Math.floor((now - currentTask.lastUpdated) / 1000);
        setCurrentTask((prev) => ({
          ...prev,
          time: Math.max(prev.time - elapsed, 0),
          lastUpdated: now,
        }));
      } else if (currentTask && currentTask.time === 0) {
        setTasks((prev) => {
          const updated = { ...prev };
          updated[currentTask.column] = [...updated[currentTask.column]];
          updated[currentTask.column][currentTask.taskIndex] = {
            ...updated[currentTask.column][currentTask.taskIndex],
            status: 4,
          };
          return updated;
        });
        setCurrentTask(null);
        setIsRunning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTask, isRunning]);

  // Lưu trạng thái task vào localStorage khi rời trang
  const handleBeforeUnload = (e) => {
    if (currentTask) {
      const task = tasks[currentTask.column]?.[currentTask.taskIndex];
      if (task) {
        const dataToSave = {
          taskId: task.taskId,
          column: currentTask.column,
          taskIndex: currentTask.taskIndex,
          time: currentTask.time,
          totalTime: currentTask.totalTime,
          workDuration: currentTask.workDuration,
          breakTime: currentTask.breakTime,
          lastUpdated: Date.now(),
          isRunning: isRunning,
        };
        localStorage.setItem("currentTask", JSON.stringify(dataToSave));
        if (isRunning) {
          fetch(
            `https://zengarden-be.onrender.com/api/Task/pause/${task.taskId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
              keepalive: true,
            }
          ).catch((err) => console.error("PauseTask failed", err));
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning, currentTask, tasks]);

  // Khôi phục trạng thái từ localStorage khi quay lại trang
  useEffect(() => {
    const saved = localStorage.getItem("currentTask");
    if (saved && Object.keys(tasks).length > 0) {
      const {
        column,
        taskIndex,
        time,
        totalTime,
        workDuration,
        breakTime,
        lastUpdated,
        isRunning: savedIsRunning,
      } = JSON.parse(saved);

      const task = tasks[column]?.[taskIndex];

      if (task) {
        const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
        const updatedTime = savedIsRunning ? Math.max(time - elapsed, 0) : time;

        setCurrentTask({
          ...task,
          column,
          taskIndex,
          time: updatedTime,
          lastUpdated: Date.now(),
        });

        setIsRunning(savedIsRunning && updatedTime > 0);
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [tasks, setCurrentTask, setIsRunning]);

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
      className="p-6 max-w-full mx-auto w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md"></div>
      <div className="pt-10">
        <TreeInfoHeader
          userTrees={userTrees}
          currentTree={currentTree}
          trees={trees}
          treeExp={treeExp}
          equippedItems={equippedItems}
          setIsTreeDialogOpen={setIsTreeDialogOpen}
          setIsCreateTreeDialogOpen={setIsCreateTreeDialogOpen}
          addIcon={addIcon}
          handleOpen={handleOpen}
        />

        <TreeSelectorDialog
          isOpen={isTreeDialogOpen}
          onOpenChange={setIsTreeDialogOpen}
          userTrees={userTrees}
          trees={trees}
          setCurrentTree={setCurrentTree}
          setIsCreateTreeDialogOpen={setIsCreateTreeDialogOpen}
          addIcon={addIcon}
        />

        <CreateTreeDialog
          isOpen={isCreateTreeDialogOpen}
          onOpenChange={setIsCreateTreeDialogOpen}
          newTreeName={newTreeName}
          setNewTreeName={setNewTreeName}
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          handleCreateTree={handleCreateTree}
        />

        <TaskInfoDialog
          isOpen={isTaskInfoDialogOpen}
          onOpenChange={setIsTaskInfoDialogOpen}
          selectedTask={selectedTask}
        />

        <TaskCreationDialog
          isOpen={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          taskData={taskData}
          setTaskData={setTaskData}
          step={step}
          setStep={setStep}
          focusSuggestion={focusSuggestion}
          setFocusSuggestion={setFocusSuggestion}
          handleNext={handleNext}
          handleBack={handleBack}
          handleCreateTask={handleCreateTask}
          handleDateChange={handleDateChange}
          handleTimeChange={handleTimeChange}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <TaskColumn
          title="Daily Task"
          taskList={tasks.daily}
          columnKey="daily"
          activeTabs={activeTabs}
          setActiveTabs={setActiveTabs}
          tasks={tasks}
          setTasks={setTasks}
          currentTask={currentTask}
          isRunning={isRunning}
          toggleTimer={toggleTimer}
          startTimer={startTimer}
          setTaskToComplete={setTaskToComplete}
          setIsConfirmDialogOpen={setIsConfirmDialogOpen}
          selectedTree={selectedTree}
          setCurrentTask={setCurrentTask}
          setIsRunning={setIsRunning}
          refreshTreeExp={refreshTreeExp}
          currentTree={currentTree}
          fetchTasks={fetchTasks}
          setIsWorkspaceDialogOpen={setIsWorkspaceDialogOpen}
          setTaskToStart={setTaskToStart}
          setSelectedTask={setSelectedTask}
          setIsTaskInfoDialogOpen={setIsTaskInfoDialogOpen}
          formatTime={formatTime}
        />
        <TaskColumn
          title="Simple Task"
          taskList={tasks.simple}
          columnKey="simple"
          activeTabs={activeTabs}
          setActiveTabs={setActiveTabs}
          tasks={tasks}
          setTasks={setTasks}
          currentTask={currentTask}
          isRunning={isRunning}
          toggleTimer={toggleTimer}
          startTimer={startTimer}
          setTaskToComplete={setTaskToComplete}
          setIsConfirmDialogOpen={setIsConfirmDialogOpen}
          selectedTree={selectedTree}
          setCurrentTask={setCurrentTask}
          setIsRunning={setIsRunning}
          refreshTreeExp={refreshTreeExp}
          currentTree={currentTree}
          fetchTasks={fetchTasks}
          setIsWorkspaceDialogOpen={setIsWorkspaceDialogOpen}
          setTaskToStart={setTaskToStart}
          setSelectedTask={setSelectedTask}
          setIsTaskInfoDialogOpen={setIsTaskInfoDialogOpen}
          formatTime={formatTime}
        />
        <TaskColumn
          title="Complex Task"
          taskList={tasks.complex}
          columnKey="complex"
          activeTabs={activeTabs}
          setActiveTabs={setActiveTabs}
          tasks={tasks}
          setTasks={setTasks}
          currentTask={currentTask}
          isRunning={isRunning}
          toggleTimer={toggleTimer}
          startTimer={startTimer}
          setTaskToComplete={setTaskToComplete}
          setIsConfirmDialogOpen={setIsConfirmDialogOpen}
          selectedTree={selectedTree}
          setCurrentTask={setCurrentTask}
          setIsRunning={setIsRunning}
          refreshTreeExp={refreshTreeExp}
          currentTree={currentTree}
          fetchTasks={fetchTasks}
          setIsWorkspaceDialogOpen={setIsWorkspaceDialogOpen}
          setTaskToStart={setTaskToStart}
          setSelectedTask={setSelectedTask}
          setIsTaskInfoDialogOpen={setIsTaskInfoDialogOpen}
          formatTime={formatTime}
        />
      </div>

      <ConfirmCompletionDialog
        isConfirmDialogOpen={isConfirmDialogOpen}
        setIsConfirmDialogOpen={setIsConfirmDialogOpen}
        taskToComplete={taskToComplete}
        setTaskToComplete={setTaskToComplete}
        selectedTree={selectedTree}
        tasks={tasks}
        setTasks={setTasks}
        currentTask={currentTask}
        setCurrentTask={setCurrentTask}
        setIsRunning={setIsRunning}
        refreshTreeExp={refreshTreeExp}
        currentTree={currentTree}
        fetchTasks={fetchTasks}
      />
      <WorkspaceSwitchDialog
        isWorkspaceDialogOpen={isWorkspaceDialogOpen}
        setIsWorkspaceDialogOpen={setIsWorkspaceDialogOpen}
        taskToStart={taskToStart}
        setTaskToStart={setTaskToStart}
        startTimer={startTimer}
      />
    </motion.div>
  );
}