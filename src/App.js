import { useState, useEffect, useRef } from "react";

// ── EmailJS config — replace with your keys ──────────────────────────────────
const EJ_PUBLIC  = "YOUR_PUBLIC_KEY";
const EJ_SERVICE = "YOUR_SERVICE_ID";
const EJ_TMPL    = "YOUR_TEMPLATE_ID";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  cream:   "#F5F0E8",
  cream2:  "#EDE8DC",
  cream3:  "#E4DDD0",
  ink:     "#1A1610",
  ink2:    "#2E2820",
  muted:   "#7A7060",
  accent:  "#B8860B",
  accent2: "#8B1A1A",
  border:  "#D6CFC3",
  white:   "#FDFAF5",
};

const skills = [
  { cat: "Backend",          items: ["C# .NET Core","ASP.NET Web API","Node.js","Express.js","RESTful APIs","JWT Auth","Clean Architecture"] },
  { cat: "Frontend",         items: ["React","Next.js","TypeScript","JavaScript","Material UI"] },
  { cat: "Databases",        items: ["SQL Server","MongoDB","PostgreSQL","CosmosDB","Azure Blob","Prisma ORM"] },
  { cat: "API Integrations", items: ["ICICI UPI API","MSG91 SMS","MSG91 WhatsApp","Deepvue CIBIL","Deepvue KYC","Firebase OAuth"] },
  { cat: "Cloud & DevOps",   items: ["AWS EC2","AWS S3","AWS SES","Azure Functions","Azure API Mgmt","GitHub Actions","CI/CD"] },
  { cat: "Tools",            items: ["Git","GitHub","Jira","Postman","Socket.io","Firebase"] },
];

const experience = [
  {
    period: "Oct 2024 – Present", role: "Senior Software Developer",
    company: "MyRinBazaar Consultancy · KSDPL Assignment", location: "Ujjain, MP",
    points: [
      "Integrated ICICI UPI APIs for QR code generation & full payment processing pipeline.",
      "Automated MSG91 WhatsApp & SMS notifications for order confirmations and alerts.",
      "Built Deepvue CIBIL credit scoring, KYC verification, and financial risk workflows.",
      "Designed .NET Core Web APIs for inventory, transactions, user ops & reporting.",
      "Optimised SQL Server queries — achieved 40% performance improvement.",
    ],
    stack: ["C# .NET Core","SQL Server","ICICI UPI","MSG91","Deepvue","Azure"],
  },
  {
    period: "Jun 2024 – Sep 2024", role: "Backend Software Developer",
    company: "NeoSharks Solutions · Remote", location: "India",
    points: [
      "Built Socket.io real-time messaging with auto-reconnection and persistence.",
      "Implemented Firebase Google OAuth for login and profile management.",
      "Developed i18n backend supporting Hindi & English across the platform.",
      "Designed PostgreSQL schemas with Prisma ORM for type-safe operations.",
    ],
    stack: ["Node.js","PostgreSQL","Prisma ORM","Socket.io","Firebase","AWS"],
  },
  {
    period: "Oct 2022 – Dec 2023", role: "Software Developer (Internship)",
    company: "ByteBillion Pvt. Ltd.", location: "Indore",
    points: [
      "Built e-commerce dashboard with React & Material UI — 35% engagement boost.",
      "Migrated 5000+ lines of legacy JS to TypeScript, cutting runtime errors.",
      "Built scalable Node.js APIs with validation and structured error handling.",
      "Deployed and monitored apps on Microsoft Azure.",
    ],
    stack: ["React","TypeScript","Node.js","Material UI","Azure"],
  },
];

