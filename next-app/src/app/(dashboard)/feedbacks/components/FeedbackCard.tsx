import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FeedbackData {
  id: string | number;
  nama_lengkap: string;
  email: string;
  rating: string | number;
  alasan: string;
  pesan_kesan: string;
  created_at: string;
  source: string;
  materi?: string;
}

interface FeedbackCardProps {
  data: FeedbackData;
}

const COLORS = [['#4285F4', '#174EA6'], ['#34A853', '#0D652D'], ['#FBBC04', '#E37400'], ['#EA4335', '#A50E0E']];

function getColor(n: string) {
  let h = 0;
  for (let i = 0; i < (n || ' ').length; i++) h = h * 31 + (n || ' ').charCodeAt(i);
  return COLORS[Math.abs(h) % COLORS.length][0];
}

function getInitials(n: string) {
  if (!n) return "?";
  const p = n.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase();
}

function maskName(name: string) {
  if (!name) return 'Anonim';
  return name.split(' ').map(word => {
    if (word.length <= 3) return word + '*'.repeat(Math.max(0, 5 - word.length));
    return word.substring(0, 3) + '*'.repeat(word.length - 3);
  }).join(' ');
}

function maskEmail(email: string) {
  if (!email) return '-';
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.***';
  const [username, domain] = parts;
  const maskedUsername = username.length <= 3 ? username + '***' : username.substring(0, 3) + '*'.repeat(username.length - 3);
  return `${maskedUsername}@${domain}`;
}

export const FeedbackCard = React.memo(({ data: d }: FeedbackCardProps) => {
  const [showIdentity, setShowIdentity] = useState(false);

  return (
    <div className="bg-white border border-line-soft rounded-[16px] p-5 transition-all hover:-translate-y-1 hover:shadow-google shadow-sm flex flex-col h-full group animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm" style={{ backgroundColor: getColor(d.nama_lengkap) }}>
          {getInitials(d.nama_lengkap)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm text-ink truncate flex items-center gap-2">
            <span>{showIdentity ? (d.nama_lengkap || 'Anonim') : maskName(d.nama_lengkap)}</span>
            <button 
              onClick={() => setShowIdentity(!showIdentity)}
              className="text-ink-4 hover:text-google-blue transition-colors p-1 -ml-1 rounded-full"
              title={showIdentity ? "Sembunyikan Identitas" : "Tampilkan Identitas"}
            >
              {showIdentity ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
          <div className="text-[10px] text-ink-3 truncate">{showIdentity ? (d.email || '-') : maskEmail(d.email)}</div>
        </div>
        
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${+d.rating >= 9 ? 'bg-google-green text-white' : +d.rating >= 7 ? 'bg-google-blue text-white' : 'bg-google-yellow text-ink'}`}>
          ★ {d.rating}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        {d.materi && (
          <div>
            <div className="text-[0.65rem] font-extrabold text-ink-4 uppercase tracking-wider mb-1">Materi</div>
            <div className="text-sm text-ink-2 font-medium">{d.materi}</div>
          </div>
        )}

        <div>
          <div className="text-[0.65rem] font-extrabold text-ink-4 uppercase tracking-wider mb-1">Tanggapan Materi</div>
          <div className="text-sm text-ink-2 leading-relaxed">{d.alasan || '-'}</div>
        </div>

        <div>
          <div className="text-[0.65rem] font-extrabold text-ink-4 uppercase tracking-wider mb-1">Pesan untuk Pemateri</div>
          <div className="text-sm text-ink-2 leading-relaxed">{d.pesan_kesan || '-'}</div>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-line-soft flex items-center justify-between text-[10px] text-ink-4 font-bold">
        <div>{new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        <div className="px-2 py-0.5 bg-google-blue-soft text-google-blue rounded-md">{d.source || 'Umum'}</div>
      </div>
    </div>
  );
});
