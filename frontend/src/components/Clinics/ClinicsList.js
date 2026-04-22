import React, { useState, useEffect, useRef } from 'react';
import { useClinic } from '../../context/ClinicContext';
import Table from '../Common/Table';
import Pagination from '../Common/Pagination';
import Modal from '../Common/Modal';
import ClinicForm from './ClinicForm';
import Breadcrumb from '../Common/Breadcrumb';
import Filters from '../Common/Filters';
import { PlusIcon, EyeIcon, ArchiveBoxIcon, ArrowLeftIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoader } from '../../context/LoaderContext';
import { useRoutePath } from '../../hooks/useRoutePath';
import ErrorHandle from '../Common/ErrorHandle';
import { useTitle } from '../../context/TitleContext';
import { usePermissions } from '../../context/PermissionsContext';
import { PreviewImage } from '../Patients/EyeImageUploader';

const ClinicsList = ({ archived = false }) => {
  const {
    clinics,
    setClinics,
    pagination,
    getClinics,
    archiveClinic,
    unarchiveClinic,
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [clinicToArchive, setClinicToArchive] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  const [errors, setErrors] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { setPageTitle } = useTitle();
  const { permission } = usePermissions();
  const [tab, setTab] = useState(1);
  const prevTab = useRef(tab);

  useEffect(() => {
    setPageTitle(archived ? 'Archived Clinics' : 'Clinics');
  }, [setPageTitle, archived]);


  useEffect(() => {

    if (tab !== prevTab.current) {
      setClinics([])
    }

    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page')) || 1;
      const q = params.get('q') || '';
      const active = params.get('active') || 'all';

      setSearchTerm(q);
      setStatusFilter(active);

      const filters = {};
      if (q) filters.q = q;
      if (active && active !== 'all') filters.active = active;
      filters.is_archived = archived;
      filters.active = tab;

      try {
        const response = await getClinics(page, filters, true);

        if (response?.status && response?.status !== 200) {
          setClinics([]);
          setErrors({ general: response?.message });
        }
        setIsDataLoaded(true);
      } catch (error) {
        setIsDataLoaded(true);
        setErrors({ general: error });
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLocation(), tab]);

  const filtersData = async (key, value) => {
    if (key === 'q') setSearchTerm(value);
    if (key === 'active') setStatusFilter(value);

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
    const response = await getClinics(1, filters, true);

    if (response?.status && response?.status !== 200) {
      setClinics([]);
      setErrors({ general: response?.message });
    }
  };

  const columns = [
    {
      header: 'Clinic',
      accessor: 'name',
      render: (row) => (
        <div className="w-auto">
          <div className="flex items-center">

            <div className="h-10 w-10 min-w-10 shrink-0 rounded-full bg-gray-200 mr-3 flex items-center justify-center overflow-hidden">
              {row?.display_image?.status === 200 ? (
                <div className="w-full h-full object-cover">
                  <PreviewImage
                    preview={row.display_image.src}
                    hasCustomClass="h-10 w-10 object-contain"
                    hasRemoveButton={false}
                    hasViewButton={false}
                    index={0}
                    key={0}
                  />
                </div>
              ) : (
                <span className="text-gray-500 text-sm">
                  {row.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 lg:min-w-full">
              <div className="text-sm font-medium text-gray-900 break-words">
                {row?.name}
              </div>

              <div className="text-sm">
                <Link
                  to={getRoutePath(`/clinics/view/${row.id}`)}
                  className="text-primary hover:text-primary-700"
                  target="_blank"
                >
                  {row.code || "-"}
                </Link>
              </div>
            </div>

          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'poc_email',
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">{row.poc_email || '-'}</p>
          <p className="text-gray-500 text-xs">{row.phone || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'city',
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">{row.city || '-'}{row.state?.name ? `, ${row.state?.name}` : ''}</p>
          <p className="text-gray-500 text-xs">{row.zip || ''}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'active',
      sortable: false,
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${row.status === 1
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
          <p className="text-gray-900 text-sm">{row?.formated_created_at}</p>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center space-x-2">
          {/* <button
            onClick={() => handleEdit(row)}
            className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button> */}

          <Link to={getRoutePath(`/clinics/${row.id}/edit`)} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="View">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>

          <Link to={getRoutePath(`/clinics/view/${row.id}`)} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="View">
            <EyeIcon className="w-5 h-5" />
          </Link>

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

    if (searchTerm) filters.q = searchTerm;
    if (statusFilter && statusFilter !== 'all') filters.active = statusFilter;

    await getClinics(page, filters, true);

    const newUrl = new URL(window.location);
    newUrl.searchParams.set('page', page);
    window.history.pushState({}, '', newUrl);
  };

  // const handleEdit = (clinic) => {
  //   setEditingClinic(clinic);
  //   setShowModal(true);
  // };

  const handleArchive = (clinic) => {
    setShowArchiveConfirm(true);
    setClinicToArchive(clinic);
  };

  const confirmArchive = async () => {
    if (clinicToArchive) {
      showLoader();
      try {
        const result = await archiveClinic(clinicToArchive.id);
        if (result && result.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setClinicToArchive(null);
          navigate(getRoutePath('/clinics'));
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
    if (clinicToArchive) {
      showLoader();
      try {
        const result = await unarchiveClinic(clinicToArchive.id);
        if (result && result.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setClinicToArchive(null);
          navigate(getRoutePath('/clinics'));
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
    setEditingClinic(null);
  };

  const filterConfig = [
    {
      key: 'q',
      type: 'text',
      placeholder: 'Search clinics...',
      value: searchTerm,
    },
  ];

  return (
    <div className="py-6">
      <Breadcrumb />

      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{archived ? 'Archived' : ''} Clinics</h1>

          <div className="flex flex-wrap justify-end items-center gap-3 w-full">
            {!archived ? (
              <>
                <button
                  onClick={() => navigate(getRoutePath('/clinics/archived'))}
                  className="inline-flex items-center justify-center px-4 py-2 btn-warning w-full sm:w-auto text-sm sm:text-base"
                >
                  <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                  Archived Clinics
                </button>

                {/* <button
                  onClick={() => {
                    setEditingClinic(null);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 w-full sm:w-auto border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-[#009efb] hover:bg-[#0089db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009efb]"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add New Clinic
                </button> */}

                <Link to={getRoutePath('/clinics/create')} className="inline-flex items-center justify-center px-4 py-2.5 w-full sm:w-auto border border-transparent rounded-md shadow-sm text-[0.775rem] xs:text-base font-medium text-white bg-[#009efb] hover:bg-[#0089db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009efb]">
                  <PlusIcon className="w-3 h-3 mr-1" />
                  Add New Clinic
                </Link>
              </>
            ) : (
              <button
                onClick={() => navigate(getRoutePath('/clinics'))}
                className="inline-flex items-center justify-center px-4 py-2 w-full sm:w-auto btn-primary text-sm sm:text-base"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to List
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
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
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Clinics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Clinic information and details.
          </p>
        </div>
      </div>
      <div className="mb-6">
        <Table
          columns={columns}
          data={clinics || []}
          emptyMessage="No clinics found"
          isDataLoaded={isDataLoaded}
          permissions={{ 'read': permission(1, 'read'), 'write': permission(1, 'write') }}
        />
      </div>

      {clinics?.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* Add/Edit Clinic Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingClinic ? 'Edit Clinic' : 'Add New Clinic'}
        size="lg"
      >
        <ClinicForm
          clinic={editingClinic}
          onClose={handleCloseModal}
        />
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={showArchiveConfirm}
        onClose={() => {
          setShowArchiveConfirm(false);
          setClinicToArchive(null);
        }}
        title={`Confirm ${archived ? 'Unarchive' : 'Archive'}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to {archived ? 'unarchive' : 'archive'} <strong>{clinicToArchive?.name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowArchiveConfirm(false);
                setClinicToArchive(null);
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

export default ClinicsList;
