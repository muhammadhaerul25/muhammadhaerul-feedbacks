import React from 'react';

interface FeedbackStatsProps {
  n: number;
  avg: number;
  ratingCounts: Record<number, number>;
  modeRating: string | number;
  modeCount: number;
  evalCount: number;
  cukupCount: number;
  puasCount: number;
  sangatCount: number;
  materiFilter: string;
}

export const FeedbackStats = React.memo(({ 
  n, avg, ratingCounts, modeRating, modeCount, 
  evalCount, cukupCount, puasCount, sangatCount, materiFilter 
}: FeedbackStatsProps) => {
  const avgFixed = parseFloat(avg.toFixed(1));
  const avgAngle = (avgFixed / 10) * Math.PI;

  const getAvgLabel = (val: number) => {
    if (val >= 9) return 'Excellent';
    if (val >= 7) return 'Good';
    if (val >= 5) return 'Fair';
    return 'Needs Evaluation';
  };

  const getSangatPuasPct = () => {
    if (!n) return 0;
    return Math.round((sangatCount / n) * 100);
  };

  return (
    <div className="flex flex-col gap-5 mb-8">
      {/* 1. Top Banner */}
      <div className="bg-white border border-line-soft rounded-[20px] p-5 md:p-6 flex flex-col md:flex-row items-center gap-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-google-green"></div>
        
        {/* Circle avg */}
        <div className="relative w-20 h-20 rounded-full flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#22C55E" strokeWidth="8" strokeDasharray={282.7} strokeDashoffset={282.7 * (1 - avgFixed/10)} strokeLinecap="round" />
          </svg>
          <div className="flex flex-col items-center">
            <div className="text-xl font-black text-ink leading-none">{avgFixed}</div>
          </div>
        </div>

        {/* Text Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="text-lg font-black text-ink">Highly Satisfactory 🎉</div>
        </div>

        {/* Right Info */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right hidden sm:flex">
          <div className="text-[10px] font-semibold text-ink-4 mb-1">Updated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div className="text-4xl font-black text-ink leading-none mb-1">{n}</div>
          <div className="text-[10px] font-semibold text-ink-4">total respondents</div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-line-soft rounded-[16px] p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-4 mb-2">Respondents</div>
          <div className="text-3xl font-black text-ink mb-1">{n}</div>
          <div className="text-[10px] font-medium text-ink-3">participants gave feedback</div>
          <div className="absolute top-4 right-4 w-10 h-10 bg-google-blue-soft/50 rounded-full flex items-center justify-center text-google-blue text-lg group-hover:scale-110 transition-transform">👥</div>
        </div>
        
        <div className="bg-white border border-line-soft rounded-[16px] p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-4 mb-2">Average Rating</div>
          <div className="text-3xl font-black text-ink mb-1 flex items-baseline gap-1">{avgFixed}<span className="text-sm font-bold text-ink-4">/10</span></div>
          <div><span className="px-2 py-0.5 bg-google-green-soft text-google-green-dark text-[10px] font-bold rounded-md">{getAvgLabel(avgFixed)}</span></div>
          <div className="absolute top-4 right-4 w-10 h-10 bg-google-green-soft/50 rounded-full flex items-center justify-center text-google-green text-lg group-hover:scale-110 transition-transform">⭐</div>
        </div>

        <div className="bg-white border border-line-soft rounded-[16px] p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-4 mb-2">Most Frequent Rating</div>
          <div className="text-3xl font-black text-ink mb-1">{modeRating}</div>
          <div className="text-[10px] font-medium text-ink-3">{modeCount} of {n} respondents</div>
          <div className="absolute top-4 right-4 w-10 h-10 bg-google-yellow-soft/50 rounded-full flex items-center justify-center text-google-yellow-dark text-lg group-hover:scale-110 transition-transform">🏆</div>
        </div>
      </div>

      {/* 3. Detailed Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Distribusi Rating */}
        <div className="bg-white border border-line-soft rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-extrabold text-ink flex items-center gap-2">📊 Rating Distribution</h3>
            <span className="text-[10px] font-bold text-ink-4">{n} responses</span>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(r => {
              const count = ratingCounts[r] || 0;
              const pct = n ? Math.round((count / n) * 100) : 0;
              return (
                <div key={r} className="flex items-center gap-3">
                  <div className="w-8 flex items-center gap-1 text-[10px] font-bold text-ink shrink-0">
                    <span className="text-google-yellow">★</span> {r}
                  </div>
                  <div className="flex-1 h-1.5 bg-line-soft rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-google-green rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="w-5 text-[10px] font-bold text-ink text-right shrink-0">{count}</div>
                  <div className="w-7 text-[10px] font-semibold text-ink-4 text-right shrink-0">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown Kepuasan */}
        <div className="bg-white border border-line-soft rounded-[20px] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-extrabold text-ink flex items-center gap-2">🔎 Satisfaction Breakdown</h3>
            <span className="text-[10px] font-bold text-ink-4">Average: {avgFixed}/10</span>
          </div>
          
          {/* Half Gauge */}
          <div className="flex-1 flex flex-col items-center justify-center mb-6">
            <div className="relative w-[140px] h-[80px] flex items-end justify-center">
              <svg viewBox="0 0 200 115" className="absolute top-0 left-0 w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#22C55E" />
                  </linearGradient>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#F1F5F9" strokeWidth="16" strokeLinecap="round" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${251.327 * (avgFixed/10)} 251.327`} />
                <circle cx={100 - 80 * Math.cos(avgAngle)} cy={100 - 80 * Math.sin(avgAngle)} r="7" fill="#0F172A" stroke="#FFFFFF" strokeWidth="3" className="shadow-sm" />
              </svg>
              <div className="flex flex-col items-center pb-0 z-10">
                <div className="text-2xl font-black leading-none text-ink tracking-tight">{avgFixed}</div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-4 mt-1">
                  {avgFixed >= 9 ? 'Highly Satisfied' : avgFixed >= 7 ? 'Satisfied' : avgFixed >= 5 ? 'Fair' : 'Needs Evaluation'}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Bracket Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-google-red-soft/30 rounded-lg p-2 flex flex-col items-center text-center justify-center border border-google-red-soft">
              <div className="text-base font-black text-google-red mb-0.5">{n ? Math.round(evalCount/n*100) : 0}%</div>
              <div className="text-[9px] font-bold text-google-red-dark leading-tight">😔 Needs Evaluation<br/><span className="text-[8px] font-medium opacity-80">Score 1-4</span></div>
            </div>
            <div className="bg-google-yellow-soft/30 rounded-lg p-2 flex flex-col items-center text-center justify-center border border-google-yellow/30">
              <div className="text-base font-black text-google-yellow-dark mb-0.5">{n ? Math.round(cukupCount/n*100) : 0}%</div>
              <div className="text-[9px] font-bold text-google-yellow-dark leading-tight">😐 Fairly Satisfied<br/><span className="text-[8px] font-medium opacity-80">Score 5-6</span></div>
            </div>
            <div className="bg-google-blue-soft/30 rounded-lg p-2 flex flex-col items-center text-center justify-center border border-google-blue-soft">
              <div className="text-base font-black text-google-blue-dark mb-0.5">{n ? Math.round(puasCount/n*100) : 0}%</div>
              <div className="text-[9px] font-bold text-google-blue-dark leading-tight">😊 Satisfied<br/><span className="text-[8px] font-medium opacity-80">Score 7-8</span></div>
            </div>
            <div className="bg-google-green-soft/30 rounded-lg p-2 flex flex-col items-center text-center justify-center border border-google-green-soft">
              <div className="text-base font-black text-google-green-dark mb-0.5">{n ? Math.round(sangatCount/n*100) : 0}%</div>
              <div className="text-[9px] font-bold text-google-green-dark leading-tight">🤩 Highly Satisfied<br/><span className="text-[8px] font-medium opacity-80">Score 9-10</span></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
});
