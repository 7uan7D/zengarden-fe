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

// Thêm import cho Pintura
import "@pqina/pintura/pintura.css"; // CSS của Pintura
import { openDefaultEditor } from "@pqina/pintura"; // Hàm mở editor mặc định

// Danh sách cây mẫu trong vườn
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
      className="min-h-screen flex flex-col p-6 bg-gray-100 mt-20"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
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
          {[
            "Your Space",
            "Rich Text",
            "Watch Videos",
            "PDF Editor",
            "Image Editor",
          ].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              className={`${
                activeTab === tab
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
          </>
        )}

        {/* Tab Rich Text */}
        {activeTab === "Rich Text" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md">
              <CardContent className="mt-4">
                <QuillEditor />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Watch Videos */}
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

        {/* Tab PDF Editor */}
        {activeTab === "PDF Editor" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <PDFEditor />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Image Editor với Pintura */}
        {activeTab === "Image Editor" && (
          <div className="flex-1">
            <Card className="bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Pintura Image Editor</CardTitle>
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
                      <p className="text-gray-700 font-medium">Edited Image:</p>
                      <img
                        src={editedImage}
                        alt="Edited"
                        className="max-w-full h-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
