import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import MusicPlayerController, {
  FullMusicPlayer,
  globalAudioState,
} from "../../../components/musicPlayerController/index.jsx";
import "../home/index.css";
import QuillEditor from "@/components/quill_js/index.jsx";
import VideoPlayer from "@/components/react_player/index.jsx";
import PDFEditor from "@/components/react_pdf/index.jsx";
import { GetTaskByUserTreeId, StartTask, PauseTask } from "@/services/apiServices/taskService";
import { GetUserConfigByUserId } from "@/services/apiServices/userConfigService";
import { GetUserTreeByUserId } from "@/services/apiServices/userTreesService";
import parseJwt from "@/services/parseJwt.js";
import "../workspace/index.css";
import "../task/index.css";
import Pintura from "@/components/pintura/index.jsx";
import "@pqina/pintura/pintura.css";
import { openDefaultEditor } from "@pqina/pintura";
import { LayoutDashboard, FileText, Video, BookOpen, Image, House, Menu, X, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Workspace() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [userTreeId, setUserTreeId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(globalAudioState.isPlaying);
  const [currentIndex, setCurrentIndex] = useState(globalAudioState.currentIndex);
  const [activeTab, setActiveTab] = useState("Your Space");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [editedImage, setEditedImage] = useState(null);
  const fileInputRef = useRef(null);

  /** Gán callback cho MusicPlayerController */
  globalAudioState.setPlaying = setIsPlaying;
  globalAudioState.setCurrentIndex = setCurrentIndex;

  useEffect(() => {
    setCurrentIndex(globalAudioState.currentIndex);
  }, [globalAudioState.currentIndex]);

  /** Lấy userTreeId từ URL hoặc userTrees */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const treeId = urlParams.get("userTreeId");
    if (treeId) {
      setUserTreeId(treeId);
    } else {
      const fetchDefaultTree = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          const userId = parseJwt(token)?.sub;
          const userTrees = await GetUserTreeByUserId(userId);
          if (userTrees.length > 0) {
            const savedTreeId = localStorage.getItem("selectedTreeId");
            const found = userTrees.find((tree) => tree.userTreeId === parseInt(savedTreeId));
            const defaultTreeId = found ? found.userTreeId : userTrees[0].userTreeId;
            setUserTreeId(defaultTreeId);
          }
        } catch (error) {
          console.error("Failed to fetch user trees:", error);
        }
      };
      fetchDefaultTree();
    }
  }, [location]);

  /** Hàm lấy danh sách task */
  const fetchTasks = async (treeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      let taskData = [];
      if (treeId) {
        console.log("Fetching tasks for userTreeId:", treeId);
        taskData = await GetTaskByUserTreeId(treeId);
        console.log("Raw task data:", taskData);
        taskData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        const simpleTasks = taskData.filter((task) => task.taskTypeName === "Simple");
        console.log("Filtered simple tasks:", simpleTasks);
        setTasks(simpleTasks);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
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

  /** Lấy task khi userTreeId thay đổi */
  useEffect(() => {
    if (userTreeId) {
      fetchTasks(userTreeId);
    }
  }, [userTreeId]);

  /** Xử lý thay đổi background */
  const handleBackgroundChange = (url) => {
    setBackgroundUrl(url);
    // Có thể thêm logic để lưu background vào user config qua API nếu cần
  };

  /** Toggle sidebar */
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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

  const sidebarTabs = [
    { name: "Your Space", icon: <LayoutDashboard size={24} /> },
    { name: "Rich Text", icon: <FileText size={24} /> },
    { name: "Watch Videos", icon: <Video size={24} /> },
    { name: "PDF Reader", icon: <BookOpen size={24} /> },
    { name: "Image Editor", icon: <Image size={24} /> },
    { name: "Return to Homepage", icon: <House size={24} />, action: () => navigate("/home") },
  ];

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-green-100 to-green-200 relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-full bg-white/90 backdrop-blur-md shadow-lg border-r-2 border-green-300 z-20"
        animate={{ width: isSidebarCollapsed ? 68 : 250 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4">
          {!isSidebarCollapsed && <h2 className="text-lg font-semibold text-green-700">Workspace</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-green-700 bg-gray-300 hover:bg-green-200"
          >
            {isSidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
          </Button>
        </div>
        <nav className="flex flex-col gap-2 p-2">
          <TooltipProvider>
            {sidebarTabs.map((tab) => (
              <Tooltip key={tab.name}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.name
                        ? "bg-green-600 text-white"
                        : "text-green-700 bg-gray-300 hover:bg-green-100"
                    }`}
                    onClick={() => {
                      if (tab.action) {
                        tab.action();
                      } else {
                        setActiveTab(tab.name);
                      }
                    }}
                  >
                    {tab.icon}
                    {!isSidebarCollapsed && <span className="text-sm font-medium tab_span">{tab.name}</span>}
                  </motion.button>
                </TooltipTrigger>
                {isSidebarCollapsed && (
                  <TooltipContent side="right">
                    <p>{tab.name}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 pt-10 ml-[80px]">
        {/* Trang trí lá cây */}
        <div className="absolute top-0 left-0 w-full h-24 bg-[url('/leaf-pattern.png')] bg-repeat-x opacity-30 pointer-events-none" />

        {/* Tiêu đề và Clock */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 z-10"
        >
          <Clock />
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
              </motion.div>

              {/* Không gian trống bên phải */}
              <div className="flex-1"></div>

              {/* Music Player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute bottom-8 w-[91%] mx-auto"
              >
                <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                  <CardContent className="p-1">
                    <FullMusicPlayer
                      setPlaying={setIsPlaying}
                      setCurrentIndex={setCurrentIndex}
                      onBackgroundChange={handleBackgroundChange}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {activeTab === "Rich Text" && (
            <div className="flex-1">
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardContent className="mt-4">
                  <QuillEditor />
                </CardContent>
              </Card>
            </div>
          )}

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

          {activeTab === "PDF Reader" && (
            <div className="flex-1">
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardContent>
                  <PDFEditor />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "Image Editor" && (
            <div className="flex-1">
              <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg">
                <CardContent>
                  <Pintura />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Trang trí ánh sáng nền */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-300/30 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}