import React, { useState, useEffect, useCallback } from 'react';
import { usePatient } from '../../context/PatientContext';
import Table from '../Common/Table';
import Pagination from '../Common/Pagination';
import Modal from '../Common/Modal';
import Breadcrumb from '../Common/Breadcrumb';
import Filters from '../Common/Filters';
import { PlusIcon, ArchiveBoxIcon, ArrowLeftIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoader } from '../../context/LoaderContext';
import { useRoutePath } from '../../hooks/useRoutePath';
import ErrorHandle from '../Common/ErrorHandle';
import { useTitle } from '../../context/TitleContext';
import { usePermissions } from '../../context/PermissionsContext';

const PatientsList = ({ status = 'all', archived = false, diagnosis_status = 'all' }) => {
  const {
    patients,
    pagination,
    getPatients,
    archivePatient,
    unarchivePatient,
    markAsCompleted,
  } = usePatient();

  const [searchTerm, setSearchTerm] = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [patientToArchive, setPatientToArchive] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { setPageTitle } = useTitle();
  const { permission } = usePermissions();

  const getTitle = useCallback(() => {

    if (archived) return 'Archived Patients';
    if (status === 'pending') return 'Pending Patients';
    if (status === 'completed') return 'Completed Patients';
    return 'Patients';
  }, [archived, status]);

  useEffect(() => {
    setPageTitle(getTitle());
  }, [setPageTitle, status, archived, getTitle]);

  useEffect(() => {
    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page')) || 1;
      const q = params.get('q') || '';

      setSearchTerm(q);

      const filters = {};
      if (q) filters.q = q;
      filters.is_archived = archived;
      filters.diagnosis_status = diagnosis_status;

      if (status && status !== 'all') {
        filters.status = status;
      }

      try {
        const response = await getPatients(page, filters, true);

        if (response?.status && response?.status !== 200) {
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
  }, [location, status, archived]);

  const filtersData = async (key, value) => {
    if (key === 'q') setSearchTerm(value);

    const newUrl = new URL(window.location);
    let filters = {};
    filters.is_archived = archived;
    filters.diagnosis_status = diagnosis_status;
    if (status && status !== 'all') {
      filters.status = status;
    }

    if (key === 'q') {
      filters.q = value;
      if (value) {
        newUrl.searchParams.set('q', value);
      } else {
        newUrl.searchParams.delete('q');
      }
    }

    newUrl.searchParams.delete('page');
    window.history.pushState({}, '', newUrl);
    const response = await getPatients(1, filters, true);

    if (response?.status && response?.status !== 200) {
      setErrors({ general: response?.message });
    }
  };

  let columns = [
    {
      header: 'Patient Name',
      accessor: 'name',
      render: (row) => (
        <div className="w-48">
          <div className="flex items-center">

            <div className="h-10 w-10 min-w-10 shrink-0 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                {row.first_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>

            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 break-words">
                {row?.first_name} {row?.last_name}
              </div>

              <div className="text-sm text-gray-500">
                <Link
                  to={getRoutePath(`/patients/view/${row.id}`)}
                  className="text-primary hover:text-primary-700 break-words"
                  target="_blank"
                >
                  {row?.p_code || "-"}
                </Link>
              </div>
            </div>

          </div>
        </div>
      ),
    },

    {
      header: 'Chart Code',
      accessor: 'chart_code',
      render: (row) => (
        <div className="space-y-1">

          <p className={`${row.report_download_status_data?.class} text-sm`}>
            {row.report_download_status_data?.name}
          </p>

          {row?.clinic?.is_patient_report_email_enabled === 1 && (
            <p className={`${row.report_sent_status?.class} text-sm`}>
              {row.report_sent_status?.status}
            </p>
          )}


          {row.fax_status !== 0 &&
            <p className={`${row.fax_status_data?.class} text-sm`}>
              {row.fax_status_data?.name}
              {row.fax_status === 3 && (
                <>
                  <br />
                  <p className={`text-danger text-xs`}>
                    ({row.fax_status_data?.message})
                  </p>
                </>
              )}
            </p>
          }

          {row.is_dicom_file_send !== 0 &&
            <p className={`${row.dicom_file_status_data?.class} text-sm`}>
              {row.dicom_file_status_data?.name}
              {row.is_dicom_file_send === 3 && (
                <>
                  <br />
                  <p className={`text-danger text-xs`}>
                    ({row.dicom_file_status_data?.message})
                  </p>
                </>
              )}
            </p>
          }

        </div>
      ),
    },
    {
      header: 'Clinic',
      accessor: 'clinic',
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm"><Link to={getRoutePath(`/clinics/view/${row.clinic?.id}`)} target="_blank" className="text-primary hover:text-primary-700">{row.clinic?.name || '-'}</Link></p>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">{row.phone || '-'}</p>
          <p className="text-gray-500 text-xs">EHR: {row.ehr || '-'}</p>
        </div>
      ),
    },

    {
      header: 'Diagnosis Status',
      accessor: 'diagnosis_status',
      render: (row) => (
        <div className='flex items-center justify-center'>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold bg-${row?.diagnosis_status_data?.color}-100 text-${row?.diagnosis_status_data?.color}-800`}
          >
            {row?.diagnosis_status_data
              ? row.diagnosis_status_data?.name.charAt(0).toUpperCase() + row.diagnosis_status_data?.name.slice(1)
              : '-'}
          </span>
        </div>
      ),
    },
    {
      header: 'DOS',
      accessor: 'dos',
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">{row?.dos || '-'}</p>
        </div>
      ),
    },
    {
      header: 'EHR',
      accessor: 'ehr',
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">{row?.ehr || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Date of Birth',
      accessor: 'date_of_birth',
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">{row?.date_of_birth || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Created At',
      accessor: 'created_at',
      sortValue: (row) => row?.formated_created_at,
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">{row?.formated_created_at || new Date(row.created_at).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center space-x-2">
          {!archived && (
            <>
              <Link to={getRoutePath(`/patients/${row.id}/edit`)} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="Edit">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>

              <Link to={getRoutePath(`/patients/view/${row.id}`)} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="View">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Link>

              {(row.status === 'Pending' || row.status === 'pending') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsCompleted(row.id);
                  }}
                  className="p-2 text-green-600 hover:bg-green-200 rounded-lg transition-colors duration-200"
                  title="Mark as Completed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </>
          )}

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

  if (diagnosis_status === 0 || diagnosis_status === '0') {
    columns = columns.filter(c => c.accessor !== 'chart_code');
  }

  const handlePageChange = async (page) => {
    let filters = {};
    filters.is_archived = archived;
    filters.diagnosis_status = diagnosis_status;
    if (status && status !== 'all') {
      filters.status = status;
    }

    if (searchTerm) filters.q = searchTerm;

    await getPatients(page, filters, true);

    const newUrl = new URL(window.location);
    newUrl.searchParams.set('page', page);
    window.history.pushState({}, '', newUrl);
  };

  const handleArchive = (patient) => {
    setShowArchiveConfirm(true);
    setPatientToArchive(patient);
  };

  const confirmArchive = async () => {
    if (patientToArchive) {
      showLoader();
      try {
        const result = await archivePatient(patientToArchive.id);
        if (result && result.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setPatientToArchive(null);
          // Refresh data
          filtersData('q', searchTerm);
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
    if (patientToArchive) {
      showLoader();
      try {
        const result = await unarchivePatient(patientToArchive.id);
        if (result && result.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setPatientToArchive(null);
          // Refresh data
          filtersData('q', searchTerm);
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

  const handleMarkAsCompleted = async (id) => {
    showLoader();
    try {
      const result = await markAsCompleted(id);
      if (result && result.status === 200) {
        toast.success(result?.message);
        filtersData('q', searchTerm);
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      toast.error(error?.message);
    } finally {
      hideLoader();
    }
  };

  const filterConfig = [
    {
      key: 'q',
      type: 'text',
      placeholder: 'Search patients...',
      value: searchTerm,
    },
  ];

  return (
    <div className="py-6">
      <Breadcrumb />

      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{getTitle()}</h1>

          <div className="flex flex-wrap justify-end items-center gap-3 w-full">
            {!archived ? (
              <>
                <Link to={getRoutePath('/patients/create')} className="inline-flex items-center justify-center px-4 py-2.5 w-full sm:w-auto border border-transparent rounded-md shadow-sm text-[0.775rem] xs:text-base font-medium text-white bg-[#009efb] hover:bg-[#0089db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009efb]">
                  <PlusIcon className="w-3 h-3 mr-1" />
                  Add New Patient
                </Link>
              </>
            ) : (
              <button
                onClick={() => navigate(getRoutePath('/patients'))}
                className="inline-flex items-center justify-center px-4 py-2 w-full sm:w-auto btn-primary text-sm sm:text-base"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to List
              </button>
            )}
          </div>
        </div>
      </div>

      <ErrorHandle errors={errors} />
      <Filters filters={filterConfig} onFilterChange={filtersData} />

      <div className='bg-white rounded-t-lg p-2 border border-gray-200 shadow-sm mt-6'>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Patients</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Patient records and details.
          </p>
        </div>
      </div>

      <div className={`mb-6`}>
        <Table
          columns={columns}
          data={patients || []}
          emptyMessage="No patients found"
          isDataLoaded={isDataLoaded}
          permissions={{ 'read': permission(2, 'read'), 'write': permission(2, 'write') }}
          forceLoading={diagnosis_status}
        />
      </div>

      {patients?.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={showArchiveConfirm}
        onClose={() => {
          setShowArchiveConfirm(false);
          setPatientToArchive(null);
        }}
        title={`Confirm ${archived ? 'Unarchive' : 'Archive'}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to {archived ? 'unarchive' : 'archive'} <strong>{patientToArchive?.first_name} {patientToArchive?.last_name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowArchiveConfirm(false);
                setPatientToArchive(null);
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

export default PatientsList;
