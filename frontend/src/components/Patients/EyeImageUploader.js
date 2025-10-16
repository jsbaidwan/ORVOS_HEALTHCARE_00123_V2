import React, { useState } from 'react';

const EyeImageUploader = ({ label, name, onChange, required = false, eyeType = 'left' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      // Create preview URLs
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
      
      // Call onChange with files
      onChange({ target: { name, files: validFiles } });
    }
  };

  const removePreview = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const eyeColor = eyeType === 'left' ? 'blue' : 'green';

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? `border-${eyeColor}-500 bg-${eyeColor}-50`
            : `border-gray-300 hover:border-${eyeColor}-400 bg-gray-50`
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={name}
          name={name}
          onChange={handleChange}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          required={required && previews.length === 0}
        />
        
        <label htmlFor={name} className="cursor-pointer">
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full bg-${eyeColor}-100 flex items-center justify-center mb-3`}>
              <svg
                className={`w-10 h-10 text-${eyeColor}-600`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {eyeType === 'left' ? 'Left' : 'Right'} Eye Images
            </p>
            <p className="text-xs text-gray-500">
              Drag & Drop or Click to Upload
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, JPEG, PNG, WEBP • Max 5MB each
            </p>
          </div>
        </label>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`${eyeType} eye ${index + 1}`}
                className={`w-full h-32 object-cover rounded-lg border-2 border-${eyeColor}-200`}
              />
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className={`absolute bottom-2 left-2 bg-${eyeColor}-600 text-white text-xs px-2 py-1 rounded`}>
                {eyeType === 'left' ? 'L' : 'R'} {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        {previews.length} image(s) selected • Multiple files allowed
      </p>
    </div>
  );
};

export default EyeImageUploader;


