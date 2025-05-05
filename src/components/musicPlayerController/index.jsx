import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Images,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import "../musicPlayerController/index.css";
import { GetBagItems, UseItem } from "@/services/apiServices/itemService";
import parseJwt from "@/services/parseJwt";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Đối tượng toàn cục quản lý trạng thái âm thanh
export const globalAudioState = {
  audio: null,
  isPlaying: false,
  currentIndex: 0,
  setPlaying: null,
  setCurrentIndex: null,
  musicList: [],
};

/** Hàm tải và phát một bài hát mới */
const loadAudioPlayer = (index, setPlaying, setCurrentIndex, playlist) => {
  if (globalAudioState.audio) {
    globalAudioState.audio.pause();
    globalAudioState.audio = null;
  }

  const newAudio = new Audio(playlist[index].url);
  newAudio.loop = false;
  newAudio
    .play()
    .then(() => {
      globalAudioState.isPlaying = true;
      setPlaying(true);
    })
    .catch((error) => {
      console.error("Lỗi khi phát audio:", error);
    });

  newAudio.addEventListener("ended", () => {
    handleNext(setPlaying, setCurrentIndex);
  });

  globalAudioState.audio = newAudio;
  globalAudioState.currentIndex = index;
  globalAudioState.setPlaying = setPlaying;
  globalAudioState.setCurrentIndex = setCurrentIndex;
  setCurrentIndex(index);
};

/** Hàm điều khiển phát/tạm dừng */
const handleTogglePlay = (setPlaying) => {
  if (globalAudioState.audio) {
    if (globalAudioState.isPlaying) {
      globalAudioState.audio.pause();
      globalAudioState.isPlaying = false;
      setPlaying(false);
    } else {
      globalAudioState.audio.play().catch((error) => {
        console.error("Lỗi khi tiếp tục audio:", error);
      });
      globalAudioState.isPlaying = true;
      setPlaying(true);
    }
  } else {
    loadAudioPlayer(
      globalAudioState.currentIndex,
      setPlaying,
      globalAudioState.setCurrentIndex,
      globalAudioState.musicList
    );
  }
};

/** Hàm chuyển về bài trước */
const handlePrevious = (setPlaying, setCurrentIndex) => {
  const list = globalAudioState.musicList;
  const newIndex =
    (globalAudioState.currentIndex - 1 + list.length) % list.length;
  loadAudioPlayer(newIndex, setPlaying, setCurrentIndex, list);
};

/** Hàm chuyển sang bài tiếp theo */
const handleNext = (setPlaying, setCurrentIndex) => {
  const list = globalAudioState.musicList;
  const newIndex = (globalAudioState.currentIndex + 1) % list.length;
  loadAudioPlayer(newIndex, setPlaying, setCurrentIndex, list);
};

/** Component chính của Music Player */
export default function MusicPlayerController({
  positionClass = "relative",
  setPlaying,
  setCurrentIndex,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [musicList, setMusicList] = useState([]);

  /** Lấy danh sách nhạc từ API */
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = parseJwt(token);
        const bagId = decoded.sub;

        const items = await GetBagItems(bagId);
        const ownedMusicItems = items.filter(
          (item) => item.item?.type === 4 && item.quantity > 0
        );

        const ownedPlaylist = ownedMusicItems.map((item) => ({
          title: item.item.name,
          url: item.item.itemDetail.mediaUrl,
        }));

        setMusicList(ownedPlaylist);
        globalAudioState.musicList = ownedPlaylist;
      } catch (err) {
        console.error("Lỗi tải nhạc:", err);
      }
    };

    fetchMusic();
  }, []);

  useEffect(() => {
    globalAudioState.setPlaying = setPlaying;
    globalAudioState.setCurrentIndex = setCurrentIndex;
  }, [setPlaying, setCurrentIndex]);

  return (
    <div
      className={`flex items-center gap-2 bg-white rounded-lg shadow-md border border-gray-200 p-3 ${positionClass}`}
    >
      {/* Nút thu gọn/mở rộng */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 bg-transparent text-gray-500 hover:bg-gray-100"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>

      {/* Nội dung chính */}
      {!isCollapsed && (
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handlePrevious(setPlaying, setCurrentIndex)}
            >
              <SkipBack className="h-3 w-3 text-black" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleTogglePlay(setPlaying)}
            >
              {globalAudioState.isPlaying ? (
                <Pause className="h-3 w-3 text-black" />
              ) : (
                <Play className="h-3 w-3 text-black" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleNext(setPlaying, setCurrentIndex)}
            >
              <SkipForward className="h-3 w-3 text-black" />
            </Button>
          </div>
          <div className="text-center w-full overflow-hidden">
            <p className="text-xs font-medium text-gray-800">Current song:</p>
            <p
              className="text-xs text-gray-600 mt-1 whitespace-nowrap animate-marquee"
              style={{ display: "inline-block" }}
            >
              {musicList[globalAudioState.currentIndex]?.title ||
                "No song playing"}
            </p>
          </div>
        </div>
      )}
      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .animate-marquee {
            animation: marquee 10s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </div>
  );
}