const projects = [
  { num:"I",   name:"KSDPL",      full:"Enterprise Sales & Distribution Platform",
    desc:"Full-stack .NET Core backend with ICICI UPI payments, MSG91 WhatsApp/SMS, and Deepvue CIBIL/KYC integrations. Complete CRUD APIs for inventory, transactions, user management with 40% SQL Server optimisation.",
    tags:["C# .NET Core","ICICI UPI","MSG91","Deepvue","SQL Server"] },
  { num:"II",  name:"KAROCODE",   full:"Learning & Certification Platform",
    desc:"Dynamic React UI for course navigation with certificate generation system, progress tracking, and REST APIs for courses, modules, and user enrollment management.",
    tags:["React","Node.js","REST API","Certificates"] },
  { num:"III", name:"KAROMANAGE", full:"Subscription & SaaS Platform",
    desc:"Multi-tenant subscription frontend in React. Coupon management, attendance tracking APIs, and org/teacher/student backend. Achieved 45% faster DB response times.",
    tags:["React","Node.js","Multi-tenant","45% faster DB"] },
  { num:"IV",  name:"Qalakaar",   full:"Real-Time Creative Platform",
    desc:"Socket.io real-time messaging, Firebase Google OAuth, PostgreSQL + Prisma ORM, Hindi/English i18n, and automated GitHub Actions CI/CD pipeline to AWS.",
    tags:["Socket.io","PostgreSQL","Firebase","AWS"] },
];

// ── Reveal hook ───────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); ob.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(24px)",
      transition: `opacity 0.75s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.75s cubic-bezier(.22,1,.36,1) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
}

function Rule() {
  return <div style={{ height: "1px", background: T.border }} />;
}

function Label({ children, light }) {
  return (
    <p style={{ fontFamily: "'Lato',sans-serif", fontSize: "0.62rem", letterSpacing: "0.26em", textTransform: "uppercase", color: light ? T.accent : T.accent, fontWeight: 700, marginBottom: "0.5rem" }}>{children}</p>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 3rem", height:"60px",
      background: scrolled ? "rgba(245,240,232,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.border}` : "none",
      transition:"all 0.4s ease",
    }}>
      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:700, color:T.ink }}>
        Narendra <span style={{ color:T.accent, fontStyle:"italic" }}>Patidar</span>
      </span>
      <div style={{ display:"flex", gap:"2.2rem" }}>
        {["About","Skills","Experience","Projects","Contact"].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{
            fontFamily:"'Lato',sans-serif", fontSize:"0.68rem", letterSpacing:"0.16em",
            textTransform:"uppercase", color:T.muted, textDecoration:"none", fontWeight:700, transition:"color 0.2s",
          }}
            onMouseOver={e=>e.currentTarget.style.color=T.ink}
            onMouseOut={e=>e.currentTarget.style.color=T.muted}
          >{l}</a>
        ))}
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const [count, setCount] = useState(0);
  const roles = ["Full Stack Developer","Backend Specialist","API Integration Expert",".NET & Node.js Engineer"];
