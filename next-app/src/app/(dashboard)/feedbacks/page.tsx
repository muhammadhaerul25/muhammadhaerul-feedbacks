"use client";

import { useEffect, useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { FeedbackStats } from "./components/FeedbackStats";
import { FeedbackFilters } from "./components/FeedbackFilters";
import { FeedbackCard } from "./components/FeedbackCard";
import { FeedbackSkeleton } from "./components/FeedbackSkeleton";

export default function FeedbacksPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [activeF, setActiveF] = useState("all");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300); // 300ms debounce
  const [sorter, setSorter] = useState("newest");
  const [srcF, setSrcF] = useState("all");
  const [matF, setMatF] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback");
      const j = await res.json();
      setData(j.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sources = useMemo(() => Array.from(new Set(data.map((d) => d.source).filter(Boolean))), [data]);
  const materis = useMemo(() => Array.from(new Set(data.map((d) => d.materi).filter(Boolean))), [data]);

  const filtered = useMemo(() => {
    let fl = data.filter((d) => {
      const r = +d.rating;
      if (activeF !== "all" && r.toString() !== activeF) return false;
      if (srcF !== "all" && (d.source || "Umum") !== srcF) return false;
      if (matF !== "all" && (d.materi || "") !== matF) return false;
      if (debouncedQ) {
        const str = ((d.nama_lengkap || "") + " " + (d.alasan || "") + " " + (d.pesan_kesan || "")).toLowerCase();
        if (!str.includes(debouncedQ.toLowerCase())) return false;
      }
      return true;
    });

    fl.sort((a, b) => {
      if (sorter === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sorter === "hi") return +b.rating - +a.rating;
      return 0;
    });

    return fl;
  }, [data, activeF, debouncedQ, sorter, srcF, matF]);

  const n = data.length;
  const avg = n ? data.reduce((s, x) => s + (+x.rating || 0), 0) / n : 0;
  
  // Rating counts
  const ratingCounts: Record<number, number> = { 10:0, 9:0, 8:0, 7:0, 6:0, 5:0, 4:0, 3:0, 2:0, 1:0 };
  let modeRating = "0";
  let modeCount = 0;
  
  // Brackets
  let evalCount = 0; // 1-4
  let cukupCount = 0; // 5-6
  let puasCount = 0; // 7-8
  let sangatCount = 0; // 9-10
  
  data.forEach(x => {
    const r = +x.rating || 0;
    if (r >= 1 && r <= 10) ratingCounts[r]++;
    
    if (ratingCounts[r] > modeCount) {
      modeCount = ratingCounts[r];
      modeRating = r.toString();
    }
    
    if (r <= 4) evalCount++;
    else if (r <= 6) cukupCount++;
    else if (r <= 8) puasCount++;
    else sangatCount++;
  });

  return (
    <div className="bg-[#fcfdff] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-20">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-black text-ink tracking-tight">Feedbacks</h1>
          <button 
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-google-blue hover:bg-google-blue-dark text-white text-sm font-bold rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {loading ? (
          <FeedbackSkeleton />
        ) : !n ? (
          <div className="text-center p-16">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="text-2xl font-black text-ink mb-2 tracking-tight">No Feedbacks Yet</h2>
            <p className="text-ink-3">Wait for the audience to provide their responses!</p>
          </div>
        ) : (
          <>
            <FeedbackStats 
              n={n} 
              avg={avg} 
              ratingCounts={ratingCounts}
              modeRating={modeRating}
              modeCount={modeCount}
              evalCount={evalCount}
              cukupCount={cukupCount}
              puasCount={puasCount}
              sangatCount={sangatCount}
              materiFilter={matF}
            />
            
            <FeedbackFilters 
              q={q} setQ={setQ} 
              activeF={activeF} setActiveF={setActiveF} 
              srcF={srcF} setSrcF={setSrcF} 
              matF={matF} setMatF={setMatF} 
              sorter={sorter} setSorter={setSorter} 
              sources={sources} materis={materis} 
            />

            {filtered.length === 0 ? (
              <div className="text-center p-16 bg-white border border-line-soft rounded-[24px] shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-ink mb-2">No Results Found</h2>
                <p className="text-ink-3">Try changing your filters or search keywords.</p>
                <button onClick={() => { setQ(''); setActiveF('all'); setSrcF('all'); setMatF('all'); }} className="mt-6 px-6 py-2.5 bg-google-blue-soft text-google-blue-dark font-bold rounded-full hover:bg-google-blue hover:text-white transition-colors">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(d => (
                  <FeedbackCard key={d.id} data={d} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
