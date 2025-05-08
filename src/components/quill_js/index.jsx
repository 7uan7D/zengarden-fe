import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { SubmitTaskResult } from "@/services/apiServices/taskService";

function QuillEditor() {
  const [editorHtml, setEditorHtml] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  // Khôi phục nội dung từ localStorage khi component mount
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem("richTextContent");
      if (savedContent) {
        setEditorHtml(savedContent);
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      setSavedMessage("Failed to load saved content.");
      setTimeout(() => setSavedMessage(""), 3000);
    }
  }, []);

  const handleChange = (html) => {
    setEditorHtml(html);
    console.log("Editor HTML:", html);
  };

  const handleSave = async () => {
    try {
      localStorage.setItem("richTextContent", editorHtml);
      setSavedMessage("Content saved to localStorage successfully!");

      const blob = new Blob([editorHtml], { type: "text/html" });
      const file = new File([blob], "task-result.html", { type: "text/html" });

      const formData = new FormData();
      formData.append("TaskNote", "Automated content from Quill");
      formData.append("TaskFile", file);

      const currentTaskString = localStorage.getItem("currentTask");
      if (!currentTaskString) {
        console.error("Không tìm thấy currenttask trong localStorage.");
        return;
      }

      const currentTask = JSON.parse(currentTaskString);
      const taskId = currentTask ? currentTask.taskId : null;

      console.log("taskId từ localStorage:", taskId);

      if (taskId) {
        await SubmitTaskResult(taskId, formData);
        console.log("Đã gửi nội dung lên server thành công!");
      } else {
        console.error("Không tìm thấy taskId trong currenttask.");
      }
    } catch (error) {
      console.error("Lỗi khi lưu nội dung:", error);
      setSavedMessage("Failed to save content.");
    } finally {
      setTimeout(() => setSavedMessage(""), 3000);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"], // Đảm bảo italic được bao gồm
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic", // Đảm bảo italic được hỗ trợ
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "align",
  ];

  return (
    <div className="container mx-auto p-4 pb-0 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4 text-center">Rich Text Editor</h1>
      <div className="w-full">
        <ReactQuill
          value={editorHtml}
          onChange={handleChange}
          modules={modules}
          formats={formats} // Thêm formats để đảm bảo hỗ trợ italic
          className="bg-white shadow-md rounded-lg"
        />
        <button
          onClick={handleSave}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Save Content
        </button>
        {savedMessage && (
          <p
            className={`mt-2 ${
              savedMessage.includes("Failed")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {savedMessage}
          </p>
        )}
      </div>
      <style jsx>{`
        .ql-container {
          min-height: 350px;
          border-radius: 0 0 8px 8px;
        }
        .ql-toolbar {
          border-radius: 8px 8px 0 0;
        }
        .ql-editor em {
          font-style: italic !important; /* Đảm bảo chữ nghiêng hiển thị đúng */
        }
      `}</style>
    </div>
  );
}

export default QuillEditor;
