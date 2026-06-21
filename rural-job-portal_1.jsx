import { useState, useEffect } from "react";

const translations = {
  hi: {
    tagline: "अपना काम, अपने गाँव के पास",
    subtitle: "आवाज़ से खोजें • WhatsApp पर पाएं • नज़दीक काम करें",
    findWork: "काम खोजें",
    postWork: "काम दें",
    searchPlaceholder: "बोलकर खोजें...",
    categories: "काम की श्रेणियाँ",
    nearJobs: "पास के काम",
    verified: "सत्यापित",
    km: "किमी दूर",
    voiceBio: "आवाज़ बायो",
    aadhar: "आधार से जुड़ें",
    howItWorks: "कैसे काम करता है",
    step1: "आवाज़ से प्रोफ़ाइल बनाएं",
    step2: "नज़दीकी काम देखें",
    step3: "WhatsApp पर जानकारी पाएं",
    stats_workers: "पंजीकृत मज़दूर",
    stats_jobs: "उपलब्ध काम",
    stats_villages: "गाँव जुड़े",
    panchayat: "पंचायत सत्यापित",
  },
  en: {
    tagline: "Your Work, Near Your Village",
    subtitle: "Search by Voice • Get Alerts on WhatsApp • Work Nearby",
    findWork: "Find Work",
    postWork: "Post a Job",
    searchPlaceholder: "Speak to search...",
    categories: "Job Categories",
    nearJobs: "Jobs Near You",
    verified: "Verified",
    km: "km away",
    voiceBio: "Voice Bio",
    aadhar: "Link Aadhaar",
    howItWorks: "How It Works",
    step1: "Create Voice Profile",
    step2: "See Nearby Jobs",
    step3: "Get Alerts on WhatsApp",
    stats_workers: "Registered Workers",
    stats_jobs: "Available Jobs",
    stats_villages: "Villages Connected",
    panchayat: "Panchayat Verified",
  },
  mr: {
    tagline: "तुमचे काम, तुमच्या गावाजवळ",
    subtitle: "आवाजाने शोधा • WhatsApp वर मिळवा • जवळचे काम करा",
    findWork: "काम शोधा",
    postWork: "काम द्या",
    searchPlaceholder: "बोलून शोधा...",
    categories: "कामाचे प्रकार",
    nearJobs: "जवळचे काम",
    verified: "सत्यापित",
    km: "किमी दूर",
    voiceBio: "आवाज बायो",
    aadhar: "आधार जोडा",
    howItWorks: "कसे काम करते",
    step1: "आवाज प्रोफाइल तयार करा",
    step2: "जवळचे काम पहा",
    step3: "WhatsApp वर माहिती मिळवा",
    stats_workers: "नोंदणीकृत कामगार",
    stats_jobs: "उपलब्ध काम",
    stats_villages: "जोडलेली गावे",
    panchayat: "पंचायत सत्यापित",
  },
};

const categories = [
  { icon: "🌾", labelHi: "खेती", labelEn: "Agriculture", labelMr: "शेती", color: "#4CAF50", jobs: 142 },
  { icon: "🏗️", labelHi: "निर्माण", labelEn: "Construction", labelMr: "बांधकाम", color: "#FF7043", jobs: 89 },
  { icon: "🧵", labelHi: "हथकरघा", labelEn: "Handloom", labelMr: "हातमाग", color: "#AB47BC", jobs: 56 },
  { icon: "🚛", labelHi: "ड्राइविंग", labelEn: "Driving", labelMr: "वाहन चालन", color: "#1E88E5", jobs: 73 },
  { icon: "🛒", labelHi: "दुकान", labelEn: "Retail", labelMr: "दुकान", color: "#F4A200", jobs: 38 },
  { icon: "🪣", labelHi: "प्लंबर", labelEn: "Plumbing", labelMr: "प्लंबर", color: "#00ACC1", jobs: 29 },
  { icon: "⚡", labelHi: "बिजली", labelEn: "Electrical", labelMr: "विद्युत", color: "#FDD835", jobs: 41 },
  { icon: "🍳", labelHi: "रसोई", labelEn: "Cooking", labelMr: "स्वयंपाक", color: "#EF5350", jobs: 33 },
];

