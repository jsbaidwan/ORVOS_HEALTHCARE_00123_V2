import React, { useState, useEffect, useRef } from 'react';
import useBlobUrl from '../../hooks/useBlobUrl';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { PhotoIcon } from '@heroicons/react/24/outline';
//import { createRoot } from "react-dom/client";

const PreviewImage = ({ preview, index, eyeType, removePreview, eyeColor, hasRemoveButton = true }) => {

  const [fileloading, setFileLoading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const fileRef = useRef(preview);
  const { blobUrl } = useBlobUrl(preview);
  const imgSrc = blobUrl || preview;

  useEffect(() => {
    if (fileRef.current === preview) {
      fileloading === true ? setFileLoading(true) : setFileLoading(false);
    }

  }, [preview, fileloading]);

  return (
    <>
      <div className={`relative group overflow-hidden rounded-lg border-2 border-${eyeColor}-200`}>
        {/* Dark overlay on hover */}
        <div className="absolute  inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200 z-10 pointer-events-none"></div>

        {fileloading ? (
          <PhotoIcon className="w-8 h-8 border border-gray-200 rounded p-1 object-cover bg-gray-100" />
        ) : (
          <>
            {!blobUrl ? (
              <PhotoIcon className="w-full h-32 border border-gray-200 rounded p-1 object-cover bg-gray-100" />
            ) : (

              <img
                src={imgSrc}
                alt=""
                className="w-full h-32 object-cover bg-gray-200"

              />
            )}
          </>
        )}

        {/* View Icon */}


        <button
          type="button"
          onClick={() => setIsViewerOpen(true)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-full p-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-lg hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>


        {hasRemoveButton && (
          <>
            {/* Remove Icon */}
            <button
              type="button"
              onClick={() => removePreview(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-md hover:bg-red-600 hover:scale-110"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}

        <div className={`absolute bottom-2 left-2 bg-${eyeColor}-600 text-white text-xs px-2 py-1 rounded z-20 shadow-sm pointer-events-none`}>
          {eyeType === 'left' ? 'L' : 'R'} {index + 1}
        </div>
      </div>

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setIsViewerOpen(false)} // ✅ close on outside click
        >
          <div
            className="w-[80vw]  max-w-[800px] p-[0.2rem] bg-white rounded-lg border border-gray-200 shadow-lg relative overflow-visible"
            onClick={(e) => e.stopPropagation()} // ✅ prevent close inside
          >

            {/* ✅ Close button inside container */}
            <button
              onClick={() => setIsViewerOpen(false)}
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
              aria-label="Close"
            >
              ✕
            </button>

            <InnerImageZoom
              src={imgSrc}
              zoomSrc={imgSrc}
              zoomType="hover"
              zoomScale={1.0}
              hasSpacer={false}
              className="rounded w-full h-auto"

            />
          </div>
        </div>
      )}
    </>
  );
};

const EyeImageUploader = ({ label, name, required = false, eyeType = 'left', setValue, getValues, existingImages = [], onRemoveExisting }) => {
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

      const prevFiles = getValues(name) || [];
      setValue(name, [...prevFiles, ...validFiles], { shouldValidate: true });
    }
  };

  const removePreview = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);

    const prevFiles = getValues(name) || [];
    setValue(name, prevFiles.filter((_, i) => i !== index), { shouldValidate: true });
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
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive
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
          required={required && previews.length === 0 && (!existingImages || existingImages.length === 0)}
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

      {/* Existing Images (from server) */}
      {existingImages && existingImages.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Existing Images</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {existingImages.map((img, index) => (
              <PreviewImage
                key={`existing-${index}`}
                preview={img.src ? img.src : img}
                index={index}
                eyeType={eyeType}
                removePreview={() => onRemoveExisting && onRemoveExisting(img)}
                eyeColor={eyeColor}
                hasRemoveButton={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Newly Uploaded Image Previews */}
      {previews.length > 0 && (
        <div className="mt-4">
          {existingImages && existingImages.length > 0 && (
            <p className="text-xs font-medium text-gray-500 mb-2">New Uploads</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <PreviewImage
                key={index}
                preview={preview}
                index={index}
                eyeType={eyeType}
                removePreview={removePreview}
                eyeColor={eyeColor}
                hasRemoveButton={true}
              />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        {previews.length} new image(s) selected{existingImages && existingImages.length > 0 ? ` • ${existingImages.length} existing` : ''} • Multiple files allowed
      </p>
    </div>
  );
};

export default EyeImageUploader;


