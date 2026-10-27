
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  UploadCloud,
  Trash2,
  File,
  Download,
} from "lucide-react";

import { EmptyState } from "../EmptyState/index.js";
import styles from "./MaterialsPanel.module.css";
import {
  supabase,
  isSupabaseConfigured,
} from "../../lib/supabase.js";

function fileSize(bytes) {
  return bytes > 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MaterialsPanel({
  materials,
  setMaterials,
  notify,
  compact = false,
}) {
  const inputRef = useRef(null);
  const [subject, setSubject] = useState("DBMS");
  const [uploading, setUploading] = useState(false);

useEffect(() => {
  async function loadMaterials() {
    if (!isSupabaseConfigured || !supabase) {
      notify("Supabase is not configured.");
      return;
    }

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      notify(`Could not load materials: ${error.message}`);
      return;
    }

    const loadedMaterials = (data || []).map((item) => {
      const { data: publicData } = supabase.storage
        .from("study-materials")
        .getPublicUrl(item.storage_path);

      return {
        id: item.storage_path,
        name: item.name,
        subject: item.subject,
        size: item.size,
        type: item.type,
        addedAt: item.created_at,
        url: publicData.publicUrl,
        path: item.storage_path,
      };
    });

    setMaterials(loadedMaterials);
  }

  loadMaterials();
}, [setMaterials, notify]);


  async function handleFiles(event) {
    const input = event.target;
    const files = Array.from(input.files || []);

    if (!files.length) return;

    if (!isSupabaseConfigured || !supabase) {
      notify("Supabase is not configured. Check your .env file.");
      input.value = "";
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          notify(`${file.name} is over the 10 MB limit.`);
          continue;
        }

        const safeName = file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );
        const path = `${crypto.randomUUID()}-${safeName}`;

        const { data, error } = await supabase.storage
          .from("study-materials")
          .upload(path, file);

        if (error) {
          notify(`Upload failed: ${error.message}`);
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("study-materials")
          .getPublicUrl(data.path);

        const material = {
          id: data.path,
          name: file.name,
          subject,
          size: file.size,
          type: file.name.split(".").pop().toUpperCase(),
          addedAt: "Just now",
          url: publicData.publicUrl,
          path: data.path,
        };
        const { error: dbError } = await supabase
  .from("study_materials")
  .insert({
    name: file.name,
    subject: subject,
    size: file.size,
    type: file.name.split(".").pop().toUpperCase(),
    storage_path: data.path,
  });

if (dbError) {
  notify(`File uploaded, but database save failed: ${dbError.message}`);
  continue;
}
        setMaterials((old) => [material, ...old]);

        notify(`${file.name} uploaded successfully.`);
      }
    } catch (error) {
      notify(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  function remove(material) {
    setMaterials((old) =>
      old.filter((item) => item.id !== material.id)
    );
    notify("Material removed from this list.");
  }

  const list = compact ? materials.slice(0, 3) : materials;

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2>
            {compact ? "Recent materials" : "Study materials"}
          </h2>
          <p>
            {compact
              ? "Your recently saved notes"
              : "Upload and organize your notes by subject."}
          </p>
        </div>

        {compact && (
          <span className={styles.count}>
            {materials.length} files
          </span>
        )}
      </div>

      {!compact && (
        <div className={styles.upload}>
          <UploadCloud size={29} />
          <strong>Upload your materials</strong>
          <p>
            PDF, DOCX, PPTX, TXT, images and more · 10 MB max
          </p>

          <div className={styles.uploadActions}>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-label="Select material subject"
            >
              <option>DBMS</option>
              <option>DSA</option>
              <option>PPS</option>
              <option>MATH</option>
              <option>General</option>
            </select>

            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud size={15} />
              {uploading ? "Uploading..." : "Choose files"}
            </button>

            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.xlsx,.csv"
              onChange={handleFiles}
            />
          </div>
        </div>
      )}

      <div className={styles.list}>
        {list.map((m) => (
          <div className={styles.item} key={m.id}>
            <span className={styles.fileIcon}>
              <FileText size={18} />
            </span>

            <div className={styles.info}>
              <strong title={m.name}>{m.name}</strong>
              <small>
                {m.subject} · {m.type} · {fileSize(m.size)}
              </small>
            </div>

            {m.url && (
              <a
                className={styles.open}
                href={m.url}
                download={m.name}
                title="Download file"
                target="_blank"
                rel="noreferrer"
              >
                <Download size={15} />
              </a>
            )}

            <button
              type="button"
              className={styles.remove}
              onClick={() => remove(m)}
              title="Remove material"
              aria-label={`Remove ${m.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {!list.length && (
        <EmptyState
          icon={File}
          title="Your library is empty"
          description="Upload class notes and reference files to get started."
        />
      )}

      {compact && (
        <button
          type="button"
          className={styles.viewAll}
          onClick={() =>
            notify(
              "Choose Study Materials in the sidebar to manage uploads."
            )
          }
        >
          View materials <span>→</span>
        </button>
      )}
    </section>
  );
}