import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Circle, CircleCheckBig, CircleX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import "../task/index.css";
import { GetTaskByUserId } from "@/services/apiServices/taskService";
import { UpdateTaskById2 } from "@/services/apiServices/taskService";
import { DeleteTaskById } from "@/services/apiServices/taskService";
import parseJwt from "@/services/parseJwt";
import { toast } from "sonner";

const taskTypeIdMap = {
  Simple: 2,
  Complex: 3,
  Challenge: 4,
};

export default function TaskTab({ userTreeId }) {
  const [activeTabs, setActiveTabs] = useState({
    simple: "all",
    complex: "all",
    challenge: "all",
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState({
    simple: [],
    complex: [],
    challenge: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const decoded = parseJwt(token);
        const userId = decoded?.sub;
        if (!userId) throw new Error("Invalid token: no user ID");

        const allTasks = await GetTaskByUserId(userId);

        const categorizedTasks = {
          simple: [],
          complex: [],
          challenge: [],
        };

        allTasks.forEach((task) => {
          const type = task.taskTypeName?.toLowerCase();
          if (type === "simple") categorizedTasks.simple.push(task);
          else if (type === "complex") categorizedTasks.complex.push(task);
          else if (type === "challenge") categorizedTasks.challenge.push(task);
        });

        setTasks(categorizedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const [editTaskData, setEditTaskData] = useState({
    TotalDuration: selectedTask?.totalDuration || 0,
    TaskType: selectedTask?.taskTypeName || "Simple",
    TaskTypeId: taskTypeIdMap[selectedTask?.taskTypeName] || 2,
  });

  useEffect(() => {
    if (selectedTask) {
      setEditTaskData({
        TotalDuration: selectedTask.totalDuration || 0,
        TaskType: selectedTask.taskTypeName || "Simple",
        TaskTypeId: taskTypeIdMap[selectedTask.taskTypeName] || 2,
      });
    }
  }, [selectedTask]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      return parts[0];
    }
    return 0;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

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

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "Not Started";
      case 1:
      case 2:
        return "On-going";
      case 3:
        return "Done";
      case 4:
        return "Expired";
      default:
        return "Unknown";
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const renderTaskColumn = (title, taskList, columnKey) => {
    const filteredTasks =
      activeTabs[columnKey] === "all"
        ? taskList
        : activeTabs[columnKey] === "current"
        ? taskList.filter((task) => task.status !== 4 && task.status !== 3)
        : taskList.filter((task) => task.status === 3);

    const sortedTasks = [...filteredTasks].sort(
      (a, b) => a.priority - b.priority
    );

    const taskHeight = 85;
    const gap = 8;
    const padding = 0;
    const calculatedHeight =
      sortedTasks.length > 0
        ? sortedTasks.length * taskHeight +
          (sortedTasks.length - 1) * gap +
          padding
        : 150;

    return (
      <div className="task-column-container">
        <div className="flex justify-between items-center mb-1 mt-3">
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
          style={{ minHeight: `${calculatedHeight}px` }}
        >
          <div className="task-list">
            {sortedTasks.length === 0 ? (
              <p className="text-gray-500 text-center">No tasks available</p>
            ) : (
              sortedTasks.map((task, index) => {
                const totalDurationSeconds = task.totalDuration * 60;
                const remainingTimeSeconds = parseTimeToSeconds(
                  task.remainingTime
                );
                const elapsedTime = totalDurationSeconds - remainingTimeSeconds;
                const cycleDuration = (task.workDuration + task.breakTime) * 60;
                const completedCycles = Math.floor(elapsedTime / cycleDuration);
                const timeInCurrentCycle = elapsedTime % cycleDuration;

                // console.log("Elapsed:", elapsedTime);
                // console.log("Cycle Duration:", cycleDuration);
                // console.log("Completed Cycles:", completedCycles);
                // console.log("Time in Current Cycle:", timeInCurrentCycle);

                const phases = [];

                // Completed cycles
                for (let i = 0; i < completedCycles; i++) {
                  phases.push({
                    type: "work",
                    duration: task.workDuration * 60,
                  });
                  phases.push({ type: "break", duration: task.breakTime * 60 });
                }

                // Pha hiện tại
                const workDurationSec = task.workDuration * 60;
                const breakDurationSec = task.breakTime * 60;

                // const sumOfPhases = phases.reduce(
                //   (acc, cur) => acc + cur.duration,
                //   0
                // );
                // console.log("TotalDuration:", totalDurationSeconds);
                // console.log("Sum of all phases:", sumOfPhases);

                if (timeInCurrentCycle < workDurationSec) {
                  // Đang trong work phase
                  phases.push({ type: "work", duration: timeInCurrentCycle });
                } else {
                  // Đang trong break phase
                  phases.push({ type: "work", duration: workDurationSec });
                  const timeIntoBreak = timeInCurrentCycle - workDurationSec;
                  phases.push({ type: "break", duration: timeIntoBreak });
                }

                return (
                  <motion.div
                    key={`${task.taskName}-${task.priority}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className="task-item relative flex cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      {["simple", "complex"].includes(columnKey) && (
                        <div
                          className={`priority-label priority-${
                            task.priority <= 2
                              ? "high"
                              : task.priority <= 4
                              ? "medium"
                              : "low"
                          } absolute top-0 right-0 font-bold text-white px-2 py-1 rounded priority_custom cursor-pointer`}
                        >
                          {getPriorityLabel(task.priority)}
                        </div>
                      )}
                      <div className="flex-1 flex flex-col gap-1 text-left">
                        <div className="min-h-[24px]">
                          <span className="text-gray-700 font-medium">
                            {task.taskName}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="progress-bar-container h-2">
                            <div className="progress-bar flex h-full rounded overflow-hidden">
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
                          <div className="min-h-[8px] text-xs text-gray-500">
                            {task.status === 0 ? (
                              <span className="text-gray-400">Not Started</span>
                            ) : (
                              <span> </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 p-5 pl-0">
                        {task.status === 0 ? (
                          <span
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "#6b7280" }}
                          >
                            <Circle className="w-4 h-4" />
                            Not Started
                          </span>
                        ) : task.status === 1 || task.status === 2 ? (
                          <span
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "#3b82f6" }}
                          >
                            <CircleCheckBig className="w-4 h-4" />
                            On-going
                          </span>
                        ) : task.status === 3 ? (
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
                        ) : null}
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderTaskColumn("Simple Task", tasks.simple, "simple")}
          {renderTaskColumn("Complex Task", tasks.complex, "complex")}
          {renderTaskColumn("Challenge Task", tasks.challenge, "challenge")}
        </div>
      )}
      {selectedTask && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTask?.taskName || "Task Details"}
              </DialogTitle>
              <DialogDescription>
                {selectedTask?.taskDescription || "No description available"}
              </DialogDescription>
            </DialogHeader>

            <div
              className="mt-6 text-sm text-gray-800 task-tab-dialog-container"
              style={{ display: "block" }}
            >
              <div
                className="grid gap-6 task-tab-dialog-grid"
                style={{
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateAreas: '"editable read-only"',
                }}
              >
                <div
                  className="space-y-4 editable-fields"
                  style={{ gridArea: "editable" }}
                >
                  <h3 className="text-lg font-semibold text-gray-700">
                    Editable Fields
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <div className="mt-1 rounded-md border p-2 bg-gray-50">
                        {new Date(
                          new Date(selectedTask.startDate).getTime() +
                            7 * 60 * 60 * 1000
                        ).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <div className="mt-1 rounded-md border p-2 bg-gray-50">
                        {new Date(
                          new Date(selectedTask.endDate).getTime() +
                            7 * 60 * 60 * 1000
                        ).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">
                      Total Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={editTaskData.TotalDuration}
                      min={editTaskData.TaskType === "Simple" ? 30 : 180}
                      max={editTaskData.TaskType === "Simple" ? 179 : undefined}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        const taskType = editTaskData.TaskType;

                        const min = taskType === "Simple" ? 30 : 180;
                        const max = taskType === "Simple" ? 179 : Infinity;

                        if (value >= min && value <= max) {
                          setEditTaskData({
                            ...editTaskData,
                            TotalDuration: value,
                          });
                        } else {
                          toast.error(
                            `Total Duration for '${taskType}' must be between ${min} and ${
                              max === Infinity ? "∞" : max
                            } minutes.`
                          );
                        }
                      }}
                      disabled={
                        editTaskData.TaskTypeId !== 2 &&
                        editTaskData.TaskTypeId !== 3
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700">
                      Task Type
                    </label>
                    <select
                      value={editTaskData.TaskType}
                      onChange={(e) => {
                        const selectedType = e.target.value;
                        const currentDuration = editTaskData.TotalDuration;

                        const isValidDuration =
                          (selectedType === "Simple" &&
                            currentDuration >= 30 &&
                            currentDuration < 180) ||
                          (selectedType === "Complex" &&
                            currentDuration >= 180);

                        if (!isValidDuration) {
                          const newDuration =
                            selectedType === "Simple" ? 30 : 180;
                          toast.info(
                            `Invalid duration for type '${selectedType}'. Updated to ${newDuration} minutes.`
                          );
                          setEditTaskData({
                            ...editTaskData,
                            TaskType: selectedType,
                            TaskTypeId: taskTypeIdMap[selectedType],
                            TotalDuration: newDuration,
                          });
                        } else {
                          setEditTaskData({
                            ...editTaskData,
                            TaskType: selectedType,
                            TaskTypeId: taskTypeIdMap[selectedType],
                          });
                        }
                      }}
                      disabled={
                        editTaskData.TaskTypeId !== 2 &&
                        editTaskData.TaskTypeId !== 3
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Simple">Simple (30 - 180 minutes)</option>
                      <option value="Complex">
                        Complex (Above 180 minutes)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Note
                    </label>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">
                      {selectedTask.taskNote ? (
                        selectedTask.taskNote
                      ) : (
                        <span className="text-gray-400 italic">
                          There are no notes
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Result
                    </label>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">
                      {selectedTask.taskResult ? (
                        isValidUrl(selectedTask.taskResult) ? (
                          <div className="space-y-2">
                            <a
                              href={selectedTask.taskResult}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {selectedTask.taskResult}
                            </a>
                            {selectedTask.taskResult.match(
                              /\.(jpeg|jpg|png|gif)$/i
                            ) && (
                              <img
                                src={selectedTask.taskResult}
                                alt="Task Result Preview"
                                className="max-w-full h-auto rounded"
                              />
                            )}
                            {selectedTask.taskResult.match(/\.pdf$/i) && (
                              <iframe
                                src={selectedTask.taskResult}
                                title="Task Result PDF"
                                className="w-full h-64 border rounded"
                              ></iframe>
                            )}
                          </div>
                        ) : (
                          <span>{selectedTask.taskResult}</span>
                        )
                      ) : (
                        <span className="text-gray-400 italic">
                          No result available
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="space-y-4 read-only-fields"
                  style={{ gridArea: "read-only" }}
                >
                  <h3 className="text-lg font-semibold text-gray-700">
                    Read-Only Fields
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tree
                    </label>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">
                      {selectedTask.userTreeName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">
                      {
                        {
                          0: "Not Started",
                          1: "In Progress",
                          2: "Paused",
                          3: "Completed",
                          4: "Expired",
                          5: "Canceled",
                        }[selectedTask.status]
                      }
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Focus Method
                    </label>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50 mt-0">
                      {selectedTask.focusMethodName}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Work Duration
                      </label>
                      <div className="mt-1 rounded-md border p-2 bg-gray-50">
                        {selectedTask.workDuration} minutes
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Break Time
                      </label>
                      <div className="mt-1 rounded-md border p-2 bg-gray-50">
                        {selectedTask.breakTime} minutes
                      </div>
                    </div>
                  </div>

                  {selectedTask.remainingTime !== null && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Remaining Time
                      </label>
                      <div className="mt-1 rounded-md border p-2 bg-gray-50">
                        {formatTime(
                          parseTimeToSeconds(selectedTask.remainingTime)
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={async () => {
                  try {
                    await DeleteTaskById(selectedTask.taskId);
                    toast.success("Task deleted!");
                    setIsDialogOpen(false);
                  } catch (err) {
                    console.error("Delete failed:", err);
                    toast.error("Failed to delete task.");
                  }
                }}
                className="bg-red-500 text-white hover:bg-red-700"
              >
                Delete
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const payload = {
                      TotalDuration: editTaskData.TotalDuration,
                      TaskTypeId: taskTypeIdMap[editTaskData.TaskType],
                    };

                    await UpdateTaskById2(selectedTask.taskId, payload);
                    toast.success("Task updated!");
                    setIsDialogOpen(false);
                  } catch (err) {
                    console.error("Update failed:", err);
                    toast.error("Failed to update task.");
                  }
                }}
                disabled={
                  selectedTask?.status !== 0 && selectedTask?.status !== 3
                }
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
