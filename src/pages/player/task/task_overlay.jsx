import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTreeExperience } from "@/context/TreeExperienceContext";
import { GetTaskByUserTreeId } from "@/services/apiServices/taskService";
import { PauseTask, StartTask } from "@/services/apiServices/taskService";
import "../task/index.css";

export default function TaskOverlay({ positionClass = "fixed top-4 left-4 z-50 mt-20" }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const { treeExp, refreshTreeExp } = useTreeExperience();

  // Hàm định dạng thời gian
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Lấy danh sách task đang chạy (status === 1)
  const fetchRunningTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const selectedTreeId = localStorage.getItem("selectedTreeId");
      if (selectedTreeId) {
        const taskData = await GetTaskByUserTreeId(selectedTreeId);
        const runningTasks = taskData.filter((task) => task.status === 1);
        setTasks(runningTasks);
      }
    } catch (error) {
      console.error("Failed to fetch running tasks", error);
    }
  };

  // Cập nhật danh sách task khi component mount
  useEffect(() => {
    fetchRunningTasks();
  }, []);

  // Logic timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTask && isRunning && currentTask.time > 0) {
        const now = Date.now();
        const elapsed = Math.floor((now - currentTask.lastUpdated) / 1000);
        setCurrentTask((prev) => ({
          ...prev,
          time: Math.max(prev.time - elapsed, 0),
          lastUpdated: now,
        }));
      } else if (currentTask && currentTask.time === 0) {
        setTasks((prev) =>
          prev.map((task, index) =>
            index === currentTask.taskIndex ? { ...task, status: 4 } : task
          )
        );
        setCurrentTask(null);
        setIsRunning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTask, isRunning]);

  // Toggle timer (Pause/Resume)
  const toggleTimer = async (taskIndex) => {
    const task = tasks[taskIndex];
    const totalDurationSeconds = task.totalDuration * 60;

    if (isRunning && currentTask?.taskIndex === taskIndex) {
      // Pause
      try {
        await PauseTask(task.taskId);
        setTasks((prev) =>
          prev.map((t, i) =>
            i === taskIndex ? { ...t, status: 2 } : t
          )
        );
        setCurrentTask((prev) => ({
          ...prev,
          lastUpdated: Date.now(),
        }));
        setIsRunning(false);
      } catch (error) {
        console.error("Failed to pause task:", error);
      }
    } else {
      // Resume
      try {
        await StartTask(task.taskId);
        setTasks((prev) =>
          prev.map((t, i) =>
            i === taskIndex ? { ...t, status: 1 } : t
          )
        );
        const initialTime = task.remainingTime
          ? typeof task.remainingTime === "string"
            ? timeStringToSeconds(task.remainingTime)
            : task.remainingTime * 60
          : totalDurationSeconds;

        setCurrentTask({
          taskIndex,
          time: initialTime,
          totalTime: totalDurationSeconds,
          workDuration: task.workDuration * 60,
          breakTime: task.breakTime * 60,
          lastUpdated: Date.now(),
        });
        setIsRunning(true);
      } catch (error) {
        console.error("Failed to resume task:", error);
      }
    }
  };

  // Chuyển đổi thời gian từ chuỗi sang giây
  const timeStringToSeconds = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  return (
    <div
      className={`flex flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200 p-3 ${positionClass}`}
    >
      {/* Nút thu gọn/mở rộng */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 bg-transparent text-gray-500 hover:bg-gray-100 self-end"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Nội dung chính */}
      {!isCollapsed && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-gray-800">Running Tasks</h3>
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-600">No tasks running</p>
          ) : (
            tasks.map((task, index) => {
              const totalDurationSeconds = task.totalDuration * 60;
              const isCurrentTask = currentTask && currentTask.taskIndex === index;
              const remainingTime = isCurrentTask
                ? currentTask.time
                : task.remainingTime
                ? typeof task.remainingTime === "string"
                  ? timeStringToSeconds(task.remainingTime)
                  : task.remainingTime * 60
                : totalDurationSeconds;

              const workDurationSeconds = task.workDuration * 60;
              const breakTimeSeconds = task.breakTime * 60;
              const cycleDuration = workDurationSeconds + breakTimeSeconds;
              const completedCycles = Math.floor(
                (totalDurationSeconds - remainingTime) / cycleDuration
              );
              const remainingInCycle =
                (totalDurationSeconds - remainingTime) % cycleDuration;

              const workProgress =
                (task.workDuration / task.totalDuration) *
                100 *
                (completedCycles +
                  (remainingInCycle < workDurationSeconds
                    ? remainingInCycle / workDurationSeconds
                    : 1));
              const breakProgress =
                (task.breakTime / task.totalDuration) *
                100 *
                (completedCycles +
                  (remainingInCycle >= workDurationSeconds
                    ? (remainingInCycle - workDurationSeconds) / breakTimeSeconds
                    : 0));

              const isAlmostDone = remainingTime <= 10 && remainingTime > 0;

              return (
                <Card key={index} className="task-item">
                  <div className="flex-1 flex flex-col justify-between text-left">
                    <span className="text-gray-700 font-medium">
                      {task.taskName}
                    </span>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-sm text-gray-600">
                        Remaining: {formatTime(remainingTime)}
                      </span>
                      <div className="progress-bar-container">
                        <div className="progress-bar">
                          <div
                            className="work-progress"
                            style={{ width: `${Math.min(workProgress, 100)}%` }}
                          />
                          <div
                            className="break-progress"
                            style={{ width: `${Math.min(breakProgress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isCurrentTask && (
                      <span className="text-sm text-gray-600">
                        {remainingInCycle < workDurationSeconds
                          ? `Work: ${formatTime(
                              workDurationSeconds - remainingInCycle
                            )}`
                          : `Break: ${formatTime(
                              cycleDuration - remainingInCycle
                            )}`}
                      </span>
                    )}
                    {isAlmostDone ? (
                      <Button
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => {
                          setTaskToComplete({
                            taskId: task.taskId,
                            taskName: task.taskName,
                            columnKey: "overlay",
                            realIndex: index,
                          });
                          setIsConfirmDialogOpen(true);
                        }}
                      >
                        Complete
                      </Button>
                    ) : task.status === 1 ? (
                      <Button onClick={() => toggleTimer(index)}>
                        Pause
                      </Button>
                    ) : task.status === 2 ? (
                      <Button onClick={() => toggleTimer(index)}>
                        Resume
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Dialog xác nhận hoàn thành */}
      <ConfirmCompletionDialog
        isConfirmDialogOpen={isConfirmDialogOpen}
        setIsConfirmDialogOpen={setIsConfirmDialogOpen}
        taskToComplete={taskToComplete}
        setTaskToComplete={setTaskToComplete}
        selectedTree={{ userTreeId: localStorage.getItem("selectedTreeId") }}
        tasks={{ overlay: tasks }}
        setTasks={setTasks}
        currentTask={currentTask}
        setCurrentTask={setCurrentTask}
        setIsRunning={setIsRunning}
        refreshTreeExp={refreshTreeExp}
        currentTree={localStorage.getItem("selectedTreeId")}
        fetchTasks={fetchRunningTasks}
      />
    </div>
  );
}