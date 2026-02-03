import "./App.css";
import logo from "./assets/logo.png";
import Editor from "@monaco-editor/react";
import { useState, useRef, useEffect } from "react";

/* ================= Templates ================= */

const templates = {
  python: `# Python example
print("Hello from Python")`,

  javascript: `// JavaScript example
console.log("Hello from JavaScript");`,

  cpp: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello from C++";
  return 0;
}`,

  c: `#include <stdio.h>

int main() {
  printf("Hello from C");
  return 0;
}`,

  java: `class Main {
  public static void main(String[] args) {
    System.out.println("Hello from Java");
  }
}`,

  html: `<!DOCTYPE html>
<html>
<head>
  <title>Cloud Editor</title>
</head>
<body>
  <h1>Hello HTML 👋</h1>
  <p>Live preview opened in new tab</p>
</body>
</html>`,

  css: `body {
  background: #020617;
  color: white;
  font-family: Arial;
}`
};

const STORAGE_KEY = "cloud_code_editor_state";

function App() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

  const [language, setLanguage] = useState(saved?.language || "python");
  const [files, setFiles] = useState(
    saved?.files || [{ id: 1, name: "main.py", code: templates.python }]
  );
  const [output, setOutput] = useState("// Ready");
  const [isRunning, setIsRunning] = useState(false);
  const [editorWidth, setEditorWidth] = useState(saved?.editorWidth || 65);

  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const activeFile = files[0];

  /* ================= Persist ================= */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ language, files, editorWidth })
    );
  }, [language, files, editorWidth]);

  /* ================= Keyboard Shortcuts ================= */

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleRunOrPreview();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        downloadFile();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetWorkspace();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  /* ================= Run / Preview ================= */

  const runCode = () => {
    const resultMap = {
      python: "Hello from Python\n",
      javascript: "Hello from JavaScript\n",
      cpp: "Hello from C++\n",
      c: "Hello from C\n",
      java: "Hello from Java\n"
    };

    setIsRunning(true);
    setOutput(`$ running ${language} code...\n\n${resultMap[language]}`);
    setTimeout(() => setIsRunning(false), 600);
  };

  const openPreviewInNewTab = () => {
    const w = window.open();
    w.document.write(activeFile.code);
    w.document.close();
  };

  const handleRunOrPreview = () => {
    if (language === "html" || language === "css") {
      openPreviewInNewTab();
    } else {
      runCode();
    }
  };

  /* ================= Language Change ================= */

  const changeLanguage = (lang) => {
    const extMap = {
      python: "py",
      javascript: "js",
      cpp: "cpp",
      c: "c",
      java: "java",
      html: "html",
      css: "css"
    };

    setLanguage(lang);
    setFiles([
      {
        id: 1,
        name: `main.${extMap[lang]}`,
        code: templates[lang]
      }
    ]);
    setOutput("// Ready");
  };

  /* ================= Update Code ================= */

  const updateCode = (value) => {
    setFiles([{ ...activeFile, code: value }]);
  };

  /* ================= Download ================= */

  const downloadFile = () => {
    const blob = new Blob([activeFile.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= Reset ================= */

  const resetWorkspace = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLanguage("python");
    setFiles([{ id: 1, name: "main.py", code: templates.python }]);
    setOutput("// Ready");
    setEditorWidth(65);
  };

  /* ================= Resize ================= */

  const onMouseDown = () => (isDragging.current = true);
  const onMouseUp = () => (isDragging.current = false);

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    if (newWidth > 30 && newWidth < 80) setEditorWidth(newWidth);
  };

  return (
    <div className="app" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <div className="topbar">
        <div className="brand">
  <img src={logo} alt="CodeDeck logo" className="brand-logo" />
  <span className="brand-text">CodeDeck</span>
</div>

        <div style={{ display: "flex", gap: "12px" }}>
          <select
            className="lang-select"
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>

          <button className="run-btn" onClick={handleRunOrPreview}>
            {language === "html" || language === "css" ? "Preview" : "Run"}
          </button>

          <button className="run-btn" onClick={downloadFile}>Download</button>
          <button className="run-btn" onClick={resetWorkspace}>Reset</button>
        </div>
      </div>

      <div className="main" ref={containerRef}>
        <div className="editor-area" style={{ width: `${editorWidth}%` }}>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={activeFile.code}
            onChange={updateCode}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>

        <div style={{ width: "6px", cursor: "col-resize" }} onMouseDown={onMouseDown} />

        <div className="output-area" style={{ width: `${100 - editorWidth}%` }}>
          <pre>{output}</pre>
        </div>
      </div>

      {/* ===== Status Bar ===== */}
      <div className="status-bar">
        <div>
          {isRunning ? "Running…" : "Ready"} • {language}
        </div>
        <div className="shortcuts">
          Ctrl+Enter • Run | Ctrl+S • Download | Ctrl+R • Reset
        </div>
      </div>
    </div>
  );
}

export default App;