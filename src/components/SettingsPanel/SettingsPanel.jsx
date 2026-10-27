import { useRef } from "react";
import { Monitor, Moon, Sun, Palette, Database, ShieldCheck, Camera, Trash2 } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher/index.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import styles from "./SettingsPanel.module.css";
export default function SettingsPanel({notify, profilePicture="", onProfilePictureChange}) {
  const {theme,resolvedTheme}=useTheme();
  const fileRef=useRef(null);
  function selectPicture(event){
    const file=event.target.files?.[0];
    if(!file) return;
    if(!file.type.startsWith("image/")){notify("Please select an image file.");return;}
    if(file.size>2*1024*1024){notify("Profile image must be 2 MB or smaller.");return;}
    const reader=new FileReader();
    reader.onload=()=>{onProfilePictureChange(String(reader.result));notify("Profile picture updated.");};
    reader.onerror=()=>notify("Could not read that image.");
    reader.readAsDataURL(file);
    event.target.value="";
  }
  return <section className={styles.page}><div className={styles.heading}><p>PREFERENCES</p><h1>Settings</h1><span>Customize the look and feel of your learning workspace.</span></div><div className={styles.panel}>
    <div className={styles.row}><span className={styles.icon}><Camera size={19}/></span><div className={styles.copy}><strong>Profile picture</strong><p>Upload a JPG, PNG, WebP or other browser-supported image. Maximum 2 MB.</p></div><input ref={fileRef} type="file" accept="image/*" hidden onChange={selectPicture}/><button className={styles.secondary} onClick={()=>fileRef.current?.click()}>{profilePicture?"Change photo":"Upload photo"}</button>{profilePicture&&<button className={styles.removePhoto} onClick={()=>{onProfilePictureChange("");notify("Profile picture removed.");}} aria-label="Remove profile picture" title="Remove photo"><Trash2 size={15}/></button>}<div className={styles.profilePreview}>{profilePicture?<img src={profilePicture} alt="Current profile"/>:<span>AK</span>}</div></div>
    <div className={styles.row}><span className={styles.icon}><Palette size={19}/></span><div className={styles.copy}><strong>Appearance</strong><p>Choose from ten themes, or follow your device setting.</p></div><ThemeSwitcher/></div>
    <div className={styles.preview}><div><Sun size={18}/><span>Light</span></div><div><Moon size={18}/><span>Dark</span></div><div><Monitor size={18}/><span>System</span></div><small>Selected: {theme} · Currently displaying: {resolvedTheme}</small></div>
    <div className={styles.row}><span className={styles.icon}><Database size={19}/></span><div className={styles.copy}><strong>Local demo data</strong><p>Courses, tasks, theme and profile picture are stored in this browser.</p></div><button className={styles.secondary} onClick={()=>notify("Your demo data is saved in localStorage.")}>View status</button></div>
    <div className={styles.row}><span className={styles.icon}><ShieldCheck size={19}/></span><div className={styles.copy}><strong>Privacy note</strong><p>This frontend demo does not send your data to a server.</p></div></div>
  </div></section>;
}
