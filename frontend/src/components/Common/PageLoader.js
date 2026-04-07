import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const PageLoader = ({ loading, title = "Loading..." }) => {
    if (!loading) return null;

    return (

        <>
            <div className="bg-white/90 border border-gray-200  rounded-b-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 min-w-[240px]">

                {/* Spinner with soft background */}
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50">
                    <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
                </div>

                {/* Title */}
                <p className="text-gray-800 font-semibold text-sm tracking-wide">
                    {title}
                </p>

                {/* Subtle progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-[loadingBar_1.5s_infinite] rounded-full"></div>
                </div>

            </div>

            {/* Custom animation */}
            <style>
                {`
          @keyframes loadingBar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}
            </style>
        </>

    );
};

export default PageLoader;