import React, {useState} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles

function QuillEditor() {
    const [editorHtml, setEditorHtml] = useState("");
    
    const handleChange = (html) => {
        setEditorHtml(html);
    };
    
    return (
        <div className="quill-editor">
        <ReactQuill value={editorHtml} onChange={handleChange} />
        </div>
    );
    }
export default QuillEditor;