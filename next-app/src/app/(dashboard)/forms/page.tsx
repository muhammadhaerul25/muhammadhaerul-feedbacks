"use client";

import { Search, Plus, FileText, Link as LinkIcon, Settings, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface FormItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  config?: any;
  response_count?: number;
}

export default function FormsManagementPage() {
  const [q, setQ] = useState("");
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forms')
      .then(r => r.json())
      .then(d => {
        if (d.success) setForms(d.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const getDisplayDomain = (f: FormItem) => {
    let domain = '';
    if (f.config) {
      let conf = f.config;
      if (typeof conf === 'string') {
        try { conf = JSON.parse(conf); } catch (e) {}
      }
      if (conf.customDomain) {
        domain = conf.customDomain.replace(/^https?:\/\//, '');
        if (domain.endsWith('/')) domain = domain.slice(0, -1);
      }
    }
    if (!domain && typeof window !== 'undefined') {
      domain = window.location.host;
    }
    return domain || '';
  };

  const filtered = forms.filter(f => f.name.toLowerCase().includes(q.toLowerCase()) || f.slug.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="bg-[#fcfdff] min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-line-soft">
        <div className="text-[1.8rem] font-extrabold tracking-tight text-ink">Forms</div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-20">
        
        {/* Actions (Search & Create) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
            <input 
              type="text" 
              placeholder="Search forms..." 
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-line-soft bg-white text-sm focus:outline-none focus:border-google-blue focus:ring-1 focus:ring-google-blue transition-all shadow-sm"
            />
          </div>
          
          <Link 
            href="/forms/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-google-blue hover:bg-google-blue-dark text-white text-sm font-bold rounded-full transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create New Form
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-ink-3">Loading forms...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-16 bg-white border border-line-soft rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-ink mb-2">No Forms Found</h2>
            <p className="text-ink-3 mb-6">Create your first form to get started.</p>
            <Link 
              href="/forms/create"
              className="inline-flex items-center gap-2 px-5 py-2 bg-google-blue hover:bg-google-blue-dark text-white text-sm font-bold rounded-full transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Form
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(f => (
              <div key={f.id} className="bg-white border border-line-soft rounded-2xl p-5 shadow-sm flex flex-col gap-4 group hover:border-google-blue transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-ink text-lg line-clamp-1 group-hover:text-google-blue transition-colors">{f.name}</h3>
                    <p className="text-xs text-ink-3 line-clamp-2 mt-1 min-h-[32px]">{f.description || 'No description'}</p>
                  </div>
                  <div className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${f.is_active ? 'bg-google-green-soft/20 text-google-green' : 'bg-ink-4/20 text-ink-4'}`}>
                    {f.is_active ? 'Active' : 'Closed'}
                  </div>
                </div>
                
                <a href={`http://${getDisplayDomain(f)}/form/${f.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-ink-3 bg-line-soft/30 px-3 py-2 rounded-lg break-all hover:text-google-blue hover:bg-google-blue-soft/10 transition-colors group">
                  <LinkIcon className="w-3 h-3 shrink-0 group-hover:text-google-blue" />
                  {getDisplayDomain(f)}/form/{f.slug}
                </a>
                
                <div className="flex gap-2 mt-2">
                  <a href={`http://${getDisplayDomain(f)}/form/${f.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 border border-line-soft rounded-lg text-sm font-bold text-ink hover:text-google-blue hover:bg-google-blue-soft/10 transition-colors flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Visit
                  </a>
                  <Link href={`/forms/create?slug=${f.slug}`} className="flex-1 px-3 py-2 border border-line-soft rounded-lg text-sm font-bold text-ink hover:text-google-blue hover:bg-google-blue-soft/10 transition-colors flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" /> Edit
                  </Link>
                  <button className="flex-1 px-3 py-2 border border-line-soft rounded-lg text-sm font-bold text-ink hover:text-google-blue hover:bg-google-blue-soft/10 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> Responses {f.response_count !== undefined && f.response_count > 0 && <span className="bg-line-soft text-ink-3 px-1.5 py-0.5 rounded-md text-[10px] leading-none font-bold ml-1">{f.response_count}</span>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
