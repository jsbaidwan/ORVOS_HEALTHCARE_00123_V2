import React, { useRef, useState, useEffect } from "react";
import { DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import useBlobUrl from '../../hooks/useBlobUrl';

const BlobFileItem = ({ file, onRemove, index, onRemoveEnable = true }) => {

  const { blobUrl } = useBlobUrl(file?.src);
  const [fileloading, setFileLoading] = useState(false);
  const fileRef = useRef(file?.src);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file?.name || "");

  useEffect(() => {
    if (fileRef.current === file?.src) {
      fileloading === true ? setFileLoading(true) : setFileLoading(false);
    }
  }, [file?.src, fileloading]);

  return (
    <li className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">

      <div className="flex items-center gap-2 truncate max-w-[75%]">

        {isImage ? (
          <div className="w-8 h-8 rounded overflow-hidden   border   flex items-center justify-center">
            {fileloading ? (
              <PhotoIcon className="w-8 h-8 border border-gray-200 rounded p-1 bg-gray-100" />
            ) : (
              <>
                {!blobUrl ? (
                  <PhotoIcon className="w-8 h-8 border border-gray-200 rounded p-1 bg-gray-100" />
                ) : (
                  <img
                    src={blobUrl}
                    alt={file?.name}
                    className="w-full h-full object-cover"
                  />)}
              </>
            )}
          </div>
        ) : (
          <DocumentIcon className="w-8 h-8 border border-gray-200 rounded p-1 bg-gray-100" />
        )}

        <a
          href={blobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm truncate ${blobUrl
            ? "text-blue-600 underline text-sm truncate cursor-pointer"
            : "text-gray-400 cursor-not-allowed pointer-events-none"
            }`}
          title={file?.name}

        >
          {file?.name}
        </a>
      </div>

      {onRemoveEnable && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="ml-2 px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:bg-red-50 shrink-0"
        >
          Remove
        </button>
      )}
    </li>
  );
};

export default BlobFileItem;