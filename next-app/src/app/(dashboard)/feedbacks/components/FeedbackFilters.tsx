import React from 'react';

interface FeedbackFiltersProps {
  q: string;
  setQ: (val: string) => void;
  activeF: string;
  setActiveF: (val: string) => void;
  srcF: string;
  setSrcF: (val: string) => void;
  matF: string;
  setMatF: (val: string) => void;
  sorter: string;
  setSorter: (val: string) => void;
  sources: (string | unknown)[];
  materis: (string | unknown)[];
}

export const FeedbackFilters = React.memo(({
  q, setQ, activeF, setActiveF, srcF, setSrcF, matF, setMatF, sorter, setSorter, sources, materis
}: FeedbackFiltersProps) => {
  return (
    <>
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Cari nama, email, atau isi feedback..." 
          value={q} 
          onChange={e => setQ(e.target.value)} 
          className="w-full py-3 px-5 pl-12 border border-line-soft rounded-full text-sm font-medium bg-white shadow-sm outline-none focus:border-google-blue focus:shadow-md transition-all" 
        />
        <svg className="absolute left-4 top-3.5 w-5 h-5 text-ink-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <select value={activeF} onChange={e => setActiveF(e.target.value)} className="px-4 py-2 rounded-full border border-line-soft bg-white text-sm font-bold text-ink-3 hover:bg-line-soft outline-none cursor-pointer transition-colors">
          <option value="all">Semua Rating</option>
          <option value="10">Rating 10</option>
          <option value="9">Rating 9</option>
          <option value="8">Rating 8</option>
          <option value="7">Rating 7</option>
          <option value="6">Rating 6</option>
          <option value="5">Rating 5</option>
          <option value="4">Rating 4</option>
          <option value="3">Rating 3</option>
          <option value="2">Rating 2</option>
          <option value="1">Rating 1</option>
        </select>

        <select value={srcF} onChange={e => setSrcF(e.target.value)} className="px-4 py-2 rounded-full border border-line-soft bg-white text-sm font-bold text-ink-3 hover:bg-line-soft outline-none cursor-pointer transition-colors">
          <option value="all">Semua Source</option>
          {sources.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
        </select>

        <select value={matF} onChange={e => setMatF(e.target.value)} className="px-4 py-2 rounded-full border border-line-soft bg-white text-sm font-bold text-ink-3 hover:bg-line-soft outline-none cursor-pointer">
          <option value="all">Semua Materi</option>
          {materis.map(m => <option key={m as string} value={m as string}>{m as string}</option>)}
        </select>

        <select value={sorter} onChange={e => setSorter(e.target.value)} className="px-4 py-2 rounded-full border border-line-soft bg-white text-sm font-bold text-ink-3 hover:bg-line-soft outline-none cursor-pointer ml-auto">
          <option value="newest">Terbaru</option>
          <option value="hi">Rating Tertinggi</option>
        </select>
      </div>
    </>
  );
});
