import React from 'react';

const StatsCard = ({ title, value, icon, color, textColor, bgColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 hover:shadow-soft transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={textColor}>{icon}</div>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatsCard;


