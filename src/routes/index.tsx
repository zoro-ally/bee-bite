import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import {
  Link2,
  Zap,
  BarChart3,
  Shield,
  QrCode,
  Globe2,
  Sparkles,
  ArrowRight,
  Check,
  Copy,
  MousePointerClick,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shorten links. Amplify reach." },
      {
        name: "description",
        content:
          "A modern URL shortener with analytics, QR codes, and branded links — built for teams that move fast.",
      },
    ],
  }),
  component: LandingPage,
});

/* ---------- Helpers ---------- */

function useMouseTilt(maxDeg = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 150, damping: 15 });
  const ry = useSpring(0, { stiffness: 150, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * maxDeg * 2);
    rx.set(-py * maxDeg * 2);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return { ref, rx, ry, onMove, onLeave };
}

function Blob({
  className,
  delay = 0,
  size = 500,
}: {
  className?: string;
  delay?: number;
  size?: number;
}) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-60 ${className ?? ""}`}
      style={{ width: size, height: size }}
      animate={{
        x: [0, 40, -30, 0],
        y: [0, -30, 30, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ---------- Page ---------- */

function LandingPage() {
  const { scrollY } = useScroll();
  const heroBgY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroFgY = useTransform(scrollY, [0, 800], [0, -60]);

  // Mouse parallax for hero blobs
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 20 });
  const smy = useSpring(my, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 30);
      my.set((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mx, my]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAFAFC] text-slate-800 antialiased">
      <Nav />
      <Hero heroBgY={heroBgY} heroFgY={heroFgY} smx={smx} smy={smy} />
      <Features />
      <Showcase />
      <Process />
      <CTA />
      <Footer />
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-5 py-3 shadow-[0_8px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
            <Link2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">Bee Bite</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#showcase" className="hover:text-slate-900">Showcase</a>
          <a href="#process" className="hover:text-slate-900">How it works</a>
        </nav>
        <Link to="/app" className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.03]">
          Get started
        </Link>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero({
  heroBgY,
  heroFgY,
  smx,
  smy,
}: {
  heroBgY: any;
  heroFgY: any;
  smx: any;
  smy: any;
}) {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-32 pb-20">
      {/* Animated blobs background */}
      <motion.div style={{ y: heroBgY }} className="absolute inset-0 overflow-hidden">
        <motion.div style={{ x: smx, y: smy }} className="absolute inset-0">
          <Blob className="-left-32 top-10 bg-indigo-300/50" size={520} />
          <Blob className="right-0 top-40 bg-violet-300/50" size={460} delay={2} />
          <Blob className="left-1/3 bottom-0 bg-sky-300/40" size={500} delay={4} />
        </motion.div>
      </motion.div>

      {/* Foreground */}
      <motion.div style={{ y: heroFgY }} className="relative z-10 mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Introducing smarter links
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
          >
            Shorten links.{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 bg-clip-text text-transparent">
              Amplify
            </span>{" "}
            reach.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
          >
            Turn long, clunky URLs into branded, trackable links in seconds. Built for marketers,
            creators, and teams that care about every click.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link to="/app" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:scale-[1.03] hover:shadow-indigo-500/50">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#process" className="rounded-2xl border border-slate-300 bg-white/70 px-6 py-3.5 text-sm font-semibold text-slate-800 backdrop-blur transition hover:scale-[1.03] hover:border-indigo-300 hover:text-indigo-700">
              See how it works
            </a>
          </motion.div>

          <ShortenWidget />
        </div>

        <FloatingMockup />
      </motion.div>
    </section>
  );
}

function ShortenWidget() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [copied, setCopied] = useState(false);

  const shorten = () => {
    if (!url) return;
    setState("loading");
    setTimeout(() => setState("done"), 900);
  };

  const reset = () => {
    setState("idle");
    setUrl("");
    setCopied(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="mt-10 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.35)] backdrop-blur-xl"
    >
      {state !== "done" ? (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-4">
            <Link2 className="h-4 w-4 text-slate-400" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              className="w-full bg-transparent py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            onClick={shorten}
            disabled={state === "loading"}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.03] disabled:opacity-70"
          >
            {state === "loading" ? "Shortening..." : "Shorten"}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span className="truncate text-sm font-medium text-indigo-700">
              beebite.link/abc123
            </span>
          </div>
          <button
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={reset}
            className="rounded-xl px-3 py-3 text-sm text-slate-500 hover:text-slate-800"
          >
            New
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function FloatingMockup() {
  const { ref, rx, ry, onMove, onLeave } = useMouseTilt(8);

  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative mx-auto w-full max-w-md"
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
        className="relative rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_-30px_rgba(99,102,241,0.45)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <BarChart3 className="h-4 w-4 text-slate-400" />
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
          <div className="text-xs text-slate-500">Total clicks</div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900">12,438</div>
            <div className="text-xs font-medium text-emerald-600">+18%</div>
          </div>
          <div className="mt-4 flex h-20 items-end gap-1.5">
            {[40, 65, 50, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-400 to-violet-400"
              />
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {["Feature one", "Feature two", "Feature three"].map((t, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100" />
                <span className="text-sm text-slate-700">{t}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Decorative floats */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 -top-6 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl shadow-indigo-200/50 backdrop-blur"
      >
        <QrCode className="h-6 w-6 text-indigo-500" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -right-4 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl shadow-violet-200/50 backdrop-blur"
      >
        <MousePointerClick className="h-6 w-6 text-violet-500" />
      </motion.div>
    </motion.div>
  );
}

/* ---------- Features ---------- */

const FEATURES = [
  { icon: Zap, title: "Lightning fast", desc: "Generate branded short links in milliseconds, anywhere in the world." },
  { icon: BarChart3, title: "Deep analytics", desc: "Track clicks, devices, and locations with a beautiful dashboard." },
  { icon: QrCode, title: "Instant QR codes", desc: "Every link comes with a downloadable QR code, ready for print." },
  { icon: Shield, title: "Safe & secure", desc: "Built-in spam protection and link expiration to keep things tidy." },
  { icon: Globe2, title: "Custom domains", desc: "Use your own domain for trustworthy, on-brand short links." },
  { icon: Sparkles, title: "Smart routing", desc: "Send visitors to different destinations based on device or geo." },
];

function Features() {
  return (
    <section id="features" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need, nothing you don't"
          subtitle="A focused toolkit to ship, share, and measure links your audience actually clicks."
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  const { ref, rx, ry, onMove, onLeave } = useMouseTilt(6);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileHover={{ y: -6 }}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
        className="group relative h-full rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.1)] transition-shadow duration-300 hover:shadow-[0_30px_60px_-20px_rgba(99,102,241,0.35)]"
      >
        <motion.div
          whileHover={{ rotate: 8, scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600"
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Showcase ---------- */

function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yLeft = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yRight = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const yShape = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section
      id="showcase"
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-violet-50/50 to-white px-6 py-28"
    >
      <Blob className="-left-20 top-20 bg-indigo-200/50" size={420} />
      <Blob className="right-0 bottom-10 bg-sky-200/50" size={460} delay={3} />

      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-center">
        <motion.div style={{ y: yLeft }}>
          <SectionHeading
            align="left"
            eyebrow="Showcase"
            title="A dashboard that just clicks"
            subtitle="Real-time insights, distraction-free. Watch your campaigns perform without drowning in numbers."
          />
          <ul className="mt-8 space-y-3">
            {["Real-time click tracking", "One-tap QR generation", "Branded short domains"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-slate-700">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div style={{ y: yRight }} className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative rounded-3xl border border-white/70 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(99,102,241,0.45)] transition-shadow duration-300 hover:shadow-[0_40px_100px_-30px_rgba(124,58,237,0.55)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Performance</div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Live
              </span>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500/5 to-violet-500/10 p-6">
              <svg viewBox="0 0 300 120" className="h-32 w-full">
                <defs>
                  <linearGradient id="ln" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                  d="M0,90 C40,60 70,80 110,50 C150,20 190,70 230,40 C260,20 285,30 300,25"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M0,90 C40,60 70,80 110,50 C150,20 190,70 230,40 C260,20 285,30 300,25 L300,120 L0,120 Z"
                  fill="url(#ln)"
                />
              </svg>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {["Today", "Week", "Month"].map((l, i) => (
                <div key={l} className="rounded-xl border border-slate-100 p-3">
                  <div className="text-xs text-slate-500">{l}</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {["1.2k", "8.4k", "32k"][i]}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ y: yShape }}
            className="absolute -right-10 -top-10 -z-0 h-32 w-32 rounded-full bg-gradient-to-br from-violet-300/60 to-sky-300/60 blur-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Process ---------- */

function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const steps = [
    { icon: Link2, title: "Paste", desc: "Drop in any long URL to begin." },
    { icon: Sparkles, title: "Shorten", desc: "We craft a clean, branded link." },
    { icon: BarChart3, title: "Track", desc: "Watch the clicks roll in, live." },
  ];

  return (
    <section id="process" ref={ref} className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How it works"
          title="From URL to insight in three steps"
        />

        <div className="relative mt-20">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-slate-200 md:block" />
          <motion.div
            style={{ scaleX: lineScale, transformOrigin: "left" }}
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 md:block"
          />

          <div className="relative grid gap-12 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  className="relative z-10 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/30 ring-8 ring-white"
                >
                  <s.icon className="h-6 w-6" />
                </motion.div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 max-w-xs text-sm text-slate-600">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */

function CTA() {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 px-8 py-20 text-center shadow-[0_40px_100px_-30px_rgba(99,102,241,0.6)]"
      >
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

        <h2 className="relative text-4xl font-bold leading-tight text-white sm:text-5xl">
          Ready to make every link count?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-white/90">
          Start shortening, sharing, and measuring in minutes. No credit card required.
        </p>
        <Link to="/app" className="group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-white px-7 py-4 text-sm font-semibold shadow-2xl transition active:scale-95">
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Get started free
          </span>
          <ArrowRight className="h-4 w-4 text-indigo-600" />
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-indigo-200/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </Link>
      </motion.div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  const cols = [
    { title: "Product", links: ["Feature one", "Feature two", "Feature three", "Feature four"] },
    { title: "Company", links: ["About", "Careers", "Contact", "Press"] },
    { title: "Resources", links: ["Docs", "Guides", "Changelog", "Status"] },
  ];

  return (
    <footer className="relative px-6 pt-16 pb-10">
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
              <Link2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900">Bee Bite</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-slate-500">
            Placeholder tagline that describes the product in one warm, friendly sentence.
          </p>
          <div className="mt-5 flex gap-3 text-slate-400">
            <a href="#" className="hover:text-indigo-600"><Twitter className="h-4 w-4" /></a>
            <a href="#" className="hover:text-indigo-600"><Github className="h-4 w-4" /></a>
            <a href="#" className="hover:text-indigo-600"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-slate-900">{c.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              {c.links.map((l) => (
                <li key={l}><a href="#" className="hover:text-slate-900">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Bee Bite. All rights reserved.
      </div>
    </footer>
  );
}

/* ---------- Misc ---------- */

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}
    >
      <span className="inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg text-slate-600">{subtitle}</p>}
    </motion.div>
  );
}
