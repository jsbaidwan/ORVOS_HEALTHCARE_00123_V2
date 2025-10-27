import React, { useState, useEffect} from 'react';
import { useClinicGroup } from '../../context/ClinicGroupContext';
import Table from '../Common/Table';
import Pagination from '../Common/Pagination';
import Modal from '../Common/Modal';
import ClinicGroupForm from './ClinicGroupForm';
import Breadcrumb from '../Common/Breadcrumb';
import Filters from '../Common/Filters';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
//import { useLoader } from '../../context/LoaderContext';

const ClinicGroupList = () => {
  const {
    clinicGroups,
    pagination,
    getClinicGroups,
    deleteClinicGroup,
  } = useClinicGroup();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingClinicGroup, setEditingClinicGroup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clinicGroupToDelete, setClinicGroupToDelete] = useState(null);
  
  //const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
     
    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page')) || 1;
      const q = params.get('q') || '';
      const active = params.get('active') || 'all';
      
      setSearchTerm(q);
      setStatusFilter(active);
  
      // Prepare filters
      const filters = {};
      if (q) filters.q = q;
      if (active && active !== 'all') filters.active = active;
  
      try {
        // showLoader();
        await getClinicGroups(page, filters, true);
        // hideLoader();
      } catch (error) {
        // hideLoader();
        console.error(error);
      }
    };
  
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLocation()]);
   
  const filtersData = async (key, value) => {
    // Update the state first
    if (key === 'q') {
      setSearchTerm(value);
    }
    if (key === 'active') {
      setStatusFilter(value);
    }
    
    const newUrl = new URL(window.location);
    let filters = {};
    
    if (key === 'q') {
      filters.q = value;
      if(value) {
        newUrl.searchParams.set('q', value);
      } else {
        newUrl.searchParams.delete('q');
      }
    }
    
    if (key === 'active') {
      filters.active = value;
      if(value && value !== 'all') {
        newUrl.searchParams.set('active', value);
      } else {
        newUrl.searchParams.delete('active');
      }
    }
    
    newUrl.searchParams.delete('page');
    window.history.pushState({}, '', newUrl);
     
    await getClinicGroups(1, filters,true);
   
    
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.name}</p>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <div className="max-w-xs">
          <p className="text-gray-900 text-sm line-clamp-2">{row.description || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'active',
      sortable: false,
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.active === 1
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.is_active_status?.name
            ? row.is_active_status.name.charAt(0).toUpperCase() + row.is_active_status.name.slice(1)
            : ''}
        </span>
      ),
    },
    {
      header: 'Created At',
      accessor: 'created_at',
      sortValue: (row) => new Date(row.created_at).getTime(),
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">
            {new Date(row.created_at).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200"
            title="Edit"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = async (page) => {
    let filters = {};
    
    if(searchTerm) {
      filters.q = searchTerm;
    }
    if(statusFilter && statusFilter !== 'all') {
      filters.active = statusFilter;
    }
    
    await getClinicGroups(page, filters, true);
    
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('page', page);
    window.history.pushState({}, '', newUrl);
    
  };

  const handleEdit = (clinicGroup) => {
    setEditingClinicGroup(clinicGroup);
    setShowModal(true);
  };

  const handleDelete = (clinicGroup) => {
    setShowDeleteConfirm(true);
    setClinicGroupToDelete(clinicGroup);
  };

  const confirmDelete = async () => {
    if (clinicGroupToDelete) {
      const result = await deleteClinicGroup(clinicGroupToDelete.id);
      if (result && result.status === 200) {
        setShowDeleteConfirm(false);
        setClinicGroupToDelete(null);
      } else {
        console.error('Failed to delete:', result?.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClinicGroup(null);
  };

  const filterConfig = [
    {
      key: 'q',
      type: 'text',
      placeholder: 'Search clinic groups...',
      value: searchTerm,
    },
    {
      key: 'active',
      type: 'select',
      value: statusFilter,
      options: [
        { value: 'all', label: 'All Status' },
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' },
      ],
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 md:px-8">
        <Breadcrumb />
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Clinic Groups</h1>
            <button
              onClick={() => {
                setEditingClinicGroup(null);
                setShowModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#009efb] hover:bg-[#0089db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009efb]"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New Clinic Group
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-10xl mx-auto px-4 sm:px-6 md:px-8">
        <Filters filters={filterConfig} onFilterChange={filtersData} />

        <div className='bg-white rounded-lg shadow-sm'>
          <div className="px-4 py-5 sm:px-6" bis_skin_checked="1">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
            Clinic Groups</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Clinic groups information and details.
            </p>
          </div>
        </div>
        <div className="mb-6">
         
          <Table
            columns={columns}
            data={clinicGroups || []}
            emptyMessage="No clinic groups found"
          />
        </div>
        
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Add/Edit Clinic Group Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingClinicGroup ? 'Edit Clinic Group' : 'Add New Clinic Group'}
        size="lg"
      >
        <ClinicGroupForm
          clinicGroup={editingClinicGroup}
          onClose={handleCloseModal}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setClinicGroupToDelete(null);
        }}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{clinicGroupToDelete?.name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setClinicGroupToDelete(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={confirmDelete} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClinicGroupList;
