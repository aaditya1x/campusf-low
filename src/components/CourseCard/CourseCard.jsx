import { ArrowUpRight, BookOpen, Trash2 } from "lucide-react";
import styles from "./CourseCard.module.css";
const tones = { purple:["#f0eeff","#6c5ce7"],green:["#e3f8f0","#209b75"],blue:["#e7f0ff","#3f7fe8"],orange:["#fff0e5","#b96b2e"] };
export default function CourseCard({ course, onOpen, onDelete }) {
  const [bg,fg] = tones[course.color] || tones.purple;
  return <article className={styles.card}>
    <div className={styles.top}>
      <span className={styles.courseIcon} style={{background:bg,color:fg}}><BookOpen size={19}/></span>
      <span className={styles.semester}>Semester {course.semester}</span>
      <button type="button" className={styles.delete} onClick={()=>onDelete?.(course)} aria-label={`Delete ${course.name}`} title="Delete course"><Trash2 size={15}/></button>
    </div>
    <h3>{course.name}</h3><p className={styles.code}>{course.code} · {course.materials || 0} materials</p>
    <div className={styles.progressLabel}><span>Course progress</span><b>{course.progress}%</b></div>
    <div className={styles.track}><span style={{width:`${Math.min(100,Math.max(0,course.progress))}%`,background:fg}}/></div>
    <div className={styles.actions}><button onClick={onOpen} className={styles.open}>Open course <ArrowUpRight size={14}/></button><button type="button" className={styles.deleteText} onClick={()=>onDelete?.(course)}><Trash2 size={13}/> Delete</button></div>
  </article>;
}
