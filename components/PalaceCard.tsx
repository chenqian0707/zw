
import React from 'react';
import { PalaceData } from '../types';

interface PalaceCardProps {
  data: PalaceData;
}

const PalaceCard: React.FC<PalaceCardProps> = ({ data }) => {
  // Ensure we have arrays even if the API returns undefined for these fields
  const mainStars = data.mainStars || [];
  const minorStars = data.minorStars || [];

  return (
    <div className="glass rounded-xl p-5 border border-amber-500/20 hover:border-amber-500/50 transition-all group">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-amber-400 serif">{data.name}</h3>
        <div className="flex gap-2">
          {mainStars.map((star, i) => (
            <span key={i} className="px-2 py-0.5 bg-indigo-900/50 text-indigo-200 text-xs rounded border border-indigo-700/50">
              {star}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed mb-4">
        {data.interpretation}
      </p>
      <div className="flex flex-wrap gap-2">
        {minorStars.map((star, i) => (
          <span key={i} className="text-[10px] text-amber-200/60 uppercase">
            • {star}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PalaceCard;
