"use client";

import {
  Search, Plus, Mic2, Calendar, MapPin, Users, Link as LinkIcon,
  FileText, Pencil, Trash2, X, Upload, ExternalLink, ChevronRight,
  Loader2, AlertTriangle
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Slide {
  type: "link" | "pdf";
  label: string;
  url: string;
}

interface Talk {
  id: string;
  event: string;
  organizer: string | null;
  place: string | null;
  date: string | null;
  jumlah_peserta: number | null;
  poster_url: string | null;
  slides: Slide[] | null;
  created_at: string;
}

const EMPTY_FORM = {
  event: "",
  organizer: "",
  place: "",
  date: "",
  jumlah_peserta: "",
  poster_url: "",
  slides: [] as Slide[],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateInput(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

// ─── Slide Input Row ─────────────────────────────────────────────────────────

function SlideRow({
  slide,
  index,
  onChange,
  onRemove,
  onFileUpload,
}: {
  slide: Slide;
  index: number;
  onChange: (i: number, field: keyof Slide, val: string) => void;
  onRemove: (i: number) => void;
  onFileUpload: (i: number, file: File) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onFileUpload(index, file);
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#f8f9ff] border border-line rounded-xl">
      <div className="flex gap-2 items-center">
        {/* Type toggle */}
        <div className="flex rounded-lg overflow-hidden border border-line shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange(index, "type", "link")}
            className={`px-3 py-1.5 transition-colors ${slide.type === "link" ? "bg-google-blue text-white" : "text-ink-3 hover:bg-line-soft"}`}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => onChange(index, "type", "pdf")}
            className={`px-3 py-1.5 transition-colors ${slide.type === "pdf" ? "bg-google-blue text-white" : "text-ink-3 hover:bg-line-soft"}`}
          >
            PDF
          </button>
        </div>

        {/* Label */}
        <input
          type="text"
          placeholder="Label (e.g. Slide Deck Day 1)"
          value={slide.label}
          onChange={(e) => onChange(index, "label", e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-line rounded-lg focus:outline-none focus:border-google-blue focus:ring-1 focus:ring-google-blue/20 bg-white transition-all"
        />

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-ink-4 hover:text-google-red hover:bg-google-red-soft/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* URL or file upload */}
      {slide.type === "link" ? (
        <input
          type="url"
          placeholder="https://docs.google.com/presentation/..."
          value={slide.url}
          onChange={(e) => onChange(index, "url", e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-line rounded-lg focus:outline-none focus:border-google-blue focus:ring-1 focus:ring-google-blue/20 bg-white transition-all"
        />
      ) : (
        <div className="flex gap-2 items-center">
          <input
            type="url"
            placeholder="URL (auto-filled after upload)"
            value={slide.url}
            onChange={(e) => onChange(index, "url", e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-line rounded-lg focus:outline-none focus:border-google-blue focus:ring-1 focus:ring-google-blue/20 bg-white transition-all"
          />
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line rounded-lg text-xs font-semibold text-ink-2 hover:border-google-blue hover:text-google-blue transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {uploading ? "Uploading…" : "Upload PDF"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Talk Card ────────────────────────────────────────────────────────────────

function TalkCard({
  talk,
  onEdit,
  onDelete,
}: {
  talk: Talk;
  onEdit: (t: Talk) => void;
  onDelete: (t: Talk) => void;
}) {
  const slides = (talk.slides as Slide[]) || [];

  return (
    <div className="group bg-white border border-line-soft rounded-2xl overflow-hidden shadow-google hover:shadow-google-hover hover:border-google-blue/30 transition-all duration-200 flex flex-col">
      {/* Poster */}
      <div className="relative w-full aspect-[16/7] bg-gradient-to-br from-google-blue-soft via-[#f0f4ff] to-white overflow-hidden">
        {talk.poster_url ? (
          <img
            src={talk.poster_url}
            alt={talk.event}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
            <Mic2 className="w-10 h-10 text-google-blue" />
          </div>
        )}
        {/* Date badge */}
        {talk.date && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[11px] font-bold text-ink-2 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-google-blue" />
            {formatDate(talk.date)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-ink text-[1rem] leading-snug group-hover:text-google-blue transition-colors line-clamp-2">
            {talk.event}
          </h3>
          {talk.organizer && (
            <p className="text-xs text-ink-3 mt-1 font-medium">{talk.organizer}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1.5">
          {talk.place && (
            <div className="flex items-center gap-1.5 text-xs text-ink-3">
              <MapPin className="w-3.5 h-3.5 text-google-red shrink-0" />
              <span className="line-clamp-1">{talk.place}</span>
            </div>
          )}
          {talk.jumlah_peserta != null && (
            <div className="flex items-center gap-1.5 text-xs text-ink-3">
              <Users className="w-3.5 h-3.5 text-google-green shrink-0" />
              <span>{talk.jumlah_peserta.toLocaleString("id-ID")} peserta</span>
            </div>
          )}
        </div>

        {/* Slides */}
        {slides.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {slides.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label || (s.type === "pdf" ? "PDF" : "Link")}
                className="inline-flex items-center gap-1 px-2 py-1 bg-google-blue-soft/60 text-google-blue-dark text-[10px] font-semibold rounded-md hover:bg-google-blue-soft transition-colors"
              >
                {s.type === "pdf" ? (
                  <FileText className="w-3 h-3" />
                ) : (
                  <LinkIcon className="w-3 h-3" />
                )}
                {s.label || (s.type === "pdf" ? "PDF" : "Link")}
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-line-soft">
          <button
            onClick={() => onEdit(talk)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-ink-2 hover:text-google-blue hover:bg-google-blue-soft/30 border border-line-soft hover:border-google-blue/30 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(talk)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-ink-2 hover:text-google-red hover:bg-google-red-soft/30 border border-line-soft hover:border-google-red/30 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Talk Drawer ──────────────────────────────────────────────────────────────

function TalkDrawer({
  open,
  talk,
  onClose,
  onSaved,
}: {
  open: boolean;
  talk: Talk | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [posterUploading, setPosterUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posterRef = useRef<HTMLInputElement>(null);
  const isEdit = !!talk;

  useEffect(() => {
    if (open) {
      if (talk) {
        setForm({
          event: talk.event,
          organizer: talk.organizer || "",
          place: talk.place || "",
          date: formatDateInput(talk.date),
          jumlah_peserta: talk.jumlah_peserta?.toString() || "",
          poster_url: talk.poster_url || "",
          slides: (talk.slides as Slide[]) || [],
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError(null);
    }
  }, [open, talk]);

  const handleChange = (field: string, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleSlideChange = (i: number, field: keyof Slide, val: string) => {
    setForm((f) => {
      const slides = [...f.slides];
      slides[i] = { ...slides[i], [field]: val };
      return { ...f, slides };
    });
  };

  const handleSlideRemove = (i: number) => {
    setForm((f) => ({ ...f, slides: f.slides.filter((_, idx) => idx !== i) }));
  };

  const handleSlideAdd = () => {
    setForm((f) => ({
      ...f,
      slides: [...f.slides, { type: "link", label: "", url: "" }],
    }));
  };

  const handleFileUpload = useCallback(async (i: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/talks/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      setForm((f) => {
        const slides = [...f.slides];
        slides[i] = { ...slides[i], url: data.url };
        return { ...f, slides };
      });
    }
  }, []);

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/talks/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, poster_url: data.url }));
    setPosterUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.event.trim()) {
      setError("Nama event harus diisi.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        event: form.event,
        organizer: form.organizer || null,
        place: form.place || null,
        date: form.date || null,
        jumlah_peserta: form.jumlah_peserta ? parseInt(form.jumlah_peserta, 10) : null,
        poster_url: form.poster_url || null,
        slides: form.slides,
      };

      const url = isEdit ? `/api/talks/${talk!.id}` : "/api/talks";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan.");
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-[560px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line-soft">
          <div>
            <div className="text-[1.1rem] font-extrabold text-ink">
              {isEdit ? "Edit Talk" : "Add New Talk"}
            </div>
            <div className="text-xs text-ink-4 mt-0.5">
              {isEdit ? "Update detail talk" : "Tambahkan talk / speaking engagement baru"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ink-4 hover:bg-line-soft hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-google-red-soft/30 border border-google-red/20 rounded-xl text-sm text-google-red-dark font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Event */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-2 uppercase tracking-wide">
              Event <span className="text-google-red">*</span>
            </label>
            <input
              type="text"
              id="talk-event"
              placeholder="Nama event / conference"
              value={form.event}
              onChange={(e) => handleChange("event", e.target.value)}
              required
              className="px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-google-blue focus:ring-2 focus:ring-google-blue/20 transition-all"
            />
          </div>

          {/* Organizer */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-2 uppercase tracking-wide">Organizer</label>
            <input
              type="text"
              id="talk-organizer"
              placeholder="Nama penyelenggara"
              value={form.organizer}
              onChange={(e) => handleChange("organizer", e.target.value)}
              className="px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-google-blue focus:ring-2 focus:ring-google-blue/20 transition-all"
            />
          </div>

          {/* Place + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-ink-2 uppercase tracking-wide">Place</label>
              <input
                type="text"
                id="talk-place"
                placeholder="Kota / Venue"
                value={form.place}
                onChange={(e) => handleChange("place", e.target.value)}
                className="px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-google-blue focus:ring-2 focus:ring-google-blue/20 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-ink-2 uppercase tracking-wide">Date</label>
              <input
                type="date"
                id="talk-date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-google-blue focus:ring-2 focus:ring-google-blue/20 transition-all"
              />
            </div>
          </div>

          {/* Jumlah Peserta */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-2 uppercase tracking-wide">Jumlah Peserta</label>
            <input
              type="number"
              id="talk-peserta"
              placeholder="Contoh: 250"
              min={0}
              value={form.jumlah_peserta}
              onChange={(e) => handleChange("jumlah_peserta", e.target.value)}
              className="px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-google-blue focus:ring-2 focus:ring-google-blue/20 transition-all"
            />
          </div>

          {/* Poster */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-2 uppercase tracking-wide">Poster</label>
            {form.poster_url && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-line-soft mb-2">
                <img src={form.poster_url} alt="poster" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleChange("poster_url", "")}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="url"
                id="talk-poster-url"
                placeholder="https://... (URL gambar)"
                value={form.poster_url}
                onChange={(e) => handleChange("poster_url", e.target.value)}
                className="flex-1 px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-google-blue focus:ring-2 focus:ring-google-blue/20 transition-all"
              />
              <input
                ref={posterRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePosterUpload}
              />
              <button
                type="button"
                disabled={posterUploading}
                onClick={() => posterRef.current?.click()}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-line rounded-xl text-xs font-semibold text-ink-2 hover:border-google-blue hover:text-google-blue transition-colors disabled:opacity-60"
              >
                {posterUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {posterUploading ? "…" : "Upload"}
              </button>
            </div>
          </div>

          {/* Slides */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-2 uppercase tracking-wide">
                Presentation Slides
              </label>
              <span className="text-[10px] text-ink-4 font-medium">{form.slides.length} file(s)</span>
            </div>

            {form.slides.length > 0 ? (
              <div className="flex flex-col gap-2">
                {form.slides.map((slide, i) => (
                  <SlideRow
                    key={i}
                    slide={slide}
                    index={i}
                    onChange={handleSlideChange}
                    onRemove={handleSlideRemove}
                    onFileUpload={handleFileUpload}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-ink-4 italic py-2">Belum ada slide ditambahkan.</div>
            )}

            <button
              type="button"
              onClick={handleSlideAdd}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-google-blue/40 bg-google-blue-soft/20 text-google-blue text-xs font-bold rounded-xl hover:bg-google-blue-soft/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Slide
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line-soft flex gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-line text-sm font-semibold text-ink-2 hover:bg-line-soft transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit as any}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-google-blue hover:bg-google-blue-dark text-white text-sm font-bold transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {saving ? "Menyimpan…" : isEdit ? "Update Talk" : "Simpan Talk"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  talk,
  onClose,
  onDeleted,
}: {
  talk: Talk | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!talk) return;
    setDeleting(true);
    await fetch(`/api/talks/${talk.id}`, { method: "DELETE" });
    setDeleting(false);
    onDeleted();
    onClose();
  };

  if (!talk) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4">
        <div className="w-12 h-12 rounded-full bg-google-red-soft flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6 text-google-red" />
        </div>
        <div className="text-center">
          <div className="font-bold text-ink text-lg">Hapus Talk?</div>
          <p className="text-sm text-ink-3 mt-1">
            <span className="font-semibold text-ink">"{talk.event}"</span> akan dihapus secara permanen.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-line text-sm font-semibold text-ink-2 hover:bg-line-soft transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-google-red hover:bg-google-red-dark text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? "Menghapus…" : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TalksPage() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTalk, setEditTalk] = useState<Talk | null>(null);
  const [deleteTalk, setDeleteTalk] = useState<Talk | null>(null);

  const fetchTalks = useCallback(() => {
    setLoading(true);
    fetch("/api/talks")
      .then((r) => r.json())
      .then((d) => setTalks(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTalks();
  }, [fetchTalks]);

  const filtered = talks.filter(
    (t) =>
      t.event.toLowerCase().includes(q.toLowerCase()) ||
      (t.organizer || "").toLowerCase().includes(q.toLowerCase()) ||
      (t.place || "").toLowerCase().includes(q.toLowerCase())
  );

  const openCreate = () => {
    setEditTalk(null);
    setDrawerOpen(true);
  };

  const openEdit = (t: Talk) => {
    setEditTalk(t);
    setDrawerOpen(true);
  };

  return (
    <div className="bg-[#fcfdff] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-8 py-5 flex justify-between items-center border-b border-line-soft">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-google-blue-soft flex items-center justify-center">
            <Mic2 className="w-5 h-5 text-google-blue" />
          </div>
          <div>
            <div className="text-[1.4rem] font-extrabold tracking-tight text-ink leading-none">Talks</div>
            <div className="text-xs text-ink-4 mt-0.5">Speaking engagements & presentations</div>
          </div>
        </div>
        <button
          id="btn-add-talk"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-google-blue hover:bg-google-blue-dark text-white text-sm font-bold rounded-full transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Talk
        </button>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-20">

        {/* Stats bar */}
        {!loading && talks.length > 0 && (
          <div className="flex gap-4 mb-6">
            <div className="bg-white border border-line-soft rounded-xl px-4 py-3 flex items-center gap-3 shadow-google">
              <div className="w-8 h-8 rounded-lg bg-google-blue-soft flex items-center justify-center">
                <Mic2 className="w-4 h-4 text-google-blue" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-ink leading-none">{talks.length}</div>
                <div className="text-[10px] text-ink-4 font-semibold uppercase tracking-wide mt-0.5">Total Talks</div>
              </div>
            </div>
            {(() => {
              const totalPeserta = talks.reduce((s, t) => s + (t.jumlah_peserta || 0), 0);
              return totalPeserta > 0 ? (
                <div className="bg-white border border-line-soft rounded-xl px-4 py-3 flex items-center gap-3 shadow-google">
                  <div className="w-8 h-8 rounded-lg bg-google-green-soft flex items-center justify-center">
                    <Users className="w-4 h-4 text-google-green" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-ink leading-none">{totalPeserta.toLocaleString("id-ID")}</div>
                    <div className="text-[10px] text-ink-4 font-semibold uppercase tracking-wide mt-0.5">Total Peserta</div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Search */}
        <div className="relative w-full md:w-96 mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
          <input
            type="text"
            placeholder="Cari event, organizer, atau tempat…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-line-soft bg-white text-sm focus:outline-none focus:border-google-blue focus:ring-1 focus:ring-google-blue transition-all shadow-sm"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-google-blue animate-spin" />
            <div className="text-sm text-ink-3">Memuat data talks…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white border border-line-soft rounded-2xl shadow-google">
            <div className="w-16 h-16 bg-google-blue-soft rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic2 className="w-8 h-8 text-google-blue" />
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">
              {q ? "Tidak ada hasil" : "Belum ada Talk"}
            </h2>
            <p className="text-ink-3 mb-6 text-sm">
              {q ? `Tidak ada talk yang cocok dengan "${q}".` : "Tambahkan talk pertama Anda!"}
            </p>
            {!q && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-5 py-2 bg-google-blue hover:bg-google-blue-dark text-white text-sm font-bold rounded-full transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Talk
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <TalkCard key={t.id} talk={t} onEdit={openEdit} onDelete={setDeleteTalk} />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      <TalkDrawer
        open={drawerOpen}
        talk={editTalk}
        onClose={() => setDrawerOpen(false)}
        onSaved={fetchTalks}
      />

      {/* Delete dialog */}
      <DeleteDialog
        talk={deleteTalk}
        onClose={() => setDeleteTalk(null)}
        onDeleted={fetchTalks}
      />
    </div>
  );
}
