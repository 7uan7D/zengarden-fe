import React, { useState, useEffect } from "react";
import Player from "react-player";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "../react_player/index.css";

// Danh sách video mẫu ban đầu
const initialVideoList = [
  { id: 1, title: "Rick Astley - Never Gonna Give You Up", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: 2, title: "Stephen Sanchez - High", url: "https://www.youtube.com/watch?v=XbAFmBIY6DQ" },
  { id: 3, title: "Malik Mason - A Nigha", url: "https://www.youtube.com/watch?v=ikn0PvZ8j1o" },
];

const VideoPlayer = () => {
  // State để quản lý danh sách video, khởi tạo từ localStorage hoặc initialVideoList
  const [videoList, setVideoList] = useState(() => {
    const savedList = localStorage.getItem("videoList");
    return savedList ? JSON.parse(savedList) : initialVideoList;
  });

  // State để lưu URL của video đang được chọn để phát
  const [selectedVideo, setSelectedVideo] = useState(videoList[0].url);

  // State để kiểm soát trạng thái phát/tạm dừng của video
  const [playing, setPlaying] = useState(false);

  // State để lưu URL mới mà người dùng nhập vào input
  const [newVideoUrl, setNewVideoUrl] = useState("");

  // Đồng bộ videoList với localStorage
  useEffect(() => {
    console.log("Current videoList:", videoList);
    localStorage.setItem("videoList", JSON.stringify(videoList));
  }, [videoList]);

  // Hàm chọn video
  const handleVideoSelect = (url) => {
    console.log("Selecting video:", url);
    setSelectedVideo(url);
    setPlaying(true);
  };

  // Hàm thêm video mới
  const handleAddVideo = () => {
    if (newVideoUrl.trim() === "") return;

    // Chuẩn hóa URL: Thêm https:// nếu người dùng nhập thiếu giao thức
    let normalizedUrl = newVideoUrl.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    const newVideo = {
      id: Date.now(),
      title: `User Video ${videoList.length + 1}`,
      url: normalizedUrl,
    };

    // Cập nhật danh sách video bằng cách thêm video mới
    setVideoList((prevList) => [...prevList, newVideo]);
    setNewVideoUrl("");
    setSelectedVideo(newVideo.url);
    setPlaying(true);
  };

  // Hàm xóa video
  const handleRemoveVideo = (id, url) => {
    // Lọc danh sách để loại bỏ video có id tương ứng
    setVideoList((prevList) => {
      const updatedList = prevList.filter((video) => video.id !== id);
      if (selectedVideo === url) {
        if (updatedList.length > 0) {
          setSelectedVideo(updatedList[0].url);
          setPlaying(true);
        } else {
          setSelectedVideo(null);
          setPlaying(false);
        }
      }
      return updatedList;
    });
  };

  // Hàm xử lý khi video kết thúc
  const handleVideoEnd = () => {
    const currentIndex = videoList.findIndex((video) => video.url === selectedVideo);
    const nextIndex = currentIndex + 1;

    // Nếu còn video tiếp theo trong danh sách
    if (nextIndex < videoList.length) {
      const nextVideo = videoList[nextIndex];
      setSelectedVideo(nextVideo.url);
      setPlaying(true);
    } else {
      // Nếu hết danh sách, dừng phát hoặc quay lại video đầu tiên (tùy chọn)
      setPlaying(false);
      // Để quay lại video đầu tiên, uncomment dòng dưới
      // setSelectedVideo(videoList[0].url);
    }
  };

  return (
    <div className="video-player-container">
      <div className="video-display">
        {selectedVideo ? (
          <Player
            url={selectedVideo}
            playing={playing}
            controls={true}
            playsinline={true}
            width={"100%"}
            height={"100%"}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={handleVideoEnd} // Thêm sự kiện onEnded
            onError={(e) => console.log("Error playing video:", e)}
          />
        ) : (
          <div className="no-video">No videos available</div>
        )}
      </div>
      <div className="video-list">
        <h3 className="video-list-title">Video List</h3>

        {/* Phần nhập URL mới */}
        <div className="video-input-container">
          <Input
            type="text"
            placeholder="Enter video URL (e.g., YouTube)"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            className="video-input"
          />
          <Button onClick={handleAddVideo} className="add-video-button">
            Add
          </Button>
        </div>

        {/* Danh sách video */}
        <ul className="video-list-items">
          {videoList.map((video) => (
            <li
              key={video.id}
              className={`video-item ${selectedVideo === video.url ? "active" : ""}`}
              onClick={() => handleVideoSelect(video.url)}
            >
              <span>{video.title}</span>
              <Button
                variant="ghost"
                className="remove-video-button"
                onClick={() => handleRemoveVideo(video.id, video.url)}
              >
                X
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VideoPlayer;