import styles from "./EmptyState.module.css";
export default function EmptyState({icon:Icon,title,description}) {
  return <div className={styles.empty}><span><Icon size={22}/></span><strong>{title}</strong><p>{description}</p></div>;
}
