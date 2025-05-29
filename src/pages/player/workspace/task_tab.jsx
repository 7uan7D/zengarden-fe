import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Circle, CircleCheckBig, CircleX } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import "../task/index.css";

// Dữ liệu cứng cho 3 cột task
const sampleTasks = {
  simple: [
    {
      taskId: 1,
      taskName: "Learn React Basics",
      taskDescription: "Study React hooks and components",
      startDate: "2025-05-20T09:00:00.000Z",
      endDate: "2025-05-20T12:00:00.000Z",
      status: 0, // Not Started
      focusMethodName: "Pomodoro",
      totalDuration: 60,
      workDuration: 25,
      breakTime: 5,
      userTreeName: "Oak Tree",
      taskTypeName: "Simple",
      taskNote: "Focus on useState and useEffect",
      taskResult: null,
      remainingTime: 60 * 60, // 60 minutes in seconds
      priority: 1,
    },
    {
      taskId: 2,
      taskName: "Write Documentation",
      taskDescription: "Document project setup process",
      startDate: "2025-05-20T10:00:00.000Z",
      endDate: "2025-05-20T14:00:00.000Z",
      status: 1, // In Progress
      focusMethodName: "Pomodoro",
      totalDuration: 90,
      workDuration: 25,
      breakTime: 5,
      userTreeName: "Oak Tree",
      taskTypeName: "Simple",
      taskNote: null,
      taskResult: null,
      remainingTime: 45 * 60, // 45 minutes in seconds
      priority: 2,
    },
    {
      taskId: 3,
      taskName: "Review Code",
      taskDescription: "Check pull request for bugs",
      startDate: "2025-05-19T08:00:00.000Z",
      endDate: "2025-05-19T12:00:00.000Z",
      status: 3, // Completed
      focusMethodName: "Pomodoro",
      totalDuration: 120,
      workDuration: 25,
      breakTime: 5,
      userTreeName: "Oak Tree",
      taskTypeName: "Simple",
      taskNote: "Found and fixed 2 bugs",
      taskResult: "https://example.com/review.pdf",
      remainingTime: 0,
      priority: 3,
    },
  ],
  complex: [
    {
      taskId: 4,
      taskName: "Build Backend API",
      taskDescription: "Develop RESTful API with Node.js",
      startDate: "2025-05-20T09:00:00.000Z",
      endDate: "2025-05-22T17:00:00.000Z",
      status: 0, // Not Started
      focusMethodName: "Deep Work",
      totalDuration: 240,
      workDuration: 90,
      breakTime: 15,
      userTreeName: "Pine Tree",
      taskTypeName: "Complex",
      taskNote: null,
      taskResult: null,
      remainingTime: 240 * 60, // 60 minutes in seconds
      priority: 1,
    },
    {
      taskId: 5,
      taskName: "Database Optimization",
      taskDescription: "Optimize SQL queries for performance",
      startDate: "2025-05-20T10:00:00.000Z",
      endDate: "2025-05-23T17:00:00.000Z",
      status: 2, // Paused
      focusMethodName: "Deep Work",
      totalDuration: 300,
      workDuration: 90,
      breakTime: 15,
      userTreeName: "Pine Tree",
      taskTypeName: "Complex",
      taskNote: "Reduced query time by 20%",
      taskResult: null,
      remainingTime: 150 * 60, // 150 minutes in seconds
      priority: 2,
    },
    {
      taskId: 6,
      taskName: "Deploy Application",
      taskDescription: "Set up CI/CD pipeline",
      startDate: "2025-05-18T09:00:00.000Z",
      endDate: "2025-05-20T17:00:00.000Z",
      status: 4, // Expired
      focusMethodName: "Deep Work",
      totalDuration: 180,
      workDuration: 90,
      breakTime: 15,
      userTreeName: "Pine Tree",
      taskTypeName: "Complex",
      taskNote: null,
      taskResult: null,
      remainingTime: 0,
      priority: 3,
    },
  ],
  challenge: [
    {
      taskId: 7,
      taskName: "Hackathon Project",
      taskDescription: "Build a full-stack app in 48 hours",
      startDate: "2025-05-21T08:00:00.000Z",
      endDate: "2025-05-23T20:00:00.000Z",
      status: 0, // Not Started
      focusMethodName: "Intense Sprint",
      totalDuration: 480,
      workDuration: 120,
      breakTime: 30,
      userTreeName: "Maple Tree",
      taskTypeName: "Challenge",
      taskNote: null,
      taskResult: null,
      remainingTime: 480 * 60, // 480 minutes in seconds
      priority: 1,
    },
    {
      taskId: 8,
      taskName: "AI Model Training",
      taskDescription: "Train a machine learning model",
      startDate: "2025-05-20T09:00:00.000Z",
      endDate: "2025-05-24T17:00:00.000Z",
      status: 1, // In Progress
      focusMethodName: "Intense Sprint",
      totalDuration: 600,
      workDuration: 120,
      breakTime: 30,
      userTreeName: "Maple Tree",
      taskTypeName: "Challenge",
      taskNote: "Using TensorFlow",
      taskResult: null,
      remainingTime: 300 * 60, // 300 minutes in seconds
      priority: 2,
    },
    {
      taskId: 9,
      taskName: "Research Paper",
      taskDescription: "Write a paper on AI ethics",
      startDate: "2025-05-15T09:00:00.000Z",
      endDate: "2025-05-20T17:00:00.000Z",
      status: 3, // Completed
      focusMethodName: "Intense Sprint",
      totalDuration: 360,
      workDuration: 120,
      breakTime: 30,
      userTreeName: "Maple Tree",
      taskTypeName: "Challenge",
      taskNote: "Submitted to journal",
      taskResult: "https://example.com/paper.pdf",
      remainingTime: 0,
      priority: 3,
    },
    {
      taskId: 10,
      taskName: "Research Paper",
      taskDescription: "Write a paper on AI ethics",
      startDate: "2025-05-15T09:00:00.000Z",
      endDate: "2025-05-20T17:00:00.000Z",
      status: 3, // Completed
      focusMethodName: "Intense Sprint",
      totalDuration: 360,
      workDuration: 120,
      breakTime: 30,
      userTreeName: "Maple Tree",
      taskTypeName: "Challenge",
      taskNote: "Submitted to journal",
      taskResult: "https://example.com/paper.pdf",
      remainingTime: 0,
      priority: 3,
    }
  ],
};

