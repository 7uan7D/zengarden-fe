import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { GetUserConfigByUserId } from "@/services/apiServices/userConfigService";
import parseJwt from "@/services/parseJwt.js";
import "../workspace/index.css";
import Pintura from "@/components/pintura/index.jsx";
import "@pqina/pintura/pintura.css";
import { openDefaultEditor } from "@pqina/pintura";

export default function Workspace() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(globalAudioState.isPlaying);
  const [currentIndex, setCurrentIndex] = useState(
    globalAudioState.currentIndex
  );
  const [activeTab, setActiveTab] = useState("Your Space");
  const [backgroundUrl, setBackgroundUrl] = useState("");

  /** State và ref cho Image Editor */
  const [editedImage, setEditedImage] = useState(null);
  const fileInputRef = useRef(null);

  /** Gán callback cho MusicPlayerController */
  globalAudioState.setPlaying = setIsPlaying;
  globalAudioState.setCurrentIndex = setCurrentIndex;

  useEffect(() => {
    setCurrentIndex(globalAudioState.currentIndex);
  }, [globalAudioState.currentIndex]);

  /** Hàm lấy danh sách task */
  const fetchTasks = async (userTreeId) => {
    try {
      const taskData = await GetTaskByUserTreeId(userTreeId);
      setTasks(taskData.filter((task) => task.taskTypeName === "Simple"));
      const urlParams = new URLSearchParams(location.search);
      const taskId = urlParams.get("taskId");
      const runningTask = taskData.find(
        (task) => task.taskId === parseInt(taskId)
      );
      if (runningTask && runningTask.status === 1) {
        setCurrentTask({
          column: "simple",
          taskIndex: taskData.indexOf(runningTask),
          time: runningTask.totalDuration * 60,
        });
        setIsRunning(true);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  /** Lấy cấu hình người dùng (background) */
  useEffect(() => {
    const fetchUserConfig = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = parseJwt(token)?.sub;
        const config = await GetUserConfigByUserId(userId);
        if (config?.backgroundConfig) {
          setBackgroundUrl(config.backgroundConfig);
        }
      } catch (error) {
        console.error("❌ Failed to fetch user config:", error);
      }
    };
    fetchUserConfig();
  }, []);

  /** Lấy task dựa trên userTreeId từ URL */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userTreeId = urlParams.get("userTreeId");
    if (userTreeId) {
      fetchTasks(userTreeId);
    }
  }, [location]);

  /** Logic chạy Timer cho task */
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

  /** Định dạng thời gian cho timer */
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  /** Toggle timer cho task */
  const toggleTimer = (taskIndex) => {
    const task = tasks[taskIndex];
    if (isRunning) {
      setTasks((prev) =>
        prev.map((t, idx) => (idx === taskIndex ? { ...t, status: 2 } : t))
      );
      setIsRunning(false);
    } else {
      setTasks((prev) =>
        prev.map((t, idx) => (idx === taskIndex ? { ...t, status: 1 } : t))
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

  /** Mở Pintura Image Editor */
  const openImageEditor = (file) => {
    const editor = openDefaultEditor({
      src: file,
      imageCropAspectRatio: 1,
      onProcess: ({ dest }) => {
        const editedUrl = URL.createObjectURL(dest);
        setEditedImage(editedUrl);
      },
    });
    editor.on("close", () => {});
  };

  /** Xử lý khi chọn file ảnh */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      openImageEditor(file);
    }
  };

  /** Kích hoạt input file */
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  /** Component đồng hồ hiển thị thời gian hiện tại */
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

  return (
    <div
      className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-green-100 to-green-200 mt-20 relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Trang trí lá cây */}
      <div className="absolute top-0 left-0 w-full h-24 bg-[url('/leaf-pattern.png')] bg-repeat-x opacity-30 pointer-events-none" />

      {/* Tiêu đề và Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 z-10"
      >
        {/* Đồng hồ hiển thị thời gian hiện tại */}
        <Clock />
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          {[
            "Your Space",
            "Rich Text",
            "Watch Videos",
            "PDF Reader",
            "Image Editor",
          ].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                activeTab === tab
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-amber-100 text-green-800 border-2 border-green-300 hover:bg-green-200"
              }`}
              onClick={() => setActiveTab(tab)}
              style={{
                clipPath:
                  "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)",
              }}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Nội dung chính */}
      <div className="flex flex-1 flex-col gap-6 z-10">
        {activeTab === "Your Space" && (
          <div className="flex gap-6">
            {/* Khu vực Task - Chiếm 25% chiều rộng, bên trái */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-1/4"
            >
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-green-700">
                    Simple Tasks
                  </CardTitle>
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
                      return (
                        <li
                          key={task.taskId}
                          className="flex justify-between items-center p-2 bg-gray-100 rounded-lg"
                        >
                          <div className="flex-1">
                            <span
                              className={`font-medium ${
                                task.status === 4
                                  ? "line-through text-gray-500"
                                  : ""
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
                              <Button
                                onClick={() => toggleTimer(index)}
                                disabled={currentTask !== null}
                              >
                                Start
                              </Button>
                            ) : (
                              <span className="text-sm text-green-600">
                                Done
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Không gian trống bên phải */}
            <div className="flex-1"></div>

            {/* Music Player - Đặt ở dưới, chiếm 98% chiều ngang, không sát đáy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute bottom-16 w-[98%] mx-auto"
            >
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardContent className="p-1">
                  <FullMusicPlayer
                    setPlaying={setIsPlaying}
                    setCurrentIndex={setCurrentIndex}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Tab Rich Text */}
        {activeTab === "Rich Text" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
              <CardContent className="mt-4">
                <QuillEditor />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Watch Videos */}
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

        {/* Tab PDF Editor */}
        {activeTab === "PDF Reader" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
              <CardContent>
                <PDFEditor />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Image Editor */}
        {activeTab === "Image Editor" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">
                  Pintura Image Editor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleUploadClick}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Upload Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {editedImage && (
                    <div className="mt-4">
                      <p className="text-green-700 font-medium">
                        Edited Image:
                      </p>
                      <img
                        src={editedImage}
                        alt="Edited"
                        className="max-w-full h-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <Pintura />
            </Card>
          </div>
        )}
      </div>

      {/* Trang trí ánh sáng nền */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-300/30 to-transparent pointer-events-none" />
    </div>
  );
}