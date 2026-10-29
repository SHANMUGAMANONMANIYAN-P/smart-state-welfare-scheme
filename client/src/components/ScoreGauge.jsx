import React from 'react';
import { CheckCircle2, HelpCircle, XCircle, AlertTriangle } from 'lucide-react';

export function ScoreGauge({ score, category, mandatorySatisfied }) {
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
  let scoreColor = 'text-slate-700';
  let barColor = 'bg-slate-500';
  let Icon = HelpCircle;

  if (category === 'Potentially Eligible') {
    badgeColor = 'bg-teal-50 text-teal-800 border-teal-300';
    scoreColor = 'text-teal-700';
    barColor = 'bg-teal-600';
    Icon = CheckCircle2;
  } else if (category === 'Needs More Information') {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
    scoreColor = 'text-amber-700';
    barColor = 'bg-amber-500';
    Icon = HelpCircle;
  } else if (category === 'Unlikely to Qualify') {
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
    scoreColor = 'text-rose-700';
    barColor = 'bg-rose-500';
    Icon = XCircle;
  }

  return (
    <div className="flex flex-col items-end">
      {/* Category Status Badge */}
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor} shadow-xs mb-1.5`}
      >
        <Icon className="w-3.5 h-3.5 mr-1" />
        {category}
      </span>

      {/* Numerical Matching Score */}
      <div className="flex items-baseline space-x-1">
        <span className="text-[11px] text-slate-500 font-medium">Match:</span>
        <span className={`text-lg font-bold ${scoreColor}`}>
          {score !== undefined && score !== null ? `${score}%` : 'N/A'}
        </span>
      </div>

      {/* Progress Mini-Bar */}
      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden border border-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(Math.max(score || 0, 0), 100)}%` }}
        />
      </div>

      {!mandatorySatisfied && category !== 'Needs More Information' && (
        <span className="text-[10px] text-rose-600 font-medium mt-1 flex items-center">
          <AlertTriangle className="w-3 h-3 mr-0.5 inline" />
          Mandatory criteria unmet
        </span>
      )}
    </div>
  );
}

export default ScoreGauge;
