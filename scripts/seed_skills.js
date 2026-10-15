const fs = require('fs');
const prisma = require('../src/config/db');

async function seedSkillsFromIndex() {
  const html = fs.readFileSync('public/index.html', 'utf8');

  // We define the 9 canonical skill domains exactly matching the website
  const domains = [
    {
      category: 'Programming',
      category_slug: 'programming',
      accent_color: 'var(--blue)',
      icon_svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      sort_order: 1,
      items: [
        { name: 'Python', tags: 'AsyncIO · OOP · Performance · Type Hinting' },
        { name: 'JavaScript & TypeScript', tags: 'Modern ES6+ · Static Typing · Node Ecosystem' },
        { name: 'SQL & Bash Scripting', tags: 'Complex Queries · CLI Automation · Shell' }
      ],
      tech_stack: [
        { name: 'Python', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M11.927 2C6.738 2 7.062 4.254 7.062 4.254l.006 2.34h4.945v.7H5.087S2 7.034 2 12.222c0 5.19 2.695 5.02 2.695 5.02h1.61v-2.285s-.087-2.695 2.64-2.695h4.53s2.553.04 2.553-2.553V4.553S16.42 2 11.927 2zm-2.42 1.48a.9.9 0 110 1.8.9.9 0 010-1.8z" fill="#387EB8"/><path d="M12.073 22c5.189 0 4.865-2.254 4.865-2.254l-.006-2.34h-4.945v-.7h6.926S22 16.966 22 11.778c0-5.19-2.695-5.02-2.695-5.02h-1.61v2.285s.087 2.695-2.64 2.695h-4.53s-2.553-.04-2.553 2.553v5.151S7.58 22 12.073 22zm2.42-1.48a.9.9 0 110-1.8.9.9 0 010-1.8z" fill="#FFE052"/></svg>' },
        { name: 'JavaScript', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F7DF1E"/><path d="M6 18.5l1.8-1.1c.4.7.8 1.3 1.6 1.3.8 0 1.3-.3 1.3-1.1v-5.2h2.2v5.3c0 2-1.2 2.9-3.2 2.9-1.8 0-2.9-.9-3.7-2.1zm8.3-.1l1.8-1c.5.8 1.1 1.4 2.1 1.4.9 0 1.5-.4 1.5-1 0-.7-.5-1-1.6-1.5l-.6-.3c-1.7-.7-2.8-1.6-2.8-3.5 0-1.7 1.3-3.1 3.4-3.1 1.5 0 2.6.5 3.3 1.8l-1.7 1.1c-.4-.7-.8-1-1.6-1-.8 0-1.3.4-1.3.9 0 .6.4.9 1.4 1.3l.6.3c2 1 3.1 1.8 3.1 3.7 0 2.1-1.6 3.3-3.7 3.3-2.1 0-3.3-1.1-3.9-2.4z" fill="#000"/></svg>' },
        { name: 'TypeScript', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#3178C6"/><path d="M12.5 12h-3v7.5H7.5V12h-3V10h8v2zm2.7 7.5v-1.7c.6.4 1.3.6 2 .6 1 0 1.6-.4 1.6-1.1 0-.7-.5-1-1.6-1.4l-.8-.3c-1.8-.7-2.7-1.7-2.7-3.3 0-2 1.5-3.3 3.7-3.3 1 0 1.9.3 2.7.8l-.6 1.7c-.6-.4-1.3-.6-2.1-.6-.9 0-1.5.4-1.5 1.1 0 .6.4.9 1.4 1.3l.7.3c2 .7 3 1.7 3 3.4 0 2.2-1.6 3.4-3.9 3.4-1.1 0-2.1-.3-2.9-.9z" fill="#FFF"/></svg>' },
        { name: 'SQL', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="2"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>' },
        { name: 'C++', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#00599C"/><path d="M7 14.5l5 3 5-3v-5l-5-3-5 3v5z" stroke="#FFF" stroke-width="1.8"/><path d="M14 10.5h2.5M15.25 9.25v2.5M17.5 10.5H20M18.75 9.25v2.5" stroke="#659AD2" stroke-width="1.5"/></svg>' },
        { name: 'Bash / Shell', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#293138"/><path d="M7 8l4 4-4 4M13 16h4" stroke="#4EAA25" stroke-width="2" stroke-linecap="round"/></svg>' }
      ]
    },
    {
      category: 'Data Analytics and Engineering',
      category_slug: 'data-analytics',
      accent_color: 'var(--green)',
      icon_svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 20V10M12 20V4M6 20v-6"></path></svg>',
      sort_order: 2,
      items: [
        { name: 'Feature Engineering & ETL', tags: 'Pandas · NumPy · Automated Data Pipelines' },
        { name: 'Data Warehousing & Big Data', tags: 'Google BigQuery · PySpark · Partitioning' },
        { name: 'Statistical Analysis & Insights', tags: 'EDA · Hypothesis Testing · A/B Evaluation' }
      ],
      tech_stack: [
        { name: 'Pandas', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#150458"/><path d="M7 7h3v10H7zm7 0h3v10h-3z" fill="#FFF"/><path d="M7 11h10v2H7z" fill="#E70488"/></svg>' },
        { name: 'NumPy', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#013243"/><path d="M6 7l6-3 6 3v10l-6 3-6-3V7z" stroke="#4DABCF" stroke-width="1.8"/><path d="M12 4v16M6 7l12 10M18 7L6 17" stroke="#4DABCF" stroke-width="1.2"/></svg>' },
        { name: 'Scikit-Learn', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-4h2v4zm-2-8h-2V7h2v2z" fill="#F89939"/><circle cx="7" cy="14" r="2.5" fill="#3498DB"/><circle cx="17" cy="11" r="2.5" fill="#E67E22"/></svg>' },
        { name: 'Google BigQuery', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#4285F4"/><path d="M7 12l3-3 4 4 3-3" stroke="#FFF" stroke-width="2" stroke-linecap="round"/><ellipse cx="12" cy="7" rx="5" ry="2" stroke="#FFF" stroke-width="1.5"/></svg>' },
        { name: 'PySpark', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#E25A1C"/><path d="M12 4l2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#FFF"/></svg>' },
        { name: 'Matplotlib / Seaborn', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#11557C"/><path d="M5 17l4-6 4 3 6-8" stroke="#FFF" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="11" r="2" fill="#E24A33"/><circle cx="13" cy="14" r="2" fill="#FBC15E"/></svg>' }
      ]
    },
    {
      category: 'Computer Vision',
      category_slug: 'computer-vision',
      accent_color: 'var(--red)',
      icon_svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
      sort_order: 3,
      items: [
        { name: 'Object Detection & Tracking', tags: 'YOLOv8 / YOLO11 · OpenCV · Real-Time Inference' },
        { name: 'OCR & Document AI', tags: 'LayoutLM · Tesseract · KYC/KYB Pipelines' },
        { name: 'Image Segmentation & Edge AI', tags: 'SAM · Mask R-CNN · ONNX & Raspberry Pi' }
      ],
      tech_stack: [
        { name: 'OpenCV', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4.5" stroke="#ED1C24" stroke-width="2.2"/><circle cx="7" cy="16" r="4.5" stroke="#22B14C" stroke-width="2.2"/><circle cx="17" cy="16" r="4.5" stroke="#00A2E8" stroke-width="2.2"/></svg>' },
        { name: 'YOLOv8 / YOLO11', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#2563EB"/><path d="M5 6h3l2 4 2-4h3l-3.5 6.5V18h-3v-5.5L5 6zm10 0h4v12h-4V6z" fill="#FFF"/></svg>' },
        { name: 'PyTorch', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13.5 2.5l-1 1 2.3 2.3A7.5 7.5 0 1019.5 12h-1.5a6 6 0 11-1.75-4.24l-2.75 2.74-1.5-1.5 3.25-3.25L13.5 2.5z" fill="#EE4C2C"/><circle cx="17.5" cy="4.5" r="1.5" fill="#EE4C2C"/></svg>' },
        { name: 'MediaPipe', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#00838F"/><path d="M6 12l6-6 6 6-6 6-6-6z" stroke="#FFF" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="#FFF"/></svg>' },
        { name: 'Roboflow', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#6706CE"/><path d="M7 9a3 3 0 016 0c0 2-3 3-3 5m0 3h.01" stroke="#FFF" stroke-width="2" stroke-linecap="round"/></svg>' },
        { name: 'Tesseract OCR', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#4285F4"/><path d="M5 7h14M12 7v11M8 18h8" stroke="#FFF" stroke-width="2" stroke-linecap="round"/></svg>' }
      ]
    },
    {
      category: 'Natural Language Processing',
      category_slug: 'nlp',
      accent_color: 'var(--yellow)',
      icon_svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 10h.01M12 10h.01M16 10h.01"></path></svg>',
      sort_order: 4,
      items: [
        { name: 'Transformer Architectures', tags: 'Hugging Face · BERT · RoBERTa · Fine-Tuning' },
        { name: 'Semantic Search & Embeddings', tags: 'Sentence-Transformers · Vector Similarity' },
        { name: 'Text Preprocessing & Local NLP', tags: 'spaCy · NLTK · Tokenization · Indonesian NLP' }
      ],
      tech_stack: [
        { name: 'Hugging Face', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFD21E"/><path d="M8 9.5c0 .8-.7 1.5-1.5 1.5S5 10.3 5 9.5 5.7 8 6.5 8 8 8.7 8 9.5zm11 0c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5zM8.5 14.5c.8 2 2.5 3 4.5 3s3.7-1 4.5-3" stroke="#202124" stroke-width="1.8" stroke-linecap="round"/></svg>' },
        { name: 'BERT & Transformers', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#FFB703"/><path d="M7 6h6a3 3 0 010 6H7V6zm0 6h7a3 3 0 010 6H7v-6z" fill="#023047"/></svg>' },
        { name: 'spaCy', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#09A3D5"/><circle cx="12" cy="12" r="5" stroke="#FFF" stroke-width="2"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3" stroke="#FFF" stroke-width="1.8"/></svg>' },
        { name: 'NLTK', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#3D5A80"/><path d="M6 18V6l6 8 6-8v12" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
        { name: 'Sentence-Transformers', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#457B9D"/><circle cx="8" cy="12" r="2.5" fill="#A8DADC"/><circle cx="16" cy="12" r="2.5" fill="#A8DADC"/><path d="M10.5 12h3" stroke="#FFF" stroke-width="2"/></svg>' },
        { name: 'Tokenizers & RegEx', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#E63946"/><path d="M7 9h10M7 12h7M7 15h4" stroke="#FFF" stroke-width="2" stroke-linecap="round"/></svg>' }
      ]
    },
    {
      category: 'Generative AI',
      category_slug: 'generative-ai',
      accent_color: 'var(--blue)',
      icon_svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"></path></svg>',
      sort_order: 5,
      items: [
        { name: 'LLM Integration & Orchestration', tags: 'Google Gemini · OpenAI GPT-4o · Claude 3.5' },
        { name: 'Prompt Engineering & Evaluation', tags: 'Few-Shot · Chain-of-Thought · Guardrails' },
        { name: 'Multimodal & Local LLMs', tags: 'Ollama · vLLM · Vision Models · GGUF' }
      ],
      tech_stack: [
        { name: 'Google Gemini', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="url(#gemini-grad-p)"/><defs><linearGradient id="gemini-grad-p" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#4285F4"/><stop offset="0.5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs></svg>' },
        { name: 'OpenAI GPT-4o', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.28 9.37a5.99 5.99 0 00-.51-4.88 6.09 6.09 0 00-6.47-2.88A6.05 6.05 0 0011 3.23a6.04 6.04 0 00-4.32 1.93 6.03 6.03 0 00-1.8 4.7 6.02 6.02 0 00-3.66 2.66 6.07 6.07 0 00.5 6.82 6 6 0 00.52 4.88 6.09 6.09 0 006.47 2.88 6.05 6.05 0 004.31-1.62 6.04 6.04 0 004.32-1.93 6.03 6.03 0 001.8-4.7 6.02 6.02 0 003.66-2.66 6.07 6.07 0 00-.5-6.82zM12 14.5a2.5 2.5 0 112.5-2.5 2.5 2.5 0 01-2.5 2.5z"/></svg>' },
        { name: 'Anthropic Claude', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#D97706"/><circle cx="12" cy="12" r="5" fill="#FFF"/><circle cx="12" cy="12" r="2.5" fill="#D97706"/></svg>' },
        { name: 'Ollama', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#1E293B"/><circle cx="12" cy="12" r="6" stroke="#FFF" stroke-width="2"/><circle cx="10" cy="11" r="1.5" fill="#FFF"/><circle cx="14" cy="11" r="1.5" fill="#FFF"/></svg>' },
        { name: 'Prompt Engineering', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" fill="#FBBC04"/></svg>' },
        { name: 'vLLM', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#4F46E5"/><path d="M13 3L6 14h6l-1 7 7-11h-6l1-7z" fill="#FFF"/></svg>' }
      ]
    },
    {
      category: 'AI Agents',
      category_slug: 'ai-agents',
      accent_color: 'var(--green)',
      icon_svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4M8 16h.01M16 16h.01"></path></svg>',
      sort_order: 6,
      items: [
        { name: 'Autonomous Workflows', tags: 'LangChain · LangGraph · CrewAI Multi-Agents' },
        { name: 'Tool & Function Calling', tags: 'Dynamic API Calling · Structured JSON Outputs' },
        { name: 'Workflow Automation', tags: 'Flowise · n8n Pipelines · Event Triggers' }
      ],
      tech_stack: [
        { name: 'LangChain', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#1C3C3C"/><path d="M7 12a3 3 0 116 0 3 3 0 01-6 0zm8-2h2a3 3 0 010 6h-2M9 14H7a3 3 0 010-6h2" stroke="#22C55E" stroke-width="2" stroke-linecap="round"/></svg>' },
        { name: 'LangGraph', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#065F46"/><circle cx="8" cy="8" r="2.5" fill="#34D399"/><circle cx="16" cy="16" r="2.5" fill="#34D399"/><circle cx="16" cy="8" r="2" fill="#FFF"/><path d="M8 8l8 8M8 8h8" stroke="#34D399" stroke-width="1.6"/></svg>' },
        { name: 'CrewAI', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#BE123C"/><circle cx="12" cy="9" r="3" fill="#FFF"/><path d="M6 18c0-3 3-4 6-4s6 1 6 4" stroke="#FFF" stroke-width="2"/></svg>' },
        { name: 'Flowise', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#4F46E5"/><path d="M6 8h5v8H6zm7 0h5v4h-5zm0 6h5v2h-5z" fill="#FFF"/><path d="M11 10h2M11 14h2" stroke="#FFF" stroke-width="1.5"/></svg>' },
        { name: 'n8n', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#EA4B71"/><circle cx="7" cy="12" r="2.5" fill="#FFF"/><circle cx="17" cy="12" r="2.5" fill="#FFF"/><circle cx="12" cy="7" r="2" fill="#FFF"/><circle cx="12" cy="17" r="2" fill="#FFF"/><path d="M7 12h10M12 7v10" stroke="#FFF" stroke-width="1.5"/></svg>' },
        { name: 'Agentic RAG', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#047857"/><circle cx="12" cy="12" r="4" stroke="#A7F3D0" stroke-width="2"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke="#A7F3D0" stroke-width="1.8"/></svg>' }
      ]
    },
    {
      category: 'Software Development',
      category_slug: 'software-dev',
      accent_color: 'var(--red)',
      icon_svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
      sort_order: 7,
      items: [
        { name: 'High-Performance APIs', tags: 'FastAPI · Pydantic · Node.js / Express' },
        { name: 'Interactive AI Frontends', tags: 'Streamlit · React · Modern Vanilla JS' },
        { name: 'Architecture & Systems', tags: 'MVC · WebSockets · Resilient Error Handlers' }
      ],
      tech_stack: [
        { name: 'FastAPI', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10.5" fill="#059669"/><path d="M12.5 4L7 13.5h4.5l-1 6.5 6.5-10H12.5V4z" fill="#FFF"/></svg>' },
        { name: 'Node.js', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l8.5 5v10L12 22l-8.5-5V7L12 2z" fill="#339933"/><path d="M12 6.5L7 9.5v5l5 3 5-3v-5l-5-3z" fill="#FFF"/></svg>' },
        { name: 'Flask', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 3h6M10 3v5L5 19a2 2 0 002 2h10a2 2 0 002-2l-5-11V3M8 14h8"/></svg>' },
        { name: 'Streamlit', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FF4B4B"><path d="M12 4L3 18h18L12 4zm0 4.5l5.5 8.5h-11L12 8.5z"/></svg>' },
        { name: 'React', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#20232A"/><circle cx="12" cy="12" r="2.5" fill="#61DAFB"/><ellipse cx="12" cy="12" rx="7" ry="2.8" stroke="#61DAFB" stroke-width="1.2" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="7" ry="2.8" stroke="#61DAFB" stroke-width="1.2" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="7" ry="2.8" stroke="#61DAFB" stroke-width="1.2" transform="rotate(150 12 12)"/></svg>' },
        { name: 'REST & WebSockets', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#1E293B"/><path d="M7 9h10M7 15h10M12 5v14" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/></svg>' }
      ]
    },
    {
      category: 'Database Management',
      category_slug: 'database',
      accent_color: 'var(--yellow)',
      icon_svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
      sort_order: 8,
      items: [
        { name: 'Relational Databases', tags: 'PostgreSQL · MySQL · Prisma ORM' },
        { name: 'Vector Databases for RAG', tags: 'Pinecone · ChromaDB · Qdrant · Dense Indices' },
        { name: 'NoSQL & Graph Databases', tags: 'MongoDB & Atlas · Neo4j Knowledge Graphs · Redis' }
      ],
      tech_stack: [
        { name: 'PostgreSQL', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3C7 3 5 6 5 10c0 4.5 2 7 4 8.5V21h3v-2.2c1.2.2 2.5.2 3.8 0V21h3v-2.5c2-1.5 4-4 4-8.5 0-4-2-7-7-7h-3.8z" fill="#336791"/><circle cx="9" cy="9" r="1.5" fill="#FFF"/><circle cx="15" cy="9" r="1.5" fill="#FFF"/></svg>' },
        { name: 'MongoDB', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 6.5 7.5 6.5 13.5C6.5 17.5 9 20.8 12 22C15 20.8 17.5 17.5 17.5 13.5C17.5 7.5 12 2 12 2Z" fill="#47A248"/><path d="M12 2V22C12.3 21.8 12.6 21.6 12.8 21.4C15.4 19.8 17.5 16.9 17.5 13.5C17.5 7.5 12 2 12 2Z" fill="#3FA037"/></svg>' },
        { name: 'Prisma ORM', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#10B981"><path d="M12 2l3.5 6h-7L12 2zm-4 7l4 7-4 3-3.5-6 3.5-4zm8 0l3.5 4-3.5 6-4-3 4-7z"/></svg>' },
        { name: 'ChromaDB', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#EA580C"/><circle cx="12" cy="12" r="5" stroke="#FFF" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="#FFF"/></svg>' },
        { name: 'Pinecone', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#0284C7"/><path d="M12 4l3 5h-6l3-5zm-3 6l3 5 3-5h-6z" fill="#FFF"/></svg>' },
        { name: 'Redis', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#DC2626"/><path d="M6 10l6-3 6 3-6 3-6-3zm0 4l6 3 6-3" stroke="#FFF" stroke-width="1.8" stroke-linecap="round"/></svg>' }
      ]
    },
    {
      category: 'Development and Operations',
      category_slug: 'devops',
      accent_color: 'var(--blue)',
      icon_svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><polyline points="12 13 14 15 17 11"></polyline></svg>',
      sort_order: 9,
      items: [
        { name: 'Containerization & Edge', tags: 'Docker · Multi-Stage Builds · Raspberry Pi' },
        { name: 'Cloud Infrastructure', tags: 'Google Cloud Platform · Cloud Run · Vertex AI' },
        { name: 'CI/CD & Version Control', tags: 'GitHub Actions · Automated Testing · Git' }
      ],
      tech_stack: [
        { name: 'Docker', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#2496ED"/><path d="M6 13h2v2H6zm3 0h2v2H9zm3 0h2v2h-2zm3 0h2v2h-2zm-6-3h2v2H9zm3 0h2v2h-2zm3 0h2v2h-2z" fill="#FFF"/><path d="M4 15c1 3 4 4 8 4s7-1 8-4" stroke="#FFF" stroke-width="1.8" stroke-linecap="round"/></svg>' },
        { name: 'Google Cloud Platform', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#4285F4"/><path d="M7 14a4 4 0 013.9-3.1 4.5 4.5 0 018.6 1.1A3.5 3.5 0 0118.5 19H7a3 3 0 010-6z" fill="#FFF"/></svg>' },
        { name: 'GitHub Actions', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#2088FF"/><circle cx="8" cy="8" r="2.5" fill="#FFF"/><circle cx="16" cy="16" r="2.5" fill="#FFF"/><circle cx="8" cy="16" r="2.5" fill="#FFF"/><path d="M8 8v8M8 12h8" stroke="#FFF" stroke-width="1.8"/></svg>' },
        { name: 'Git', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#F05032"/><circle cx="9" cy="9" r="2" fill="#FFF"/><circle cx="15" cy="15" r="2" fill="#FFF"/><circle cx="9" cy="15" r="2" fill="#FFF"/><path d="M9 9l6 6M9 9v6" stroke="#FFF" stroke-width="1.8"/></svg>' },
        { name: 'Linux / Ubuntu', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#E95420"/><circle cx="12" cy="12" r="5" stroke="#FFF" stroke-width="2"/><circle cx="12" cy="7" r="1.5" fill="#FFF"/><circle cx="7.7" cy="14.5" r="1.5" fill="#FFF"/><circle cx="16.3" cy="14.5" r="1.5" fill="#FFF"/></svg>' },
        { name: 'Raspberry Pi', icon_svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#C51A4A"/><circle cx="10" cy="11" r="2.5" fill="#FFF"/><circle cx="14" cy="11" r="2.5" fill="#FFF"/><circle cx="8" cy="14" r="2" fill="#FFF"/><circle cx="16" cy="14" r="2" fill="#FFF"/><circle cx="12" cy="16" r="2.2" fill="#FFF"/></svg>' }
      ]
    }
  ];

  console.log('Seeding skills domains into database...');
  for (const d of domains) {
    await prisma.skill.create({
      data: {
        category: d.category,
        category_slug: d.category_slug,
        accent_color: d.accent_color,
        icon_svg: d.icon_svg,
        items: d.items,
        tech_stack: d.tech_stack,
        sort_order: d.sort_order
      }
    });
  }

  const count = await prisma.skill.count();
  console.log(`Successfully seeded ${count} skill domains!`);
}

seedSkillsFromIndex().catch(console.error).finally(() => process.exit());
