import React, { useState, useRef } from "react";

// react-pintura
import { PinturaEditor } from "@pqina/react-pintura";

// pintura
import "@pqina/pintura/pintura.css";

import {
  createDefaultImageReader,
  createDefaultImageWriter,
  createDefaultShapePreprocessor,
  setPlugins,
  plugin_crop,
  plugin_finetune,
  plugin_finetune_defaults,
  plugin_filter,
  plugin_filter_defaults,
  plugin_annotate,
  markup_editor_defaults,
} from "@pqina/pintura";

import {
  LocaleCore,
  LocaleCrop,
  LocaleFinetune,
  LocaleFilter,
  LocaleAnnotate,
  LocaleMarkupEditor,
} from "@pqina/pintura/locale/en_GB";

setPlugins(plugin_crop, plugin_finetune, plugin_filter, plugin_annotate);

const editorDefaults = {
  utils: ["crop", "finetune", "filter", "annotate"],
  imageReader: createDefaultImageReader(),
  imageWriter: createDefaultImageWriter(),
  shapePreprocessor: createDefaultShapePreprocessor(),
  ...plugin_finetune_defaults,
  ...plugin_filter_defaults,
  ...markup_editor_defaults,
  locale: {
    ...LocaleCore,
    ...LocaleCrop,
    ...LocaleFinetune,
    ...LocaleFilter,
    ...LocaleAnnotate,
    ...LocaleMarkupEditor,
  },
};

export default function Pintura() {
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setResult("");
      setMessage("Image selected successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Please select a valid image file (jpg, png, jpeg).");
      setTimeout(() => setMessage(""), 3000);
      setSelectedImage(null);
    }
  };

  const handleLoad = (res) => {
    console.log("load image", res);
    setMessage("Image loaded successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleProcess = ({ dest }) => {
    const url = URL.createObjectURL(dest);
    setResult(url);
    setMessage("Image processed successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = result;
    link.download = "edited-image.jpg";
    link.click();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUseUnwatermark = () => {
    window.open("https://unwatermark.ai/", "_blank");
    setMessage("Please upload your image to Unwatermark.ai, then re-upload the result here.");
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Image Editor
      </h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-center ${
            message.includes("Please select")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-4 flex space-x-4">
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={triggerFileInput}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Choose Image
        </button>
        <button
          onClick={handleUseUnwatermark}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          Use Unwatermark.ai
        </button>
      </div>

      {selectedImage && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="w-full" style={{ height: "60vh" }}>
              <PinturaEditor
                {...editorDefaults}
                src={selectedImage}
                onLoad={handleLoad}
                onProcess={handleProcess}
                className="border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Edited Image
          </h2>
          <div className="flex flex-col items-center">
            <img
              src={result}
              alt="Edited"
              className="max-w-full h-auto rounded-lg shadow-md mb-4"
              style={{ maxHeight: "300px" }}
            />
            <button
              onClick={handleDownload}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Download Edited Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}