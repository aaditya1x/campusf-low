import { useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  BrainCircuit,
  ChartNoAxesCombined,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Settings2,
} from "lucide-react";

import { AppShell } from "./components/AppShell/index.js";
import { Navbar } from "./components/Navbar/index.js";
import { Sidebar } from "./components/Sidebar/index.js";
import { StatCard } from "./components/StatCard/index.js";
import { CourseLibrary } from "./components/CourseLibrary/index.js";
import { MaterialsPanel } from "./components/MaterialsPanel/index.js";
import { TasksPanel } from "./components/TasksPanel/index.js";
import { AIStudyTools } from "./components/AIStudyTools/index.js";
import { ProgressReport } from "./components/ProgressReport/index.js";
import { SettingsPanel } from "./components/SettingsPanel/index.js";
import { Toast } from "./components/Toast/index.js";
import { Login } from "./components/Login/index.js";

import { usePersistentState } from "./hooks/usePersistentState.js";
import { supabase } from "./lib/supabase.js";
import {
  initialCourses,
  initialMaterials,
  initialTasks,
} from "./data/initialData.js";

import styles from "./App.module.css";

const SESSION_KEY = "campusflow-auth-session";

const navItems = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "Courses", label: "Courses", icon: BookOpen },
  { id: "Materials", label: "Study Materials", icon: FileText },
  { id: "Tasks", label: "Tasks & Assignments", icon: CheckSquare },
  { id: "AI Tools", label: "AI Study Tools", icon: BrainCircuit },
  { id: "Progress", label: "Progress Report", icon: ChartNoAxesCombined },
  { id: "Settings", label: "Settings", icon: Settings2 },
];

function readSession() {
  try {
    const value = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

    return value?.authenticated === true &&
      typeof value.username === "string" &&
      value.username.trim()
      ? {
          authenticated: true,
          username: value.username,
        }
      : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const [active, setActive] = useState("Dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [courses, setCourses] = usePersistentState(
    "campusflow-courses",
    initialCourses,
  );

  const [materials, setMaterials] = usePersistentState(
    "campusflow-materials",
    initialMaterials,
  );

  const [tasks, setTasks] = usePersistentState(
    "campusflow-tasks",
    initialTasks,
  );

  const [toast, setToast] = useState("");

  const [profilePicture, setProfilePicture] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCloudProfilePhoto() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user || !active) return;

      const path = data.user.user_metadata?.avatar_path;

      console.log("USER METADATA:", data.user.user_metadata);
      console.log("SAVED PHOTO PATH:", path);

      if (!path) {
        setProfilePicture("");
        return;
      }

      const { data: signedData, error: signedError } =
  await supabase.storage
    .from("Profile-photos")
    .createSignedUrl(path, 3600, {
      download: false,
    });

      if (!active) return;

      if (signedError) {
        console.error("Could not load profile photo:", signedError);
        return;
      }

      setProfilePicture(signedData.signedUrl);
    }

    loadCloudProfilePhoto();

    return () => {
      active = false;
    };
  }, [session?.authenticated]);

  const [query, setQuery] = useState("");

  // All React hooks must run before any conditional return.
  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 801px)").matches) {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const doneTasks = tasks.filter((task) => task.completed).length;
  const materialCount = materials.length;

  const courseHours = useMemo(
    () =>
      (
        courses.reduce(
          (sum, course) => sum + (Number(course.progress) || 0),
          0,
        ) /
        Math.max(courses.length, 1) /
        5
      ).toFixed(1),
    [courses],
  );

  function notify(message) {
    setToast(message);
    window.clearTimeout(notify.timer);

    notify.timer = window.setTimeout(() => {
      setToast("");
    }, 2800);
  }

  function handleLogin(user) {
    // Supabase Auth login user ko callback se deta hai.
    // Password kabhi localStorage mein store nahi hota.
    const username =
      user?.user_metadata?.username ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Student";

    const nextSession = {
      authenticated: true,
      username,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));

      setSession(nextSession);
      setActive("Dashboard");
    } catch {
      notify("Browser storage is unavailable.");
    }
  }

  function handleLogout() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore browser storage access errors.
    }

    setSession(null);
    setActive("Dashboard");
    setQuery("");
  }

  function handleNavigate(id) {
    setActive(id);
    setMobileNavOpen(false);
  }

  const shared = {
    courses,
    setCourses,
    materials,
    setMaterials,
    tasks,
    setTasks,
    notify,
    query,
    setQuery,
    setActive,
  };

  const title = navItems.find((item) => item.id === active)?.label || active;

  if (!session?.authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppShell>
      {mobileNavOpen && (
        <button
          type="button"
          className={styles.navOverlay}
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar
        items={navItems}
        active={active}
        onChange={handleNavigate}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <main className={styles.main}>
        <Navbar
          title={title}
          query={query}
          onQueryChange={setQuery}
          onMenu={() => setMobileNavOpen((open) => !open)}
          mobileNavOpen={mobileNavOpen}
          profilePicture={profilePicture}
          onProfilePictureChange={setProfilePicture}
          notify={notify}
          username={session.username}
          onLogout={handleLogout}
        />

        {active === "Dashboard" && (
          <>
            <section className={styles.welcome}>
              <div>
                <p className={styles.eyebrow}>YOUR LEARNING SPACE</p>
                <h1>
                  Welcome back, {session.username}!{" "}
                  <span aria-hidden="true">✦</span>
                </h1>
                <p className={styles.subtitle}>
                  Small steps today, stronger skills tomorrow.
                </p>
              </div>

              <button
                className={styles.primaryButton}
                onClick={() => setActive("Courses")}
              >
                ＋ Add a course
              </button>
            </section>

            <section className={styles.stats}>
              <StatCard
                label="Enrolled courses"
                value={courses.length}
                note="Across your semesters"
                icon={BookOpen}
                tint="purple"
              />

              <StatCard
                label="Study progress"
                value={`${courseHours} hrs`}
                note="Estimated learning progress"
                icon={ChartNoAxesCombined}
                tint="green"
              />

              <StatCard
                label="Materials saved"
                value={materialCount}
                note="In your study library"
                icon={FileText}
                tint="blue"
              />

              <StatCard
                label="Tasks completed"
                value={`${doneTasks}/${tasks.length}`}
                note="Keep your momentum"
                icon={CheckSquare}
                tint="orange"
              />
            </section>

            <div className={styles.dashboardGrid}>
              <CourseLibrary {...shared} compact />

              <div className={styles.rightColumn}>
                <div className={styles.aiBanner}>
                  <span className={styles.sparkle}>✦</span>
                  <h2>Your AI study companion</h2>
                  <p>
                    Turn notes into clear summaries, concept explanations and
                    practice quizzes.
                  </p>
                  <button onClick={() => setActive("AI Tools")}>
                    Explore AI tools <span>↗</span>
                  </button>
                </div>

                <TasksPanel {...shared} compact />
                <MaterialsPanel {...shared} compact />
              </div>
            </div>
          </>
        )}

        {active === "Courses" && <CourseLibrary {...shared} />}

        {active === "Materials" && <MaterialsPanel {...shared} />}

        {active === "Tasks" && <TasksPanel {...shared} />}

        {active === "AI Tools" && <AIStudyTools notify={notify} />}

        {active === "Progress" && (
          <ProgressReport
            courses={courses}
            tasks={tasks}
            materials={materials}
          />
        )}

        {active === "Settings" && (
          <SettingsPanel
            notify={notify}
            profilePicture={profilePicture}
            onProfilePictureChange={setProfilePicture}
          />
        )}
      </main>

      <Toast message={toast} />
    </AppShell>
  );
}
