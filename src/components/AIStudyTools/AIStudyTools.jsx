
import { useState } from "react";
import {
  Copy,
  Sparkles,
  BookOpen,
  Brain,
  ListChecks,
  LoaderCircle,
  Upload,
  FileText,
  X,
} from "lucide-react";
import styles from "./AIStudyTools.module.css";

const tools = [
  {
    id: "summarize",
    title: "Summarize",
    description: "Create concise revision notes.",
    icon: BookOpen,
  },
  {
    id: "explain",
    title: "Explain",
    description: "Understand topics in simple language.",
    icon: Brain,
  },
  {
    id: "quiz",
    title: "Quiz",
    description: "Generate practice questions and answers.",
    icon: ListChecks,
  },
];

export default function AIStudyTools() {
  const [mode, setMode] = useState("summarize");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    const isImage = selected.type.startsWith("image/");
    const isPDF = selected.type === "application/pdf";

    if (!isImage && !isPDF) {
      setError("Please upload an image or PDF file.");
      event.target.value = "";
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("File size must be 10 MB or less.");
      event.target.value = "";
      return;
    }

    setFile(selected);
    setError("");
    setResult("");
  }

  async function generate() {
    if (!text.trim() && !file) {
      setError("Enter notes or upload a photo/PDF first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      let uploadedFile;

      if (file) {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const value = reader.result;
            resolve(String(value).split(",")[1]);
          };

          reader.onerror = () => reject(new Error("Could not read the file."));
          reader.readAsDataURL(file);
        });

        uploadedFile = {
          mimeType: file.type,
          data,
        };
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          text: text.trim(),
          file: uploadedFile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI could not process your request.");
      }

      setResult(data.result || "No result was returned.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      setError("Could not copy the result. Please select and copy it manually.");
    }
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <Sparkles size={24} />
        <div>
          <h2>AI Study Assistant</h2>
          <p>Upload notes, a photo or a PDF to study smarter.</p>
        </div>
      </div>

      <div className={styles.tools}>
        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <button
              type="button"
              key={tool.id}
              className={`${styles.toolCard} ${
                mode === tool.id ? styles.active : ""
              }`}
              onClick={() => setMode(tool.id)}
            >
              <Icon size={22} />
              <strong>{tool.title}</strong>
              <span>{tool.description}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.inputSection}>
        <label htmlFor="study-notes">Your notes or topic</label>

        <textarea
          id="study-notes"
          className={styles.textarea}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a topic, paste your notes, or upload a file below..."
          rows={7}
          maxLength={30000}
        />

        <div className={styles.fileUpload}>
          <label htmlFor="study-file" className={styles.uploadButton}>
            <Upload size={18} />
            Upload photo or PDF
          </label>

          <input
            id="study-file"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className={styles.fileInput}
          />

          <span className={styles.fileHint}>Maximum file size: 10 MB</span>
        </div>

        {file && (
          <div className={styles.selectedFile}>
            <FileText size={18} />
            <span>{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              aria-label="Remove uploaded file"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className={styles.footer}>
          <span>{text.length.toLocaleString()} / 30,000 characters</span>

          <button
            type="button"
            className={styles.generateButton}
            onClick={generate}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className={styles.spinner} size={18} />
                Processing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className={styles.resultSection}>
          <div className={styles.resultHeader}>
            <h3>AI Result</h3>
            <button type="button" onClick={copyResult}>
              <Copy size={16} />
              Copy
            </button>
          </div>

          <div className={styles.resultText}>{result}</div>
        </div>
      )}
    </section>
  );
}
