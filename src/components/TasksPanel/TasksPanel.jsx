import { useState } from "react";
import { CheckCircle2, Circle, Plus, ListTodo, Trash2 } from "lucide-react";
import { EmptyState } from "../EmptyState/index.js";
import styles from "./TasksPanel.module.css";
export default function TasksPanel({tasks,setTasks,notify,compact=false}) {
  const [filter,setFilter]=useState("all");
  const done=tasks.filter(t=>t.completed).length;
  const visible=tasks.filter(t=>filter==="all"||(filter==="open"&&!t.completed)||(filter==="done"&&t.completed)).slice(0,compact?4:undefined);
  function addTask(){const title=window.prompt("Task or assignment title?");if(!title?.trim())return;const description=window.prompt("Optional notes?","")||"";setTasks(old=>[{id:crypto.randomUUID(),title:title.trim(),description,completed:false,courseId:null},...old]);notify("Task added.");}
  function toggle(task){setTasks(old=>old.map(t=>t.id===task.id?{...t,completed:!t.completed}:t));}
  function deleteTask(task){
    if(!window.confirm(`Delete task "${task.title}"?`)) return;
    setTasks(old=>old.filter(t=>t.id!==task.id));
    notify("Task deleted.");
  }
  return <section className={styles.panel}><div className={styles.header}><div><h2>{compact?"Study checklist":"Tasks & assignments"}</h2><p>{compact?"Small steps, meaningful progress":"Keep track of revision, practice and coursework."}</p></div><span className={styles.badge}>{done}/{tasks.length} done</span></div>{!compact&&<div className={styles.filters}>{[["all","All tasks"],["open","To do"],["done","Completed"]].map(([id,label])=><button key={id} onClick={()=>setFilter(id)} className={filter===id?styles.selected:""}>{label}</button>)}</div>}<div className={styles.list}>{visible.map(task=><div key={task.id} className={styles.taskRow}><label className={styles.task}><input type="checkbox" checked={task.completed} onChange={()=>toggle(task)}/><span className={styles.customCheck}>{task.completed?<CheckCircle2 size={19}/>:<Circle size={19}/>}</span><span className={styles.copy}><strong className={task.completed?styles.completed:""}>{task.title}</strong>{task.description&&<small>{task.description}</small>}</span></label><button type="button" className={styles.delete} onClick={()=>deleteTask(task)} title={`Delete ${task.title}`} aria-label={`Delete ${task.title}`}><Trash2 size={15}/></button></div>)}</div>{!visible.length&&<EmptyState icon={ListTodo} title="No tasks here" description="Add a task to keep your learning moving."/>}<button className={styles.add} onClick={addTask}><Plus size={15}/> Add task</button></section>;
}
