import React from 'react';
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const StatsCard = ({
  title,
  value,
  icon,
  textColor,
  bgColor,
  description,
  link,
}) => {
  const Card = (
    <div
      className={`group bg-white rounded-xl border border-gray-200 p-5 h-full transition-all duration-300
      ${link ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-blue-300" : "shadow-sm"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          {description && (
            <p className="text-xs sm:text-xs font-semibold uppercase tracking-wide text-gray-500">
              {description}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          <div className={textColor}>{icon}</div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-sm text-gray-500 font-medium">
          {title}
        </h3>

        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
          {value}
        </p>
      </div>

      {/* Footer */}
      {link && (
        <div className="mt-6 flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
          View Details
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  );

  return link ? (
    <a href={link} className="block h-full">
      {Card}
    </a>
  ) : (
    Card
  );
};

export default StatsCard;


