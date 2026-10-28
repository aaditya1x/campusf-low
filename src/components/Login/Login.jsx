
import { useState } from "react";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  UserRound,
  BookOpen,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import styles from "./Login.module.css";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase is not configured. Check your .env file.");
      return;
    }

    if (mode === "signup" && name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: authError } =
          await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
              data: { full_name: name.trim() },
            },
          });

        if (authError) throw authError;

        if (data.session && data.user) {
          onLogin?.(data.user);
        } else {
          setMessage(
            "Account created. Check your email to confirm your account, then log in."
          );
          setMode("login");
        }
      } else {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

        if (authError) throw authError;
        onLogin?.(data.user);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <section className={styles.layout}>
        <aside className={styles.brandPanel}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>
              <GraduationCap size={27} />
            </span>
            <span>Study Sync</span>
          </div>

          <div className={styles.brandContent}>
            <span className={styles.eyebrow}>
              YOUR CAMPUS. YOUR FUTURE.
            </span>
            <h1>
              Make your
              <br />
              next chapter
              <br />
              <span>count.</span>
            </h1>
            <p>
              Your learning space for class notes, study materials,
              courses and academic progress—all in one place.
            </p>

            <div className={styles.feature}>
              <span className={styles.featureIcon}>
                <BookOpen size={19} />
              </span>
              <div>
                <strong>Everything in one place</strong>
                <small>Study smarter, stay organized.</small>
              </div>
            </div>
          </div>

          <div className={styles.brandFooter}>
            BUILT FOR STUDENT SUCCESS
          </div>
        </aside>

        <div className={styles.formPanel}>
          <div className={styles.mobileBrand}>
            <GraduationCap size={25} />
            <strong>Study Sync</strong>
          </div>

          <div className={styles.formHeading}>
            <span className={styles.welcome}>
              {mode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </span>
            <h2>
              {mode === "login" ? "Sign in to Study Sync" : "Create your account"}
            </h2>
            <p>
              {mode === "login"
                ? "Enter your details to access your learning space."
                : "Join Study Sync and organize your learning."}
            </p>
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={mode === "login" ? styles.activeTab : ""}
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "signup" ? styles.activeTab : ""}
              onClick={() => {
                setMode("signup");
                setError("");
                setMessage("");
              }}
            >
              Create account
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label className={styles.field}>
                <span>Full name</span>
                <div className={styles.inputWrap}>
                  <UserRound size={18} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </label>
            )}

            <label className={styles.field}>
              <span>Email address</span>
              <div className={styles.inputWrap}>
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <div className={styles.inputWrap}>
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && (
              <p className={styles.error} role="alert">{error}</p>
            )}
            {message && (
              <p className={styles.message} role="status">{message}</p>
            )}

            <button
              className={styles.submit}
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign in to your account"
                    : "Create my account"}
              </span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className={styles.switchText}>
            {mode === "login"
              ? "New to Study Sync?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setMessage("");
              }}
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>

          <div className={styles.security}>
            <LockKeyhole size={14} />
            <span>Your account is secured with Supabase Auth.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
