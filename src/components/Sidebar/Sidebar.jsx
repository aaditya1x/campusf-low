import { GraduationCap, X } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar({ items, active, onChange, mobileOpen = false, onClose }) {
  return <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ""}`} aria-label="Main navigation">
    <div className={styles.brand}>
      <span className={styles.logo}><GraduationCap size={21}/></span><span>Study Sync</span>
      <button type="button" className={styles.close} aria-label="Close navigation" onClick={onClose}><X size={18}/></button>
    </div>
    <p className={styles.label}>WORKSPACE</p>
    <nav className={styles.nav}>{items.map(({ id, label, icon: Icon }) =>
      <button type="button" key={id} onClick={() => onChange(id)} className={`${styles.navItem} ${active === id ? styles.active : ""}`} aria-current={active === id ? "page" : undefined}>
        <Icon size={18}/><span>{label}</span>
      </button>
    )}</nav>
    <div className={styles.bottom}><div className={styles.tipIcon}>✦</div><strong>Your learning space</strong><p>Add your own subjects and track your learning at your pace.</p><small>No sample courses are preloaded.</small></div>
  </aside>;
}
