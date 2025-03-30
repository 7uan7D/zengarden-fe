import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import "../home/index.css";

// Danh sách cây và task mẫu
const gardenTrees = [
  { id: 1, name: "Oak", image: "/tree-1.png" },
  { id: 2, name: "Birch", image: "/tree-2.png" },
  { id: 3, name: "Maple", image: "/tree-3.png" },
  { id: 4, name: "Pine", image: "/tree-4.png" },
  { id: 5, name: "Willow", image: "/tree-5.png" },
  { id: 6, name: "Cedar", image: "/tree-6.png" },
];

const initialTasks = [
  { id: 1, title: "Complete project proposal", completed: false },
  { id: 2, title: "Review team feedback", completed: true },
  { id: 3, title: "Prepare presentation", completed: false },
];

// Quản lý trạng thái âm thanh toàn cục
const globalAudioState = {
  player: null,
  isPlaying: false,
  currentUrl: localStorage.getItem("musicUrl") || "", // Khôi phục từ localStorage
};

// Cập nhật localStorage khi URL thay đổi
const updateMusicUrl = (url) => {
  globalAudioState.currentUrl = url;
  localStorage.setItem("musicUrl", url);
};

export default function Workspace() {
  const [tasks, setTasks] = useState(initialTasks);
  const [youtubeUrl, setYoutubeUrl] = useState(globalAudioState.currentUrl);
  const [isPlaying, setIsPlaying] = useState(globalAudioState.isPlaying);
  const [searchParams, setSearchParams] = useSearchParams();

  // Đồng bộ URL và state khi tải trang
  useEffect(() => {
    const musicFromUrl = searchParams.get("music") || globalAudioState.currentUrl;
    if (musicFromUrl) {
      setYoutubeUrl(musicFromUrl);
      if (!globalAudioState.player && musicFromUrl !== globalAudioState.currentUrl) {
        loadYoutubePlayer(musicFromUrl);
      } else if (globalAudioState.player) {
        setIsPlaying(globalAudioState.isPlaying);
      }
      setSearchParams({ music: musicFromUrl }); // Đảm bảo URL luôn có music
    }
  }, [searchParams, setSearchParams]);

  // Tải YouTube Iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API Loaded");
        const musicFromUrl = searchParams.get("music") || globalAudioState.currentUrl;
        if (musicFromUrl && !globalAudioState.player) {
          loadYoutubePlayer(musicFromUrl);
        }
      };
    }
  }, []);

  // Tải và phát YouTube Player
  const loadYoutubePlayer = (url) => {
    if (!url || !window.YT) {
      console.error("YouTube API not loaded yet or URL is empty");
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      console.error("Invalid YouTube URL");
      return;
    }

    if (globalAudioState.player) {
      globalAudioState.player.destroy(); // Hủy player cũ
    }

    const playerContainer = document.createElement("div");
    playerContainer.id = `youtube-player-${Date.now()}`;
    document.body.appendChild(playerContainer);

    const newPlayer = new window.YT.Player(playerContainer.id, {
      height: "0",
      width: "0",
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: videoId,
      },
      events: {
        onReady: (event) => {
          event.target.playVideo();
          globalAudioState.isPlaying = true;
          setIsPlaying(true);
        },
        onError: (error) => {
          console.error("YouTube Player Error:", error);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PAUSED) {
            globalAudioState.isPlaying = false;
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.PLAYING) {
            globalAudioState.isPlaying = true;
            setIsPlaying(true);
          }
        },
      },
    });

    globalAudioState.player = newPlayer;
    updateMusicUrl(url); // Cập nhật global state và localStorage
    setSearchParams({ music: url }); // Cập nhật URL
  };

  // Trích xuất video ID từ URL YouTube
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Điều khiển phát/tạm dừng
  const handleTogglePlay = () => {
    if (globalAudioState.player) {
      if (isPlaying) {
        globalAudioState.player.pauseVideo();
      } else {
        globalAudioState.player.playVideo();
      }
      globalAudioState.isPlaying = !isPlaying;
      setIsPlaying(!isPlaying);
    }
  };

  const handleTaskToggle = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleLoadAndPlay = () => {
    if (youtubeUrl) {
      loadYoutubePlayer(youtubeUrl);
    }
  };

  return (
    <div
    // Chỉnh sửa img background
      className="min-h-screen flex flex-col p-6 bg-gray-100 mt-20"
      style={{
        backgroundImage: "url('https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/15/d1/80/15d1804a-1594-b708-3e90-a651a3216e4d/1968720970920101.jpg/3840x2160mv.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
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
        {/* Danh sách Task */}
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
                      onCheckedChange={() => handleTaskToggle(task.id)}
                    />
                    <span
                      className={`${
                        task.completed ? "line-through text-gray-500" : ""
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

        {/* Vườn cây */}
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
                        e.target.src = "https://via.placeholder.com/80";
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
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter YouTube URL..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleLoadAndPlay} disabled={!youtubeUrl}>
                  Load & Play
                </Button>
                {globalAudioState.player && (
                  <Button variant="outline" onClick={handleTogglePlay}>
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}