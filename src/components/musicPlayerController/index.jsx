// MusicPlayerController.js
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import "../musicPlayerController/index.css";

// Danh sách nhạc cố định
const playlist = [
  {
    title: "Particle House - Moon and Tide",
    url: "https://rr3---sn-npoe7nsl.googlevideo.com/videoplayback?expire=1743360688&ei=UD7pZ-GtCsqMvdIPnKXGwAg&ip=2a09%3Abac5%3A3262%3Abe%3A%3A13%3A29c&id=o-AHjzkAIWolHBszly2WnmI_McOqJ-YjYVvpAsmwAHH9C4&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&bui=AccgBcPwkd2-0JrzbiiLZFhWd79QorXf0a5Arzn0wOsAZMGUa8bGA2A5sLlqliMI8amABmz0fkT1BD0a&vprv=1&svpuc=1&mime=audio%2Fmp4&ns=X8CkiwRhennTL0yHGKZUYzgQ&rqh=1&gir=yes&clen=3064197&dur=189.265&lmt=1741390531267258&keepalive=yes&lmw=1&c=TVHTML5&sefc=1&txp=5308224&n=OophRqiclx7t4Q&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRgIhAMvOya8uDyPwyXy4qYc7QbFC6PIpeXYkXvNq0e2BCu7_AiEA2LChhq8FkZ-MRox-elRluGUlbcOYzKjRId6HH9iiYbM%3D&title=Particle+House+-+Moon+and+Tide&rm=sn-4g5edl7l&rrc=104,80,80&fexp=24350590,24350737,24350827,24350961,24351064,24351147,24351173,24351229,24351283,24351353,24351398,24351415,24351421,24351422,24351423,24351470,24351526,24351527,24351532,24351534&req_id=8329a503d180a3ee&ipbypass=yes&cm2rm=sn-8pxuuxa-nbozr7z,sn-8pxuuxa-nbo6k7s&redirect_counter=3&cms_redirect=yes&cmsv=e&met=1743339097,&mh=JS&mip=171.250.64.112&mm=30&mn=sn-npoe7nsl&ms=nxu&mt=1743338679&mv=m&mvi=3&pl=21&rms=nxu,au&lsparams=ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=AFVRHeAwRgIhAOd2p58XR7-I2x7LLzN0mWTIRtK4VodiBIHo9FtwcYIWAiEAmr_cjGunGG58WQvHrXuBInJwuMMd7bW-QX1p1Elx2o4%3D",
  },
  {
    title: "Relaxing Nature Sounds",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Darkest Dungeon 2 OST - Hunger of the Beast Clan Theme",
    url: "https://rr5---sn-npoe7nz7.googlevideo.com/videoplayback?expire=1743361028&ei=pD_pZ-qWL9vUsfIP6u2x2Ag&ip=104.28.203.58&id=o-AMAwW-jTRcLJgp0rFbh0_Qzn7Rb1xnKzgogcWgT5Y1uK&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&rms=au%2Cau&bui=AccgBcNwSuI-jul_b0XE4XH88F3nvB4v19panNQWs4oMW-04_saddQ4qzS7mbsUM1kUi7ESDBqY-3DOZ&vprv=1&svpuc=1&mime=audio%2Fmp4&ns=UM6wVi3lo7hf2YyFMDu5BIcQ&rqh=1&gir=yes&clen=8407644&dur=519.453&lmt=1739003644294270&keepalive=yes&lmw=1&c=TVHTML5&sefc=1&txp=4432534&n=nowASg2ZS4dH9A&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRgIhAP77xFxPYugP_5FYn32qBG33dYt_LQytXJE54Qw3qRkCAiEA1vlAYdQiToOZyolDKBeGjhTJ_1y0IwSjehzqRRoY4yI%3D&title=Darkest+Dungeon+II%3A+KINGDOMS+OST+Hunger+of+the+Beast+Clan+%28Beastmen+Combat%29+2025+HQ+Official&redirect_counter=1&rm=sn-vgqess7z&rrc=104&fexp=24350590,24350737,24350827,24350961,24351063,24351146,24351173,24351283,24351353,24351398,24351415,24351423,24351469,24351526,24351528,24351531,24351543&req_id=4c33ea414dc8a3ee&cms_redirect=yes&cmsv=e&ipbypass=yes&met=1743339433,&mh=Pl&mip=171.250.64.112&mm=31&mn=sn-npoe7nz7&ms=au&mt=1743338955&mv=m&mvi=5&pl=21&lsparams=ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=AFVRHeAwRQIgUl8zdAqsNNyZyqn2a6nalm1zTikChUiAmYBn-Ylf_lkCIQDFN_dKsN-EySsG7T5ihUZPJpJ3glOeSkJWhGRbeOLOYA%3D%3D",
  },
  {
    title: "Vistas - The Beautiful Nothing",
    url: "https://rr5---sn-npoldn7y.googlevideo.com/videoplayback?expire=1743360409&ei=OT3pZ_jaJfK4kucPyaC64Qg&ip=2a09%3Abac5%3Aa2ff%3A2769%3A%3A3ed%3A74&id=o-ACwrYJl_BkR4sBCT9Whx3j3xcJdq87C_jA8sr68JjqUS&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&bui=AccgBcMZG6mcLxRmrs4cnM09S7paMUfILqKug6GzzN-DdSw6N8cp124zJrsrJ31NbhkHIwhqWW3Edmo9&vprv=1&svpuc=1&mime=audio%2Fmp4&ns=7PYfJgwKjUjU_Kt-k_XVe0IQ&rqh=1&gir=yes&clen=3997962&dur=246.990&lmt=1705890217583658&keepalive=yes&lmw=1&c=TVHTML5&sefc=1&txp=5308224&n=RLmbQ8Ry2jldpA&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgRpRGSQf9e4IGkEWo_ndgOP_lr13MfjxgXC3lYpn9VKYCIQDRcUsop9XMvvpkgQ2-oNkOlRqhVQB4QuBAUNpbnIJ0RQ%3D%3D&title=Vistas+-+The+Beautiful+Nothing+%28Official+Video%29&redirect_counter=1&cm2rm=sn-ab5ees7s&rrc=80&fexp=24350590,24350737,24350827,24350961,24351064,24351146,24351173,24351283,24351353,24351398,24351415,24351423,24351469,24351527&req_id=4348b20c49e1a3ee&cms_redirect=yes&cmsv=e&met=1743338820,&mh=wV&mip=171.250.64.112&mm=34&mn=sn-npoldn7y&ms=ltu&mt=1743338689&mv=m&mvi=5&pl=21&rms=ltu,au&lsparams=met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=AFVRHeAwRQIgVfIjrn77hnaaIeSr-K6-or3JEwf4k4ADalcpIXBg2lECIQDr5pretHSg-uNcb-6QBbuGXa8XhpYSpmUZEPpVsxv39g%3D%3D",
  },
];

