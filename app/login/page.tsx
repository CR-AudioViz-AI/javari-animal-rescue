"use client";
// app/login/page.tsx
// AuthButtons.tsx links here, but this page never existed - same gap already
// fixed in javari-partners and javari-legal-docs. Same proven pattern: send
// people to the real core login and back.
import { useEffect } from "react";

export default function LoginRedirect() {
  useEffect(() => {
    const dest = encodeURIComponent(window.location.origin + "/");
    window.location.replace(`https://craudiovizai.com/login?redirect=${dest}`);
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0f1a", color: "#F0F8FF", fontFamily: "system-ui" }}>
      <p>Taking you to sign in&hellip;</p>
    </div>
  );
}
