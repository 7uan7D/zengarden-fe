// Workspace.js
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import MusicPlayerController, { FullMusicPlayer, globalAudioState } from "../../../components/musicPlayerController/index.jsx";
import "../home/index.css";

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
  const [tasks, setTasks] = useState(initialTasks); // Quản lý danh sách công việc
  const [isPlaying, setIsPlaying] = useState(globalAudioState.isPlaying); // Trạng thái phát nhạc trên UI
  const [currentIndex, setCurrentIndex] = useState(globalAudioState.currentIndex); // Chỉ số bài hát trên UI
  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại

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

  return (
    <div
      className="min-h-screen flex flex-col p-6 bg-gray-100 mt-20"
      style={{
        backgroundImage:
          "url('https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/15/d1/80/15d1804a-1594-b708-3e90-a651a3216e4d/1968720970920101.jpg/3840x2160mv.jpg')",
        backgroundSize: "cover", // Ảnh nền full màn hình
        backgroundPosition: "center",
      }}
    >
      {/* Tiêu đề Workspace với hiệu ứng animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Workspace
        </h1>
      </motion.div>

      <div className="flex flex-1 gap-6">
        {/* Danh sách công việc */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-1/3"
        >
          <Card className="bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(task.id)} // Chuyển đổi trạng thái khi click
                    />
                    <span
                      className={`${
                        task.completed ? "line-through text-gray-500" : "" // Gạch ngang nếu hoàn thành
                      }`}
                    >
                      {task.title}
                    </span>
                  </li>
                ))}
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
                          "https://media.istockphoto.com/id/537418258/vector/tree.jpg?s=612x612&w=0&k=20&c=YMdnc5cGziKA9Aaxq4MVgwcHBs2gajeBZ33bf9FfdZ8="; // Ảnh mặc định nếu lỗi
                      }}
                    />
                    <p className="text-sm font-semibold">{tree.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Máy phát nhạc đầy đủ (chỉ hiển thị ở trang Workspace) */}
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
                <FullMusicPlayer setPlaying={setIsPlaying} setCurrentIndex={setCurrentIndex} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}