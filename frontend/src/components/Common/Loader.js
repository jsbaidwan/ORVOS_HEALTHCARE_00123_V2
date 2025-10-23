import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const Loader = ({ size = 50, isLoading = true }) => {
  const color = '#009efb';

  if (!isLoading) return null; // Don't render anything if not loading

  return (
    <div className="fixed inset-0 bg-gray-700/50 backdrop-blur-[6px] flex items-center justify-center z-50">
      <div
        className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md text-center"
        style={{ color }}
      >
        <ClipLoader size={size} color={color} />
        <p className="mt-4 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
