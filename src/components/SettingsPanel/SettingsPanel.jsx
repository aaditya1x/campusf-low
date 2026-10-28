
import { useEffect, useRef, useState } from "react";
import {
  Monitor,
  Moon,
  Sun,
  Palette,
  Database,
  ShieldCheck,
  Camera,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import { ThemeSwitcher } from "../ThemeSwitcher/index.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import { supabase } from "../../lib/supabase.js";
import styles from "./SettingsPanel.module.css";

const BUCKET = "Profile-photos";

export default function SettingsPanel({
  notify,
  profilePicture = "",
  onProfilePictureChange,
}) {
  const { theme, resolvedTheme } = useTheme();
  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(profilePicture);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhoto(profilePicture);
  }, [profilePicture]);

  async function selectPicture(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notify("Profile image must be 2 MB or smaller.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!data.user) throw new Error("Please log in first.");

      const user = data.user;
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/profile-${Date.now()}.${extension}`;
      console.log("UPLOADED STORAGE PATH:", path);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          avatar_path: path,
        },
      });

      if (updateError) throw updateError;
      console.log("Saved avatar path:", path);
      console.log("Current user ID:", user.id);
console.log("Bucket:", BUCKET);

      const { data: signedData, error: signedError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 3600);

      if (signedError) throw signedError;

      setPhoto(signedData.signedUrl);
      onProfilePictureChange?.(signedData.signedUrl);

      notify("Profile photo saved to your account.");
    } catch (error) {
      console.error("Profile photo upload failed:", error);
      notify(error.message || "Could not upload profile photo.");
    } finally {
      setLoading(false);
    }
  }

  async function removePicture() {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!data.user) throw new Error("Please log in first.");

      const oldPath = data.user.user_metadata?.avatar_path;

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...data.user.user_metadata,
          avatar_path: null,
        },
      });

      if (updateError) throw updateError;

      setPhoto("");
      onProfilePictureChange?.("");

      if (oldPath) {
        const { error: removeError } = await supabase.storage
          .from(BUCKET)
          .remove([oldPath]);

        if (removeError) {
          console.error("Could not delete old photo:", removeError);
        }
      }

      notify("Profile photo removed.");
    } catch (error) {
      console.error("Profile photo removal failed:", error);
      notify(error.message || "Could not remove profile photo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <p>PREFERENCES</p>
        <h1>Settings</h1>
        <span>Manage your profile and learning workspace.</span>
      </div>

      <div className={styles.panel}>
        <div className={styles.row}>
          <span className={styles.icon}>
            <Camera size={19} />
          </span>

          <div className={styles.copy}>
            <strong>Profile picture</strong>
            <p>
              Upload a photo saved to your account. Maximum size: 2 MB.
            </p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={selectPicture}
            disabled={loading}
          />

          <button
            type="button"
            className={styles.secondary}
            onClick={() => fileRef.current?.click()}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle size={16} />
            ) : photo ? (
              "Change photo"
            ) : (
              "Upload photo"
            )}
          </button>

          {photo && (
            <button
              type="button"
              className={styles.removePhoto}
              onClick={removePicture}
              disabled={loading}
              aria-label="Remove profile picture"
              title="Remove photo"
            >
              <Trash2 size={15} />
            </button>
          )}

          <div className={styles.profilePreview}>
            {photo ? (
              <img src={photo} alt="Current profile" />
            ) : (
              <span>AK</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.icon}>
            <Palette size={19} />
          </span>
          <div className={styles.copy}>
            <strong>Appearance</strong>
            <p>Choose a theme or follow your device setting.</p>
          </div>
          <ThemeSwitcher />
        </div>

        <div className={styles.preview}>
          <div>
            <Sun size={18} />
            <span>Light</span>
          </div>
          <div>
            <Moon size={18} />
            <span>Dark</span>
          </div>
          <div>
            <Monitor size={18} />
            <span>System</span>
          </div>
          <small>
            Selected: {theme} · Currently displaying: {resolvedTheme}
          </small>
        </div>

        <div className={styles.row}>
          <span className={styles.icon}>
            <Database size={19} />
          </span>
          <div className={styles.copy}>
            <strong>Cloud profile</strong>
            <p>
              Your profile photo is stored in Supabase and linked to your
              signed-in account.
            </p>
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.icon}>
            <ShieldCheck size={19} />
          </span>
          <div className={styles.copy}>
            <strong>Privacy</strong>
            <p>
              Keep your Supabase Storage policies restricted to the
              appropriate user.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