/** Component FullMusicPlayer với giao diện mới */
export function FullMusicPlayer({
  setPlaying,
  setCurrentIndex,
  musicList: externalMusicList,
  onBackgroundChange,
}) {
  const [musicList, setMusicList] = useState(externalMusicList || []);
  const [backgroundList, setBackgroundList] = useState([]);

  /** Lấy danh sách nhạc và background từ API */
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = parseJwt(token);
        const bagId = decoded.sub;

        const items = await GetBagItems(bagId);

        // Lấy danh sách nhạc
        const ownedMusicItems = items.filter(
          (item) => item.item?.type === 4 && item.quantity > 0
        );
        const ownedPlaylist = ownedMusicItems.map((item) => ({
          title: item.item.name,
          url: item.item.itemDetail.mediaUrl,
        }));
        setMusicList(ownedPlaylist);
        globalAudioState.musicList = ownedPlaylist;

        // Lấy danh sách background
        const ownedBackgroundItems = items.filter(
          (item) => item.item?.type === 3 && item.quantity > 0
        );
        const ownedBackgrounds = ownedBackgroundItems.map((item) => ({
          bagItemId: item.bagItemId,
          title: item.item.name,
          url: item.item.itemDetail.mediaUrl,
          isEquipped: item.isEquipped,
        }));
        setBackgroundList(ownedBackgrounds);
      } catch (err) {
        console.error("Lỗi tải items:", err);
      }
    };

    if (!externalMusicList || externalMusicList.length === 0) {
      fetchItems();
    }
  }, [externalMusicList]);

  /** Xử lý khi nhấn nút Equip */
  const handleEquipBackground = async (bagItemId, url) => {
    try {
      await UseItem(bagItemId);
      onBackgroundChange(url); // Cập nhật background
      toast.success("Background equipped successfully!");
      // Cập nhật lại danh sách để phản ánh trạng thái isEquipped
      const updatedItems = await fetchBagItems();
      setBackgroundList(updatedItems);
    } catch (error) {
      console.error("Error equipping background:", error);
      toast.error(error.response?.data?.message || "Failed to equip background!");
    }
  };

  /** Hàm lấy lại danh sách background để cập nhật trạng thái */
  const fetchBagItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = parseJwt(token);
      const bagId = decoded.sub;
      const items = await GetBagItems(bagId);
      const ownedBackgroundItems = items.filter(
        (item) => item.item?.type === 3 && item.quantity > 0
      );
      return ownedBackgroundItems.map((item) => ({
        bagItemId: item.bagItemId,
        title: item.item.name,
        url: item.item.itemDetail.mediaUrl,
        isEquipped: item.isEquipped,
      }));
    } catch (err) {
      console.error("Lỗi tải background:", err);
      return [];
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Tên bài hát với Popover hiển thị danh sách nhạc */}
      <div className="flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="text-left flex items-center gap-2">
              <Music className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                {musicList[globalAudioState.currentIndex]?.title ||
                  "No song playing"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 ml-8">
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {musicList.length > 0 ? (
                musicList.map((track, index) => (
                  <li
                    key={index}
                    className={`text-sm p-2 rounded cursor-pointer ${globalAudioState.currentIndex === index
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                      }`}
                    onClick={() =>
                      loadAudioPlayer(
                        index,
                        setPlaying,
                        setCurrentIndex,
                        musicList
                      )
                    }
                  >
                    {track.title || "Unknown Track"}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500 italic">
                  No tracks available
                </li>
              )}
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      {/* Các nút điều khiển (căn giữa) */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePrevious(setPlaying, setCurrentIndex)}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTogglePlay(setPlaying)}
        >
          {globalAudioState.isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNext(setPlaying, setCurrentIndex)}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Biểu tượng Images với Popover hiển thị danh sách background */}
      <div className="flex-1 flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Images className="h-4 w-4 text-gray-600" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[660px] p-3 bg-white rounded-xl shadow-2xl mr-8 mb-3">
            <div className="relative">
              {/* Nút Previous */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-600 z-10 rounded-full shadow-md p-2"
                onClick={() => {
                  const container = document.getElementById("background-scroll");
                  container.scrollBy({ left: -224, behavior: "smooth" }); // Cuộn trái 224px
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              {/* Nút Next */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-600 z-10 rounded-full shadow-md p-2"
                onClick={() => {
                  const container = document.getElementById("background-scroll");
                  container.scrollBy({ left: 224, behavior: "smooth" }); // Cuộn phải 224px
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              {/* Danh sách background */}
              <div
                id="background-scroll"
                className="flex flex-row overflow-x-auto py-2 px-6"
                style={{ width: "625px" }} // 3 items * 208px + padding
              >
                {backgroundList.length > 0 ? (
                  backgroundList.map((bg) => (
                    <div
                      key={bg.bagItemId}
                      className="flex flex-col items-center w-48 flex-shrink-0 transition-transform transform hover:scale-105"
                    >
                      <div className="relative group">
                        <img
                          src={bg.url}
                          alt={bg.title}
                          className="w-482 h-24 object-cover rounded-lg shadow-md transition-shadow group-hover:shadow-xl"
                        />
                        <Button
                          className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 w-4/5 text-white text-sm py-1.5 rounded-full transition-all duration-300 ${
                            bg.isEquipped
                              ? "bg-gray-500/80 cursor-not-allowed"
                              : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg"
                          }`}
                          onClick={() => handleEquipBackground(bg.bagItemId, bg.url)}
                          disabled={bg.isEquipped}
                        >
                          {bg.isEquipped ? "Equipped" : "Equip"}
                        </Button>
                      </div>
                      <span className="text-sm font-medium text-gray-800 text-center truncate w-full">
                        {bg.title || "Unnamed Background"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic w-full text-center py-4">
                    No backgrounds available
                  </div>
                )}
              </div>
            </div>
            <style>
              {`
                #background-scroll::-webkit-scrollbar {
                  display: none;
                }
                #background-scroll {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                  scroll-behavior: smooth;
                }
              `}
            </style>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}