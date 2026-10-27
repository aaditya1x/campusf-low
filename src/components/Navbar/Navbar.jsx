import { useRef } from "react";
import { Bell, Menu, Search, UserRound, LogOut, X } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher/index.js";
import styles from "./Navbar.module.css";
export default function Navbar({ title, query, onQueryChange, onMenu, mobileNavOpen=false, profilePicture="", onProfilePictureChange, notify, username="Student", onLogout }) {
  const fileRef=useRef(null);
  function selectPicture(event){
    const file=event.target.files?.[0];
    if(!file) return;
    if(!file.type.startsWith("image/")) { notify?.("Please select an image file."); return; }
    if(file.size>2*1024*1024) { notify?.("Profile image must be 2 MB or smaller."); return; }
    const reader=new FileReader();
    reader.onload=()=>{ onProfilePictureChange?.(String(reader.result)); notify?.("Profile picture updated."); };
    reader.onerror=()=>notify?.("Could not read that image.");
    reader.readAsDataURL(file);
    event.target.value="";
  }
  return <header className={styles.header}>
    <div className={styles.left}><button type="button" className={styles.menu} onClick={onMenu} aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen}>{mobileNavOpen ? <X size={19}/> : <Menu size={19}/>}</button><div className={styles.breadcrumb}>Workspace <span>/</span> <strong>{title}</strong></div></div>
    <div className={styles.actions}><label className={styles.search}><Search size={16}/><input value={query} onChange={e=>onQueryChange(e.target.value)} placeholder="Search courses..." aria-label="Search courses"/></label><ThemeSwitcher/><button className={styles.iconButton} aria-label="Notifications" title="Notifications"><Bell size={17}/><i/></button><input ref={fileRef} type="file" accept="image/*" hidden onChange={selectPicture}/><button type="button" className={styles.avatarButton} title={`Upload profile picture for ${username}`} aria-label="Upload profile picture" onClick={()=>fileRef.current?.click()}>{profilePicture?<img src={profilePicture} alt="Profile"/>:<span>{username.slice(0,2).toUpperCase()}</span>}<span className={styles.camera}><UserRound size={10}/></span></button><span className={styles.username}>{username}</span><button type="button" className={styles.logout} onClick={onLogout} title="Log out"><LogOut size={15}/><span>Log out</span></button></div>
  </header>;
}
