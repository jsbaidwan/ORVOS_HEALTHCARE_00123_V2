import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import useBlobUrl from '../../hooks/useBlobUrl';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { PhotoIcon } from '@heroicons/react/24/outline';

/**
 * EyeImageSlider
 * A reusable image carousel/slider (built on Swiper) for eye images.
 *
 * Props:
 * - label:       Section title shown above the slider (e.g. "Right Eye").
 * - images:      Array of image objects ({ src, name } or plain url string).
 * - eyeType:     'left' | 'right' | 'both' (controls badge + color).
 * - heightClass: Optional tailwind height for the slide (default h-56).
 * - emptyMessage: Text shown when there are no images.
 */

const SlideImage = ({ preview, eyeType, eyeColor, index, onView }) => {
  const { blobUrl } = useBlobUrl(preview);
  const badge = eyeType === 'left' ? 'L' : eyeType === 'right' ? 'R' : 'B';

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900/5">
      {!blobUrl ? (
        <PhotoIcon className="w-16 h-16 text-gray-300 animate-pulse" />
      ) : (
        <img
          src={blobUrl}
          alt={`${badge} ${index + 1}`}
          className="w-full h-full "
          onClick={() => onView(blobUrl)}
          style={{ cursor: 'zoom-in' }}
        />
      )}
      <div className={`absolute bottom-2 left-2 bg-${eyeColor}-600 text-white text-xs px-2 py-1 rounded z-10 shadow-sm pointer-events-none`}>
        {badge} {index + 1}
      </div>
    </div>
  );
};

const EyeImageSlider = ({
  label,
  images = [],
  eyeType = 'left',
  widthClass = 'w-full',
  heightClass = 'h-56',
  emptyMessage = 'No Images',
}) => {
  const [viewerSrc, setViewerSrc] = useState(null);

  const eyeColor =
    eyeType === 'left' ? 'blue' :
    eyeType === 'right' ? 'green' :
    eyeType === 'both' ? 'yellow' :
    'blue';
    
  const total = images.length;

  return (
    <div className="w-full">
      {label && (
        <div className="text-xs font-semibold text-gray-700 mb-2">{label}</div>
      )}

      {total === 0 ? (
        <div className={`${widthClass} ${heightClass} bg-gray-100 flex items-center justify-center text-sm text-gray-400 rounded border border-gray-200`}>
          {emptyMessage}
        </div>
      ) : (
        <div className={`eye-slider eye-slider-${eyeColor} relative ${widthClass} ${heightClass} rounded border border-gray-200 overflow-hidden shadow-sm bg-gray-50`}>
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            navigation={total > 1}
            pagination={total > 1 ? { clickable: true } : false}
            keyboard={{ enabled: true }}
            loop={total > 1}
            spaceBetween={0}
            slidesPerView={1}
            className="w-full h-full"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i} className="w-full h-full">
                <SlideImage
                  preview={img?.src || img}
                  index={i}
                  eyeType={eyeType}
                  eyeColor={eyeColor}
                  onView={setViewerSrc}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Fullscreen zoom viewer */}
      {viewerSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setViewerSrc(null)}
        >
          <div
            className="w-[80vw] max-w-[800px] p-[0.2rem] bg-white rounded-lg border border-gray-200 shadow-lg relative overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewerSrc(null)}
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
              aria-label="Close"
            >
              ✕
            </button>
            <InnerImageZoom
              src={viewerSrc}
              zoomSrc={viewerSrc}
              zoomType="hover"
              zoomScale={1.0}
              hasSpacer={false}
              className="rounded w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EyeImageSlider;
