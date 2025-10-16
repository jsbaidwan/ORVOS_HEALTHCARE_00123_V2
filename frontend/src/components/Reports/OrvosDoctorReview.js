import React from 'react';
import { useReport } from '../../context/ReportContext';

const OrvosDoctorReview = () => {
  const { getDoctorReviewReport } = useReport();
  const reviews = getDoctorReviewReport();

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Orvos Doctor Review Report</h2>
      <p className="text-gray-600 mb-6">Patient cases pending doctor review</p>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {review.patient.firstName} {review.patient.lastName}
                </h3>
                <p className="text-sm text-gray-500">{review.patient.clinic}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                Pending Review
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500">EHR#</p>
                <p className="text-sm font-medium text-gray-900">{review.patient.ehr}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Medical Condition</p>
                <p className="text-sm font-medium text-gray-900">{review.patient.medicalCondition}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Images Submitted</p>
                <p className="text-sm font-medium text-gray-900">{review.imageCount} images</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Submission Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(review.patient.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="btn-primary text-sm px-4 py-2">
                Review Case
              </button>
              <button className="btn-secondary text-sm px-4 py-2">
                View Details
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No cases pending review</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrvosDoctorReview;