useEffect(() => {
  const t = setInterval(() => {
    setCount(c => (c + 1) % roles.length);
  }, 2800);

  return () => clearInterval(t);
}, [roles.length]);

  return (
    <section id="hero" style={{ minHeight:"100vh", background:T.cream, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", overflow:"hidden", paddingTop:"60px" }}>

      {/* watermark */}
      <div style={{ position:"absolute", right:"-3rem", top:"50%", transform:"translateY(-50%)", fontFamily:"'Playfair Display',serif", fontSize:"clamp(14rem,24vw,28rem)", fontWeight:700, color:T.cream2, lineHeight:1, userSelect:"none", pointerEvents:"none", letterSpacing:"-0.04em" }}>NP</div>

      {/* editorial top bar */}
      <div style={{ position:"absolute", top:"60px", left:0, right:0, display:"flex", justifyContent:"space-between", padding:"0.75rem 3rem", borderBottom:`1px solid ${T.border}` }}>
        {["Portfolio · 2025", "Ujjain · India · Remote", "● Open to Work"].map((t,i) => (
          <span key={i} style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", color: i===2 ? T.accent : T.muted }}>{t}</span>
        ))}
      </div>

      <div style={{ padding:"5rem 3rem 4rem", maxWidth:"1100px", position:"relative", zIndex:1 }}>
        <div style={{ animation:"fadeUp 0.6s ease 0.1s both" }}>
          <Label>Full Stack Software Developer</Label>
        </div>

        <h1 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(4.5rem,11vw,10rem)",
          fontWeight:700, lineHeight:0.92,
          color:T.ink, letterSpacing:"-0.025em",
          animation:"fadeUp 0.75s ease 0.2s both",
          marginBottom:"1.8rem",
        }}>
          Narendra<br />
          <em style={{ color:T.accent }}>Patidar</em>
        </h1>

        <div style={{ animation:"fadeUp 0.7s ease 0.32s both" }}>
          <Rule />
          <div style={{ display:"flex", alignItems:"center", gap:"1.5rem", padding:"1rem 0" }}>
            <span style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", color:T.muted }}>Currently —</span>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:T.ink2, fontStyle:"italic" }}>{roles[count]}</span>
          </div>
          <Rule />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", alignItems:"flex-end", marginTop:"2rem", animation:"fadeUp 0.7s ease 0.42s both" }}>
          <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.95rem", color:T.muted, lineHeight:1.85 }}>
            3+ years building production-grade systems with <strong style={{color:T.ink}}>.NET Core, Node.js & React</strong>. Specialised in third-party API integrations — payments, messaging, KYC & financial data at enterprise scale.
          </p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"flex-end" }}>
            <a href="#contact" style={{ padding:"0.8rem 2rem", background:T.ink, color:T.cream, fontFamily:"'Lato',sans-serif", fontSize:"0.68rem", letterSpacing:"0.16em", textTransform:"uppercase", textDecoration:"none", fontWeight:700, border:`1px solid ${T.ink}`, transition:"all 0.22s" }}
              onMouseOver={e=>{e.currentTarget.style.background=T.accent;e.currentTarget.style.borderColor=T.accent;}}
              onMouseOut={e=>{e.currentTarget.style.background=T.ink;e.currentTarget.style.borderColor=T.ink;}}
            >Hire Me</a>
            <a href="#projects" style={{ padding:"0.8rem 2rem", background:"transparent", color:T.ink, fontFamily:"'Lato',sans-serif", fontSize:"0.68rem", letterSpacing:"0.16em", textTransform:"uppercase", textDecoration:"none", fontWeight:700, border:`1px solid ${T.border}`, transition:"border-color 0.22s" }}
              onMouseOver={e=>e.currentTarget.style.borderColor=T.ink}
              onMouseOut={e=>e.currentTarget.style.borderColor=T.border}
            >View Work</a>
          </div>
        </div>

        {/* stat strip */}
        <div style={{ display:"flex", marginTop:"3.5rem", borderTop:`1px solid ${T.border}`, paddingTop:"1.8rem", animation:"fadeUp 0.7s ease 0.52s both" }}>
          {[["3+","Years Experience"],["40%","DB Optimisation"],["5K+","Lines to TypeScript"],["45%","Faster DB Response"]].map(([n,l],i)=>(
            <div key={l} style={{ flex:1, paddingRight:"2rem", borderRight: i<3?`1px solid ${T.border}`:"none", paddingLeft:i>0?"2rem":0 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"2.6rem", fontWeight:700, color:T.ink, lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.62rem", letterSpacing:"0.14em", textTransform:"uppercase", color:T.muted, marginTop:"0.35rem" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Lato:wght@300;400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:${T.cream};color:${T.ink};-webkit-font-smoothing:antialiased;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:none;}}
      `}</style>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" style={{ background:T.ink, padding:"6rem 3rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:"5rem", alignItems:"start" }}>
          <Reveal>
            <Label>About</Label>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.5rem,5vw,4.5rem)", fontWeight:700, color:T.white, lineHeight:1.05, letterSpacing:"-0.02em" }}>
              Who<br /><em style={{ color:T.accent }}>I Am</em>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"1rem", color:"#A89F92", lineHeight:1.85, marginBottom:"1.3rem" }}>
              I'm a <span style={{color:T.cream}}>Full Stack Software Developer</span> with 3+ years shipping production-grade web applications. Currently deployed at KSDPL as a Senior Developer through MyRinBazaar Consultancy in Ujjain, MP.
            </p>
            <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"1rem", color:"#A89F92", lineHeight:1.85, marginBottom:"2.5rem" }}>
              My craft centres on <span style={{color:T.cream}}>backend architecture</span> and deep third-party integrations — payment gateways, messaging APIs, financial verification. I'm pursuing MCA while building systems that matter, and I'm open to remote opportunities worldwide.
            </p>
            <div style={{ height:"1px", background:"#2E2820", marginBottom:"2rem" }} />
            <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
              {[
                ["MCA", "Maharaja Ranjit Singh College, Indore", "2023 – Pursuing"],
                ["B.A. — 68%", "Barkatullah University, Bhopal", "2018 – 2021"],
                ["MP Board 12th — 70%", "Vishal Adarsh H.S. School, Sehore", "2016 – 2017"],
              ].map(([deg,inst,yr],i)=>(
                <div key={deg} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"0.9rem 0", borderBottom:"1px solid #2E2820" }}>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.95rem", fontWeight:700, color:T.cream }}>{deg}</div>
                    <div style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.75rem", color:"#A89F92", marginTop:"0.15rem" }}>{inst}</div>
                  </div>
                  <span style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.6rem", letterSpacing:"0.16em", textTransform:"uppercase", color:T.accent }}>{yr}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Skills ────────────────────────────────────────────────────────────────────
function Skills() {
  return (
    <section id="skills" style={{ background:T.cream2, padding:"6rem 3rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:"5rem", alignItems:"start" }}>
          <Reveal>
            <div style={{ position:"sticky", top:"80px" }}>
              <Label>Skills</Label>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"3rem", fontWeight:700, color:T.ink, lineHeight:1.0, letterSpacing:"-0.02em", marginBottom:"1rem" }}>
                Tech<br /><em style={{color:T.accent}}>Stack</em>
              </h2>
              <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.82rem", color:T.muted, lineHeight:1.75 }}>Backend, frontend, cloud, and deep API integrations spanning enterprise platforms.</p>
            </div>
          </Reveal>
          <div>
            {skills.map((s,i)=>(
              <Reveal key={s.cat} delay={0.07*i}>
                <div style={{ marginBottom:"2rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"1.2rem", marginBottom:"0.8rem" }}>
                    <span style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", color:T.accent, fontWeight:700, whiteSpace:"nowrap" }}>{s.cat}</span>
                    <div style={{ flex:1, height:"1px", background:T.border }} />
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.45rem" }}>
                    {s.items.map(tag=>(
                      <span key={tag} style={{ padding:"0.32rem 0.8rem", background:T.white, border:`1px solid ${T.border}`, fontFamily:"'Lato',sans-serif", fontSize:"0.77rem", color:T.ink2, letterSpacing:"0.03em", transition:"all 0.18s", cursor:"default" }}
                        onMouseOver={e=>{e.currentTarget.style.background=T.ink;e.currentTarget.style.color=T.cream;e.currentTarget.style.borderColor=T.ink;}}
                        onMouseOut={e=>{e.currentTarget.style.background=T.white;e.currentTarget.style.color=T.ink2;e.currentTarget.style.borderColor=T.border;}}
                      >{tag}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Experience ────────────────────────────────────────────────────────────────
function Experience() {
  return (
    <section id="experience" style={{ background:T.white, padding:"6rem 3rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <Reveal>
          <Label>Experience</Label>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.2rem,5vw,4rem)", fontWeight:700, color:T.ink, lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:"3.5rem" }}>
            Work <em style={{color:T.accent}}>History</em>
          </h2>
        </Reveal>
        {experience.map((e,i)=>(
          <Reveal key={i} delay={0.1*i}>
            <div style={{ display:"grid", gridTemplateColumns:"180px 1fr", gap:"3rem", paddingBottom:"3rem", marginBottom:"3rem", borderBottom: i<experience.length-1?`1px solid ${T.border}`:"none" }}>
              <div>
                <div style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:T.accent, fontWeight:700, marginBottom:"0.4rem" }}>{e.period}</div>
                <div style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.72rem", color:T.muted }}>{e.location}</div>
              </div>
              <div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:700, color:T.ink, marginBottom:"0.2rem" }}>{e.role}</h3>
                <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.8rem", color:T.muted, marginBottom:"1.2rem", letterSpacing:"0.04em" }}>{e.company}</p>
                <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom:"1.4rem" }}>
                  {e.points.map((p,j)=>(
                    <li key={j} style={{ display:"flex", gap:"0.8rem", fontFamily:"'Lato',sans-serif", fontSize:"0.87rem", color:T.muted, lineHeight:1.65 }}>
                      <span style={{ color:T.accent, flexShrink:0 }}>—</span>{p}
                    </li>
                  ))}
                </ul>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                  {e.stack.map(t=>(
                    <span key={t} style={{ padding:"0.2rem 0.65rem", background:T.cream, border:`1px solid ${T.border}`, fontFamily:"'Lato',sans-serif", fontSize:"0.67rem", color:T.ink2, letterSpacing:"0.06em" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────
function Projects() {
  const [hov, setHov] = useState(null);
  return (
    <section id="projects" style={{ background:T.cream, padding:"6rem 3rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <Reveal>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"2.5rem", gap:"2rem" }}>
            <div>
              <Label>Projects</Label>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.2rem,5vw,4rem)", fontWeight:700, color:T.ink, lineHeight:1.05, letterSpacing:"-0.02em" }}>
                Selected <em style={{color:T.accent}}>Work</em>
              </h2>
            </div>
            <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.82rem", color:T.muted, maxWidth:"260px", textAlign:"right", lineHeight:1.7 }}>Production systems across enterprise, SaaS & real-time platforms.</p>
          </div>
        </Reveal>
        <Rule />
        {projects.map((p,i)=>(
          <Reveal key={p.num} delay={0.08*i}>
            <div style={{ display:"grid", gridTemplateColumns:"72px 1fr 180px", gap:"2rem", alignItems:"center", padding:"2rem 0", borderBottom:`1px solid ${T.border}`, background: hov===i ? T.cream2 : "transparent", transition:"background 0.22s", cursor:"default" }}
              onMouseOver={()=>setHov(i)} onMouseOut={()=>setHov(null)}
            >
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.7rem", fontWeight:400, color:T.accent, fontStyle:"italic", lineHeight:1 }}>{p.num}</div>
              <div>
                <div style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", color:T.muted, fontWeight:700, marginBottom:"0.35rem" }}>{p.name}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:700, color:T.ink, marginBottom:"0.45rem" }}>{p.full}</h3>
                <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.83rem", color:T.muted, lineHeight:1.7 }}>{p.desc}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.3rem", alignItems:"flex-end" }}>
                {p.tags.map(t=>(
                  <span key={t} style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.62rem", letterSpacing:"0.1em", textTransform:"uppercase", color: hov===i ? T.ink : T.muted, transition:"color 0.2s" }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  useEffect(() => {
    if (window.emailjs) return;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => window.emailjs.init(EJ_PUBLIC);
    document.head.appendChild(s);
  }, []);

  const [form, setForm] = useState({ from_name:"", from_email:"", message:"" });
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
    e.preventDefault(); setStatus("sending");
    try {
      await window.emailjs.send(EJ_SERVICE, EJ_TMPL, { ...form, to_name:"Narendra" });
      setStatus("success"); setForm({ from_name:"", from_email:"", message:"" });
    } catch { setStatus("error"); }
  };

  const iStyle = { width:"100%", padding:"0.85rem 0", background:"transparent", border:"none", borderBottom:`1px solid #2E2820`, fontFamily:"'Lato',sans-serif", fontSize:"0.92rem", color:T.cream, outline:"none", transition:"border-color 0.2s" };

  return (
    <section id="contact" style={{ background:T.ink, padding:"6rem 3rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.3fr", gap:"6rem", alignItems:"start" }}>
          <Reveal>
            <Label>Contact</Label>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.2rem,5vw,4rem)", fontWeight:700, color:T.white, lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:"1.5rem" }}>
              Let's Work<br /><em style={{color:T.accent}}>Together</em>
            </h2>
            <p style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.9rem", color:"#A89F92", lineHeight:1.85, marginBottom:"2.5rem" }}>
              Open to remote roles worldwide — backend, full stack, or API specialist positions.
            </p>
            <div style={{ display:"flex", flexDirection:"column" }}>
              {[["✉","narendrapatidar842@gmail.com","mailto:narendrapatidar842@gmail.com"],["☎","+91 9630749382","tel:+919630749382"],["📍","Indore, MP, India","#"]].map(([ic,label,href])=>(
                <a key={label} href={href} style={{ display:"flex", alignItems:"center", gap:"1rem", fontFamily:"'Lato',sans-serif", fontSize:"0.8rem", color:"#A89F92", textDecoration:"none", letterSpacing:"0.04em", padding:"0.9rem 0", borderBottom:"1px solid #2E2820", transition:"color 0.2s" }}
                  onMouseOver={e=>e.currentTarget.style.color=T.cream}
                  onMouseOut={e=>e.currentTarget.style.color="#A89F92"}
                ><span>{ic}</span>{label}</a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:"1.8rem" }}>
              {[{id:"from_name",label:"Your Name",type:"text",ph:"John Doe"},{id:"from_email",label:"Email",type:"email",ph:"john@company.com"}].map(f=>(
                <div key={f.id}>
                  <label style={{ display:"block", fontFamily:"'Lato',sans-serif", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", color:T.accent, fontWeight:700, marginBottom:"0.5rem" }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} required value={form[f.id]}
                    onChange={e=>setForm(p=>({...p,[f.id]:e.target.value}))}
                    style={iStyle}
                    onFocus={e=>e.target.style.borderColor=T.accent}
                    onBlur={e=>e.target.style.borderColor="#2E2820"}
                  />
                </div>
              ))}
              <div>
                <label style={{ display:"block", fontFamily:"'Lato',sans-serif", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", color:T.accent, fontWeight:700, marginBottom:"0.5rem" }}>Message</label>
                <textarea rows={5} placeholder="Tell me about the project..." required value={form.message}
                  onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                  style={{...iStyle, resize:"none", lineHeight:1.7}}
                  onFocus={e=>e.target.style.borderColor=T.accent}
                  onBlur={e=>e.target.style.borderColor="#2E2820"}
                />
              </div>
              {status==="success" && <div style={{ padding:"0.75rem 1rem", border:"1px solid #3D5C38", background:"rgba(61,92,56,0.15)", fontFamily:"'Lato',sans-serif", fontSize:"0.75rem", color:"#8FBF86", letterSpacing:"0.06em" }}>Message sent — I'll be in touch shortly.</div>}
              {status==="error"   && <div style={{ padding:"0.75rem 1rem", border:"1px solid #6B3030", background:"rgba(107,48,48,0.15)", fontFamily:"'Lato',sans-serif", fontSize:"0.75rem", color:"#C47272", letterSpacing:"0.06em" }}>Something went wrong. Please email directly.</div>}
              <button type="submit" disabled={status==="sending"} style={{ padding:"0.9rem 2.2rem", background:T.accent, color:T.white, border:"none", fontFamily:"'Lato',sans-serif", fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", fontWeight:700, cursor:status==="sending"?"not-allowed":"pointer", opacity:status==="sending"?0.6:1, alignSelf:"flex-start", transition:"all 0.22s" }}
                onMouseOver={e=>{ if(status!=="sending"){e.currentTarget.style.background=T.cream;e.currentTarget.style.color=T.ink;}}}
                onMouseOut={e=>{e.currentTarget.style.background=T.accent;e.currentTarget.style.color=T.white;}}
              >{status==="sending"?"Sending…":"Send Message"}</button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background:T.ink2, borderTop:`1px solid #2E2820`, padding:"1.4rem 3rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.88rem", color:"#5A5040", fontStyle:"italic" }}>Narendra Patidar</span>
      <span style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.58rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"#5A5040" }}>Full Stack Developer · Ujjain, India · 2025</span>
      <span style={{ fontFamily:"'Lato',sans-serif", fontSize:"0.58rem", letterSpacing:"0.18em", textTransform:"uppercase", color:T.accent }}>Open to Remote</span>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Contact />
      <Footer />
    </>
  );
}