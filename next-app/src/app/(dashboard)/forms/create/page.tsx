"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, ChevronDown, Check, GripVertical, QrCode, X, RefreshCw, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";

// --- Types ---
interface Option {
  id: string;
  text: string;
}

type QuestionType = 'Short Answer' | 'Paragraph' | 'Multiple Choice' | 'Checkboxes' | 'Dropdown' | 'True / False' | 'Rating Scale';

interface QuestionState {
  id: string;
  type: QuestionType;
  isRequired: boolean;
  questionText: string;
  helpText: string;
  options: Option[];
  ratingMax?: number;
}

interface SectionState {
  id: string;
  title: string;
  description: string;
  questions: QuestionState[];
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  successMessage: string;
  isActive: boolean;
  sections: SectionState[];
  customDomain?: string;
}

const QUESTION_TYPES: QuestionType[] = [
  'Short Answer',
  'Paragraph',
  'Multiple Choice',
  'Checkboxes',
  'Dropdown',
  'True / False',
  'Rating Scale'
];

function FormBuilder() {
  // --- State ---
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('slug');
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [toast, setToast] = useState<{show: boolean, type: 'success' | 'error', title: string, message: string}>({show: false, type: 'success', title: '', message: ''});
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    name: "",
    slug: "",
    description: "",
    successMessage: "",
    isActive: true,
    customDomain: "",
    sections: [
      {
        id: "sec-1",
        title: "Section 1",
        description: "",
        questions: [
          {
            id: "q-1",
            type: "Multiple Choice",
            isRequired: false,
            questionText: "",
            helpText: "",
            options: [{ id: "opt-1", text: "" }],
            ratingMax: 5
          }
        ]
      }
    ]
  });

  // Fetch form data if in edit mode
  useEffect(() => {
    if (editSlug) {
      fetch(`/api/forms?slug=${editSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const f = data.data;
            const config = typeof f.config === 'string' ? JSON.parse(f.config) : (f.config || {});
            
            setFormState({
              name: f.name,
              slug: f.slug,
              description: f.description || "",
              isActive: f.is_active,
              successMessage: config.successMessage || "",
              customDomain: config.customDomain || "",
              sections: config.sections || []
            });
          }
        })
        .catch(console.error);
    }
  }, [editSlug]);

  // --- Helpers ---
  const updateForm = (key: keyof FormState, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const updateSection = (sId: string, key: keyof SectionState, value: any) => {
    setFormState(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sId ? { ...s, [key]: value } : s)
    }));
  };

  const addQuestion = (sId: string) => {
    setFormState(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sId) return s;
        return {
          ...s,
          questions: [
            ...s.questions,
            {
              id: `q-${Date.now()}`,
              type: 'Multiple Choice',
              isRequired: false,
              questionText: "",
              helpText: "",
              options: [{ id: `opt-${Date.now()}`, text: "" }],
              ratingMax: 5
            }
          ]
        };
      })
    }));
  };

  const removeQuestion = (sId: string, qId: string) => {
    setFormState(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sId) return s;
        return { ...s, questions: s.questions.filter(q => q.id !== qId) };
      })
    }));
  };

  const updateQuestion = (sId: string, qId: string, key: keyof QuestionState, value: any) => {
    setFormState(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sId) return s;
        return {
          ...s,
          questions: s.questions.map(q => q.id === qId ? { ...q, [key]: value } : q)
        };
      })
    }));
  };

  const addOption = (sId: string, qId: string) => {
    setFormState(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sId) return s;
        return {
          ...s,
          questions: s.questions.map(q => {
            if (q.id !== qId) return q;
            return {
              ...q,
              options: [...q.options, { id: `opt-${Date.now()}`, text: "" }]
            };
          })
        };
      })
    }));
  };

  const updateOption = (sId: string, qId: string, oId: string, text: string) => {
    setFormState(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sId) return s;
        return {
          ...s,
          questions: s.questions.map(q => {
            if (q.id !== qId) return q;
            return {
              ...q,
              options: q.options.map(o => o.id === oId ? { ...o, text } : o)
            };
          })
        };
      })
    }));
  };

  const removeOption = (sId: string, qId: string, oId: string) => {
    setFormState(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sId) return s;
        return {
          ...s,
          questions: s.questions.map(q => {
            if (q.id !== qId) return q;
            return {
              ...q,
              options: q.options.filter(o => o.id !== oId)
            };
          })
        };
      })
    }));
  };

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const saveForm = async () => {
    if (!formState.name || !formState.slug) {
      showToast("error", "Error", "Name and URL Form are required.");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          slug: formState.slug,
          description: formState.description,
          successMessage: formState.successMessage,
          isActive: formState.isActive,
          customDomain: formState.customDomain,
          sections: formState.sections
        })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save form');
      
      showToast("success", "Save Successful!", "Form data has been successfully saved to database.");
    } catch (err: any) {
      console.error(err);
      showToast("error", "Save Failed", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getDomain = () => {
    if (formState.customDomain) {
      let d = formState.customDomain.trim();
      if (d.endsWith('/')) d = d.slice(0, -1);
      if (!d.startsWith('http://') && !d.startsWith('https://')) {
        d = 'https://' + d;
      }
      return d;
    }
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };
  
  const baseDomain = getDomain();
  const displayDomain = baseDomain.replace(/^https?:\/\//, '');

  // --- Render ---
  return (
    <div className="bg-[#fcfdff] min-h-screen">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-line-soft">
        <div className="flex items-center gap-4">
          <Link href="/forms" className="flex items-center gap-2 text-ink-3 hover:text-ink font-bold text-sm transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
        
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black text-ink">Create Form</h1>
          <p className="text-[11px] font-medium text-ink-3">Configure form details, sections, and questions.</p>
        </div>

        <button 
          onClick={saveForm}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-google-blue hover:bg-google-blue-dark text-white text-sm font-bold rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Data'}
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-32 flex flex-col gap-8">
        
        {/* Informasi Formulir */}
        <div className="bg-white border border-line-soft rounded-[12px] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-line-soft">
            <h2 className="text-lg font-bold text-ink mb-1">Form Information</h2>
            <p className="text-xs text-ink-3">Configure form identity, access URL &amp; status.</p>
          </div>
          
          <div className="p-6 flex flex-col gap-5">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1">
                <label className="block text-sm font-bold text-ink mb-2">Form Name <span className="text-google-red">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., Learning Experience Survey"
                  value={formState.name}
                  onChange={e => updateForm('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-line-soft focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-ink mb-2">URL Form <span className="text-google-red">*</span></label>
                <div className="flex rounded-lg overflow-hidden border border-line-soft focus-within:border-google-blue focus-within:ring-1 focus-within:ring-google-blue transition-all bg-white shadow-sm">
                  <span className="px-4 py-2.5 bg-line-soft/30 border-r border-line-soft text-sm text-ink-3 font-medium flex items-center shrink-0">
                    /form/
                  </span>
                  <input 
                    type="text" 
                    placeholder="survei-belajar"
                    value={formState.slug}
                    onChange={e => updateForm('slug', e.target.value)}
                    className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent min-w-[50px]"
                  />
                  <button
                    onClick={() => setShowQRModal(true)}
                    disabled={!formState.slug}
                    className="flex items-center gap-2 px-4 py-2.5 border-l border-line-soft text-sm font-bold text-ink hover:text-google-blue hover:bg-google-blue-soft/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="hidden sm:inline">QR Code</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">Description</label>
              <textarea 
                placeholder="Explain the purpose of the form..."
                value={formState.description}
                onChange={e => updateForm('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-line-soft focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm outline-none resize-y"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1">
                <label className="block text-sm font-bold text-ink mb-2">Base Domain <span className="text-ink-3 font-normal text-xs ml-1">(Optional)</span></label>
                <input 
                  type="text" 
                  placeholder="https://yourdomain.com"
                  value={formState.customDomain || ''}
                  onChange={e => updateForm('customDomain', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-line-soft focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-ink mb-2">Post-Submission Message</label>
                <input 
                  type="text" 
                  placeholder="Thank you for your participation."
                  value={formState.successMessage}
                  onChange={e => updateForm('successMessage', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-line-soft focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm outline-none"
                />
              </div>
              <div className="w-full md:w-64">
                <label className="block text-sm font-bold text-ink mb-2">Form Status</label>
                <div className="flex items-center justify-between px-4 py-[9px] rounded-lg border border-line-soft bg-white">
                  <span className="text-sm font-bold text-ink">{formState.isActive ? 'Accessible via URL' : 'Closed'}</span>
                  <button 
                    onClick={() => updateForm('isActive', !formState.isActive)}
                    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${formState.isActive ? 'bg-google-blue' : 'bg-ink-4'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formState.isActive ? 'left-5' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections (Bagian) */}
        {formState.sections.map((section, sIdx) => (
          <div key={section.id} className="bg-white border border-line-soft rounded-[12px] shadow-sm overflow-hidden border-l-[6px] border-l-google-blue">
            
            {/* Section Header */}
            <div className="p-6 border-b border-line-soft bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md bg-google-blue text-white flex items-center justify-center font-black text-sm">
                  {sIdx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-ink">Section {sIdx + 1}</h3>
                  <p className="text-[10px] text-ink-3">This section is displayed as a single step.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-1/3">
                  <label className="block text-xs font-bold text-ink mb-1">Section Title <span className="text-google-red">*</span></label>
                  <input 
                    type="text" 
                    value={section.title}
                    onChange={e => updateSection(section.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-line-soft text-sm outline-none focus:border-google-blue"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-ink mb-1">Section Description</label>
                  <input 
                    type="text" 
                    placeholder="Enter section description here..."
                    value={section.description}
                    onChange={e => updateSection(section.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-line-soft text-sm outline-none focus:border-google-blue"
                  />
                </div>
              </div>
            </div>

            {/* Questions Container */}
            <div className="p-6 bg-line-soft/10 flex flex-col gap-6">
              {section.questions.map((q, qIdx) => (
                <div key={q.id} className="bg-white border border-line-soft rounded-xl p-5 shadow-sm relative">
                  
                  {/* Question Header & Type Selector */}
                  <div className="flex items-center justify-between mb-5 border-b border-line-soft pb-4">
                    <div>
                      <h4 className="font-bold text-ink">Question {qIdx + 1}</h4>
                      <label className="flex items-center gap-2 mt-1 cursor-pointer group">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${q.isRequired ? 'border-google-blue bg-google-blue' : 'border-ink-4'}`}>
                           {q.isRequired && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <span className="text-[10px] text-ink-3 group-hover:text-ink transition-colors font-medium">Required</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={q.isRequired}
                          onChange={e => updateQuestion(section.id, q.id, 'isRequired', e.target.checked)}
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Type Dropdown Simulation */}
                      <div className="relative group">
                        <button className="flex items-center justify-between gap-6 w-44 px-3 py-2 rounded-lg border border-line-soft hover:border-google-blue bg-white text-sm font-medium text-ink transition-colors">
                          {q.type}
                          <ChevronDown className="w-4 h-4 text-ink-4" />
                        </button>
                        {/* Dropdown Menu (Hover for simplicity in mockup) */}
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-line-soft rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                          {QUESTION_TYPES.map(qt => (
                            <button 
                              key={qt}
                              onClick={() => updateQuestion(section.id, q.id, 'type', qt)}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between
                                ${q.type === qt ? 'bg-google-blue-soft/20 text-google-blue' : 'text-ink-3 hover:bg-line-soft/30 hover:text-ink'}`}
                            >
                              {qt}
                              {q.type === qt && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => removeQuestion(section.id, q.id)}
                        className="w-9 h-9 rounded-lg bg-google-red-soft/30 text-google-red flex items-center justify-center hover:bg-google-red hover:text-white transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Inputs */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">Question <span className="text-google-red">*</span></label>
                      <input 
                        type="text" 
                        placeholder="Write your question..."
                        value={q.questionText}
                        onChange={e => updateQuestion(section.id, q.id, 'questionText', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-line-soft text-sm outline-none focus:border-google-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">Help Text</label>
                      <input 
                        type="text" 
                        placeholder="Question help text here..."
                        value={q.helpText}
                        onChange={e => updateQuestion(section.id, q.id, 'helpText', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-line-soft text-sm outline-none focus:border-google-blue"
                      />
                    </div>

                    {/* Conditional Options Builder */}
                    {(q.type === 'Multiple Choice' || q.type === 'Checkboxes' || q.type === 'Dropdown') && (
                      <div className="mt-2 border border-line-soft rounded-lg overflow-hidden">
                        <div className="bg-line-soft/20 px-4 py-2 border-b border-line-soft">
                          <h5 className="text-xs font-bold text-ink">Options</h5>
                          <p className="text-[10px] text-ink-3">Provide at least 2 options.</p>
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={opt.id} className="flex items-center gap-2 group">
                              <div className="w-5 flex justify-center text-ink-4">
                                {q.type === 'Multiple Choice' ? (
                                  <div className="w-3.5 h-3.5 rounded-full border-2 border-google-blue flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-google-blue"></div>
                                  </div>
                                ) : q.type === 'Checkboxes' ? (
                                  <div className="w-3.5 h-3.5 rounded-sm border-2 border-google-blue flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-sm bg-google-blue"></div>
                                  </div>
                                ) : (
                                  <span className="text-xs font-bold">{oIdx + 1}.</span>
                                )}
                              </div>
                              <input 
                                type="text"
                                placeholder={`Option text ${oIdx + 1}...`}
                                value={opt.text}
                                onChange={e => updateOption(section.id, q.id, opt.id, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-line-soft text-sm outline-none focus:border-google-blue"
                              />
                              <button 
                                onClick={() => removeOption(section.id, q.id, opt.id)}
                                className="w-8 h-8 shrink-0 rounded-lg bg-google-red-soft/30 text-google-red flex items-center justify-center hover:bg-google-red hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          
                          <button 
                            onClick={() => addOption(section.id, q.id)}
                            className="mt-2 text-xs font-bold text-google-blue hover:text-google-blue-dark self-start flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Short Answer Preview */}
                    {q.type === 'Short Answer' && (
                      <div className="mt-2 pt-2">
                        <input disabled type="text" placeholder="Short answer text" className="w-full md:w-1/2 px-0 py-2 border-b border-line-soft border-dashed bg-transparent text-sm outline-none cursor-not-allowed text-ink-4" />
                      </div>
                    )}

                    {/* Paragraph Preview */}
                    {q.type === 'Paragraph' && (
                      <div className="mt-2 pt-2">
                        <textarea disabled placeholder="Long answer text" rows={3} className="w-full md:w-3/4 px-0 py-2 border-b border-line-soft border-dashed bg-transparent text-sm outline-none cursor-not-allowed text-ink-4 resize-none" />
                      </div>
                    )}

                    {/* True / False Preview */}
                    {q.type === 'True / False' && (
                      <div className="mt-2 pt-2 flex flex-col gap-3">
                        <div className="flex items-center gap-3 opacity-60">
                          <div className="w-4 h-4 rounded-full border-2 border-ink-4"></div>
                          <span className="text-sm font-medium text-ink-3">True</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-60">
                          <div className="w-4 h-4 rounded-full border-2 border-ink-4"></div>
                          <span className="text-sm font-medium text-ink-3">False</span>
                        </div>
                      </div>
                    )}

                    {/* Rating Scale Preview */}
                    {q.type === 'Rating Scale' && (
                      <div className="mt-2 border border-line-soft rounded-lg overflow-hidden">
                        <div className="bg-line-soft/20 px-4 py-2 border-b border-line-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h5 className="text-xs font-bold text-ink">Rating Scale Configuration</h5>
                            <p className="text-[10px] text-ink-3">Participants will rate on a scale from 1 to {q.ratingMax || 5}.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink-3">Maximum Score:</span>
                            <select 
                              value={q.ratingMax || 5}
                              onChange={(e) => updateQuestion(section.id, q.id, 'ratingMax', parseInt(e.target.value))}
                              className="px-2 py-1.5 text-xs font-bold text-ink border border-line-soft rounded-md bg-white outline-none focus:border-google-blue cursor-pointer"
                            >
                              <option value={3}>3</option>
                              <option value={4}>4</option>
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                            </select>
                          </div>
                        </div>
                        <div className="p-6 flex items-center justify-center gap-3 sm:gap-4 bg-white/50">
                          <span className="text-sm font-bold text-ink-4">1</span>
                          <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
                            {Array.from({ length: q.ratingMax || 5 }, (_, i) => i + 1).map(num => (
                              <div key={num} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-line-soft flex items-center justify-center text-sm font-bold text-ink-4">
                                {num}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm font-bold text-ink-4">{q.ratingMax || 5}</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))}

              <button 
                onClick={() => addQuestion(section.id)}
                className="w-full py-4 border-2 border-dashed border-line-soft rounded-xl text-ink-3 hover:text-google-blue hover:border-google-blue hover:bg-google-blue-soft/20 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add New Question
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-4">
          <button 
            onClick={() => {
              setFormState(prev => ({
                ...prev,
                sections: [
                  ...prev.sections,
                  {
                    id: `sec-${Date.now()}`,
                    title: `Section ${prev.sections.length + 1}`,
                    description: "",
                    questions: []
                  }
                ]
              }));
            }}
            className="px-6 py-3 bg-white border-2 border-line-soft rounded-full text-ink hover:border-google-blue hover:text-google-blue font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add New Section
          </button>
        </div>

      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-line-soft animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-line-soft flex items-center justify-between bg-white">
              <h3 className="font-bold text-ink flex items-center gap-2">
                <QrCode className="w-5 h-5 text-google-blue" />
                Form QR Code
              </h3>
              <button onClick={() => setShowQRModal(false)} className="text-ink-4 hover:text-google-red transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center bg-[#fcfdff]">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-line-soft mb-6">
                <QRCode value={`${baseDomain}/form/${formState.slug || 'preview'}`} size={180} />
              </div>
              <p className="text-sm font-bold text-ink text-center break-all">{displayDomain}/form/{formState.slug || 'preview'}</p>
              <p className="text-xs text-ink-3 text-center mt-2">Scan this QR code to access the form directly.</p>
              
              <button 
                onClick={() => {
                  setShowQRModal(false);
                  showToast("success", "Download Successful!", "QR Code image has been saved (simulation).");
                }}
                className="mt-6 w-full py-2.5 bg-google-blue hover:bg-google-blue-dark text-white text-sm font-bold rounded-lg transition-colors"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-line-soft rounded-xl p-4 shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300">
          {toast.type === 'success' ? (
            <div className="w-10 h-10 rounded-full bg-green-50 text-google-green flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-50 text-google-red flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-ink">{toast.title}</h4>
            <p className="text-xs text-ink-3">{toast.message}</p>
          </div>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-4 text-ink-4 hover:text-ink transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}

export default function CreateFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcfdff] text-ink-3">Loading...</div>}>
      <FormBuilder />
    </Suspense>
  );
}
