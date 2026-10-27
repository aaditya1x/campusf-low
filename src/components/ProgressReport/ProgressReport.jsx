import { ChartNoAxesCombined, CheckCircle2, BookOpen, FileText, ListTodo } from "lucide-react";
import { StatCard } from "../StatCard/index.js";
import styles from "./ProgressReport.module.css";

export default function ProgressReport({courses,tasks,materials}) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  // Guard empty task lists; clamp the percentage and explicitly show 100% when all tasks are done.
  const taskProgress = totalTasks === 0
    ? 0
    : completedTasks === totalTasks
      ? 100
      : Math.round((completedTasks / totalTasks) * 100);
  const average=courses.length?Math.round(courses.reduce((s,c)=>s+c.progress,0)/courses.length):0;

  return <section className={styles.page}>
    <div className={styles.heading}><p>YOUR GROWTH</p><h1>Progress report</h1><span>Review your course progress and task completion.</span></div>
    <div className={styles.stats}>
      <StatCard label="Task completion" value={`${taskProgress}%`} note={`${completedTasks} of ${totalTasks} tasks completed`} icon={ListTodo} tint="purple"/>
      <StatCard label="Average course progress" value={`${average}%`} note="Across all enrolled courses" icon={ChartNoAxesCombined} tint="green"/>
      <StatCard label="Courses enrolled" value={courses.length} note="Current learning library" icon={BookOpen} tint="blue"/>
      <StatCard label="Materials saved" value={materials.length} note="Study reference files" icon={FileText} tint="orange"/>
    </div>
    <div className={styles.panel}>
      <div className={styles.taskProgressHeading}><div><h2>Overall task completion</h2><p>{totalTasks===0?"Add a task to start tracking progress.":taskProgress===100?"Excellent — every task is complete!":"Keep going; every completed task moves you forward."}</p></div><strong>{taskProgress}%</strong></div>
      <div className={styles.taskProgressTrack} role="progressbar" aria-label="Overall task completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={taskProgress}><span style={{width:`${taskProgress}%`}}/></div>
    </div>
    <div className={styles.panel}><h2>Course completion</h2><p>Progress is based on each course's saved progress percentage.</p>{courses.map(c=><div className={styles.course} key={c.id}><div className={styles.courseHead}><strong>{c.name}</strong><b>{c.progress}%</b></div><div className={styles.track} role="progressbar" aria-label={`${c.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.progress}><span style={{width:`${Math.min(100,Math.max(0,c.progress))}%`}}/></div><small>{c.code} · Semester {c.semester}</small></div>)}</div>
  </section>;
}
