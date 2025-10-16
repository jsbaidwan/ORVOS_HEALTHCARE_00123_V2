import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import Table from '../Common/Table';

const ArchiveClinics = () => {
  const navigate = useNavigate();
  const { getArchivedClinics, deleteClinic } = useClinic();

  const archivedClinics = getArchivedClinics();

  const columns = [
    {
      header: 'Company Name',
      accessor: 'companyName',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.companyName}</p>
          <p className="text-xs text-gray-500">{row.pocEmail}</p>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'phone',
      render: (row) => (
        <div>
          <p className="text-gray-900">{row.phone}</p>
          <p className="text-xs text-gray-500">{row.city}, {row.state}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: false,
      render: (row) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          Archived
        </span>
      ),
    },
    {
      header: 'Date of Initiation',
      accessor: 'dateOfInitiation',
      sortValue: (row) => new Date(row.dateOfInitiation).getTime(),
      render: (row) => new Date(row.dateOfInitiation).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this clinic?')) {
                deleteClinic(row.id);
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Archived Clinics</h1>
          <p className="text-gray-600 mt-1">View archived clinic records</p>
        </div>
        <button
          onClick={() => navigate('/clinics')}
          className="btn-secondary flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Clinics</span>
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={archivedClinics}
        emptyMessage="No archived clinics"
      />
    </div>
  );
};

export default ArchiveClinics;


