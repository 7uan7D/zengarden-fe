import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button"; // Thêm Button để làm tab
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import MusicPlayerController, {
  FullMusicPlayer,
  globalAudioState,
} from "../../../components/musicPlayerController/index.jsx";
import "../home/index.css";
import QuillEditor from "@/components/quill_js/index.jsx";
import VideoPlayer from "@/components/react_player/index.jsx";
import PDFEditor from "@/components/react_pdf/index.jsx";
import { GetTaskByUserTreeId } from "@/services/apiServices/taskService";
import "../workspace/index.css";

// Danh sách cây mẫu trong vườn
const gardenTrees = [
  { id: 1, name: "Oak", image: "/tree-1.png" },
  { id: 2, name: "Birch", image: "/tree-2.png" },
  { id: 3, name: "Maple", image: "/tree-3.png" },
  { id: 4, name: "Pine", image: "/tree-4.png" },
  { id: 5, name: "Willow", image: "/tree-5.png" },
  { id: 6, name: "Cedar", image: "/tree-6.png" },
];

// Danh sách công việc mẫu
const initialTasks = [
  { id: 1, title: "Complete project proposal", completed: false },
  { id: 2, title: "Review team feedback", completed: true },
  { id: 3, title: "Prepare presentation", completed: false },
];

export default function Workspace() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại
  const [isPlaying, setIsPlaying] = useState(globalAudioState.isPlaying); // Trạng thái phát nhạc trên UI
  const [currentIndex, setCurrentIndex] = useState(globalAudioState.currentIndex); // Chỉ số bài hát trên UI
  const [activeTab, setActiveTab] = useState("Your Space"); // State để quản lý tab hiện tại

  // Gán callback để MusicPlayerController có thể cập nhật UI
  globalAudioState.setPlaying = setIsPlaying;
  globalAudioState.setCurrentIndex = setCurrentIndex;

  // Hàm chuyển đổi trạng thái hoàn thành của công việc
  const handleTaskToggle = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Kiểm tra xem có đang ở trang Workspace không
  const isWorkspacePage = location.pathname === "/workspace";

  // Danh sách các tab
  const tabs = ["Your Space", "Rich Text", "Watch Videos", "PDF Editor", "Image Editor"];

  // Hàm lấy danh sách task
  const fetchTasks = async (userTreeId) => {
    try {
      const taskData = await GetTaskByUserTreeId(userTreeId);
      setTasks(taskData.filter((task) => task.taskTypeName === "Simple")); // Chỉ lấy Simple Tasks
      const urlParams = new URLSearchParams(location.search);
      const taskId = urlParams.get("taskId");
      const runningTask = taskData.find((task) => task.taskId === parseInt(taskId));
      if (runningTask && runningTask.status === 1) {
        setCurrentTask({
          column: "simple",
          taskIndex: taskData.indexOf(runningTask),
          time: runningTask.totalDuration * 60, // Giả sử bắt đầu từ đầu
        });
        setIsRunning(true);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userTreeId = urlParams.get("userTreeId");
    if (userTreeId) {
      fetchTasks(userTreeId);
    }
  }, [location]);
  //chạy Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTask && isRunning && currentTask.time > 0) {
        setCurrentTask((prev) => ({
          ...prev,
          time: prev.time - 1,
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
//code bên Tasks
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };
  
  const toggleTimer = (taskIndex) => {
    const task = tasks[taskIndex];
    if (isRunning) {
      setTasks((prev) =>
        prev.map((t, idx) =>
          idx === taskIndex ? { ...t, status: 2 } : t
        )
      );
      setIsRunning(false);
    } else {
      setTasks((prev) =>
        prev.map((t, idx) =>
          idx === taskIndex ? { ...t, status: 1 } : t
        )
      );
      setCurrentTask({
        column: "simple",
        taskIndex,
        time: task.remainingTime
          ? task.remainingTime * 60
          : task.totalDuration * 60,
      });
      setIsRunning(true);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col p-6 bg-gray-100 mt-20"
      style={{
        backgroundImage:
          "url('https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/15/d1/80/15d1804a-1594-b708-3e90-a651a3216e4d/1968720970920101.jpg/3840x2160mv.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Tiêu đề Workspace */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Workspace
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 justify-center">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              className={`${activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-white/80 text-gray-700 hover:bg-gray-200"
                } transition-all`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Nội dung của các tab */}
      <div className="flex flex-1 gap-6">
        {activeTab === "Your Space" && (
          <>
            {/* Danh sách công việc */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-1/3"
            >
              <Card className="bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Simple Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {tasks.map((task, index) => {
                      const totalDurationSeconds = task.totalDuration * 60;
                      const isCurrentTask =
                        currentTask &&
                        currentTask.column === "simple" &&
                        currentTask.taskIndex === index;
                      const remainingTime = isCurrentTask
                        ? currentTask.time
                        : totalDurationSeconds;
                      const isTaskRunning = isCurrentTask && isRunning;
                      const isAlmostDone = remainingTime <= 10 && remainingTime > 0;

                      return (
                        <li
                          key={task.taskId}
                          className="flex justify-between items-center p-2 bg-gray-100 rounded-lg"
                        >
                          <div className="flex-1">
                            <span
                              className={`font-medium ${task.status === 4 ? "line-through text-gray-500" : ""
                                }`}
                            >
                              {task.taskName}
                            </span>
                            <div className="text-sm text-gray-600">
                              Remaining: {formatTime(remainingTime)}
                              {task.status === 4 && (
                                <span className="text-sm text-green-600 ml-2">
                                  Done
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.status === 1 ? (
                              <Button onClick={() => toggleTimer(index)}>
                                Pause
                              </Button>
                            ) : task.status === 2 ? (
                              <Button onClick={() => toggleTimer(index)}>
                                Resume
                              </Button>
                            ) : task.status === 0 ? (
                              <Button disabled={currentTask !== null}>
                                Start
                              </Button>
                            ) : (
                              <span className="text-sm text-green-600">Done</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Khu vực vườn cây */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex-1"
            >
              <Card className="bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Garden</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {gardenTrees.map((tree) => (
                      <div
                        key={tree.id}
                        className="flex flex-col items-center p-4 bg-gray-100 rounded-lg"
                      >
                        <img
                          src={tree.image}
                          alt={tree.name}
                          className="w-20 h-20 mb-2"
                          onError={(e) => {
                            e.target.src =
                              "https://media.istockphoto.com/id/537418258/vector/tree.jpg?s=612x612&w=0&k=20&c=YMdnc5cGziKA9Aaxq4MVgwcHBs2gajeBZ33bf9FfdZ8=";
                          }}
                        />
                        <p className="text-sm font-semibold">{tree.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Máy phát nhạc */}
            {isWorkspacePage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-1/4"
              >
                <Card className="bg-white/80 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle>Music Player</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FullMusicPlayer
                      setPlaying={setIsPlaying}
                      setCurrentIndex={setCurrentIndex}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {/* Các tab khác để trống */}
        {activeTab === "Rich Text" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md">

              <CardContent className="mt-4">
                <QuillEditor />
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "Watch Videos" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Watch Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer />
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "PDF Editor" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>PDF</CardTitle>
                <PDFEditor />
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Content coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "Image Editor" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Pintura</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Content coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}