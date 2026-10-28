import { useState } from "react";
import { BrainCircuit, Sparkles, Copy, RotateCcw } from "lucide-react";
import styles from "./AIStudyTools.module.css";
const descriptions = {
  summarize: "Turn your notes into a concise revision guide.",
  explain: "Understand a difficult concept in simple language.",
  quiz: "Create practice questions to test your understanding.",
};
export default function AIStudyTools({ notify }) {
  const [mode, setMode] = useState("summarize");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (text.trim().length < 10) {
      notify("Paste at least a few lines of notes or a topic first.");
      return;
    }

    setBusy(true);
    setResult("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          action: mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      setResult(data.result);
    } catch (error) {
      notify(error.message || "Unable to connect to the AI service.");
    } finally {
      setBusy(false);
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      notify("Result copied.");
    } catch {
      notify("Clipboard access was blocked by the browser.");
    }
  }
  return (
    <section className={styles.page}>
      <div className={styles.intro}>
        <span className={styles.icon}>
          <BrainCircuit size={25} />
        </span>
        <div>
          <p className={styles.eyebrow}>AI LEARNING LAB</p>
          <h1>AI Study Tools</h1>
          <p>Turn study material into a clearer path to understanding.</p>
        </div>
      </div>
      <div className={styles.panel}>
        <label className={styles.label}>Choose a tool</label>
        <div className={styles.modeGrid}>
          {[
            ["summarize", "Summarize notes"],
            ["explain", "Explain a concept"],
            ["quiz", "Generate a quiz"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`${styles.mode} ${mode === id ? styles.modeActive : ""}`}
            >
              <Sparkles size={17} />
              <strong>{label}</strong>
              <small>{descriptions[id]}</small>
            </button>
          ))}
        </div>
        <label className={styles.label} htmlFor="ai-notes">
          Your notes or topic
        </label>
        <textarea
          id="ai-notes"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          maxLength={30000}
          placeholder="Paste DBMS notes, a textbook paragraph, or a topic such as normalization..."
        />
        <div className={styles.footer}>
          <span>{text.length.toLocaleString()} / 30,000 characters</span>
          <button
            onClick={() => {
              setText("");
              setResult("");
            }}
            className={styles.reset}
          >
            <RotateCcw size={14} /> Clear
          </button>
          <button
            onClick={generate}
            disabled={busy}
            className={styles.generate}
          >
            <Sparkles size={15} />
            {busy ? "Generating..." : "Generate"}
          </button>
        </div>
        {result && (
          <div className={styles.result}>
            <div className={styles.resultHead}>
              <strong>Study output</strong>
              <button onClick={copyResult} title="Copy result">
                <Copy size={15} /> Copy
              </button>
            </div>
            <pre>{result}</pre>
            <small className={styles.demoNote}>
              Demo output generated locally. Connect a secure backend and AI
              provider for live results.
            </small>
          </div>
        )}
      </div>
    </section>
  );
}