export default function TaskTab({ userTreeId }) {
  const [activeTabs, setActiveTabs] = useState({
    simple: "all",
    complex: "all",
    challenge: "all",
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Hàm định dạng thời gian
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  // Hàm xác định nhãn độ ưu tiên
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

  // Hàm xác định trạng thái task
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

  // Hàm xử lý khi nhấp vào task
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  // Hàm hiển thị cột task
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

    // Tính chiều cao động cho cột
    const taskHeight = 95; // Chiều cao mỗi task (px)
    const gap = 12; // Khoảng cách giữa các task (px)
    const padding = 16 * 2; // Padding top + bottom (px)
    const calculatedHeight =
      sortedTasks.length > 0
        ? sortedTasks.length * taskHeight +
          (sortedTasks.length - 1) * gap +
          padding
        : 150; // Chiều cao tối thiểu nếu không có task

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
        >
          <div className="grid" style={{ minHeight: `${calculatedHeight}px` }}>
            {sortedTasks.length === 0 ? (
              <p className="text-gray-500 text-center">No tasks available</p>
            ) : (
              sortedTasks.map((task, index) => {
                const remainingTime = task.remainingTime || 0;
                const currentTaskStatus =
                  task.status === 1 ? 1 : task.status === 2 ? 2 : 0;

                // Tính toán progress bar
                const totalDurationSeconds = task.totalDuration * 60;
                const elapsedTime = totalDurationSeconds - remainingTime;
                const cycleDuration = (task.workDuration + task.breakTime) * 60;
                const completedCycles = Math.floor(elapsedTime / cycleDuration);
                const timeInCurrentCycle = elapsedTime % cycleDuration;

                const phases = [];
                for (let i = 0; i < completedCycles; i++) {
                  phases.push({
                    type: "work",
                    duration: task.workDuration * 60,
                  });
                  phases.push({
                    type: "break",
                    duration: task.breakTime * 60,
                  });
                }

                if (timeInCurrentCycle < task.workDuration * 60) {
                  phases.push({
                    type: "work",
                    duration: timeInCurrentCycle,
                  });
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
                      <div className="flex-1 flex flex-col justify-between text-left p-4">
                        <div>
                          <span className="text-gray-700 font-medium">
                            {task.taskName}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 text-left">
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
                                      (phase.duration / totalDurationSeconds) * 100
                                    }%`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          {task.status === 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="text-gray-400">Not Started</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 p-4">
                        {task.status === 0 ? (
                          <span
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "#6b7280" }}
                          >
                            <Circle className="w-4 h-4" />
                            Not Started
                          </span>
                        ) : (task.status === 1 || task.status === 2) ? (
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderTaskColumn("Simple Task", sampleTasks.simple, "simple")}
        {renderTaskColumn("Complex Task", sampleTasks.complex, "complex")}
        {renderTaskColumn("Challenge Task", sampleTasks.challenge, "challenge")}
      </div>
      {selectedTask && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <strong>Name:</strong> {selectedTask.taskName}
              </div>
              <div>
                <strong>Description:</strong> {selectedTask.taskDescription || "No description"}
              </div>
              <div>
                <strong>Start Date:</strong> {formatDateTime(selectedTask.startDate)}
              </div>
              <div>
                <strong>End Date:</strong> {formatDateTime(selectedTask.endDate)}
              </div>
              <div>
                <strong>Status:</strong> {getStatusLabel(selectedTask.status)}
              </div>
              <div>
                <strong>Focus Method:</strong> {selectedTask.focusMethodName}
              </div>
              <div>
                <strong>Total Duration:</strong> {selectedTask.totalDuration} minutes
              </div>
              <div>
                <strong>Priority:</strong> {getPriorityLabel(selectedTask.priority)}
              </div>
              <div>
                <strong>Note:</strong> {selectedTask.taskNote || "No note"}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsDialogOpen(false)}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}