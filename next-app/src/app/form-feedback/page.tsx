"use client";

import { useEffect, useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function FormFeedbackPage() {
  const [materis, setMateris] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    rating: "",
    materi: "",
    alasan: "",
    pesanKesan: ""
  });

  useEffect(() => {
    fetch("/api/materi")
      .then(r => r.json())
      .then(j => setMateris(j.data || []))
      .catch(console.error);
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim feedback");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="bg-white border-2 border-line rounded-[24px] p-10 max-w-lg w-full text-center shadow-google">
          <div className="w-20 h-20 bg-google-green-soft text-google-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-[2rem] font-extrabold text-ink mb-4">Terima Kasih!</h2>
          <p className="text-ink-2 text-lg">Feedback Anda sangat berarti bagi kami untuk terus berkembang.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6 py-12">
      <div className="bg-white border-2 border-line rounded-[24px] p-8 md:p-12 max-w-2xl w-full shadow-google">
        <div className="text-center mb-10">
          <h2 className="text-[2rem] font-extrabold text-ink tracking-tight mb-2">Berikan Feedback Anda</h2>
          <p className="text-ink-3">Bantu kami meningkatkan kualitas Muhammad Haerul's Portfolio.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="namaLengkap" className="text-sm font-extrabold uppercase tracking-widest text-ink-3">Nama Lengkap</label>
            <input type="text" id="namaLengkap" required value={formData.namaLengkap} onChange={handleChange} className="px-5 py-3.5 border-2 border-line rounded-xl outline-none focus:border-google-blue transition-colors text-ink font-medium" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-extrabold uppercase tracking-widest text-ink-3">Alamat Email</label>
            <input type="email" id="email" required value={formData.email} onChange={handleChange} className="px-5 py-3.5 border-2 border-line rounded-xl outline-none focus:border-google-blue transition-colors text-ink font-medium" />
          </div>

          {materis.length > 0 && (
            <div className="flex flex-col gap-2">
              <label htmlFor="materi" className="text-sm font-extrabold uppercase tracking-widest text-ink-3">Materi yang Diulas</label>
              <select id="materi" required value={formData.materi} onChange={handleChange} className="px-5 py-3.5 border-2 border-line rounded-xl outline-none focus:border-google-blue transition-colors text-ink font-medium bg-white">
                <option value="" disabled>Pilih materi...</option>
                {materis.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label className="text-sm font-extrabold uppercase tracking-widest text-ink-3">Rating (1-10)</label>
            <div className="flex gap-2 justify-between">
              {[...Array(10)].map((_, i) => (
                <label key={i+1} className="flex-1 cursor-pointer">
                  <input type="radio" name="rating" id="rating" value={i+1} required onChange={handleChange} className="peer sr-only" />
                  <div className="text-center py-2 border-2 border-line rounded-lg font-bold text-ink-3 peer-checked:border-google-blue peer-checked:bg-google-blue-soft peer-checked:text-google-blue-dark transition-all">
                    {i+1}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="alasan" className="text-sm font-extrabold uppercase tracking-widest text-ink-3">Alasan Rating</label>
            <textarea id="alasan" rows={3} required value={formData.alasan} onChange={handleChange} className="px-5 py-3.5 border-2 border-line rounded-xl outline-none focus:border-google-blue transition-colors text-ink font-medium resize-none"></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pesanKesan" className="text-sm font-extrabold uppercase tracking-widest text-ink-3">Pesan & Kesan</label>
            <textarea id="pesanKesan" rows={3} required value={formData.pesanKesan} onChange={handleChange} className="px-5 py-3.5 border-2 border-line rounded-xl outline-none focus:border-google-blue transition-colors text-ink font-medium resize-none"></textarea>
          </div>

          <button type="submit" className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg text-white bg-google-blue hover:bg-google-blue-dark transition-colors shadow-google">
            <Send className="w-5 h-5" />
            Kirim Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
