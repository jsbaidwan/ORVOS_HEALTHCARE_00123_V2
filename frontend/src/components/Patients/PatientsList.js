import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import Table from '../Common/Table';
import Modal from '../Common/Modal';
import Breadcrumb from '../Common/Breadcrumb';
import { useRoutePath } from '../../hooks/useRoutePath';

const PatientsList = ({ status = 'all' }) => {
  const navigate = useNavigate();
  const getRoutePath = useRoutePath();
  const { patients, getPendingPatients, getCompletedPatients, deletePatient, markAsCompleted } = usePatient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
 
  const getPatients = () => {
    if (status === 'pending') return getPendingPatients();
    if (status === 'completed') return getCompletedPatients();
    return patients;
  };

  const patientList = getPatients();

  const columns = [
    {
      header: 'Patient Name',
      accessor: 'name',
      sortValue: (row) => `${row.firstName} ${row.lastName}`,
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.firstName} {row.lastName}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Clinic',
      accessor: 'clinic',
    },
    {
      header: 'Contact',
      accessor: 'contact',
      sortValue: (row) => row.phone,
      render: (row) => (
        <div>
          <p className="text-gray-900">{row.phone}</p>
          <p className="text-xs text-gray-500">EHR: {row.ehr}</p>
        </div>
      ),
    },
    {
      header: 'Medical Condition',
      accessor: 'medicalCondition',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.status === 'Pending' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Date Added',
      accessor: 'createdAt',
      sortValue: (row) => new Date(row.createdAt).getTime(),
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Link
            to={getRoutePath(`/patients/edit/${row.id}`)}
            className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          {row.status === 'Pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAsCompleted(row.id);
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              title="Mark as Completed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPatientToDelete(row);
              setShowDeleteConfirm(true);
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

  const handleDelete = () => {
    if (patientToDelete) {
      deletePatient(patientToDelete.id);
      setShowDeleteConfirm(false);
      setPatientToDelete(null);
    }
  };

  const getTitle = () => {
    if (status === 'pending') return 'Pending Patients';
    if (status === 'completed') return 'Completed Patients';
    return 'All Patients';
  };

  return (
    <div>
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-gray-600 mt-1">Manage patient records</p>
        </div>
        <div className="flex space-x-3">
          {status === 'all' && (
            <>
              <button
                onClick={() => navigate('/patients/pending')}
                className="btn-secondary flex items-center space-x-2"
              >
                <span>Pending</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  {getPendingPatients().length}
                </span>
              </button>
              <button
                onClick={() => navigate('/patients/completed')}
                className="btn-secondary flex items-center space-x-2"
              >
                <span>Completed</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  {getCompletedPatients().length}
                </span>
              </button>
            </>
          )}
          
          <Link
            to={getRoutePath('/patients/add')}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Patient</span> 
          </Link>
        </div>
      </div>

      {/* Stats */}
      {status === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-blue-100 text-sm mb-1">Total Patients</p>
            <p className="text-3xl font-bold">{patients.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
            <p className="text-yellow-100 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold">{getPendingPatients().length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <p className="text-green-100 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold">{getCompletedPatients().length}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={patientList}
        emptyMessage={`No ${status !== 'all' ? status : ''} patients found`}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPatientToDelete(null);
        }}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete patient <strong>{patientToDelete?.firstName} {patientToDelete?.lastName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setPatientToDelete(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleDelete} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientsList;

