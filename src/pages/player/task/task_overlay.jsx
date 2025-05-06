import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react"; // Import icon spinner
import {
  GetTaskByUserTreeId,
  PauseTask,
  StartTask,
  CompleteTask,
} from "@/services/apiServices/taskService";
import "../task/index.css";

export default function TaskOverlay({
  positionClass = "fixed top-4 left-4 z-50 mt-20",
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [timers, setTimers] = useState({});
  const [loadingTaskKey, setLoadingTaskKey] = useState(null); // Theo dõi loading
  const intervalRefs = useRef({});

  // Hàm định dạng thời gian từ giây sang phút:giây
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

    setLoadingTaskKey("fetch-tasks"); // Bắt đầu loading
    try {
      const selectedTreeId = localStorage.getItem("selectedTreeId");
      if (selectedTreeId) {
        const taskData = await GetTaskByUserTreeId(selectedTreeId);
        const runningTasks = taskData
          .filter((task) => task.status === 1 || task.status === 2)
          .map((task) => ({
            taskId: task.taskId,
            taskName: task.taskName,
            totalDuration: task.totalDuration,
            workDuration: task.workDuration,
            breakTime: task.breakTime,
            remainingTime: convertToMinutes(task.remainingTime) * 60,
            status: task.status,
            taskTypeName: task.taskTypeName,
          }));
        setTasks(runningTasks);

        // Khởi tạo timers cho các task đang chạy
        const newTimers = {};
        runningTasks.forEach((task, index) => {
          const taskKey = `overlay-${index}`;
          newTimers[taskKey] = {
            isWorkPhase: true,
            currentWorkTime: task.workDuration * 60,
            currentBreakTime: task.breakTime * 60,
            remainingTime: task.remainingTime,
            overdueTime: 0,
            isRunning: task.status === 1,
            totalWorkCompleted: 0,
            totalBreakCompleted: 0,
          };
        });
        setTimers(newTimers);
      }
    } catch (error) {
      console.error("Failed to fetch running tasks", error);
    } finally {
      setLoadingTaskKey(null); // Kết thúc loading
    }
  };

  // Helper chuyển thời gian kiểu "00:30:00" thành phút
  const convertToMinutes = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
  };

  // Lấy danh sách task khi component mount
  useEffect(() => {
    fetchRunningTasks();
  }, []);

  // Logic timer
  useEffect(() => {
    Object.keys(timers).forEach((taskKey) => {
      const [columnKey, index] = taskKey.split("-");
      const task = tasks[index];

      if (!task || !timers[taskKey].isRunning) return;

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
            setTasks((prevTasks) =>
              prevTasks.map((t, i) =>
                i === parseInt(index)
                  ? { ...t, status: 4, remainingTime: 0 }
                  : t
              )
            );
            clearInterval(intervalRefs.current[taskKey]);
            return {
              ...prev,
              [taskKey]: { ...timer, isRunning: false },
            };
          }

          setTasks((prevTasks) =>
            prevTasks.map((t, i) =>
              i === parseInt(index) ? { ...t, remainingTime } : t
            )
          );

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
    });

    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
      intervalRefs.current = {};
    };
  }, [timers, tasks]);

  // Toggle timer (Pause/Resume)
  const toggleTimer = async (index) => {
    const task = tasks[index];
    const taskKey = `overlay-${index}`;

    setLoadingTaskKey(taskKey); // Bắt đầu loading cho task cụ thể
    try {
      if (timers[taskKey]?.isRunning) {
        // Pause
        await PauseTask(task.taskId);
        setTimers((prev) => ({
          ...prev,
          [taskKey]: { ...prev[taskKey], isRunning: false },
        }));
        setTasks((prev) =>
          prev.map((t, i) => (i === index ? { ...t, status: 2 } : t))
        );
        clearInterval(intervalRefs.current[taskKey]);
        delete intervalRefs.current[taskKey];
      } else {
        // Resume
        await StartTask(task.taskId);
        setTimers((prev) => ({
          ...prev,
          [taskKey]: {
            ...prev[taskKey],
            isRunning: true,
            isWorkPhase: true,
            currentWorkTime: task.workDuration * 60,
            currentBreakTime: task.breakTime * 60,
          },
        }));
        setTasks((prev) =>
          prev.map((t, i) => (i === index ? { ...t, status: 1 } : t))
        );
      }
    } catch (error) {
      console.error("Failed to toggle task:", error);
    } finally {
      setLoadingTaskKey(null); // Kết thúc loading
    }
  };

  // Hoàn thành task
  const handleCompleteTask = async (taskId, index) => {
    const taskKey = `overlay-${index}`;
    setLoadingTaskKey(taskKey); // Bắt đầu loading cho task cụ thể
    try {
      const selectedTreeId = localStorage.getItem("selectedTreeId");
      await CompleteTask(taskId, selectedTreeId);
      setTasks((prev) =>
        prev.map((t, i) => (i === index ? { ...t, status: 3 } : t))
      );
      clearInterval(intervalRefs.current[taskKey]);
      setTimers((prev) => ({
        ...prev,
        [taskKey]: { ...prev[taskKey], isRunning: false },
      }));
    } catch (error) {
      console.error("Failed to complete task:", error);
    } finally {
      setLoadingTaskKey(null); // Kết thúc loading
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200 ${
        isCollapsed ? "p-1" : "p-3"
      } ${positionClass}`}
      style={{ width: isCollapsed ? "32px" : "400px" }} // Đặt chiều rộng cho nút thu gọn overlay
    >
      {/* Nội dung chính */}
      {!isCollapsed && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800">Running Tasks</h3>
            {/* Nút Chevron nằm bên phải tiêu đề */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 bg-transparent text-gray-500 hover:bg-gray-100"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
          </div>
          {loadingTaskKey === "fetch-tasks" ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-xs text-gray-600">No tasks running</p>
          ) : (
            tasks.map((task, index) => {
              const taskKey = `overlay-${index}`;
              const timer = timers[taskKey] || {};
              const {
                isWorkPhase = true,
                currentWorkTime = task.workDuration * 60,
                currentBreakTime = task.breakTime * 60,
                remainingTime = task.remainingTime,
                totalWorkCompleted = 0,
                totalBreakCompleted = 0,
              } = timer;

              const totalDurationSeconds = task.totalDuration * 60;
              const cycleDuration = (task.workDuration + task.breakTime) * 60;
              const elapsedTime = totalDurationSeconds - remainingTime;
              const completedCycles = Math.floor(elapsedTime / cycleDuration);
              const timeInCurrentCycle = elapsedTime % cycleDuration;

              // Tạo mảng các phase để render thanh tiến độ
              const phases = [];
              for (let i = 0; i < completedCycles; i++) {
                phases.push({
                  type: "work",
                  duration: task.workDuration * 60,
                });
                phases.push({ type: "break", duration: task.breakTime * 60 });
              }
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

              const isAlmostDone = remainingTime <= 120 && remainingTime > 0;
              const isLoading = loadingTaskKey === taskKey;

              return (
                <Card
                  key={task.taskId}
                  className="task-item flex justify-between p-3"
                >
                  <div className="flex-1 flex flex-col justify-between text-left">
                    <span className="text-gray-700 font-medium">
                      {task.taskName}
                    </span>
                    <div className="flex flex-col gap-1 text-left">
                      <span
                        className={`text-sm ${
                          remainingTime <= 0 ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {remainingTime <= 0
                          ? `Overdue: ${formatTime(timer.overdueTime || 0)}`
                          : `Remaining: ${formatTime(remainingTime)}`}
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
                                  (phase.duration / totalDurationSeconds) * 100
                                }%`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      {task.status !== 3 &&
                        task.status !== 4 &&
                        remainingTime > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {isWorkPhase ? (
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
                      <span className="text-sm text-green-600">Done</span>
                    ) : task.status === 4 ? (
                      <span className="text-sm text-red-600">Expired</span>
                    ) : (
                      <>
                        {isAlmostDone && (
                          <Button
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50 flex items-center gap-2"
                            onClick={() =>
                              handleCompleteTask(task.taskId, index)
                            }
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Complete"
                            )}
                          </Button>
                        )}
                        <Button
                          onClick={() => toggleTimer(index)}
                          className={
                            timer.isRunning
                              ? "bg-yellow-500 hover:bg-yellow-600 flex items-center gap-2"
                              : "bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                          }
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : timer.isRunning ? (
                            "Pause"
                          ) : (
                            "Resume"
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 bg-transparent text-gray-500 hover:bg-gray-100"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
