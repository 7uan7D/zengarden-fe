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

// Danh sách cây
const gardenTrees = [
  { id: 1, name: "Oak", image: "/tree-1.png" },
  { id: 2, name: "Birch", image: "/tree-2.png" },
  { id: 3, name: "Maple", image: "/tree-3.png" },
  { id: 4, name: "Pine", image: "/tree-4.png" },
  { id: 5, name: "Willow", image: "/tree-5.png" },
  { id: 6, name: "Cedar", image: "/tree-6.png" },
];

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

  // State cho Image Editor
  const [editedImage, setEditedImage] = useState(null); // Lưu ảnh đã chỉnh sửa
  const fileInputRef = useRef(null); // Ref để kích hoạt input file

  // Gán callback cho MusicPlayerController
  globalAudioState.setPlaying = setIsPlaying;
  globalAudioState.setCurrentIndex = setCurrentIndex;

  useEffect(() => {
    setCurrentIndex(globalAudioState.currentIndex);
  }, [globalAudioState.currentIndex]);

  // Hàm lấy danh sách task
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

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userTreeId = urlParams.get("userTreeId");
    if (userTreeId) {
      fetchTasks(userTreeId);
    }
  }, [location]);

  // Logic chạy Timer
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

  // Hàm định dạng thời gian
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Hàm toggle timer
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

  // Hàm mở Pintura Image Editor
  const openImageEditor = (file) => {
    const editor = openDefaultEditor({
      src: file, // Ảnh được chọn từ input
      imageCropAspectRatio: 1, // Tỷ lệ cắt mặc định (có thể thay đổi)
      onProcess: ({ dest }) => {
        // Khi hoàn tất chỉnh sửa, lưu ảnh đã chỉnh sửa
        const editedUrl = URL.createObjectURL(dest);
        setEditedImage(editedUrl);
      },
    });
    editor.on("close", () => {
      // Xử lý khi editor đóng (nếu cần)
    });
  };

  // Hàm xử lý khi chọn file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      openImageEditor(file);
    }
  };

  // Hàm kích hoạt input file khi nhấn nút
  const handleUploadClick = () => {
    fileInputRef.current.click();
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

      {/* Tiêu đề Workspace */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 z-10"
      >
        <h1 className="text-4xl font-bold text-green-800 drop-shadow-lg text-center">
          Workspace
        </h1>

        {/* Tabs dạng lá cây */}
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

      {/* Nội dung của các tab */}
      <div className="flex flex-1 flex-col gap-6 z-10">
        {activeTab === "Your Space" && (
          <>
            {/* Khu vực Task và Music Player */}
            <div className="flex gap-6">
            {/* Danh sách công việc */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-1/3"
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

              {/* Khu vực trống ở giữa - có thể thêm widget sau này */}
              <div className="flex-1" />

              {/* Music Player - giữ nguyên kích cỡ gốc */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-1/4"
              >
                <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-green-700">
                      Music Player
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FullMusicPlayer
                      setPlaying={setIsPlaying}
                      setCurrentIndex={setCurrentIndex}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Khu vực vườn cây - xếp ngang, cuộn được */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6"
            >
              <Card className="bg-amber-50 backdrop-blur-md border-2 border-green-400 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-800">Your Garden</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-amber-100">
                    {gardenTrees.map((tree) => (
                      <motion.div
                        key={tree.id}
                        className="flex flex-col items-center min-w-[140px] p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm"
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="relative">
                          <img
                            src={tree.image}
                            alt={tree.name}
                            className="w-20 h-20 object-cover rounded-full"
                            onError={(e) => {
                              e.target.src =
                                "https://media.istockphoto.com/id/537418258/vector/tree.jpg?s=612x612&w=0&k=20&c=YMdnc5cGziKA9Aaxq4MVgwcHBs2gajeBZ33bf9FfdZ8=";
                            }}
                          />
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-700 rounded-full border-2 border-green-300" />
                        </div>
                        <p className="mt-2 text-sm font-semibold text-green-900">
                          {tree.name}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
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
                  {/* Nút để tải ảnh lên */}
                  <Button
                    onClick={handleUploadClick}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Upload Image
                  </Button>
                  {/* Input file ẩn */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {/* Hiển thị ảnh đã chỉnh sửa */}
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