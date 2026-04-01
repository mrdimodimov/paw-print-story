import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Tribute {
  id: string;
  pet_name: string;
  pet_type: string;
  breed: string | null;
  tier_name: string;
  tester_source: string | null;
  created_at: string;
  is_paid: boolean;
  slug: string | null;
  tribute_story: string;
  photo_urls: string[];
  form_data: any;
  owner_name: string | null;
  years_of_life: string | null;
  title: string | null;
}

interface AnalyticsEvent {
  id: string;
  event_name: string;
  tester_source: string | null;
  tribute_id: string | null;
  metadata: any;
  created_at: string;
}

const ADMIN_KEY = "vellum_admin_2026";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [selectedTribute, setSelectedTribute] = useState<Tribute | null>(null);
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("admin_key") || "");
  const [authenticated, setAuthenticated] = useState(false);

  const fetchData = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-analytics`;
      const resp = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch");
      setTributes(data.tributes || []);
      setEvents(data.events || []);
      setAuthenticated(true);
      localStorage.setItem("admin_key", key);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) fetchData(adminKey);
    else setLoading(false);
  }, []);

  // Compute overview stats grouped by tester_source
  const overview = useMemo(() => {
    const sources = new Map<string, {
      source: string;
      started: number;
      stepsCompleted: Map<string, number>;
      completed: number;
      paymentClicked: number;
      tributes: number;
    }>();

    const getOrCreate = (src: string) => {
      if (!sources.has(src)) {
        sources.set(src, {
          source: src,
          started: 0,
          stepsCompleted: new Map(),
          completed: 0,
          paymentClicked: 0,
          tributes: 0,
        });
      }
      return sources.get(src)!;
    };

    for (const ev of events) {
      const src = ev.tester_source || "(organic)";
      const entry = getOrCreate(src);
      if (ev.event_name === "tribute_started") entry.started++;
      if (ev.event_name === "step_completed") {
        const step = ev.metadata?.step || "unknown";
        entry.stepsCompleted.set(step, (entry.stepsCompleted.get(step) || 0) + 1);
      }
      if (ev.event_name === "tribute_completed") entry.completed++;
      if (ev.event_name === "payment_clicked") entry.paymentClicked++;
    }

    for (const t of tributes) {
      const src = t.tester_source || "(organic)";
      const entry = getOrCreate(src);
      entry.tributes++;
    }

    return Array.from(sources.values()).sort((a, b) => b.started - a.started);
  }, [events, tributes]);

  const filteredTributes = useMemo(() => {
    if (!filter) return tributes;
    const q = filter.toLowerCase();
    return tributes.filter(
      (t) =>
        (t.tester_source || "").toLowerCase().includes(q) ||
        t.pet_name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }, [tributes, filter]);

  // Auth gate
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
          <Input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData(adminKey)}
          />
          <Button className="w-full" onClick={() => fetchData(adminKey)} disabled={loading}>
            {loading ? "Loading…" : "Access Dashboard"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading analytics…</p>
      </div>
    );
  }

  // Detail view
  if (selectedTribute) {
    const t = selectedTribute;
    const tributeEvents = events.filter((e) => e.tribute_id === t.id);
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedTribute(null)} className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to list
        </Button>

        <div className="max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.title || t.pet_name}</h1>
            <p className="text-sm text-muted-foreground">
              {t.pet_type} · {t.breed || "Unknown breed"} · {t.years_of_life || "—"}
            </p>
            <div className="mt-2 flex gap-2">
              <Badge variant={t.is_paid ? "default" : "secondary"}>
                {t.is_paid ? "Paid" : "Unpaid"}
              </Badge>
              <Badge variant="outline">{t.tier_name}</Badge>
              {t.tester_source && <Badge variant="outline">tester: {t.tester_source}</Badge>}
            </div>
          </div>

          {/* Photos */}
          {t.photo_urls.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Photos</h3>
              <div className="flex flex-wrap gap-2">
                {t.photo_urls.map((url, i) => (
                  <img key={i} src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}

          {/* Story */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-foreground">Generated Story</h3>
            <div className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {t.tribute_story}
            </div>
          </div>

          {/* Form data */}
          {t.form_data && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Form Inputs</h3>
              <pre className="overflow-auto rounded-lg border border-border bg-muted p-4 text-xs text-muted-foreground">
                {JSON.stringify(t.form_data, null, 2)}
              </pre>
            </div>
          )}

          {/* Events for this tribute */}
          {tributeEvents.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Events ({tributeEvents.length})</h3>
              <div className="space-y-1">
                {tributeEvents.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono">{new Date(e.created_at).toLocaleString()}</span>
                    <Badge variant="outline" className="text-xs">{e.event_name}</Badge>
                    {e.metadata && <span className="font-mono">{JSON.stringify(e.metadata)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Created: {new Date(t.created_at).toLocaleString()} · ID: {t.id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tester Analytics</h1>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Home
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Overview by Source</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overview.map((o) => (
            <div key={o.source} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">{o.source}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Started: <span className="font-semibold text-foreground">{o.started}</span></div>
                <div>Completed: <span className="font-semibold text-foreground">{o.completed}</span></div>
                <div>Tributes: <span className="font-semibold text-foreground">{o.tributes}</span></div>
                <div>Payments: <span className="font-semibold text-foreground">{o.paymentClicked}</span></div>
                <div className="col-span-2">
                  Conversion: <span className="font-semibold text-foreground">
                    {o.started > 0 ? Math.round((o.completed / o.started) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          {overview.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No analytics data yet.</p>
          )}
        </div>
      </div>

      {/* Filter + Table */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by source, name, or ID…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
          {filter && (
            <button onClick={() => setFilter("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{filteredTributes.length} tributes</p>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pet Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Created</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTributes.map((t) => (
              <TableRow key={t.id} className="cursor-pointer" onClick={() => setSelectedTribute(t)}>
                <TableCell className="font-medium">{t.pet_name}</TableCell>
                <TableCell>
                  {t.tester_source ? (
                    <Badge variant="outline" className="text-xs">{t.tester_source}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs">{t.tier_name}</TableCell>
                <TableCell>
                  <Badge variant={t.is_paid ? "default" : "secondary"} className="text-xs">
                    {t.is_paid ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
            {filteredTributes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  No tributes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
