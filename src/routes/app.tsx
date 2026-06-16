import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  Link2, Copy, Check, BarChart3, Trash2, ExternalLink, QrCode,
  LogOut, Plus, Search, Sparkles, TrendingUp, MousePointerClick,
  CalendarDays, Trophy, X, Globe, Smartphone, Monitor, Zap, Download, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { jwtDecode } from "jwt-decode";
import { getLinks, createLink, deleteLink, updateLinkStatus } from "../lib/api/links.functions.server";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Bee Bite — Tiny links, big insights" },
      { name: "description", content: "Shorten URLs, track clicks, and grow your reach with Bee Bite." },
    ],
  }),
  component: App,
});

type LinkRow = {
  id: string;
  alias: string;
  longUrl: string;
  clicks: number;
  createdAt: Date;
  active: boolean;
  history: number[]; // 7 days
  visits: any[];
};

const SAMPLE: LinkRow[] = [
  { id: "1", alias: "launch-deck", longUrl: "https://www.notion.so/teams/product/launch-strategy-q3-2026-final-deck-revised", clicks: 1284, createdAt: daysAgo(2), active: true, history: [45,80,120,90,210,380,359] },
  { id: "2", alias: "yt-keynote", longUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDMM&start_radio=1", clicks: 842, createdAt: daysAgo(5), active: true, history: [60,90,110,140,120,150,172] },
  { id: "3", alias: "design-jam", longUrl: "https://figma.com/file/abcdef/Design-Jam-Spring-Edition", clicks: 312, createdAt: daysAgo(9), active: true, history: [10,20,40,55,60,70,57] },
  { id: "4", alias: "early-access", longUrl: "https://snip.io/signup?ref=earlyaccess&plan=pro&promo=SNIP25", clicks: 2476, createdAt: daysAgo(14), active: true, history: [180,220,300,340,420,500,516] },
  { id: "5", alias: "weekly-news", longUrl: "https://buttondown.email/snip/archive/issue-42-the-edge-update/", clicks: 98, createdAt: daysAgo(20), active: false, history: [5,10,15,12,18,20,18] },
  { id: "6", alias: "hire-eng", longUrl: "https://snip.io/careers/senior-frontend-engineer-remote-europe", clicks: 553, createdAt: daysAgo(26), active: true, history: [30,50,70,80,100,110,113] },
];

function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function fmtDate(d: Date | string) { 
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }); 
}
function shortHost() { 
  if (typeof window === "undefined") return "snip.li/r";
  return `${window.location.host}/r`; 
}
function randomAlias() { return Math.random().toString(36).slice(2, 8); }

function App() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  if (!user) return <AuthScreen onUser={setUser} />;
  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}

/* ---------------- AUTH ---------------- */
function AuthScreen({ onUser }: { onUser: (u: { email: string; name: string }) => void }) {
  const [err, setErr] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-40"
             style={{ background: "radial-gradient(circle, var(--primary-glow), transparent 60%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-40"
             style={{ background: "radial-gradient(circle, var(--primary), transparent 60%)" }} />
      </div>

      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <LogoMark />
          <span className="text-3xl font-bold tracking-tight">Bee Bite</span>
        </div>

        <div className="bg-card rounded-3xl shadow-2xl shadow-primary/10 border border-border p-10">
          <h1 className="text-2xl font-bold tracking-tight">Get Started</h1>
          <p className="text-muted-foreground mt-2 mb-8">
            Manage your links and track analytics in one place.
          </p>

          <div className="flex flex-col items-center justify-center gap-4">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const decoded: any = jwtDecode(credentialResponse.credential!);
                console.log("Google Login Email:", decoded.email);
                onUser({ 
                  email: decoded.email, 
                  name: decoded.name || decoded.given_name || "User" 
                });
              }}
              onError={() => {
                console.log("Login Failed");
                setErr("Google Login Failed");
              }}
              useOneTap
              theme="outline"
              shape="pill"
            />
            {err && <p className="text-sm text-destructive mt-2">{err}</p>}
          </div>

          <p className="text-xs text-muted-foreground mt-10">
            By continuing you agree to Bee Bite's Terms & Privacy.
          </p>
        </div>
      </div>
    </div>
  );
}



