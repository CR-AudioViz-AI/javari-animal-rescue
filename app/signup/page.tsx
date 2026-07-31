"use client";
// app/signup/page.tsx — same reasoning as app/login/page.tsx.
import { useEffect } from "react";

export default function SignupRedirect() {
  useEffect(() => {
    const dest = encodeURIComponent(window.location.origin + "/");
    window.location.replace(`https://craudiovizai.com/signup?returnTo=${dest}`);
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0f1a", color: "#F0F8FF", fontFamily: "system-ui" }}>
      <p>Taking you to create an account&hellip;</p>
    </div>
  );
}
