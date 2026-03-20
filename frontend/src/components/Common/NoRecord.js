import React from "react";
import { useNavigate } from "react-router-dom";

const NoRecord = ({ message = "No record found" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      
      <h2 className="text-2xl font-semibold text-gray-800">
        {message}
      </h2>

      <p className="mt-2 text-gray-500">
        We couldn’t find any data to display.
      </p>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white btn-primary rounded-md shadow-sm"
        >
          Go Back
        </button>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Go Home
        </button>
      </div>

    </div>
  );
};

export default NoRecord;