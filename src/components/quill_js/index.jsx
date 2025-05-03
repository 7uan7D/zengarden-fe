import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
    // Debug: Kiểm tra nội dung HTML khi thay đổi
    console.log("Editor HTML:", html);
  };

  const handleSave = () => {
    try {
      localStorage.setItem("richTextContent", editorHtml);
      setSavedMessage("Content saved to localStorage successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      setSavedMessage("Failed to save content.");
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
              savedMessage.includes("Failed") ? "text-red-600" : "text-green-600"
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