import { createContext, useContext, useState, useEffect } from "react";

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [currentTask, setCurrentTask] = useState(null); // Task đang chạy
  const [isRunning, setIsRunning] = useState(false); // Trạng thái chạy/pause
  const [tasks, setTasks] = useState({
    daily: [],
    simple: [],
    complex: [],
  }); // Danh sách tasks

  // Đồng bộ từ localStorage khi khởi tạo
  useEffect(() => {
    const savedTask = localStorage.getItem("currentTask");
    const savedRunning = localStorage.getItem("isRunning");
    const savedTasks = localStorage.getItem("tasks");
    if (savedTask) {
      setCurrentTask(JSON.parse(savedTask));
    }
    if (savedRunning) {
      setIsRunning(JSON.parse(savedRunning));
    }
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Lưu trạng thái vào localStorage khi thay đổi
  useEffect(() => {
    if (currentTask) {
      localStorage.setItem("currentTask", JSON.stringify(currentTask));
    } else {
      localStorage.removeItem("currentTask");
    }
    localStorage.setItem("isRunning", JSON.stringify(isRunning));
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [currentTask, isRunning, tasks]);

  // Logic chạy timer
  useEffect(() => {
    let interval;
    if (isRunning && currentTask && currentTask.time > 0) {
      interval = setInterval(() => {
        setCurrentTask((prev) => {
          if (!prev) return null;
          const newTime = prev.time - 1;
          if (newTime <= 0) {
            setTasks((prevTasks) => {
              const updated = { ...prevTasks };
              updated[prev.column] = [...updated[prev.column]];
              updated[prev.column][prev.taskIndex] = {
                ...updated[prev.column][prev.taskIndex],
                status: 4, // Hoàn thành
              };
              return updated;
            });
            return null; // Xóa currentTask khi hết thời gian
          }
          return { ...prev, time: newTime };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentTask]);

  return (
    <TimerContext.Provider
      value={{
        currentTask,
        setCurrentTask,
        isRunning,
        setIsRunning,
        tasks,
        setTasks,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);