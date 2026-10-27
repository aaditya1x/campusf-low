
import { useEffect, useMemo, useState } from "react";
import { Plus, BookOpen, X } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { CourseCard } from "../CourseCard/index.js";
import { EmptyState } from "../EmptyState/index.js";
import styles from "./CourseLibrary.module.css";

export default function CourseLibrary({
  courses,
  setCourses,
  notify,
  query = "",
  compact = false
}) {
  const [semester, setSemester] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [semesterValue, setSemesterValue] = useState("1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setLoading(true);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setError("Could not load courses: " + error.message);
      } else {
        setCourses((data || []).map(course => ({
          ...course,
          name: course.name || course.title || "Untitled subject",
          code: course.code || course.course_code || "",
          semester: course.semester ?? 1,
          progress: course.progress ?? 0,
          color: course.color || "purple",
          materials: course.materials ?? 0,
          description: course.description || ""
        })));
      }

      setLoading(false);
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [setCourses]);

  const visible = useMemo(() => courses.filter(course =>
    (semester === "all" || String(course.semester) === semester) &&
    `${course.name} ${course.code} ${course.description || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  ), [courses, semester, query]);

  async function addCourse(event) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanTitle || !cleanCode) {
      setError("Enter both a subject title and course code.");
      return;
    }

    if (courses.some(course =>
      course.code?.toLowerCase() === cleanCode.toLowerCase()
    )) {
      setError("That course code already exists.");
      return;
    }

    setLoading(true);
    setError("");

    const newCourse = {
      name: cleanTitle,
      code: cleanCode,
      title: cleanTitle,
      course_code: cleanCode,
      semester: Number(semesterValue),
      description: description.trim(),
      progress: 0,
      color: ["purple", "green", "blue", "orange"][courses.length % 4],
      materials: 0
    };

    const { data, error: insertError } = await supabase
      .from("courses")
      .insert(newCourse)
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError("Could not save subject: " + insertError.message);
      return;
    }

    setCourses(old => [{
      ...data,
      name: data.name || data.title,
      code: data.code || data.course_code
    }, ...old]);

    setTitle("");
    setCode("");
    setDescription("");
    setSemesterValue("1");
    setFormOpen(false);
    notify?.("Subject saved to Supabase.");
  }

  async function deleteCourse(course) {
    if (!window.confirm(`Delete "${course.name}"?`)) return;

    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id);

    if (deleteError) {
      notify?.("Could not delete subject: " + deleteError.message);
      return;
    }

    setCourses(old => old.filter(item => item.id !== course.id));
    notify?.(`${course.name} deleted.`);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2>{compact ? "My courses" : "Course library"}</h2>
          <p>
            {courses.length === 0
              ? "Your subjects will appear here after you add them."
              : compact
                ? "Your subjects at a glance"
                : "Manage your subjects and track learning progress."}
          </p>
        </div>

        <div className={styles.controls}>
          {!compact && (
            <select
              value={semester}
              onChange={event => setSemester(event.target.value)}
              aria-label="Filter by semester"
            >
              <option value="all">All semesters</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Semester {i + 1}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => {
              setFormOpen(open => !open);
              setError("");
            }}
            className={styles.add}
          >
            {formOpen ? <X size={15} /> : <Plus size={15} />}
            <span>{formOpen ? "Cancel" : "Add subject"}</span>
          </button>
        </div>
      </div>

      {formOpen && (
        <form className={styles.addForm} onSubmit={addCourse}>
          <div className={styles.formGrid}>
            <label>
              Subject title
              <input
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder="e.g. Database Management Systems"
                maxLength={100}
                required
              />
            </label>

            <label>
              Course code
              <input
                value={code}
                onChange={event => setCode(event.target.value)}
                placeholder="e.g. DBMS"
                maxLength={16}
                required
              />
            </label>

            <label>
              Semester
              <select
                value={semesterValue}
                onChange={event => setSemesterValue(event.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Semester {i + 1}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.descriptionField}>
              Description (optional)
              <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Add a short description..."
                maxLength={500}
                rows={2}
              />
            </label>
          </div>

          {error && <p className={styles.formError} role="alert">{error}</p>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "Saving..." : "Save subject"}
          </button>
        </form>
      )}

      {error && !formOpen && (
        <p className={styles.formError} role="alert">{error}</p>
      )}

      {loading && <p>Loading courses from Supabase...</p>}

      <div className={styles.grid}>
        {visible.slice(0, compact ? 4 : undefined).map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onOpen={() => notify?.(`${course.name} selected.`)}
            onDelete={deleteCourse}
          />
        ))}
      </div>

      {!loading && !visible.length && (
        <EmptyState
          icon={BookOpen}
          title={query ? "No matching subjects" : "No subjects added yet"}
          description={
            query
              ? "Try a different search term."
              : "Start by adding your first subject using the button above."
          }
        />
      )}
    </section>
  );
}
