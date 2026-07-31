"use client";
// app/page.tsx — Javari Animal Rescue
// AI-powered tools for animal shelters, rescues, and foster networks
// Beats: Petfinder tools, DonorPerfect, PetPoint, Shelterluv content tools
// CR AudioViz AI · EIN 39-3646201 · June 2026
//
// Fixed 2026-07-31: AuthButtons, CreditsBar, and JavariWidget existed in this
// repo, fully built, and were never actually rendered anywhere - a user had
// no visible way to log in, see their balance, or get support. Separately,
// generate() never attached an auth token to its request at all, meaning
// even a logged-in user would always be rejected once credits enforcement
// was turned on. Both fixed together here.
import { useState, useCallback, useEffect } from "react";
import { AuthButtons } from "@/components/brand/AuthButtons";
import { CreditsBar } from "@/components/brand/CreditsBar";
import JavariWidget from "@/components/javari-widget/JavariWidget";
import { supabase } from "@/lib/supabase";

const TOOLS = [
  { id:"adoption",   icon:"🐾", label:"Adoption Bio Writer",    desc:"Compelling pet profiles that get animals adopted faster",   color:"#10B981" },
  { id:"grant",      icon:"💰", label:"Grant Application",      desc:"Apply to 500+ animal welfare grants automatically",         color:"#F59E0B" },
  { id:"donor",      icon:"📧", label:"Donor Email Campaign",   desc:"Personalized fundraising emails that convert",              color:"#3B82F6" },
  { id:"social",     icon:"📱", label:"Social Media Posts",     desc:"Adoption posts optimized for Facebook, Instagram, TikTok", color:"#8B5CF6" },
  { id:"volunteer",  icon:"🤝", label:"Volunteer Recruitment",  desc:"Job listings, training guides, onboarding materials",       color:"#EC4899" },
  { id:"care",       icon:"🏥", label:"Animal Care Guide",      desc:"Species-specific care instructions for fosters",            color:"#06B6D4" },
  { id:"newsletter", icon:"📰", label:"Rescue Newsletter",      desc:"Monthly newsletters that retain donors and volunteers",     color:"#84CC16" },
  { id:"policy",     icon:"📋", label:"Policy & Procedures",    desc:"Adoption agreements, foster contracts, intake forms",       color:"#F97316" },
];

const TOOL_FIELDS: Record<string, {label:string; placeholder:string; type?:string}[]> = {
  adoption: [
    {label:"Animal Name",   placeholder:"Max"},
    {label:"Species/Breed", placeholder:"Golden Retriever mix"},
    {label:"Age",           placeholder:"3 years"},
    {label:"Personality",   placeholder:"Playful, loves kids, house-trained..."},
    {label:"Special needs or story", placeholder:"Found as a stray, loves to cuddle..."},
  ],
  grant: [
    {label:"Organization name",   placeholder:"Happy Paws Rescue"},
    {label:"Grant amount needed",  placeholder:"$5,000"},
    {label:"Program to fund",      placeholder:"Spay/neuter clinic for low-income families"},
    {label:"Annual animals helped",placeholder:"200"},
    {label:"Mission statement",    placeholder:"We rescue and rehome animals..."},
  ],
  donor: [
    {label:"Donor name",    placeholder:"Sarah"},
    {label:"Donation ask",  placeholder:"$50/month"},
    {label:"Rescue name",   placeholder:"Happy Paws Rescue"},
    {label:"Urgency",       placeholder:"Winter overflow — 40 animals need foster homes"},
    {label:"Impact story",  placeholder:"Last month we saved Bella from being euthanized..."},
  ],
  social: [
    {label:"Animal name",   placeholder:"Luna"},
    {label:"Species/breed", placeholder:"Tabby cat, 2 years"},
    {label:"Personality",   placeholder:"Shy but loving, good with calm households"},
    {label:"Platform",      placeholder:"Facebook / Instagram / TikTok / X"},
    {label:"Rescue location",placeholder:"Fort Myers, FL"},
  ],
  volunteer: [
    {label:"Role needed",   placeholder:"Dog walker, foster parent, event volunteer"},
    {label:"Commitment",    placeholder:"2-4 hours/week"},
    {label:"What they do",  placeholder:"Walk dogs, socialize cats, help at adoption events"},
    {label:"Benefits",      placeholder:"Training provided, reference letters available"},
    {label:"Rescue name",   placeholder:"Happy Paws Rescue"},
  ],
  care: [
    {label:"Animal/species",placeholder:"8-week-old kitten"},
    {label:"Situation",     placeholder:"First-time foster, kitten is eating solid food"},
    {label:"Questions",     placeholder:"How often to feed? Vet visit timing? Socialization?"},
  ],
  newsletter: [
    {label:"Month/theme",  placeholder:"June — Summer adoption event"},
    {label:"Success stories",placeholder:"We placed 23 animals in May..."},
    {label:"Upcoming events",placeholder:"Adoption event July 4th weekend"},
    {label:"Urgent needs",  placeholder:"Need fosters for 15 kittens"},
    {label:"Rescue name",   placeholder:"Happy Paws Rescue"},
  ],
  policy: [
    {label:"Document type",  placeholder:"Adoption agreement / Foster contract / Surrender form"},
    {label:"Organization",   placeholder:"Happy Paws Rescue"},
    {label:"State",          placeholder:"Florida"},
    {label:"Special clauses",placeholder:"Home visit required, return policy, spay/neuter timeline"},
  ],
};

