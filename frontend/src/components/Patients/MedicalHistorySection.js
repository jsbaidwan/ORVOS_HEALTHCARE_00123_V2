import React from 'react';

const MedicalHistorySection = ({ selectedHistory = [], onChange, medicalHistoryOptions = [] }) => {

  const handleCheckboxChange = (option) => {
    const optionId = option.id;
    const updatedHistory = selectedHistory.includes(optionId)
      ? selectedHistory.filter(item => item !== optionId)
      : [...selectedHistory, optionId];

    onChange(updatedHistory);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Medical History
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {medicalHistoryOptions?.map((option, index) => (
          <div key={option.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <input
              type="checkbox"
              id={`history-${option.id || index}`}
              checked={selectedHistory.includes(option.id)}
              onChange={() => handleCheckboxChange(option)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor={`history-${option.id || index}`} className="ml-3 text-sm text-gray-700 cursor-pointer flex-1">
              {option.name}
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {selectedHistory.length} condition(s) selected
      </p>
    </div>
  );
};

export default MedicalHistorySection;
