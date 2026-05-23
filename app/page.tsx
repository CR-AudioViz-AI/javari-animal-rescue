"use client";
// app/page.tsx — Javari Animal Rescue
// CR AudioViz AI · EIN 39-3646201 · May 2026
import { useState } from "react";

const TOOLS = [{"icon": "\ud83d\udc9a", "label": "Grant Writer", "desc": "Find rescue-specific grants", "href": "https://craudiovizai.com/grants"}, {"icon": "\ud83d\udcf1", "label": "Social Posts", "desc": "Adoption posts that convert", "href": "/social"}, {"icon": "\ud83d\udc15", "label": "Pet Profile", "desc": "AI adoption bio writer", "href": "/profiles"}, {"icon": "\ud83d\udce7", "label": "Donor Email", "desc": "Fundraising campaigns", "href": "/email"}, {"icon": "\ud83d\udccb", "label": "Intake Form", "desc": "Smart intake questionnaires", "href": "/intake"}, {"icon": "\u2764\ufe0f", "label": "Success Story", "desc": "Tell your rescue stories", "href": "/stories"}];

export default function HomePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!input.trim()) return;
    setLoading(true); setOutput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
          stream: false,
          systemOverride: "You are an expert at writing compelling pet adoption bios that get animals adopted. Write emotionally engaging, specific bios that highlight personality and match pets to families.",
        }),
      });
      const data = await res.json();
      setOutput(data?.choices?.[0]?.message?.content || data?.content || "Error.");
    } catch { setOutput("Connection error."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#040912", color:"#e2e8f0", fontFamily:"system-ui" }}>
      <nav style={{ background:"#1E3A5F", padding:"0 20px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>🐾</span>
          <span style={{ fontWeight:800, color:"#FF0800", fontSize:15 }}>Javari Animal Rescue</span>
        </div>
        <a href="https://craudiovizai.com/auth/signup" style={{ background:"#FF0800", color:"#fff", borderRadius:7, padding:"5px 14px", fontSize:12, fontWeight:700, textDecoration:"none" }}>Sign Up Free</a>
      </nav>
      <section style={{ background:"linear-gradient(135deg,#1E3A5F,#040912)", padding:"56px 24px 48px", textAlign:"center" }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <h1 style={{ fontSize:"clamp(24px,4vw,44px)", fontWeight:900, color:"#fff", margin:"0 0 12px", lineHeight:1.05 }}>AI Tools for<br /><span style={{ color:"#FF0800" }}>Animal Rescues</span></h1>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:15, lineHeight:1.65, margin:0 }}>Grant writing, social media, adoption listings, and fundraising for rescues and shelters.</p>
        </div>
      </section>
      <section style={{ maxWidth:720, margin:"0 auto", padding:"28px 20px 0" }}>
        <div style={{ background:"#0F1F32", border:"1px solid rgba(0,180,216,0.12)", borderRadius:14, padding:"20px 24px" }}>
          <h2 style={{ margin:"0 0 12px", fontSize:15, fontWeight:700, color:"#fff" }}>Write Adoption Bio</h2>
          <div style={{ display:"flex", gap:8 }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()}
              placeholder="Describe the animal (name, age, breed, personality)..."
              style={{ flex:1, background:"#172D48", border:"1px solid rgba(0,180,216,0.15)", borderRadius:8, padding:"10px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"system-ui" }} />
            <button onClick={generate} disabled={loading||!input.trim()}
              style={{ background:loading||!input.trim()?"#0F1F32":"#1E3A5F", color:loading||!input.trim()?"#374151":"#FF0800", border:"1px solid rgba(0,180,216,0.2)", borderRadius:8, padding:"10px 18px", fontSize:13, fontWeight:700, cursor:loading||!input.trim()?"not-allowed":"pointer", fontFamily:"system-ui" }}>
              {loading?"...":"Go"}
            </button>
          </div>
          {output && <div style={{ marginTop:14, padding:"12px 14px", background:"rgba(0,180,216,0.05)", border:"1px solid rgba(0,180,216,0.1)", borderRadius:8 }}>
            <pre style={{ margin:0, fontSize:13, color:"#e2e8f0", lineHeight:1.65, whiteSpace:"pre-wrap", fontFamily:"system-ui", maxHeight:320, overflowY:"auto" }}>{output}</pre>
          </div>}
        </div>
      </section>
      <section style={{ maxWidth:960, margin:"0 auto", padding:"36px 20px 72px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
          {TOOLS.map((t:any) => (
            <a key={t.href} href={t.href} style={{ background:"#0F1F32", border:"1px solid rgba(0,180,216,0.08)", borderRadius:14, padding:"18px 16px", textDecoration:"none", display:"block" }}>
              <span style={{ fontSize:26, display:"block", marginBottom:8 }}>{t.icon}</span>
              <div style={{ fontWeight:700, fontSize:13, color:"#e2e8f0", marginBottom:4 }}>{t.label}</div>
              <div style={{ fontSize:11, color:"#6B7280", lineHeight:1.4 }}>{t.desc}</div>
            </a>
          ))}
        </div>
      </section>
      <footer style={{ borderTop:"1px solid rgba(0,180,216,0.08)", padding:"12px 24px", textAlign:"center" }}>
        <p style={{ color:"#374151", fontSize:11, margin:0 }}>© 2026 CR AudioViz AI, LLC — EIN: 39-3646201 · <a href="https://craudiovizai.com/auth/signup" style={{ color:"#FF0800", textDecoration:"none", fontWeight:600 }}>Sign Up Free</a></p>
      </footer>
    </div>
  );
}