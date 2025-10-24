import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import Table from '../Common/Table';
import Modal from '../Common/Modal';
import ClinicForm from './ClinicForm';
import Breadcrumb from '../Common/Breadcrumb';
import { useTitle } from '../../context/TitleContext';

const ClinicsList = ({ archived = false }) => {
  const navigate = useNavigate();
  const { getActiveeClinics, getArchivedClinics, archiveClinic, deleteClinic } = useClinic();
  const { setPageTitle } = useTitle();
  const [showModal, setShowModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState(null);

  const clinics = archived ? getArchivedClinics() : getActiveeClinics();

  useEffect(() => {
    setPageTitle(archived ? 'Archived Clinics' : 'Clinics');
  }, [setPageTitle, archived]);
  
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
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.status}
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
              setEditingClinic(row);
              setShowModal(true);
            }}
            className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {!archived && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                archiveClinic(row.id);
              }}
              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
              title="Archive"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setClinicToDelete(row);
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
    if (clinicToDelete) {
      deleteClinic(clinicToDelete.id);
      setShowDeleteConfirm(false);
      setClinicToDelete(null);
    }
  };

  return (
    <div>
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {archived ? 'Archived Clinics' : 'Clinics'}
          </h1>
          <p className="text-gray-600 mt-1">Manage your medical clinics</p>
        </div>
        <div className="flex space-x-3">
          {!archived && (
            <button
              onClick={() => navigate('/clinics/archived')}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>Archives</span>
            </button>
          )}
          {archived && (
            <button
              onClick={() => navigate('/clinics')}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Clinics</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingClinic(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Clinic</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={clinics}
        emptyMessage={archived ? 'No archived clinics' : 'No clinics found'}
      />

      {/* Add/Edit Clinic Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClinic(null);
        }}
        title={editingClinic ? 'Edit Clinic' : 'Add New Clinic'}
        size="lg"
      >
        <ClinicForm
          clinic={editingClinic}
          onClose={() => {
            setShowModal(false);
            setEditingClinic(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setClinicToDelete(null);
        }}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{clinicToDelete?.companyName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setClinicToDelete(null);
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

export default ClinicsList;

