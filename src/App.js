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
<head><title>Cloud Editor</title></head>
<body>
  <h1>Hello HTML 👋</h1>
</body>
</html>`,

  css: `body {
  background: #020617;
  color: white;
}`
};

const STORAGE_KEY = "cloud_code_editor_state";

function App() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const isMobile = window.innerWidth <= 768;

  const [language, setLanguage] = useState(saved?.language || "python");
  const [files, setFiles] = useState(
    saved?.files || [{ id: 1, name: "main.py", code: templates.python }]
  );
  const [output, setOutput] = useState("// Ready");
  const [isRunning, setIsRunning] = useState(false);
  const [editorWidth, setEditorWidth] = useState(saved?.editorWidth || 65);
  const [activeTab, setActiveTab] = useState("code");

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

  /* ================= Run ================= */

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
    setActiveTab("output");
    setTimeout(() => setIsRunning(false), 600);
  };

  const handleRunOrPreview = () => {
    if (language === "html" || language === "css") {
      const w = window.open();
      w.document.write(activeFile.code);
      w.document.close();
    } else {
      runCode();
    }
  };

  /* ================= Language ================= */

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
    setFiles([{ id: 1, name: `main.${extMap[lang]}`, code: templates[lang] }]);
    setOutput("// Ready");
    setActiveTab("code");
  };

  const updateCode = (value) => {
    setFiles([{ ...activeFile, code: value }]);
  };

  const downloadFile = () => {
    const blob = new Blob([activeFile.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetWorkspace = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLanguage("python");
    setFiles([{ id: 1, name: "main.py", code: templates.python }]);
    setOutput("// Ready");
    setEditorWidth(65);
    setActiveTab("code");
  };

  /* ================= Resize ================= */

  const onMouseDown = () => {
    if (isMobile) return;
    isDragging.current = true;
  };

  const onMouseMove = (e) => {
    if (isMobile || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    if (newWidth > 30 && newWidth < 80) setEditorWidth(newWidth);
  };

  const onMouseUp = () => (isDragging.current = false);

  return (
    <div className="app" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      {/* ===== Top Bar ===== */}
      <div className="topbar">
        <div className="brand">
          <img src={logo} alt="logo" className="brand-logo" />
          <span className="brand-text">CodeDeck</span>
        </div>

        <div className="topbar-right">
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

          <button className="run-btn" onClick={handleRunOrPreview}>Run</button>
          <button className="run-btn" onClick={downloadFile}>Download</button>
          <button className="run-btn" onClick={resetWorkspace}>Reset</button>

          <div className="mobile-actions">
            <button onClick={handleRunOrPreview}>▶</button>
            <button onClick={downloadFile}>⬇</button>
            <button onClick={resetWorkspace}>⟳</button>
          </div>
        </div>
      </div>

      {/* ===== Mobile Tabs ===== */}
      {isMobile && (
        <div className="mobile-tabs">
          <button
            className={activeTab === "code" ? "active" : ""}
            onClick={() => setActiveTab("code")}
          >
            Code
          </button>
          <button
            className={activeTab === "output" ? "active" : ""}
            onClick={() => setActiveTab("output")}
          >
            Output
          </button>
        </div>
      )}

      {/* ===== Main ===== */}
      <div className="main" ref={containerRef}>
        {(!isMobile || activeTab === "code") && (
          <div className="editor-area">
            <Editor
              height="100%"
              language={language}
              value={activeFile.code}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme("codedeck-dark", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [],
                  colors: {
                    "editor.background": "#020617",
                    "editorGutter.background": "#020617",
                    "editorLineNumber.foreground": "#475569",
                    "editorCursor.foreground": "#e5e7eb",
                  }
                });
              }}
              onMount={(editor, monaco) => {
                monaco.editor.setTheme("codedeck-dark");
              }}
              onChange={updateCode}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        )}

        {!isMobile && <div className="resize-bar" onMouseDown={onMouseDown} />}

        {(!isMobile || activeTab === "output") && (
          <div
            className="output-area"
            style={!isMobile ? { width: `${100 - editorWidth}%` } : {}}
          >
            <pre>{output}</pre>
          </div>
        )}
      </div>

      {!isMobile && (
        <div className="status-bar">
          <div>{isRunning ? "Running…" : "Ready"} • {language}</div>
        </div>
      )}
    </div>
  );
}

export default App;