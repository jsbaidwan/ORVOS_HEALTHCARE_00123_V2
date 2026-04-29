import React, { useState, useEffect, useRef } from 'react';
import { useClinicGroup } from '../../context/ClinicGroupContext';
import Table from '../Common/Table';
import Pagination from '../Common/Pagination';
import Modal from '../Common/Modal';
import ClinicGroupForm from './ClinicGroupForm';
import Breadcrumb from '../Common/Breadcrumb';
import Filters from '../Common/Filters';
import { PlusIcon, EyeIcon, ArchiveBoxIcon, ArrowLeftIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoader } from '../../context/LoaderContext';
import { useRoutePath } from '../../hooks/useRoutePath';
//import { useLoader } from '../../context/LoaderContext';
import ErrorHandle from '../Common/ErrorHandle';
import { useTitle } from '../../context/TitleContext';
import { usePermissions } from '../../context/PermissionsContext';

const ClinicGroupList = ({ archived = false }) => {
  const {
    clinicGroups,
    setClinicGroups,
    pagination,
    getClinicGroups,
    archiveClinicGroup,
    unarchiveClinicGroup,
  } = useClinicGroup();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingClinicGroup, setEditingClinicGroup] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [clinicGroupToArchive, setClinicGroupToArchive] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  const [errors, setErrors] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { setPageTitle } = useTitle();
  const { permission } = usePermissions();
  const [tab, setTab] = useState(1);
  const prevTab = useRef(tab);
  const searchDebounceRef = useRef(null);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    setPageTitle('Clinic Groups');
  }, [setPageTitle]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);


  useEffect(() => {

    if (tab !== prevTab.current) {
      setClinicGroups([])
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

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
      filters.is_archived = archived;
      filters.active = tab;

      const seq = ++requestSeqRef.current;
      try {
        setIsDataLoaded(true);
        // showLoader();
        const response = await getClinicGroups(page, filters, true);

        if (seq !== requestSeqRef.current) return;

        if (response?.status && response?.status !== 200) {
          setClinicGroups([])
          setErrors({ general: response?.message });

        }

        // hideLoader();
      } catch (error) {
        if (seq !== requestSeqRef.current) return;
        // hideLoader();
        setIsDataLoaded(true);
        setErrors({ general: error });
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLocation(), tab]);

  const runFilterRequest = async (filters) => {
    const seq = ++requestSeqRef.current;
    const response = await getClinicGroups(1, filters, true);

    if (seq !== requestSeqRef.current) return;

    if (response?.status && response?.status !== 200) {
      setClinicGroups([])
      setErrors({ general: response?.message });
    }
  };

  const filtersData = (key, value) => {
    // Update the state first
    if (key === 'q') {
      setSearchTerm(value);
    }
    if (key === 'active') {
      setStatusFilter(value);
    }

    const newUrl = new URL(window.location);
    let filters = {};
    filters.is_archived = archived;
    filters.active = tab;

    if (key === 'q') {
      filters.q = value;
      if (value) {
        newUrl.searchParams.set('q', value);
      } else {
        newUrl.searchParams.delete('q');
      }
    }

    if (key === 'active') {
      filters.active = value;
      if (value && value !== 'all') {
        newUrl.searchParams.set('active', value);
      } else {
        newUrl.searchParams.delete('active');
      }
    }

    newUrl.searchParams.delete('page');
    window.history.pushState({}, '', newUrl);

    if (key === 'q') {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        runFilterRequest(filters);
      }, 400);
      return;
    }

    runFilterRequest(filters);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div className='w-auto'>
          <div className="flex items-center">

            <div className="h-10 w-10 min-w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center shrink-0">
              <span className="text-gray-500 text-sm">
                {row.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 lg:min-w-full">
              <div className="text-sm font-medium text-gray-900 break-words">
                {row?.name}
              </div>

              <div className="text-sm">
                <Link
                  to={getRoutePath(`/clinic-groups/view/${row.id}`)}
                  className='text-primary hover:text-primary-700'
                  target='_blank'
                >
                  {row.code || '-'}
                </Link>
              </div>
            </div>

          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (row) => (
        <div className='w-80'>
          <p className="text-gray-900 text-sm line-clamp-3">{row.description || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'active',
      sortable: false,
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${row.active === 1
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
      sortValue: (row) => row?.formated_created_at,
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">
            {row?.formated_created_at}
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

          <Link to={getRoutePath(`/clinic-groups/view/${row.id}`)} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="View"> <EyeIcon className="w-5 h-5" /> </Link>

          <button
            onClick={() => handleArchive(row)}
            className="p-2 hover:bg-warning-50 rounded-lg transition-colors duration-200"
            title={archived ? 'Unarchive' : 'Archive'}
          >
            {archived ? <ArrowUpCircleIcon className="w-5 h-5 text-warning" /> : <ArchiveBoxIcon className="w-5 h-5 text-warning" />}
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = async (page) => {
    let filters = {};
    filters.is_archived = archived;
    filters.active = tab;

    if (searchTerm) {
      filters.q = searchTerm;
    }
    if (statusFilter && statusFilter !== 'all') {
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

  const handleArchive = (clinicGroup) => {

    setShowArchiveConfirm(true);
    setClinicGroupToArchive(clinicGroup);
  };

  const confirmArchive = async () => {
    if (clinicGroupToArchive) {
      showLoader();
      try {
        const result = await archiveClinicGroup(clinicGroupToArchive.id);
        if (result && result.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setClinicGroupToArchive(null);
          navigate(getRoutePath('/clinic-groups'));
        } else {
          toast.error(result?.message);
        }
      } catch (error) {
        toast.error(error?.message);
      } finally {
        hideLoader();
      }
    }
  };

  const confirmUnarchive = async () => {
    if (clinicGroupToArchive) {
      showLoader();
      try {
        const result = await unarchiveClinicGroup(clinicGroupToArchive.id);
        if (result && result.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setClinicGroupToArchive(null);
          navigate(getRoutePath('/clinic-groups'));
        } else {
          toast.error(result?.message);
        }
      } catch (error) {
        toast.error(error?.message);
      } finally {
        hideLoader();
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
    // {
    //   key: 'active',
    //   type: 'select',
    //   value: statusFilter,
    //   options: [
    //     { value: 'all', label: 'All Status' },
    //     { value: '1', label: 'Active' },
    //     { value: '0', label: 'Inactive' },
    //   ],
    // },
  ];

  return (
    <div className="py-6">
      <Breadcrumb />

      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{archived ? 'Archived' : ''} Clinic Groups</h1>

          <div className="flex flex-wrap justify-end items-center gap-3 w-full">
            {!archived ? (
              <>
                {/* 📦 Archived Clinic Groups */}
                <button
                  onClick={() => navigate(getRoutePath('/clinic-groups/archived'))}
                  className="inline-flex items-center justify-center px-4 py-2 btn-warning w-full sm:w-auto text-sm sm:text-base"
                >
                  <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                  Archived Clinic Groups
                </button>

                {/* ➕ Add New Clinic Group */}
                <button
                  onClick={() => {
                    setEditingClinicGroup(null);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 w-full sm:w-auto border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-[#009efb] hover:bg-[#0089db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009efb]"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add New Clinic Group
                </button>
              </>
            ) : (
              <>
                {/* 🔙 Back to List */}
                <button
                  onClick={() => navigate(getRoutePath('/clinic-groups'))}
                  className="inline-flex items-center justify-center px-4 py-2 w-full sm:w-auto btn-primary text-sm sm:text-base"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to List
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 ">
        <button
          onClick={() => setTab(1)}
          className={`px-4 py-2 font-medium transition-all duration-200 ${tab === 1
            ? "flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 border-b-2 border-primary-600 text-primary-600 bg-primary-50"
            : "flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
        >
          Active
        </button>
        <button
          onClick={() => setTab(0)}
          className={`px-4 py-2 font-medium transition-all duration-200 ${tab === 0
            ? "flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 border-b-2 border-primary-600 text-primary-600 bg-primary-50"
            : "flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
        >
          Inactive
        </button>
      </div>

      <ErrorHandle errors={errors} />
      <Filters filters={filterConfig} onFilterChange={filtersData} />

      <div className='bg-white rounded-t-lg p-2 border border-gray-200 shadow-sm'>
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
          isDataLoaded={isDataLoaded}
          permissions={{ 'read': permission(8, 'read'), 'write': permission(8, 'write') }}
        />
      </div>

      {clinicGroups?.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          onPageChange={handlePageChange}
        />
      )}

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

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={showArchiveConfirm}
        onClose={() => {
          setShowArchiveConfirm(false);
          setClinicGroupToArchive(null);
        }}
        title={`Confirm ${archived ? 'Unarchive' : 'Archive'}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to  {archived ? 'unarchive' : 'archive'} <strong>{clinicGroupToArchive?.name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowArchiveConfirm(false);
                setClinicGroupToArchive(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={archived ? confirmUnarchive : confirmArchive} className="btn-danger">
              {archived ? 'Unarchive' : 'Archive'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClinicGroupList;
