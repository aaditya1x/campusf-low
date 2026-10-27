import { CheckCircle2 } from "lucide-react";
import styles from "./Toast.module.css";
export default function Toast({message}) {
  if(!message) return null;
  return <div className={styles.toast} role="status" aria-live="polite"><CheckCircle2 size={17}/>{message}</div>;
}
