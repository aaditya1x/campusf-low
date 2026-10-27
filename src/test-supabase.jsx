
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function TestSupabase() {
  const [status, setStatus] = useState("Checking connection...");

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase
          .from("courses")
          .select("id")
          .limit(1);

        if (error) {
          setStatus("Database error: " + error.message);
        } else {
          setStatus("SUCCESS: Supabase database is responding!");
        }
      } catch (err) {
        setStatus("Connection error: " + err.message);
      }
    }

    checkConnection();
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>CampusFlow Connection Test</h1>
      <p>{status}</p>
    </div>
  );
}
