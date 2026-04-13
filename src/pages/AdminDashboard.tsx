import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, X, ChevronDown, Trash2, Eye, EyeOff, Pencil, ImagePlus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface PublicTribute {
  id: string;
  pet_name: string;
  pet_type: string;
  breed: string | null;
  slug: string;
  story: string;
  photo_urls: string[];
  is_public: boolean;
  is_deleted: boolean;
  tier_id: string;
  created_at: string;
  years_of_life: string | null;
}

interface AnalyticsEvent {
  id: string;
  event_name: string;
  tester_source: string | null;
  tribute_id: string | null;
  metadata: any;
  created_at: string;
}

const ADMIN_KEY = "vellum123";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [publicTributes, setPublicTributes] = useState<PublicTribute[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [selectedTribute, setSelectedTribute] = useState<Tribute | null>(null);
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("admin_key") || "");
  const [authenticated, setAuthenticated] = useState(false);

  // Memorial management state
  const [activeTab, setActiveTab] = useState<"analytics" | "memorials">("analytics");
  const [memorialFilter, setMemorialFilter] = useState<"all" | "public" | "private">("all");
  const [tierFilter, setTierFilter] = useState<"all" | "story" | "pack" | "legacy">("all");
  const [memorialSearch, setMemorialSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PublicTribute | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<PublicTribute | null>(null);
  const [editName, setEditName] = useState("");
  const [editStory, setEditStory] = useState("");
  const [editPetType, setEditPetType] = useState("dog");
  const [editBreed, setEditBreed] = useState("");
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAdminKey = () => localStorage.getItem("admin_key") || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tributeRes, eventRes, publicRes] = await Promise.all([
        supabase
          .from("tributes")
          .select("id, pet_name, pet_type, breed, tier_name, tester_source, created_at, is_paid, slug, tribute_story, photo_urls, form_data, owner_name, years_of_life, title")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("analytics_events")
          .select("id, event_name, tester_source, tribute_id, metadata, created_at")
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase
          .from("public_tributes")
          .select("id, pet_name, pet_type, breed, slug, story, photo_urls, is_public, is_deleted, tier_id, created_at, years_of_life")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false }),
      ]);

      if (tributeRes.error) throw new Error(tributeRes.error.message);
      if (eventRes.error) throw new Error(eventRes.error.message);

      setTributes((tributeRes.data as Tribute[]) || []);
      setEvents((eventRes.data as AnalyticsEvent[]) || []);
      setPublicTributes((publicRes.data as PublicTribute[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = () => {
    const trimmed = adminKey.trim();
    if (trimmed === ADMIN_KEY) {
      setAuthenticated(true);
      localStorage.setItem("admin_key", trimmed);
    } else {
      setError("Invalid admin key");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("admin_key");
    if (stored === ADMIN_KEY) {
      setAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, fetchData]);

  // Toggle visibility
  const handleToggleVisibility = async (tribute: PublicTribute) => {
    const newValue = !tribute.is_public;
    // Optimistic update
    setPublicTributes((prev) =>
      prev.map((t) => (t.id === tribute.id ? { ...t, is_public: newValue } : t))
    );

    try {
      const res = await supabase.functions.invoke("admin-manage-tribute", {
        body: { action: "toggle_visibility", tribute_id: tribute.id, data: { is_public: newValue } },
        headers: { "x-admin-key": getAdminKey() },
      });
      if (res.error) throw res.error;
      toast.success(newValue ? "Now public" : "Marked as private");
    } catch {
      // Revert
      setPublicTributes((prev) =>
        prev.map((t) => (t.id === tribute.id ? { ...t, is_public: !newValue } : t))
      );
      toast.error("Failed to update visibility");
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await supabase.functions.invoke("delete-tribute", {
        body: { tribute_id: deleteTarget.id, slug: deleteTarget.slug },
        headers: { "x-admin-key": getAdminKey() },
      });
      if (res.error) throw res.error;
      setPublicTributes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.pet_name}" deleted`);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Edit
  const openEdit = (t: PublicTribute) => {
    setEditTarget(t);
    setEditName(t.pet_name);
    setEditStory(t.story);
    setEditPetType(t.pet_type || "other");
    setEditBreed(t.breed || "");
    setEditPhotos([...t.photo_urls]);
  };

  const handleRemovePhoto = (index: number) => {
    setEditPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadPhotos = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `admin/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("pet-photos").upload(path, file);
        if (error) {
          console.error("Upload error:", error);
          continue;
        }
        const { data: urlData } = supabase.storage.from("pet-photos").getPublicUrl(path);
        if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
      }
      if (newUrls.length > 0) {
        setEditPhotos((prev) => [...prev, ...newUrls]);
        toast.success(`${newUrls.length} photo(s) uploaded`);
      }
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const normalizedType = ["dog", "cat", "bird", "other"].includes(editPetType.toLowerCase())
        ? editPetType.toLowerCase()
        : "other";

      const res = await supabase.functions.invoke("admin-manage-tribute", {
        body: {
          action: "edit",
          tribute_id: editTarget.id,
          slug: editTarget.slug,
          data: {
            pet_name: editName.trim(),
            story: editStory.trim(),
            pet_type: normalizedType,
            breed: editBreed.trim(),
            photo_urls: editPhotos,
          },
        },
        headers: { "x-admin-key": getAdminKey() },
      });
      if (res.error) throw res.error;
      setPublicTributes((prev) =>
        prev.map((t) =>
          t.id === editTarget.id
            ? {
                ...t,
                pet_name: editName.trim(),
                story: editStory.trim(),
                pet_type: normalizedType,
                breed: editBreed.trim() || null,
                photo_urls: editPhotos,
              }
            : t
        )
      );
      toast.success("Memorial updated");
      setEditTarget(null);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Analytics computed values
  const overview = useMemo(() => {
    const sources = new Map<string, {
      source: string; started: number; stepsCompleted: Map<string, number>;
      completed: number; paymentClicked: number; tributes: number;
    }>();
    const getOrCreate = (src: string) => {
      if (!sources.has(src)) {
        sources.set(src, { source: src, started: 0, stepsCompleted: new Map(), completed: 0, paymentClicked: 0, tributes: 0 });
      }
      return sources.get(src)!;
    };
    for (const ev of events) {
      const src = ev.tester_source || "(organic)";
      const entry = getOrCreate(src);
      if (ev.event_name === "tribute_started") entry.started++;
      if (ev.event_name === "step_completed") {
        const step = (ev.metadata as any)?.step || "unknown";
        entry.stepsCompleted.set(step, (entry.stepsCompleted.get(step) || 0) + 1);
      }
      if (ev.event_name === "tribute_completed") entry.completed++;
      if (ev.event_name === "payment_clicked") entry.paymentClicked++;
    }
    for (const t of tributes) {
      const src = t.tester_source || "(organic)";
      getOrCreate(src).tributes++;
    }
    return Array.from(sources.values()).sort((a, b) => b.started - a.started);
  }, [events, tributes]);

  const filteredTributes = useMemo(() => {
    if (!filter) return tributes;
    const q = filter.toLowerCase();
    return tributes.filter(
      (t) => (t.tester_source || "").toLowerCase().includes(q) || t.pet_name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    );
  }, [tributes, filter]);

  const tierLabel = (tid: string) => {
    if (tid === "pack") return "Memory Pack";
    if (tid === "legacy") return "Legacy";
    return "Story";
  };

  const filteredMemorials = useMemo(() => {
    let list = publicTributes;
    if (memorialFilter === "public") list = list.filter((t) => t.is_public);
    if (memorialFilter === "private") list = list.filter((t) => !t.is_public);
    if (tierFilter !== "all") list = list.filter((t) => t.tier_id === tierFilter);
    if (memorialSearch.trim()) {
      const q = memorialSearch.toLowerCase();
      list = list.filter((t) => t.pet_name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
    }
    return list;
  }, [publicTributes, memorialFilter, tierFilter, memorialSearch]);

  const excerpt = (story: string, len = 80): string => {
    if (!story) return "";
    const cleaned = story.replace(/---[A-Z_]+---[^\n]*/g, "").trim();
    if (cleaned.length <= len) return cleaned;
    const cut = cleaned.slice(0, len).lastIndexOf(" ");
    return cleaned.slice(0, cut > 40 ? cut : len).trim() + "…";
  };

  // Auth gate
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
          <Input type="password" placeholder="Enter admin key" value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          <Button className="w-full" onClick={handleLogin} disabled={loading}>
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

  // Detail view for analytics tribute
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
            <p className="text-sm text-muted-foreground">{t.pet_type} · {t.breed || "Unknown breed"} · {t.years_of_life || "—"}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant={t.is_paid ? "default" : "secondary"}>{t.is_paid ? "Paid" : "Unpaid"}</Badge>
              <Badge variant="outline">{t.tier_name}</Badge>
              {t.tester_source && <Badge variant="outline">tester: {t.tester_source}</Badge>}
            </div>
          </div>
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
          <div>
            <h3 className="mb-2 text-sm font-medium text-foreground">Generated Story</h3>
            <div className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {t.tribute_story}
            </div>
          </div>
          {t.form_data && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Form Inputs</h3>
              <pre className="overflow-auto rounded-lg border border-border bg-muted p-4 text-xs text-muted-foreground">
                {JSON.stringify(t.form_data, null, 2)}
              </pre>
            </div>
          )}
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
          <p className="text-xs text-muted-foreground">Created: {new Date(t.created_at).toLocaleString()} · ID: {t.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Home
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">Unable to load data: {error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchData}>Retry</Button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(["analytics", "memorials"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "analytics" ? "Analytics" : "Memorials"}
          </button>
        ))}
      </div>

      {activeTab === "analytics" && (
        <>
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

          {/* Analytics Table */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Filter by source, name, or ID…" value={filter}
                onChange={(e) => setFilter(e.target.value)} className="pl-9" />
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
        </>
      )}

      {activeTab === "memorials" && (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name or slug…" value={memorialSearch}
                  onChange={(e) => setMemorialSearch(e.target.value)} className="pl-9" />
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">{filteredMemorials.length} memorials</p>
            </div>
            <div className="flex gap-3">
              <div className="flex gap-1">
                {(["all", "public", "private"] as const).map((f) => (
                  <button key={f} onClick={() => setMemorialFilter(f)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      memorialFilter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {([
                  { key: "all" as const, label: "All tiers" },
                  { key: "story" as const, label: "Story" },
                  { key: "pack" as const, label: "Pack" },
                  { key: "legacy" as const, label: "Legacy" },
                ]).map((f) => (
                  <button key={f.key} onClick={() => setTierFilter(f.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      tierFilter === f.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Memorials Table */}
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemorials.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{t.pet_name}</span>
                        <p className="mt-0.5 text-xs text-muted-foreground italic line-clamp-1">
                          {excerpt(t.story)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs capitalize">{t.pet_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{tierLabel(t.tier_id)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.is_public ? "default" : "secondary"}
                        className={`text-xs ${t.is_public ? "bg-green-600 hover:bg-green-700" : ""}`}
                      >
                        {t.is_public ? "Public" : "Private"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggleVisibility(t)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title={t.is_public ? "Make private" : "Make public"}
                        >
                          {t.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openEdit(t)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(t)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMemorials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      No memorials found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.pet_name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block italic text-muted-foreground mb-2">
                "{deleteTarget ? excerpt(deleteTarget.story) : ""}"
              </span>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Memorial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Pet Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Pet Type</label>
                <Select value={editPetType} onValueChange={setEditPetType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Breed</label>
              <Input value={editBreed} onChange={(e) => setEditBreed(e.target.value)} className="mt-1" placeholder="e.g. Golden Retriever" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Story</label>
              <Textarea value={editStory} onChange={(e) => setEditStory(e.target.value)}
                className="mt-1 min-h-[200px]" />
            </div>

            {/* Photo Management */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Photos ({editPhotos.length})</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                  {uploading ? "Uploading…" : "Add Photos"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleUploadPhotos(e.target.files)}
                />
              </div>
              {editPhotos.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {editPhotos.map((url, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                      <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No photos yet.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editName.trim()}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