const nearbyJobs = [
  { title: "धान की कटाई", titleEn: "Paddy Harvesting", distance: 2.3, wage: "₹500/दिन", verified: true, type: "🌾", urgent: true },
  { title: "मकान निर्माण मज़दूर", titleEn: "Construction Labor", distance: 4.1, wage: "₹450/दिन", verified: true, type: "🏗️", urgent: false },
  { title: "ट्रैक्टर ड्राइवर", titleEn: "Tractor Driver", distance: 6.8, wage: "₹600/दिन", verified: false, type: "🚛", urgent: true },
];

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString("en-IN")}</span>;
};

export default function RuralJobPortal() {
  const [lang, setLang] = useState("hi");
  const [listening, setListening] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [waveHeights, setWaveHeights] = useState(Array.from({ length: 32 }, (_, i) => Math.sin(i * 0.5) * 16 + 20));
  const t = translations[lang];

  useEffect(() => {
    if (!recording) return;
    const iv = setInterval(() => {
      setWaveHeights(Array.from({ length: 32 }, () => Math.random() * 36 + 8));
    }, 120);
    return () => clearInterval(iv);
  }, [recording]);

  const getLabel = (cat) =>
    lang === "hi" ? cat.labelHi : lang === "mr" ? cat.labelMr : cat.labelEn;

  const handleVoice = () => {
    setListening(true);
    setTimeout(() => setListening(false), 3000);
  };

  const handleRecord = () => {
    if (recording) { setRecording(false); setRecordSecs(0); return; }
    setRecording(true);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      setRecordSecs(s);
      if (s >= 30) { clearInterval(iv); setRecording(false); setRecordSecs(0); }
    }, 1000);
  };

  return (
    <div style={{
      fontFamily: "'Noto Sans Devanagari', 'Noto Sans', Georgia, serif",
      background: "#FFFDF5",
      minHeight: "100vh",
      color: "#1A1200",
      overflowX: "hidden",
      maxWidth: 520,
      margin: "0 auto",
      boxShadow: "0 0 60px rgba(0,0,0,0.12)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lang-btn { border: 2px solid #E8A000; background: transparent; border-radius: 20px; padding: 6px 14px; font-size: 13px; cursor: pointer; font-family: inherit; color: #1A1200; transition: all 0.2s; font-weight: 600; }
        .lang-btn.active { background: #E8A000; color: #fff; }
        .lang-btn:hover { background: #E8A000; color: #fff; }
        .find-btn { background: #E8A000; color: #fff; border: none; border-radius: 16px; padding: 16px 24px; font-size: 17px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(232,160,0,0.4); }
        .find-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,160,0,0.5); }
        .post-btn { background: rgba(255,255,255,0.15); color: #fff; border: 2px solid rgba(255,255,255,0.6); border-radius: 16px; padding: 16px 24px; font-size: 17px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .post-btn:hover { background: rgba(255,255,255,0.25); }
        .voice-pill { background: rgba(255,255,255,0.95); border-radius: 20px; display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        .voice-btn { border: none; background: linear-gradient(135deg, #E8A000, #FF6B35); color: white; border-radius: 50%; width: 52px; height: 52px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 16px rgba(232,160,0,0.4); flex-shrink: 0; }
        .voice-btn.listening { animation: pulse 0.8s infinite; background: linear-gradient(135deg, #E53935, #FF6B35); }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .cat-card { border: none; border-radius: 18px; padding: 16px 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.22s; font-family: inherit; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
        .cat-card:hover, .cat-card.active { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.13); }
        .job-card { background: #fff; border-radius: 18px; padding: 16px 18px; box-shadow: 0 2px 14px rgba(0,0,0,0.07); border-left: 5px solid transparent; transition: all 0.2s; }
        .job-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.12); }
        .step-card { background: #fff; border-radius: 18px; padding: 24px 16px; text-align: center; box-shadow: 0 2px 14px rgba(0,0,0,0.07); }
        .stat-box { background: rgba(255,255,255,0.15); border-radius: 14px; padding: 16px 8px; backdrop-filter: blur(10px); text-align: center; }
        .record-btn { border: 3px solid #E53935; border-radius: 50px; padding: 12px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .whatsapp-btn { background: #25D366; color: white; border: none; border-radius: 50px; padding: 12px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(37,211,102,0.4); transition: all 0.2s; }
        .whatsapp-btn:hover { transform: translateY(-2px); }
        .nav-bar { position: sticky; top: 0; z-index: 100; background: rgba(255,253,245,0.96); backdrop-filter: blur(12px); border-bottom: 1px solid #F0E6C8; }
        .badge { font-size: 11px; font-weight: 700; border-radius: 20px; padding: 3px 9px; display: inline-block; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        section { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* NAV */}
      <nav className="nav-bar" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🌱</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1 }}>KaamSetu</div>
            <div style={{ fontSize: 10, color: "#999", letterSpacing: 1 }}>काम सेतु</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["hi", "en", "mr"].map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
              {l === "hi" ? "हिं" : l === "en" ? "EN" : "मर"}
            </button>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(150deg, #1A3800 0%, #2E6B00 60%, #4A8C00 100%)", padding: "44px 22px 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(232,160,0,0.1)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(232,160,0,0.2)", border: "1px solid rgba(232,160,0,0.4)", borderRadius: 20, padding: "5px 14px", marginBottom: 18 }}>
            <span style={{ fontSize: 11 }}>📡</span>
            <span style={{ fontSize: 11, color: "#FFD166", fontWeight: 600 }}>Works on 2G • PWA Ready</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 10 }}>{t.tagline}</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", marginBottom: 28, lineHeight: 1.6 }}>{t.subtitle}</p>
          <div className="voice-pill" style={{ marginBottom: 22 }}>
            <input placeholder={t.searchPlaceholder} readOnly style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", fontFamily: "inherit", color: "#1A1200" }} />
            <button className={`voice-btn ${listening ? "listening" : ""}`} onClick={handleVoice}>
              {listening ? "🔴" : "🎙️"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="find-btn">🔍 {t.findWork}</button>
            <button className="post-btn">📋 {t.postWork}</button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: "linear-gradient(90deg, #E8A000, #FF6B35)", padding: "24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { num: 48200, label: t.stats_workers, icon: "👷" },
            { num: 3760, label: t.stats_jobs, icon: "💼" },
            { num: 890, label: t.stats_villages, icon: "🏘️" },
          ].map((s, i) => (
            <div key={i} className="stat-box">
              <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}><CountUp end={s.num} /></div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.82)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: "36px 18px", }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🗂️</span> {t.categories}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          {categories.map((cat, i) => (
            <button key={i} className={`cat-card ${activeCategory === i ? "active" : ""}`}
              style={{ borderTop: `4px solid ${cat.color}` }}
              onClick={() => setActiveCategory(activeCategory === i ? null : i)}>
              <span style={{ fontSize: 26 }}>{cat.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{getLabel(cat)}</span>
              <span style={{ fontSize: 10, color: "#aaa" }}>{cat.jobs}</span>
            </button>
          ))}
        </div>
      </section>

      {/* NEARBY JOBS */}
      <section style={{ padding: "0 18px 36px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <span>📍</span> {t.nearJobs}
        </h2>
        {/* Map placeholder */}
        <div style={{ background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)", borderRadius: 18, height: 148, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, border: "2px dashed #81C784", position: "relative", overflow: "hidden" }}>
          {[{ t: 16, l: 20, c: "#4CAF50", s: 8 }, { t: 60, r: 50, c: "#FF7043", s: 6 }, { b: 40, l: 80, c: "#1E88E5", s: 6 }].map((d, i) => (
            <div key={i} style={{ position: "absolute", top: d.t, left: d.l, right: d.r, bottom: d.b, width: d.s, height: d.s, borderRadius: "50%", background: d.c, boxShadow: `0 0 0 ${d.s / 2}px ${d.c}44` }} />
          ))}
          <span style={{ fontSize: 32 }}>🗺️</span>
          <span style={{ fontSize: 12, color: "#2E7D32", fontWeight: 600 }}>5km के अंदर काम देखें</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {nearbyJobs.map((job, i) => (
            <div key={i} className="job-card" style={{ borderLeftColor: job.urgent ? "#E53935" : "#4CAF50" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 26 }}>{job.type}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{lang === "en" ? job.titleEn : job.title}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>📍 {job.distance} {t.km}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: "#2E7D32", fontSize: 14 }}>{job.wage}</div>
                  {job.verified && <span className="badge" style={{ background: "#E8F5E9", color: "#2E7D32", marginTop: 3 }}>✓ {t.verified}</span>}
                </div>
              </div>
              {job.urgent && <div style={{ marginTop: 8, background: "#FFF3E0", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#E65100", fontWeight: 600 }}>⚡ तुरंत ज़रूरत है</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="whatsapp-btn" style={{ flex: 1, justifyContent: "center" }}>💬 WhatsApp</button>
                <button style={{ background: "#F5F5F5", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", fontSize: 15 }}>📞</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VOICE BIO */}
      <section style={{ background: "linear-gradient(135deg, #FFF8E1, #FFF3CD)", padding: "36px 18px", borderTop: "1px solid #FFE082", borderBottom: "1px solid #FFE082" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>🎙️ {t.voiceBio}</h2>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.6 }}>30 सेकंड में अपना परिचय रिकॉर्ड करें — कोई लिखाई नहीं चाहिए</p>
        <div style={{ background: "#fff", borderRadius: 18, padding: 22, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #E8A000, #FF6B35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>👷</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>रामलाल यादव</div>
              <div style={{ fontSize: 12, color: "#888" }}>मज़दूर • उत्तर प्रदेश</div>
              <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                <span className="badge" style={{ background: "#E3F2FD", color: "#1565C0" }}>🌾 खेती</span>
                <span className="badge" style={{ background: "#F3E5F5", color: "#6A1B9A" }}>🏗️ निर्माण</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 44, marginBottom: 14, justifyContent: "center" }}>
            {waveHeights.map((h, i) => (
              <div key={i} style={{ width: 4, borderRadius: 2, height: `${h}px`, background: recording ? "#E53935" : "#E8A000", transition: "height 0.1s", opacity: 0.8 }} />
            ))}
          </div>
          {recording && <div style={{ textAlign: "center", marginBottom: 10, fontSize: 13, color: "#E53935", fontWeight: 600 }}>⏺ {recordSecs}/30 सेकंड</div>}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button className="record-btn"
              style={{ background: recording ? "#E53935" : "transparent", color: recording ? "#fff" : "#E53935" }}
              onClick={handleRecord}>
              {recording ? "⏹ रोकें" : "🎙️ रिकॉर्ड करें"}
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "36px 18px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>{t.howItWorks}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { icon: "🎙️", step: "1", text: t.step1, color: "#E8A000" },
            { icon: "📍", step: "2", text: t.step2, color: "#4CAF50" },
            { icon: "💬", step: "3", text: t.step3, color: "#25D366" },
          ].map((s, i) => (
            <div key={i} className="step-card" style={{ borderTop: `4px solid ${s.color}` }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.color, color: "#fff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>{s.step}</div>
              <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.4, color: "#333" }}>{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VERIFICATION */}
      <section style={{ background: "#00529B", padding: "36px 18px" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>🛡️ भरोसेमंद सत्यापन</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 22 }}>Aadhaar या Panchayat से सत्यापन करें और ज़्यादा भरोसा पाएं</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "2px solid rgba(255,255,255,0.5)", borderRadius: 50, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🪪 Aadhaar Link</button>
            <button style={{ background: "#FFD700", color: "#1A1200", border: "none", borderRadius: 50, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🏛️ {t.panchayat}</button>
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {["🔒 डेटा सुरक्षित", "✅ UIDAI Verified", "🤝 Govt. Backed"].map((b, i) => (
              <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <section style={{ padding: "36px 18px" }}>
        <div style={{ background: "linear-gradient(135deg, #e8f5e9, #f1f8e9)", borderRadius: 22, padding: 26, border: "2px solid #A5D6A7", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>WhatsApp पर जुड़ें</h3>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 18 }}>नए काम की सूचना सीधे WhatsApp पर पाएं</p>
          <button className="whatsapp-btn" style={{ margin: "0 auto" }}>
            <span>📲</span> WhatsApp पर Alert पाएं
          </button>
        </div>
      </section>

      {/* BOTTOM NAV */}
      <nav style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid #eee", padding: "10px 0 6px", display: "flex", justifyContent: "space-around", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
        {[
          { icon: "🏠", label: "होम" },
          { icon: "🔍", label: "खोजें" },
          { icon: "📍", label: "पास में" },
          { icon: "💬", label: "बात करें" },
          { icon: "👤", label: "प्रोफ़ाइल" },
        ].map((item, i) => (
          <button key={i} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 10px", borderRadius: 10 }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 9, color: "#777", fontWeight: 600 }}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
