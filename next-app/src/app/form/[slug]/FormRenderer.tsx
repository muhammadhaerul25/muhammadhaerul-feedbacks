"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, RefreshCw, Star, ArrowRight } from "lucide-react";

export default function FormRenderer({ form, config }: { form: any, config: any }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress and submission state from localStorage on mount
  useEffect(() => {
    try {
      const submitted = localStorage.getItem(`form_submitted_${form.id}`);
      if (submitted === 'true') {
        setIsSubmitted(true);
      } else {
        const savedProgress = localStorage.getItem(`form_progress_${form.id}`);
        if (savedProgress) {
          setAnswers(JSON.parse(savedProgress));
        }
      }
    } catch (e) {}
    setIsLoaded(true);
  }, [form.id]);

  // Save progress whenever answers change
  useEffect(() => {
    if (isLoaded && !isSubmitted) {
      try {
        if (Object.keys(answers).length > 0) {
          localStorage.setItem(`form_progress_${form.id}`, JSON.stringify(answers));
        }
      } catch (e) {}
    }
  }, [answers, isLoaded, isSubmitted, form.id]);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-google-blue" /></div>;
  }

  if (!form.isActive) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-line-soft p-12">
          <div className="w-20 h-20 bg-line-soft/30 rounded-full flex items-center justify-center mx-auto mb-6 text-ink-3">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-3 tracking-tight">Formulir Ditutup</h1>
          <p className="text-ink-3 text-lg">Mohon maaf, formulir ini sudah tidak menerima tanggapan lagi.</p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    localStorage.removeItem(`form_progress_${form.id}`);
    localStorage.removeItem(`form_submitted_${form.id}`);
    setAnswers({});
    setIsSubmitted(false);
    setError("");
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-line-soft p-12 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-google-green-soft/20 rounded-full flex items-center justify-center mx-auto mb-8 text-google-green">
            <Check className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink mb-4 tracking-tight">Terima Kasih!</h1>
          <p className="text-ink-3 text-lg leading-relaxed mb-10">
            {config.successMessage || 'Tanggapan Anda telah berhasil dikirim dan direkam ke sistem.'}
          </p>
          <button 
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-line-soft hover:border-google-blue text-ink font-bold rounded-xl transition-all hover:shadow-sm"
          >
            Isi Form Lagi <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          answers: answers
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim tanggapan');
      
      // Mark as submitted in localStorage
      try {
        localStorage.setItem(`form_submitted_${form.id}`, 'true');
        localStorage.removeItem(`form_progress_${form.id}`);
      } catch (e) {}

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-32 animate-in fade-in duration-500">
        
        <div className="bg-white rounded-[12px] shadow-sm border border-line-soft overflow-hidden">
          {/* Google-like colored top border */}
          <div className="h-2 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]"></div>
          
          {/* Form Header */}
          <div className="p-8 sm:p-10 text-center border-b border-line-soft/50">
            <h1 className="text-2xl font-bold text-ink mb-3">{form.name}</h1>
            {form.description && (
              <p className="text-sm text-ink-3 whitespace-pre-wrap">{form.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-10 flex flex-col gap-8">
            {config.sections?.map((section: any, sIdx: number) => {
              const showSectionHeader = config.sections.length > 1 && (section.title || section.description);

              return (
                <div key={section.id} className="flex flex-col gap-8">
                  
                  {/* Section Header */}
                  {showSectionHeader && (
                    <div className="mb-2">
                      {section.title && <h2 className="text-xl font-bold text-ink mb-1">{section.title}</h2>}
                      {section.description && <p className="text-sm text-ink-3">{section.description}</p>}
                    </div>
                  )}

                {/* Questions in Section */}
                {section.questions?.map((q: any) => (
                  <div key={q.id} className="flex flex-col relative group">
                    <label className="block text-sm font-bold text-ink mb-1">
                      {q.questionText} {q.required && <span className="text-google-red">*</span>}
                    </label>
                    {q.helpText && <p className="text-xs text-ink-3 mb-3">{q.helpText}</p>}
                    {!q.helpText && <div className="mb-3"></div>}

                    {/* Render input based on type */}
                    {q.type === 'Short Answer' && (
                      <input
                        type="text"
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full bg-white rounded-lg px-4 py-2.5 border border-line-soft focus:border-google-blue focus:ring-1 focus:ring-google-blue text-ink text-sm outline-none transition-all placeholder:text-ink-4"
                      />
                    )}

                    {q.type === 'Paragraph' && (
                      <textarea
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Tuliskan alasan Anda..."
                        rows={4}
                        className="w-full bg-white rounded-lg px-4 py-3 border border-line-soft focus:border-google-blue focus:ring-1 focus:ring-google-blue text-ink text-sm outline-none transition-all placeholder:text-ink-4 resize-y"
                      />
                    )}

                    {q.type === 'Multiple Choice' && (
                      <div className="flex flex-col gap-2.5">
                        {q.options?.map((opt: any) => (
                          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group/opt w-fit">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${answers[q.id] === opt.text ? 'border-google-blue' : 'border-line-soft group-hover/opt:border-google-blue/50'}`}>
                              {answers[q.id] === opt.text && <div className="w-2 h-2 rounded-full bg-google-blue animate-in zoom-in duration-200" />}
                            </div>
                            <span className="text-ink text-sm">{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === 'Checkboxes' && (
                      <div className="flex flex-col gap-2.5">
                        {q.options?.map((opt: any) => {
                          const isChecked = (answers[q.id] || []).includes(opt.text);
                          const handleCheck = () => {
                            const current = answers[q.id] || [];
                            if (isChecked) {
                              handleAnswerChange(q.id, current.filter((v: string) => v !== opt.text));
                            } else {
                              handleAnswerChange(q.id, [...current, opt.text]);
                            }
                          };
                          return (
                            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group/opt w-fit">
                              <input type="checkbox" className="hidden" checked={isChecked} onChange={handleCheck} />
                              <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all ${isChecked ? 'border-google-blue bg-google-blue text-white' : 'border-line-soft group-hover/opt:border-google-blue/50 bg-white'}`}>
                                {isChecked && <Check className="w-3 h-3 animate-in zoom-in duration-200" />}
                              </div>
                              <span className="text-ink text-sm">{opt.text}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'Dropdown' && (
                      <select
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full bg-white rounded-lg px-4 py-2.5 border border-line-soft focus:border-google-blue focus:ring-1 focus:ring-google-blue text-ink text-sm outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Pilih salah satu</option>
                        {q.options?.map((opt: any) => (
                          <option key={opt.id} value={opt.text}>{opt.text}</option>
                        ))}
                      </select>
                    )}

                    {q.type === 'Rating Scale' && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {Array.from({ length: q.ratingMax || 5 }).map((_, i) => {
                            const val = i + 1;
                            const isSelected = answers[q.id] === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleAnswerChange(q.id, val)}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded border font-medium text-sm transition-all flex items-center justify-center ${isSelected ? 'border-google-blue bg-google-blue-soft/10 text-google-blue shadow-sm' : 'border-line-soft text-ink-3 hover:border-google-blue/50 hover:text-google-blue bg-white'}`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
            </div>
          );
        })}

        {error && (
          <div className="bg-red-50 text-google-red p-4 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

          <div className="flex justify-start mt-4 pt-6 border-t border-line-soft">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-google-blue hover:bg-google-blue-dark text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