const C = {
  bg:"#0a0f1a", card:"rgba(16,28,52,0.9)", teal:"#00D4FF",
  green:"#10B981", text:"#F0F8FF", text2:"#607090",
};

export default function AnimalRescuePage() {
  const [active, setActive]   = useState<string|null>(null);
  const [fields, setFields]   = useState<Record<string,string>>({});
  const [result, setResult]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName]     = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail]   = useState<string | undefined>(undefined);
  const [authToken, setAuthToken]   = useState<string | undefined>(undefined);
  const [credits, setCredits]       = useState<number | undefined>(undefined);
  const [plan, setPlan]             = useState<'free'|'pro'|'business'>('free');

  const loadBalance = useCallback(async (token: string) => {
    try {
      const res = await fetch("https://craudiovizai.com/api/credits/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json() as { balance?: number; tier?: string };
      if (res.ok) { setCredits(d.balance ?? 0); setPlan((d.tier as 'free'|'pro'|'business') ?? 'free'); }
    } catch { /* leave credits undefined - CreditsBar handles that gracefully */ }
  }, []);

  useEffect(() => {
    (async () => {
      // Real session from this app's own Supabase client (module-level
      // singleton, same real Supabase project every other app shares) -
      // NOT the cookie-based CentralAuth.getSession(), which relies on
      // third-party cookies that modern browsers increasingly block
      // cross-domain and which this project's User type doesn't even
      // expose an access_token from.
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user) {
        setIsLoggedIn(true);
        setUserName(session.user.user_metadata?.name ?? session.user.email ?? undefined);
        setUserEmail(session.user.email ?? undefined);
        setAuthToken(session.access_token);
        await loadBalance(session.access_token);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setUserName(session?.user?.user_metadata?.name ?? session?.user?.email ?? undefined);
      setUserEmail(session?.user?.email ?? undefined);
      setAuthToken(session?.access_token);
      if (session?.access_token) void loadBalance(session.access_token);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadBalance]);

  const tool = TOOLS.find(t => t.id === active);
  const toolFields = active ? (TOOL_FIELDS[active] ?? []) : [];

  const generate = useCallback(async () => {
    if (!active) return;
    if (!authToken) { setResult("Please log in to use this tool."); return; }
    setLoading(true); setResult("");
    try {
      const res = await fetch("/api/generate", {
        method:"POST",
        headers:{"Content-Type":"application/json", "Authorization": `Bearer ${authToken}`},
        body: JSON.stringify({ action: active, fields }),
      });
      const d = await res.json() as {result?:string; error?:string};
      setResult(d.result ?? d.error ?? "Error");
      if (res.ok && authToken) {
        await loadBalance(authToken);
      }
    } catch(e) { setResult("Network error. Please try again."); }
    setLoading(false);
  }, [active, fields, authToken, loadBalance]);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <div style={{minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"system-ui, sans-serif"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,rgba(0,212,255,0.08),rgba(16,185,129,0.08))",
        borderBottom:"1px solid rgba(0,212,255,0.12)", padding:"20px 24px",
        display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div>
          <h1 style={{margin:0, fontSize:22, fontWeight:900,
            background:"linear-gradient(135deg,#00D4FF,#10B981)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
            🐾 Javari Animal Rescue
          </h1>
          <p style={{margin:"4px 0 0", color:C.text2, fontSize:12}}>
            AI-powered tools for shelters, rescues & foster networks · Powered by CR AudioViz AI
          </p>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <CreditsBar isLoggedIn={isLoggedIn} credits={credits} plan={plan} userName={userName} />
          <AuthButtons isLoggedIn={isLoggedIn} userName={userName} userEmail={userEmail} />
        </div>
      </div>
      <JavariWidget />

      <div style={{maxWidth:900, margin:"0 auto", padding:"28px 20px"}}>
        {/* Mission banner */}
        <div style={{marginBottom:24, padding:"14px 18px",
          background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)",
          borderRadius:10, textAlign:"center"}}>
          <span style={{fontSize:13, color:C.green, fontWeight:700}}>
            🆓 FREE for animal rescues & shelters · No account required
          </span>
          <span style={{color:C.text2, fontSize:11, marginLeft:12}}>
            Powered by Javari AI · Part of the CR AudioViz AI social impact mission
          </span>
        </div>

        {/* Tool grid */}
        {!active && (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12}}>
            {TOOLS.map(t => (
              <button key={t.id} onClick={() => { setActive(t.id); setFields({}); setResult(""); }}
                style={{padding:"16px", borderRadius:12, textAlign:"left",
                  background:C.card, border:`1px solid ${t.color}30`,
                  cursor:"pointer", fontFamily:"system-ui", color:C.text,
                  transition:"border-color 0.15s"}}>
                <div style={{fontSize:24, marginBottom:8}}>{t.icon}</div>
                <div style={{fontWeight:800, fontSize:13, marginBottom:4}}>{t.label}</div>
                <div style={{fontSize:11, color:C.text2}}>{t.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Active tool */}
        {active && tool && (
          <div>
            <button onClick={() => { setActive(null); setResult(""); }}
              style={{marginBottom:16, background:"none", border:"none", color:C.teal,
                cursor:"pointer", fontSize:13, fontFamily:"system-ui", padding:0}}>
              ← Back to tools
            </button>
            <div style={{padding:"20px", background:C.card,
              border:`1px solid ${tool.color}30`, borderRadius:14, marginBottom:16}}>
              <h2 style={{margin:"0 0 4px", fontSize:18, fontWeight:900}}>
                {tool.icon} {tool.label}
              </h2>
              <p style={{margin:"0 0 20px", color:C.text2, fontSize:12}}>{tool.desc}</p>
              {toolFields.map((f, i) => (
                <div key={i} style={{marginBottom:12}}>
                  <label style={{display:"block", fontSize:11, fontWeight:700,
                    color:C.text2, marginBottom:4, textTransform:"uppercase",
                    letterSpacing:"0.05em"}}>
                    {f.label}
                  </label>
                  <textarea
                    value={fields[f.label] ?? ""}
                    onChange={e => setFields(prev => ({...prev, [f.label]: e.target.value}))}
                    placeholder={f.placeholder}
                    rows={2}
                    style={{width:"100%", padding:"10px 12px", borderRadius:8,
                      border:"1px solid rgba(255,255,255,0.1)",
                      background:"rgba(0,0,0,0.3)", color:C.text,
                      fontFamily:"system-ui", fontSize:13,
                      outline:"none", resize:"vertical", boxSizing:"border-box"}}/>
                </div>
              ))}
              <button onClick={() => void generate()}
                disabled={loading}
                style={{width:"100%", padding:"12px", borderRadius:10,
                  background: loading ? "rgba(255,255,255,0.08)"
                    : `linear-gradient(135deg,${tool.color},${tool.color}99)`,
                  color: loading ? C.text2 : "#fff",
                  fontWeight:800, fontSize:14, border:"none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily:"system-ui"}}>
                {loading ? "⏳ Generating..." : `✨ Generate ${tool.label}`}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div style={{padding:"20px", background:"rgba(0,0,0,0.4)",
                border:"1px solid rgba(255,255,255,0.08)", borderRadius:14}}>
                <div style={{display:"flex", justifyContent:"space-between",
                  marginBottom:12, alignItems:"center"}}>
                  <span style={{fontSize:13, fontWeight:700, color:C.green}}>
                    ✅ Generated
                  </span>
                  <div style={{display:"flex", gap:8}}>
                    <button onClick={() => void copy()}
                      style={{padding:"6px 14px", borderRadius:7, fontSize:11, fontWeight:700,
                        background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.08)",
                        color: copied ? C.green : C.text2,
                        border:"1px solid " + (copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"),
                        cursor:"pointer", fontFamily:"system-ui"}}>
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                </div>
                <pre style={{margin:0, whiteSpace:"pre-wrap", fontSize:13,
                  lineHeight:1.6, color:C.text, fontFamily:"system-ui"}}>
                  {result}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Bottom stats */}
        <div style={{marginTop:32, display:"grid",
          gridTemplateColumns:"repeat(4,1fr)", gap:12}}>
          {[
            {n:"FREE", d:"Always free for rescues"},
            {n:"8 Tools", d:"All animal welfare needs"},
            {n:"AI-Powered", d:"Groq + Javari intelligence"},
            {n:"No Login", d:"Start generating instantly"},
          ].map((s,i) => (
            <div key={i} style={{padding:"12px", background:C.card,
              border:"1px solid rgba(255,255,255,0.06)", borderRadius:10,
              textAlign:"center"}}>
              <div style={{fontWeight:900, fontSize:16, color:C.teal}}>{s.n}</div>
              <div style={{fontSize:10, color:C.text2, marginTop:2}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
