
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

function fileSize(bytes = 0) {
  return bytes > 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MaterialsPanel({
  materials = [],
  setMaterials,
  notify,
  compact = false,
}) {
  const inputRef = useRef(null);

  const [subject, setSubject] = useState("DBMS");
  const [uploading, setUploading] = useState(false);

  // Load only the logged-in user's materials
  useEffect(() => {
    let active = true;

    async function loadMaterials() {
      if (!isSupabaseConfigured || !supabase) {
        notify("Supabase is not configured. Check your .env file.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (active) {
          setMaterials([]);
          notify("Please log in with your Supabase account.");
        }
        return;
      }

      const { data, error } = await supabase
        .from("study_materials")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

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

    return () => {
      active = false;
    };
  }, [setMaterials, notify]);

  // Upload files and save their ownership
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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        notify("Please log in with your Supabase account before uploading.");
        return;
      }

      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) {
          notify(`${file.name} is over the 50 MB limit.`);
          continue;
        }

        const safeName = file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const path = `${crypto.randomUUID()}-${safeName}`;

        const {
          data: uploadedFile,
          error: uploadError,
        } = await supabase.storage
          .from("study-materials")
          .upload(path, file);

        if (uploadError) {
          notify(`Upload failed: ${uploadError.message}`);
          continue;
        }

        const { error: dbError } = await supabase
          .from("study_materials")
          .insert({
            user_id: user.id,
            name: file.name,
            subject,
            size: file.size,
            type: file.name.split(".").pop().toUpperCase(),
            storage_path: uploadedFile.path,
          });

        if (dbError) {
          notify(
            `File uploaded, but database save failed: ${dbError.message}`
          );
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("study-materials")
          .getPublicUrl(uploadedFile.path);

        const material = {
          id: uploadedFile.path,
          name: file.name,
          subject,
          size: file.size,
          type: file.name.split(".").pop().toUpperCase(),
          addedAt: new Date().toISOString(),
          url: publicData.publicUrl,
          path: uploadedFile.path,
        };

      
setMaterials((old) => [material, ...old]);

// Automatically index PDFs for Book-Only AI
if (file.name.toLowerCase().endsWith(".pdf")) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    notify(
      `${file.name} uploaded, but please log in again to index it.`
    );
    continue;
  }

  try {
    const response = await fetch("/api/index-book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        storage_path: uploadedFile.path,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      notify(
        `${file.name} uploaded, but indexing failed: ${
          result.error || "Unknown error"
        }`
      );
      continue;
    }

    notify(
      `${file.name} uploaded and indexed successfully.`
    );
  } catch (error) {
    notify(
      `${file.name} uploaded, but indexing could not connect to the server.`
    );
  }
} else {
  notify(`${file.name} uploaded successfully.`);
}

      }
    } catch (error) {
      notify(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  // Remove from the current screen only
  function remove(material) {
    setMaterials((old) =>
      old.filter((item) => item.id !== material.id)
    );

    notify(
      "Hidden from this list only. The database file has not been deleted."
    );
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
              onChange={(event) => setSubject(event.target.value)}
              aria-label="Select material subject"
            >
              <option>DBMS</option>
              <option>DSA</option>
              <option>JAVA</option>
              <option>COA</option>
              <option>DSD</option>
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
        {list.map((material) => (
          <div className={styles.item} key={material.id}>
            <span className={styles.fileIcon}>
              <FileText size={18} />
            </span>

            <div className={styles.info}>
              <strong title={material.name}>
                {material.name}
              </strong>

              <small>
                {material.subject} · {material.type} ·{" "}
                {fileSize(material.size)}
              </small>
            </div>

            {material.url && (
              <a
                className={styles.open}
                href={material.url}
                download={material.name}
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
              onClick={() => remove(material)}
              title="Hide material from this list"
              aria-label={`Hide ${material.name}`}
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