/* ---------------- DASHBOARD ---------------- */
function Dashboard({ user, onLogout }: { user: { email: string; name: string }; onLogout: () => void }) {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest"|"oldest"|"clicks">("newest");
  const [openAnalytics, setOpenAnalytics] = useState<LinkRow | null>(null);
  const [confirmDel, setConfirmDel] = useState<LinkRow | null>(null);

  useEffect(() => {
    console.log("Fetching links for:", user.email);
    fetchLinks();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      console.log("Auto-refreshing links...");
      fetchLinks();
    }, 10000);

    return () => clearInterval(interval);
  }, [user.email]);

  const fetchLinks = async () => {
    console.log("Calling getLinks server function...");
    setLoading(true);
    try {
      const data = await getLinks({ data: { userId: user.email } });
      setLinks(data as LinkRow[]);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const create = async () => {
    if (!longUrl.trim()) return;
    const alias = customAlias.trim() || randomAlias();
    
    try {
      await createLink({ 
        data: { 
          alias, 
          longUrl: longUrl.trim(), 
          userId: user.email 
        } 
      });
      setLongUrl(""); 
      setCustomAlias("");
      showToast(`Created ${shortHost()}/${alias}`);
      fetchLinks();
    } catch (e: any) {
      showToast(e.message || "Error creating link");
    }
  };

  const totals = useMemo(() => {
    if (!links.length) return { total: 0, clicks: 0, thisWeek: 0, top: null };
    const clicks = links.reduce((a, l) => a + l.clicks, 0);
    const weekAgo = daysAgo(7);
    const thisWeek = links.filter(l => new Date(l.createdAt) >= weekAgo).length;
    const top = links.reduce((a, l) => (l.clicks > (a?.clicks ?? 0) ? l : a), links[0]);
    return { total: links.length, clicks, thisWeek, top };
  }, [links]);

  const filtered = useMemo(() => {
    let l = links.filter(x =>
      x.alias.toLowerCase().includes(search.toLowerCase()) ||
      x.longUrl.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "clicks") l = [...l].sort((a,b) => b.clicks - a.clicks);
    if (sort === "newest") l = [...l].sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "oldest") l = [...l].sort((a,b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    return l;
  }, [links, search, sort]);

  const toggleActive = async (id: string) => {
    const link = links.find(l => l.id === id);
    if (!link) return;
    
    try {
      const newStatus = !link.active;
      // Optimistic update
      setLinks(links.map(l => l.id === id ? { ...l, active: newStatus } : l));
      
      await updateLinkStatus({ data: { id, active: newStatus, userId: user.email } });
    } catch (e) {
      showToast("Error updating status");
      fetchLinks(); // Rollback
    }
  };
    
  const remove = async (id: string) => {
    try {
      await deleteLink({ data: { id, userId: user.email } });
      showToast("Link deleted");
      fetchLinks();
    } catch (e) {
      showToast("Error deleting link");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="font-bold text-lg tracking-tight">Snip</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-primary-foreground"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-glow))" }}>
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <button onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-muted">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Create */}
        <section className="rounded-2xl p-6 sm:p-8 border border-border shadow-xl shadow-primary/5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 8%, var(--card)), var(--card))" }}>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30"
               style={{ background: "var(--primary-glow)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Create new link</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Make it snippy.</h2>
            <p className="text-muted-foreground mt-1">Paste a long URL, choose an alias if you want — done.</p>

            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_240px_auto]">
              <div className="relative">
                <Link2 className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={longUrl} onChange={e => setLongUrl(e.target.value)}
                  placeholder="https://example.com/some/really/long/url"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">snip.ly/</span>
                <input value={customAlias} onChange={e => setCustomAlias(e.target.value.replace(/\s/g, ""))}
                  placeholder="custom (optional)"
                  className="w-full pl-[4.5rem] pr-4 py-3.5 rounded-xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
              </div>
              <button onClick={create}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-primary-foreground transition-all hover:opacity-95 active:scale-[0.98] shadow-lg shadow-primary/30"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-glow))" }}>
                <Zap className="w-4 h-4" /> Shorten
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Link2 className="w-5 h-5" />} label="Total Links" value={totals.total} />
          <StatCard icon={<MousePointerClick className="w-5 h-5" />} label="Total Clicks" value={totals.clicks.toLocaleString()} />
          <StatCard icon={<CalendarDays className="w-5 h-5" />} label="Created This Week" value={totals.thisWeek} />
          <StatCard icon={<Trophy className="w-5 h-5" />} label="Top Link" value={`/${totals.top?.alias ?? "—"}`} sub={`${totals.top?.clicks ?? 0} clicks`} />
        </section>

        {/* Links */}
        <section className="bg-card border border-border rounded-2xl shadow-sm">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b border-border">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">My Links</h3>
              <p className="text-sm text-muted-foreground">{filtered.length} of {links.length} shown</p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search links…"
                  className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-muted/60 border border-transparent focus:bg-card focus:border-border outline-none text-sm" />
              </div>
              <select value={sort} onChange={e => setSort(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-muted/60 border border-transparent focus:bg-card focus:border-border outline-none text-sm">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="clicks">Most clicks</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading your links...</div>
          ) : filtered.length === 0 ? (
            <EmptyState onCreate={() => document.querySelector<HTMLInputElement>('input[placeholder^="https://"]')?.focus()} />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map(l => (
                <LinkItem key={l.id} link={l}
                  onCopy={() => { navigator.clipboard?.writeText(`${window.location.protocol}//${shortHost()}/${l.alias}`); showToast("Copied to clipboard"); }}
                  onAnalytics={() => setOpenAnalytics(l)}
                  onDelete={() => setConfirmDel(l)}
                  onToggle={() => toggleActive(l.id)}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}>
        <div className="px-4 py-3 rounded-xl bg-foreground text-background shadow-2xl flex items-center gap-2 text-sm font-medium">
          <Check className="w-4 h-4 text-success" /> {toast}
        </div>
      </div>

      {openAnalytics && <AnalyticsModal link={openAnalytics} onClose={() => setOpenAnalytics(null)} onCopy={(a) => { navigator.clipboard?.writeText(`https://${shortHost()}/${a}`); showToast("Copied"); }} />}
      {confirmDel && (
        <ConfirmModal title="Delete this link?" desc={`snip.ly/${confirmDel.alias} will stop working immediately.`}
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => { remove(confirmDel.id); setConfirmDel(null); showToast("Link deleted"); }} />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-primary"
          style={{ background: "color-mix(in oklab, var(--primary) 12%, transparent)" }}>
          {icon}
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight truncate">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function LinkItem({ link, onCopy, onAnalytics, onDelete, onToggle }: {
  link: LinkRow; onCopy: () => void; onAnalytics: () => void; onDelete: () => void; onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const short = `${shortHost()}/${link.alias}`;
  return (
    <li className="p-5 sm:p-6 hover:bg-muted/30 transition group">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={copy} className="font-semibold text-foreground hover:text-primary transition truncate">
              {short}
            </button>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              link.active ? "bg-success/15 text-[oklch(0.45_0.13_155)]" : "bg-muted text-muted-foreground"
            }`}>{link.active ? "Active" : "Paused"}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "color-mix(in oklab, var(--primary) 12%, transparent)", color: "var(--primary)" }}>
              <MousePointerClick className="w-3 h-3" /> {link.clicks.toLocaleString()}
            </span>
          </div>
          <a href={link.longUrl} target="_blank" rel="noreferrer"
            className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground truncate max-w-full">
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{link.longUrl}</span>
          </a>
          <div className="text-xs text-muted-foreground mt-1">Created {fmtDate(link.createdAt)}</div>
        </div>

        <div className="flex items-center gap-1">
          <label className="inline-flex items-center cursor-pointer mr-2" title="Toggle active">
            <input type="checkbox" className="sr-only peer" checked={link.active} onChange={onToggle} />
            <div className="w-9 h-5 bg-muted rounded-full peer-checked:bg-primary transition relative">
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${link.active ? "translate-x-4" : ""}`} />
            </div>
          </label>
          <IconBtn label="Copy" onClick={copy}>
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </IconBtn>
          <IconBtn label="Analytics" onClick={onAnalytics}><BarChart3 className="w-4 h-4" /></IconBtn>
          <IconBtn label="Delete" onClick={onDelete} danger><Trash2 className="w-4 h-4" /></IconBtn>
        </div>
      </div>
    </li>
  );
}

function IconBtn({ children, onClick, label, danger }: { children: React.ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return (
    <button onClick={onClick} title={label} aria-label={label}
      className={`w-9 h-9 inline-flex items-center justify-center rounded-lg transition ${
        danger ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
               : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}>
      {children}
    </button>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-primary mb-4"
        style={{ background: "color-mix(in oklab, var(--primary) 12%, transparent)" }}>
        <Link2 className="w-7 h-7" />
      </div>
      <h4 className="text-lg font-semibold">No links match</h4>
      <p className="text-sm text-muted-foreground mt-1">Try a different search or create a new one.</p>
      <button onClick={onCreate} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-primary-foreground font-medium shadow-lg shadow-primary/30"
        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-glow))" }}>
        <Plus className="w-4 h-4" /> New link
      </button>
    </div>
  );
}

/* ---------------- ANALYTICS ---------------- */
const MOCK_VISITS = [
  { t: "2 min ago", device: "Mobile", browser: "Safari", loc: "Berlin, DE", icon: Smartphone },
  { t: "14 min ago", device: "Desktop", browser: "Chrome", loc: "New York, US", icon: Monitor },
  { t: "1 hr ago", device: "Desktop", browser: "Firefox", loc: "Tokyo, JP", icon: Monitor },
  { t: "3 hr ago", device: "Mobile", browser: "Chrome", loc: "São Paulo, BR", icon: Smartphone },
  { t: "Yesterday", device: "Desktop", browser: "Edge", loc: "London, UK", icon: Monitor },
];

function AnalyticsModal({ link, onClose, onCopy }: { link: LinkRow; onClose: () => void; onCopy: (a: string) => void }) {
  const data = link.history.map((v, i) => {
    const d = daysAgo(6 - i);
    return { day: d.toLocaleDateString(undefined, { weekday: "short" }), clicks: v };
  });
  const short = `${shortHost()}/${link.alias}`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 flex items-start justify-between border-b border-border">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-primary">Analytics</div>
            <h3 className="text-xl font-bold tracking-tight mt-1">{short}</h3>
            <p className="text-sm text-muted-foreground truncate max-w-md">{link.longUrl}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-muted inline-flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-[1fr_220px] gap-6">
          <div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <MiniStat label="Total" value={link.clicks.toLocaleString()} />
              <MiniStat label="7-day" value={link.history.reduce((a,b)=>a+b,0).toLocaleString()} />
              <MiniStat label="Avg/day" value={Math.round(link.history.reduce((a,b)=>a+b,0)/7).toLocaleString()} />
            </div>
            <div className="bg-muted/40 rounded-xl p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.52 0.22 280)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.52 0.22 280)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 270)" />
                  <XAxis dataKey="day" stroke="oklch(0.52 0.03 270)" fontSize={12} />
                  <YAxis stroke="oklch(0.52 0.03 270)" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 270)" }} />
                  <Area type="monotone" dataKey="clicks" stroke="oklch(0.52 0.22 280)" strokeWidth={2.5} fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <QrPanel short={short} alias={link.alias} onCopy={onCopy} />

        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Recent visits</h4>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-3 font-semibold">When</th>
                  <th className="text-left p-3 font-semibold">Device</th>
                  <th className="text-left p-3 font-semibold">Browser</th>
                  <th className="text-left p-3 font-semibold">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {link.visits && link.visits.length > 0 ? (
                  link.visits.slice().reverse().map((v: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30 transition">
                      <td className="p-3 text-muted-foreground">{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-3 inline-flex items-center gap-2">
                        {v.device === "Mobile" ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                        {v.device}
                      </td>
                      <td className="p-3">{v.browser}</td>
                      <td className="p-3 inline-flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" />{v.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">No recent visits yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-xl p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

function ConfirmModal({ title, desc, onCancel, onConfirm }: { title: string; desc: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        <div className="mt-6 flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:opacity-90">Delete</button>
        </div>
      </div>
    </div>
  );
}

function QrPanel({ short, alias, onCopy }: { short: string; alias: string; onCopy: (a: string) => void }) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const url = `https://${short}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    QRCode.toDataURL(url, {
      width: 512, margin: 1,
      color: { dark: "#1a1130", light: "#ffffff" },
    })
      .then((data) => { if (!cancelled) setDataUrl(data); })
      .catch(() => {
        if (!cancelled) {
          setDataUrl("");
          toast.error("Failed to generate QR code");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [url]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `snip-${alias}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <div className="rounded-2xl p-5 border border-border text-center"
      style={{ background: "linear-gradient(160deg, color-mix(in oklab, var(--primary) 8%, var(--card)), var(--card))" }}>
      <div className="w-32 h-32 mx-auto bg-card rounded-xl border border-border flex items-center justify-center overflow-hidden p-2">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Generating…</span>
          </div>
        ) : dataUrl ? (
          <img src={dataUrl} alt={`QR code for ${url}`} className="w-full h-full" />
        ) : (
          <QrCode className="w-16 h-16 text-muted-foreground" />
        )}
      </div>
      <div className="mt-4 font-semibold text-sm break-all">{url}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={() => onCopy(alias)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-primary-foreground text-sm font-medium shadow-lg shadow-primary/30"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-glow))" }}>
          <Copy className="w-4 h-4" /> Copy
        </button>
        <button onClick={download} disabled={!dataUrl}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition disabled:opacity-50">
          <Download className="w-4 h-4" /> PNG
        </button>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30"
      style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-glow))" }}>
      <Link2 className="w-5 h-5 -rotate-45" />
    </div>
  );
}
