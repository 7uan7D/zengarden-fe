import React, { useState, useEffect } from "react";
import Player from "react-player";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "../react_player/index.css";

// Danh sách video mẫu ban đầu, được sử dụng nếu không có dữ liệu trong localStorage
const initialVideoList = [
  { id: 1, title: "Rick Astley - Never Gonna Give You Up", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: 2, title: "Stephen Sanchez - High", url: "https://www.youtube.com/watch?v=XbAFmBIY6DQ" },
  { id: 3, title: "vistas ~ eighteen", url: "https://www.youtube.com/watch?v=_JHs3acwCKA" },
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

  // Hook useEffect để đồng bộ videoList với localStorage mỗi khi danh sách thay đổi
  useEffect(() => {
    console.log("Current videoList:", videoList);
    localStorage.setItem("videoList", JSON.stringify(videoList));
  }, [videoList]);

  // Hàm xử lý khi người dùng chọn một video từ danh sách
  const handleVideoSelect = (url) => {
    console.log("Selecting video:", url);
    setSelectedVideo(url);
    setPlaying(true);
  };

  // Hàm xử lý khi người dùng thêm video mới từ input
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

  // Hàm xử lý khi người dùng xóa một video khỏi danh sách
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

  // Phần render giao diện
  return (
    <div className="video-player-container">
      <div className="video-display">
        {selectedVideo ? (
          <Player
            url={selectedVideo}
            playing={playing}
            controls={true}
            width={"100%"}
            height={"100%"}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
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
              key={video.id} // Key duy nhất để React quản lý danh sách
              className={`video-item ${selectedVideo === video.url ? "active" : ""}`}
              onClick={() => {
                handleVideoSelect(video.url);
              }}
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