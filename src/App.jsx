import React, { useState, useEffect } from 'react';
import { 
  Wand2, BookOpen, Search, Copy, Download, Trash2, 
  Languages, FileText, CheckCircle, AlertCircle, 
  Menu, X, Send, Sparkles, Quote, History, 
  FileSearch, PenTool, Lightbulb, MessageSquare, 
  Type, AlignLeft, Layers, ShieldCheck, RefreshCw
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY; 

const PlusIcon = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MinusIcon = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const App = () => {
  const [inputText, setInputText] = useState('');
  const [activeTool, setActiveTool] = useState('paraphrase');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [writingScore, setWritingScore] = useState(0);

  const tools = [
    { id: 'paraphrase', name: 'Paraphrase', icon: <Wand2 size={18}/>, prompt: 'Parafrasekan teks akademik ini agar lebih elegan namun tetap mempertahankan esensi penelitiannya:' },
    { id: 'grammar', name: 'Grammar Check', icon: <CheckCircle size={18}/>, prompt: 'Periksa tata bahasa dan ejaan teks ini, berikan versi benarnya dan poin kesalahan:' },
    { id: 'formal', name: 'Ubah ke Formal', icon: <FileText size={18}/>, prompt: 'Ubah teks berikut menjadi bahasa jurnal internasional yang sangat formal:' },
    { id: 'title_gen', name: 'Generator Judul', icon: <Sparkles size={18}/>, prompt: 'Berikan 5 saran judul skripsi/tesis yang provokatif dan menarik berdasarkan draf ini:' },
    { id: 'abstract', name: 'Abstract Gen', icon: <FileSearch size={18}/>, prompt: 'Buatlah abstrak penelitian lengkap (IMRAD style) dari teks berikut:' },
    { id: 'summary', name: 'Ringkasan Jurnal', icon: <BookOpen size={18}/>, prompt: 'Ringkas teks ini menjadi 3 poin utama (key takeaways) untuk literatur review:' },
    { id: 'citation', name: 'Citation Maker', icon: <Quote size={18}/>, prompt: 'Buatlah format sitasi APA 7th Edition dari informasi sumber berikut:' },
    { id: 'background', name: 'Latar Belakang', icon: <PenTool size={18}/>, prompt: 'Kembangkan draf latar belakang masalah berdasarkan fenomena berikut:' },
    { id: 'plagiarism', name: 'Analisis Plagiasi', icon: <ShieldCheck size={18}/>, prompt: 'Analisis teks ini dan tandai bagian yang berisiko dianggap plagiat serta cara memperbaikinya:' },
    { id: 'qna', name: 'Diskusi Teori', icon: <MessageSquare size={18}/>, prompt: 'Jelaskan konsep teori utama yang relevan dengan teks penelitian ini:' },
    { id: 'tone', name: 'Tone Switcher', icon: <Languages size={18}/>, prompt: 'Ubah nada teks ini agar lebih objektif dan kurang emosional (standar akademik):' },
    { id: 'rewrite', name: 'Rewrite Kalimat', icon: <Type size={18}/>, prompt: 'Tulis ulang kalimat ini agar lebih singkat dan tidak bertele-tele (concise):' },
    { id: 'spellcheck', name: 'Cek Tipografi', icon: <CheckCircle size={18}/>, prompt: 'Temukan dan perbaiki semua typo (kesalahan ketik) dalam teks ini:' },
    { id: 'biblio', name: 'Daftar Pustaka', icon: <AlignLeft size={18}/>, prompt: 'Urutkan dan rapikan informasi berikut menjadi daftar pustaka yang sesuai abjad:' },
    { id: 'topic_idea', name: 'Ide Riset Baru', icon: <Lightbulb size={18}/>, prompt: 'Berikan 5 celah penelitian (research gap) yang bisa diteliti dari topik ini:' },
    { id: 'essay_gen', name: 'Essay Drafter', icon: <Layers size={18}/>, prompt: 'Buatlah kerangka essay akademik berdasarkan poin-poin diskusi berikut:' },
    { id: 'email_formal', name: 'Email Pembimbing', icon: <Send size={18}/>, prompt: 'Tulis email sangat sopan kepada dosen pembimbing untuk bimbingan skripsi mengenai:' },
    { id: 'autocomplete', name: 'Auto-Complete', icon: <PenTool size={18}/>, prompt: 'Lanjutkan paragraf ini dengan argumen logis yang didukung gaya bahasa ilmiah:' },
    { id: 'expand', name: 'Expand Argumen', icon: <PlusIcon size={18}/>, prompt: 'Perdalam argumen dalam teks ini dengan menambahkan penjelasan data yang logis:' },
    { id: 'shorten', name: 'Shorten/Fit', icon: <MinusIcon size={18}/>, prompt: 'Potong teks ini agar masuk dalam limit kata tanpa mengurangi informasi inti:' },
    { id: 'score', name: 'Evaluasi Dosen', icon: <History size={18}/>, prompt: 'Berikan evaluasi jujur ala dosen penguji untuk teks ini (skor 1-100) dan kritik sarannya:' },
    { id: 'highlight', name: 'Logika Cek', icon: <AlertCircle size={18}/>, prompt: 'Identifikasi kerancuan logika atau struktur berpikir dalam teks ini:' },
    { id: 'multilang', name: 'Translate Jurnal', icon: <Languages size={18}/>, prompt: 'Terjemahkan ke Bahasa Inggris dengan standar TOEFL/IELTS Writing Band 8.0:' },
    { id: 'history_context', name: 'Konteks Literatur', icon: <History size={18}/>, prompt: 'Sebutkan tokoh atau peneliti terkenal yang berkaitan dengan topik ini:' }
  ];

  useEffect(() => {
    const words = inputText.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWritingScore(inputText.length > 0 ? Math.min(100, Math.floor(words / 1.5) + 30) : 0);
  }, [inputText]);

  const callGemini = async (prompt, text) => {
  setErrorMessage('');
  setIsLoading(true);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // GRATIS
        messages: [
          {
            role: "user",
            content: `${prompt}\n\n"${text}"`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Gagal request ke OpenRouter");
    }

    const result = data.choices?.[0]?.message?.content;

    if (result) {
      setInputText(result);
    } else {
      throw new Error("AI tidak memberikan respon");
    }

  } catch (err) {
    console.error(err);
    setErrorMessage(err.message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shrink-0"><Sparkles size={20} /></div>
            <h1 className="font-bold text-xl text-indigo-900 whitespace-nowrap">WriteWise AI</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Academic Toolkits</p>
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTool === tool.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span className={activeTool === tool.id ? 'text-indigo-600' : 'text-slate-400'}>{tool.icon}</span>
              <span className="text-sm font-semibold whitespace-nowrap">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg"><Menu size={20} /></button>}
            <h2 className="font-semibold text-slate-700 capitalize">Workspace / <span className="text-indigo-600">{activeTool.replace('_', ' ')}</span></h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigator.clipboard.writeText(inputText)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors" title="Copy"><Copy size={18}/></button>
            <button onClick={() => setInputText('')} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Clear"><Trash2 size={18}/></button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden">
          <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col relative overflow-hidden shadow-inner">
            
            {errorMessage && (
              <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 z-40">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-800">Terjadi Masalah</p>
                  <p className="text-xs text-red-600 leading-tight">{errorMessage}</p>
                </div>
                <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-600"><X size={16}/></button>
              </div>
            )}

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tuliskan draf artikel, skripsi, atau ide penelitian Anda di sini..."
              className="flex-1 p-8 bg-transparent focus:outline-none resize-none text-lg text-slate-800 leading-relaxed placeholder:text-slate-300"
            />
            
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 transition-all">
                <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4 shadow-sm"></div>
                <p className="text-indigo-900 font-bold">WriteWise AI sedang memproses...</p>
                <p className="text-slate-400 text-xs mt-1">Ini mungkin memakan waktu beberapa detik</p>
              </div>
            )}

            <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-4">
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {inputText.length} Karakter
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} Kata
                </div>
              </div>
              
              <button
                onClick={() => callGemini(tools.find(t => t.id === activeTool).prompt, inputText)}
                disabled={isLoading || !inputText.trim()}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Wand2 size={18} />}
                <span>{isLoading ? 'MEMPROSES...' : 'PROSES SEKARANG'}</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* History Panel (Desktop Only) */}
      <div className="hidden xl:flex w-64 border-l border-slate-200 bg-white flex-col">
        <div className="p-6 border-b border-slate-100 font-bold text-slate-800 flex items-center gap-2 uppercase text-[11px] tracking-widest">
          <History size={16} className="text-indigo-600"/> Riwayat Sesi
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center p-4">
              <History size={32} className="mb-2 opacity-20" />
              <p className="text-[10px] font-medium">Belum ada aktivitas</p>
            </div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl text-[11px] border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div className="flex justify-between font-bold text-indigo-600 mb-1">
                  <span className="truncate">{h.tool}</span>
                  <span className="text-[9px] text-slate-400 font-normal">{h.timestamp}</span>
                </div>
                <p className="text-slate-500 italic line-clamp-2">"{h.text}"</p>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-indigo-900 m-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mb-3">Academic Score</p>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-3xl font-black leading-none">{writingScore}</span>
            <span className="text-xs font-bold text-indigo-400">/100</span>
          </div>
          <div className="w-full bg-indigo-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-400 h-full transition-all duration-700" style={{width: `${writingScore}%`}}></div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.8s linear infinite; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default App;