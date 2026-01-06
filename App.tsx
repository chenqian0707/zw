
import React, { useState, useRef } from 'react';
import { AppStatus, ChartAnalysis, DecadeCycle, YearlyCycle } from './types';
import { analyzeChartImage } from './geminiService';
import LoadingScreen from './components/LoadingScreen';
import PalaceCard from './components/PalaceCard';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [analysis, setAnalysis] = useState<ChartAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setStatus(AppStatus.ANALYZING);
    setError(null);
    try {
      const result = await analyzeChartImage(base64);
      setAnalysis(result);
      setStatus(AppStatus.RESULT);
    } catch (err: any) {
      setError(err.message || "解析失败");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setAnalysis(null);
    setPreviewUrl(null);
    setError(null);
  };

  const downloadReport = () => {
    if (!analysis) return;

    let report = `紫微斗数命盘解读报告\n`;
    report += `================================\n\n`;
    report += `【个人基本信息】\n`;
    report += `生日：${analysis.personalInfo?.birthDate || '未知'}\n`;
    report += `性别：${analysis.personalInfo?.gender || '未知'}\n`;
    report += `命主：${analysis.personalInfo?.mingZhu || '未知'}\n`;
    report += `身主：${analysis.personalInfo?.shenZhu || '未知'}\n\n`;

    report += `【命盘总述】\n`;
    report += `${analysis.summary}\n\n`;

    report += `【十年大运解读】\n`;
    (analysis.decadeCycles || []).forEach(d => {
      report += `周期：${d.period}（${d.palaceName}）\n`;
      report += `概论：${d.summary}\n\n`;
    });

    report += `【流年运势解读】\n`;
    (analysis.yearlyCycles || []).forEach(y => {
      report += `年份：${y.year}\n`;
      report += `解析：${y.summary}\n`;
      report += `要点：${y.keyPoints.join('、')}\n\n`;
    });

    report += `【专业建议】\n`;
    report += `1. 事业格局：${analysis.careerAdvice}\n`;
    report += `2. 财帛分析：${analysis.wealthAdvice}\n`;
    report += `3. 婚姻感情：${analysis.relationshipAdvice}\n\n`;

    report += `【十二宫详解】\n`;
    (analysis.palaces || []).forEach(p => {
      report += `--- ${p.name} ---\n`;
      report += `主要星曜：${(p.mainStars || []).join('、')}\n`;
      report += `解析：${p.interpretation}\n\n`;
    });

    report += `\n报告生成时间：${new Date().toLocaleString()}\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `紫微解读报告_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {status === AppStatus.ANALYZING && <LoadingScreen />}

      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-lg">
          紫微斗数命盘解读
        </h1>
        <p className="text-indigo-200 text-lg md:text-xl font-light opacity-80 italic">
          "天垂象，见吉凶" —— AI 视觉深度解析
        </p>
      </header>

      {status === AppStatus.IDLE || status === AppStatus.ERROR ? (
        <div className="flex flex-col items-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md aspect-[4/3] glass border-2 border-dashed border-amber-500/30 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/60 transition-all group"
          >
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-cloud-arrow-up text-4xl text-amber-500"></i>
            </div>
            <p className="text-xl font-medium text-amber-200 mb-2">上传命盘截图</p>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>
          {error && <p className="mt-8 text-red-400 text-sm">{error}</p>}
        </div>
      ) : status === AppStatus.RESULT && analysis ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          {/* Top Summary */}
          <section className="glass rounded-3xl overflow-hidden border border-amber-500/30">
            <div className="bg-gradient-to-r from-amber-600/20 to-indigo-900/20 p-8 flex flex-col md:flex-row items-center gap-8 border-b border-amber-500/10">
              <div className="shrink-0 w-32 h-32 rounded-2xl overflow-hidden border-2 border-amber-500/40">
                <img src={previewUrl || ''} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-4 mb-4">
                   <Badge label="生日" value={analysis.personalInfo?.birthDate} />
                   <Badge label="性别" value={analysis.personalInfo?.gender} />
                   <Badge label="命主" value={analysis.personalInfo?.mingZhu} />
                   <Badge label="身主" value={analysis.personalInfo?.shenZhu} />
                </div>
                <h2 className="text-2xl font-bold text-amber-100 serif mb-3">命盘总述</h2>
                <p className="text-indigo-100 leading-relaxed opacity-90">{analysis.summary}</p>
              </div>
            </div>
          </section>

          {/* Decade Cycles (Da Yun) */}
          <section>
            <SectionHeader title="十年大运解读" icon="fa-hourglass-half" color="amber" />
            <div className="space-y-4">
              {(analysis.decadeCycles || []).map((d, i) => (
                <div key={i} className="glass p-6 rounded-2xl border border-amber-500/10 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-200 rounded-full text-sm font-bold">{d.period}</span>
                    <span className="text-amber-400/60 text-sm italic">{d.palaceName}</span>
                  </div>
                  <p className="text-indigo-100 opacity-90 leading-relaxed">{d.summary}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Yearly Cycles (Liu Nian) */}
          <section>
            <SectionHeader title="流年运势展望" icon="fa-calendar-check" color="indigo" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(analysis.yearlyCycles || []).map((y, i) => (
                <div key={i} className="glass p-6 rounded-2xl border border-indigo-500/20">
                  <h4 className="text-xl font-bold text-indigo-300 mb-3 serif">{y.year}</h4>
                  <p className="text-sm text-indigo-100/80 mb-4 line-clamp-3">{y.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {y.keyPoints.map((kp, j) => (
                      <span key={j} className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">
                        # {kp}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Advice Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdviceBox title="事业" content={analysis.careerAdvice} icon="fa-briefcase" color="blue" />
            <AdviceBox title="财富" content={analysis.wealthAdvice} icon="fa-coins" color="yellow" />
            <AdviceBox title="感情" content={analysis.relationshipAdvice} icon="fa-heart" color="pink" />
          </section>

          {/* Palace Details */}
          <section>
            <SectionHeader title="十二宫详解" icon="fa-chess-board" color="amber" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(analysis.palaces || []).map((p, i) => <PalaceCard key={i} data={p} />)}
            </div>
          </section>

          {/* Actions */}
          <footer className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-20">
            <button onClick={downloadReport} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg flex items-center justify-center gap-3">
              <i className="fa-solid fa-download"></i> 下载解读报告
            </button>
            <button onClick={reset} className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold shadow-lg flex items-center justify-center gap-3">
              <i className="fa-solid fa-rotate-left"></i> 重新开始
            </button>
          </footer>
        </div>
      ) : null}
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; icon: string; color: string }> = ({ title, icon, color }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-500/20`}>
      <i className={`fa-solid ${icon} text-${color}-400`}></i>
    </div>
    <h2 className={`text-2xl font-bold text-${color}-400 serif`}>{title}</h2>
    <div className={`h-px flex-1 bg-gradient-to-r from-${color}-500/30 to-transparent`}></div>
  </div>
);

const Badge: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
    <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">{label}</span>
    <span className="text-xs text-amber-100">{value || '--'}</span>
  </div>
);

const AdviceBox: React.FC<{ title: string; content: string; icon: string; color: string }> = ({ title, content, icon, color }) => {
  const themes: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-100",
    yellow: "border-amber-500/30 bg-amber-500/5 text-amber-100",
    pink: "border-rose-500/30 bg-rose-500/5 text-rose-100",
  };
  return (
    <div className={`p-6 rounded-2xl border ${themes[color]} relative group transition-all hover:scale-[1.02]`}>
      <i className={`fa-solid ${icon} absolute top-6 right-6 text-xl opacity-20`}></i>
      <h3 className="text-lg font-bold mb-3 serif">{title}</h3>
      <p className="text-sm leading-relaxed opacity-90">{content}</p>
    </div>
  );
};

export default App;