// Đối tượng toàn cục quản lý trạng thái âm thanh
export const globalAudioState = {
  audio: null,
  isPlaying: false,
  currentIndex: 0,
  setPlaying: null,
  setCurrentIndex: null,
};

// Hàm tải và phát một bài hát mới
const loadAudioPlayer = (index, setPlaying, setCurrentIndex) => {
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

// Hàm điều khiển phát/tạm dừng
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
      globalAudioState.setCurrentIndex
    );
  }
};

// Hàm chuyển về bài trước
const handlePrevious = (setPlaying, setCurrentIndex) => {
  const newIndex =
    (globalAudioState.currentIndex - 1 + playlist.length) % playlist.length;
  loadAudioPlayer(newIndex, setPlaying, setCurrentIndex);
};

// Hàm chuyển sang bài tiếp theo
const handleNext = (setPlaying, setCurrentIndex) => {
  const newIndex = (globalAudioState.currentIndex + 1) % playlist.length;
  loadAudioPlayer(newIndex, setPlaying, setCurrentIndex);
};

// Component điều khiển cơ bản với nút thu gọn và hiệu ứng chữ chạy ngang
export default function MusicPlayerController({
  positionClass = "relative",
  setPlaying,
  setCurrentIndex,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 bg-white rounded-lg shadow-md border border-gray-200 mt-20 ${
        isCollapsed ? "w-10 p-2" : "w-64 p-3"
      } ${positionClass}`}
    >
      {/* Nút thu gọn/mở rộng */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 bg-transparent text-gray-500 hover:bg-gray-100"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Nội dung chính (ẩn khi thu gọn) */}
      {!isCollapsed && (
        <div className="flex flex-col items-center gap-2 flex-1">
          {/* Các nút điều khiển */}
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
          {/* Hiển thị "Current song" và tên bài hát với hiệu ứng chạy ngang */}
          <div className="text-center w-full overflow-hidden">
            <p className="text-xs font-medium text-gray-800">Current song:</p>
            <p
              className="text-xs text-gray-600 mt-1 whitespace-nowrap animate-marquee"
              style={{ display: "inline-block" }}
            >
              {playlist[globalAudioState.currentIndex]?.title ||
                "No song playing"}
            </p>
          </div>
        </div>
      )}
      {/* CSS nội tuyến cho hiệu ứng chạy ngang */}
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

// Component đầy đủ với danh sách phát (giữ nguyên)
export function FullMusicPlayer({ setPlaying, setCurrentIndex }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          onClick={() => handlePrevious(setPlaying, setCurrentIndex)}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => handleTogglePlay(setPlaying)}>
          {globalAudioState.isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleNext(setPlaying, setCurrentIndex)}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">Playlist</h3>
        <ul className="space-y-2">
          {playlist.map((track, index) => (
            <li
              key={index}
              className={`text-sm p-2 rounded cursor-pointer ${
                globalAudioState.currentIndex === index
                  ? "bg-gray-300 border-2 border-gray-500"
                  : "hover:bg-gray-100"
              }`}
              onClick={() =>
                loadAudioPlayer(index, setPlaying, setCurrentIndex)
              }
            >
              {track.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
