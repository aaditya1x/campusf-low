import { useState } from "react";
import { BrainCircuit, Sparkles, Copy, RotateCcw } from "lucide-react";
import styles from "./AIStudyTools.module.css";
const descriptions={summarize:"Turn your notes into a concise revision guide.",explain:"Understand a difficult concept in simple language.",quiz:"Create practice questions to test your understanding."};
export default function AIStudyTools({notify}) {
  const [mode,setMode]=useState("summarize");
  const [text,setText]=useState("");
  const [result,setResult]=useState("");
  const [busy,setBusy]=useState(false);
  function generate(){
    if(text.trim().length<10){notify("Paste at least a few lines of notes or a topic first.");return;}
    setBusy(true);setResult("");
    window.setTimeout(()=>{
      const content=text.trim();
      const sentences=content.split(/(?<=[.!?])\s+/).filter(Boolean);
      if(mode==="summarize") setResult(`STUDY SUMMARY\n\nMain idea\n${sentences.slice(0,3).join(" ")}\n\nKey points\n${sentences.slice(3,8).map(s=>"• "+s).join("\n")||"• Identify the main concepts and definitions.\n• Review the examples and important terms."}\n\nRevision tip\nExplain the topic in your own words, then test yourself without looking at the notes.`);
      else if(mode==="explain") setResult(`SIMPLE EXPLANATION\n\nLet's break this topic down into smaller parts:\n\n1. Start with the central idea: ${sentences[0]||content}\n\n2. Focus on the important terms and how they relate to one another.\n\n3. Try to create a small real-world example, then explain why it fits the concept.\n\nNote: This is a local demo response, not a live AI-generated answer.`);
      else setResult(`PRACTICE QUESTIONS\n\n1. What is the main concept described in your notes?\n2. Explain the key idea in your own words.\n3. Which terms or definitions are most important?\n4. Give an example that applies the concept.\n5. What is one common misunderstanding about this topic?\n\nAnswer guide: Use your pasted notes to draft an answer for each question, then compare it with the source material.\n\nNote: Connect a server-side AI API for content-aware quiz generation.`);
      setBusy(false);
    },350);
  }
  async function copyResult(){try{await navigator.clipboard.writeText(result);notify("Result copied.");}catch{notify("Clipboard access was blocked by the browser.");}}
  return <section className={styles.page}><div className={styles.intro}><span className={styles.icon}><BrainCircuit size={25}/></span><div><p className={styles.eyebrow}>AI LEARNING LAB</p><h1>AI Study Tools</h1><p>Turn study material into a clearer path to understanding.</p></div></div><div className={styles.panel}><label className={styles.label}>Choose a tool</label><div className={styles.modeGrid}>{[["summarize","Summarize notes"],["explain","Explain a concept"],["quiz","Generate a quiz"]].map(([id,label])=><button key={id} onClick={()=>setMode(id)} className={`${styles.mode} ${mode===id?styles.modeActive:""}`}><Sparkles size={17}/><strong>{label}</strong><small>{descriptions[id]}</small></button>)}</div><label className={styles.label} htmlFor="ai-notes">Your notes or topic</label><textarea id="ai-notes" value={text} onChange={e=>setText(e.target.value)} rows={8} maxLength={30000} placeholder="Paste DBMS notes, a textbook paragraph, or a topic such as normalization..."/><div className={styles.footer}><span>{text.length.toLocaleString()} / 30,000 characters</span><button onClick={()=>{setText("");setResult("");}} className={styles.reset}><RotateCcw size={14}/> Clear</button><button onClick={generate} disabled={busy} className={styles.generate}><Sparkles size={15}/>{busy?"Generating...":"Generate"}</button></div>{result&&<div className={styles.result}><div className={styles.resultHead}><strong>Study output</strong><button onClick={copyResult} title="Copy result"><Copy size={15}/> Copy</button></div><pre>{result}</pre><small className={styles.demoNote}>Demo output generated locally. Connect a secure backend and AI provider for live results.</small></div>}</div></section>;
}
