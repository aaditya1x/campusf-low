import styles from "./StatCard.module.css";
export default function StatCard({ label, value, note, icon: Icon, tint="purple" }) {
  return <article className={styles.card}><div className={styles.top}><span>{label}</span><span className={`${styles.icon} ${styles[tint]}`}><Icon size={18}/></span></div><strong className={styles.value}>{value}</strong><p>{note}</p></article>;
}
