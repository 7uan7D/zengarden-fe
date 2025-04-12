// src/components/PDF_Editor.jsx
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Thêm Input để tải file
import PDF_File from "../../assets/test_function/file-example_PDF_500_kB.pdf"; // File PDF mẫu
import "../react_pdf/index.css"; // Thêm CSS cho PDF Editor

// Cấu hình workerSrc cho pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";

export default function PDFEditor() {
  const [numPages, setNumPages] = useState(null); // Tổng số trang của PDF
  const [pageNumber, setPageNumber] = useState(1); // Trang hiện tại
  const [pdfFile, setPdfFile] = useState(PDF_File); // File PDF hiện tại (mẫu hoặc từ người dùng)
  const [scale, setScale] = useState(1.0); // Độ phóng to/thu nhỏ

  // Hàm được gọi khi PDF tải thành công
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1); // Reset về trang đầu khi tải file mới
  };

  // Chuyển sang trang trước
  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  // Chuyển sang trang sau
  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  // Phóng to
  const zoomIn = () => {
    setScale((prevScale) => prevScale + 0.2);
  };

  // Thu nhỏ
  const zoomOut = () => {
    setScale((prevScale) => Math.max(0.2, prevScale - 0.2)); // Giới hạn nhỏ nhất là 0.2
  };

  // Xử lý khi người dùng tải file PDF
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileUrl = URL.createObjectURL(file); // Tạo URL tạm thời cho file
      setPdfFile(fileUrl);
      setPageNumber(1); // Reset về trang đầu
      setNumPages(null); // Reset số trang để tải lại
    } else {
      console.error("Please upload a valid PDF file.");
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md">
      <CardHeader>
        <CardTitle>PDF Reader</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Input để tải file PDF */}
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="mb-4 w-1/2"
          />

          {/* Hiển thị tài liệu PDF */}
          <div className="overflow-auto max-h-[70vh]">
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => console.error("Error loading PDF:", error)}
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
          </div>

          {/* Điều khiển trang và zoom */}
          <div className="flex gap-4 mt-4 items-center">
            <Button
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              variant="outline"
            >
              Previous
            </Button>
            <p>
              Page {pageNumber} of {numPages || "--"}
            </p>
            <Button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages || !numPages}
              variant="outline"
            >
              Next
            </Button>
            <Button onClick={zoomIn} variant="outline">
              Zoom In
            </Button>
            <Button onClick={zoomOut} variant="outline">
              Zoom Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}