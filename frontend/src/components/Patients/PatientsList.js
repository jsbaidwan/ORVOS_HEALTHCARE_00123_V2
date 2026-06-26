import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePatient } from '../../context/PatientContext';
import Table from '../Common/Table';
import Pagination from '../Common/Pagination';
import Modal from '../Common/Modal';
import Breadcrumb from '../Common/Breadcrumb';
import Filters from '../Common/Filters';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoader } from '../../context/LoaderContext';
import { useRoutePath } from '../../hooks/useRoutePath';
import ErrorHandle from '../Common/ErrorHandle';
import { useTitle } from '../../context/TitleContext';
import { usePermissions } from '../../context/PermissionsContext';
import Swal from 'sweetalert2';
import { Send, FileSpreadsheet } from 'lucide-react';
import EllipsisMenu from '../Common/EllipsisMenu';

const PatientsList = ({ status = 'all', archived = false, diagnosis_status = 'all' }) => {
  const {
    patients,
    pagination,
    getPatients,
    archivePatient,
    unarchivePatient,
    markAsCompleted,
    downloadReport,
    exportToExcel,
  } = usePatient();

  const initialFilters = {
    q: '',
    first_name: '',
    last_name: '',
    ehr: '',
    from_date: '',
    to_date: '',
  };
  const [filterValues, setFilterValues] = useState(initialFilters);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [patientToArchive, setPatientToArchive] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { setPageTitle } = useTitle();
  const { permission } = usePermissions();
  const searchDebounceRef = useRef(null);
  const requestSeqRef = useRef(0);
  const [reportDownloadStatusData, setReportDownloadStatusData] = useState({});
  const [activeEllipsisMenu, setActiveEllipsisMenu] = useState(null);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

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
    setErrors(null);
    setReportDownloadStatusData({});
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page')) || 1;

      const loadedFilters = Object.keys(initialFilters).reduce((acc, key) => {
        acc[key] = params.get(key) || '';
        return acc;
      }, {});

      setFilterValues(loadedFilters);

      const filters = { ...loadedFilters };
      Object.keys(filters).forEach((k) => {
        if (!filters[k]) delete filters[k];
      });
      filters.is_archived = archived;
      filters.diagnosis_status = diagnosis_status;

      if (status && status !== 'all') {
        filters.status = status;
      }

      const seq = ++requestSeqRef.current;
      try {
        const response = await getPatients(page, filters, true);

        if (seq !== requestSeqRef.current) return;

        if (response?.status && response?.status !== 200) {
          setErrors({ general: response?.message });
        }
        setIsDataLoaded(true);
      } catch (error) {
        if (seq !== requestSeqRef.current) return;
        setIsDataLoaded(true);
        setErrors({ general: error });
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, status, archived]);

  const runFilterRequest = async (filters) => {
    const seq = ++requestSeqRef.current;
    const response = await getPatients(1, filters, true);

    if (seq !== requestSeqRef.current) return;

    if (response?.status && response?.status !== 200) {
      setErrors({ general: response?.message });
    }
  };

  const filtersData = (key, value) => {
    if (!(key in initialFilters)) return;

    const nextValues = { ...filterValues, [key]: value };
    setFilterValues(nextValues);

    if (key !== 'q') return;

    const newUrl = new URL(window.location);
    if (value) {
      newUrl.searchParams.set('q', value);
    } else {
      newUrl.searchParams.delete('q');
    }
    newUrl.searchParams.delete('page');
    window.history.pushState({}, '', newUrl);

    const filters = { is_archived: archived, diagnosis_status };
    if (status && status !== 'all') filters.status = status;
    Object.entries(nextValues).forEach(([k, v]) => {
      if (v) filters[k] = v;
    });

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      runFilterRequest(filters);
    }, 400);
  };

  const applyFilters = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    const newUrl = new URL(window.location);
    Object.entries(filterValues).forEach(([k, v]) => {
      if (v) {
        newUrl.searchParams.set(k, v);
      } else {
        newUrl.searchParams.delete(k);
      }
    });
    newUrl.searchParams.delete('page');
    window.history.pushState({}, '', newUrl);

    runFilterRequest(buildActiveFilters());
  };

  const resetFilters = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    setFilterValues(initialFilters);

    const newUrl = new URL(window.location);
    Object.keys(initialFilters).forEach((k) => newUrl.searchParams.delete(k));
    newUrl.searchParams.delete('page');
    window.history.pushState({}, '', newUrl);

    const filters = { is_archived: archived, diagnosis_status };
    if (status && status !== 'all') filters.status = status;
    runFilterRequest(filters);
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [patients]);

  const checkAll = (checked) => {
    if (checked) {
      setSelectedIds((patients || []).map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const checkedSingle = (checked, id) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  };

  const isAllChecked =
    (patients?.length || 0) > 0 && selectedIds.length === patients.length;

  const triggerPdfDownload = (base64, fileName) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'report.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  const handleBulkDownloadPdf = async (ids) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to download ${ids.length} patient report(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, download all!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true,
      confirmButtonColor: '#009efb',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const succeeded = [];
        const failed = [];

        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          Swal.getHtmlContainer && Swal.update({
            text: `Downloading ${i + 1} of ${ids.length}...`,
          });

          try {
            const response = await downloadReport(id);

            if (response && response.status === 200 && response.data?.pdf) {
              triggerPdfDownload(
                response.data.pdf,
                response.data.fileName || `report-${id}.pdf`
              );
              succeeded.push(id);

              if (response.data?.report_download_status_data) {
                setReportDownloadStatusData((prev) => ({
                  ...prev,
                  [id]: response.data.report_download_status_data,
                }));
              }
            } else {
              failed.push({ id, message: response?.data?.message || 'Failed' });
            }
          } catch (err) {
            failed.push({ id, message: 'Something went wrong' });
          }
        }

        if (succeeded.length === 0) {
          Swal.showValidationMessage(
            failed[0]?.message || 'Failed to generate reports. Please try again.'
          );
          return false;
        }

        return { succeeded, failed };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      const { succeeded, failed } = result.value;

      if (failed.length === 0) {
        Swal.fire({
          title: 'Reports Downloaded',
          text: `${succeeded.length} report(s) downloaded successfully.`,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#009efb',
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Partially Downloaded',
          html: `Downloaded: <b>${succeeded.length}</b><br/>Failed: <b>${failed.length}</b>`,
          confirmButtonColor: '#009efb',
        });
      }



      setSelectedIds([]);
      setBulkAction('');
    });
  };

  const handleBulkSubmit = () => {
    if (!bulkAction) {
      toast.error('Please select a bulk action');
      return;
    }
    if (selectedIds.length === 0) {
      toast.error('Please select at least one patient');
      return;
    }

    if (bulkAction === 'download_pdf') {
      handleBulkDownloadPdf(selectedIds);
    }
  };


  const { currentPage = 1, perPage = 10 } = pagination || {};

  let columns = [
    {
      header: (
        <input
          type="checkbox"
          className="w-3 h-3 cursor-pointer"
          checked={isAllChecked}
          onChange={(e) => checkAll(e.target.checked)}
        />
      ),
      accessor: 'checkbox',
      sortable: false,
      className: 'w-10',
      render: (row) => (
        <div className='flex items-center justify-center'>
          <input
            type="checkbox"
            className="w-3 h-3 cursor-pointer"
            checked={selectedIds.includes(row.id)}
            onChange={(e) => checkedSingle(e.target.checked, row.id)}
          />
        </div>
      ),
    },
    {
      header: '#',
      accessor: 'sno',
      className: 'w-10',
      render: (row, index) => (
        <div className='flex items-center justify-center'>
          <span className="text-gray-500">
            {((currentPage - 1) * perPage) + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: 'Patient Name',
      accessor: 'name',
      sortValue: (row) =>
        `${row?.first_name || ''} ${row?.last_name || ''}`.trim().toLowerCase(),
      render: (row) => (
        <div className="flex items-center min-w-0">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
          <span className="text-gray-500 text-sm font-medium">
            {row.first_name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
      
        <div className="min-w-0 flex-1">
          <div
            className="text-sm font-medium text-gray-900 truncate"
            title={`${row?.first_name} ${row?.last_name}`}
          >
            {row?.first_name} {row?.last_name}
          </div>
      
          <Link
            to={getRoutePath(`/patients/view/${row.id}`)}
            className="block text-sm text-primary hover:text-primary-700 truncate"
            target="_blank"
            title={row?.p_code}
          >
            {row?.p_code || "-"}
          </Link>
        </div>
      </div>
      ),
    },

    {
      header: 'Chart Code',
      accessor: 'chart_code',
      render: (row) => (
        <div className="space-y-1">

          <p className={`font-medium mt-1 break-words ${reportDownloadStatusData[row.id]?.class || row?.report_download_status_data?.class}`}>
            {reportDownloadStatusData[row.id]?.name || row?.report_download_status_data?.name}
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
                  <span className={`text-danger text-xs`}>
                    ({row.fax_status_data?.message})
                  </span>
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
                  <em className={`text-danger text-xs`}>
                    ({row.dicom_file_status_data?.message})
                  </em>
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
      sortValue: (row) => row?.clinic?.name?.toLowerCase() || '',
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
      header: 'Posted By',
      accessor: 'user_id',
      render: (row) => (
        <div>
          {row?.user ? (
            <span className="text-green-600 font-medium">
              <Link to={getRoutePath(`/users/view/${row?.user?.id}`)} target="_blank" className="text-primary hover:text-primary-700 underline">
                {row?.user?.first_name || ''} {row?.user?.last_name || ''}
              </Link>
            </span>
          ) : (
            <span className="text-gray-500 font-medium">-</span>
          )}
        </div>
      ),
    },

    {
      header: 'Remark By',
      accessor: 'remark_by',
      render: (row) => (
        <div>
          {row?.remark_by ? (
          <span className="text-green-600 font-medium">
            <Link to={getRoutePath(`/users/view/${row?.remark_by?.id}`)} target="_blank" className="underline">
              {row?.remark_by?.first_name || ''} {row?.remark_by?.last_name || ''} ({row?.remark_by?.role?.name || ''})
            </Link>
            </span>
          ) : (
            <span className="text-gray-500 font-medium">-</span>
          )}
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
      className: 'w-10',
      render: (row) => (
        <div className="flex items-center">
          {!archived && (
            <>
              <Link to={getRoutePath(`/patients/${row.id}/edit`)} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="Edit">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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


          <EllipsisMenu
            row={row}
            activeMenu={activeEllipsisMenu}
            setActiveMenu={setActiveEllipsisMenu}
            menus={[
              {
                label: "View",
                path: (row) => getRoutePath(`/patients/view/${row.id}`),

              }
            ]}
          />
        </div>
      ),
    },
  ];

  const isPendingDiagnosis = diagnosis_status === 0 || diagnosis_status === '0';

  if (isPendingDiagnosis) {
    columns = columns.filter(c => !['chart_code', 'checkbox'].includes(c.accessor));

  }

  const buildActiveFilters = () => {
    const filters = { is_archived: archived, diagnosis_status };
    if (status && status !== 'all') filters.status = status;

    Object.entries(filterValues).forEach(([k, v]) => {
      if (v) filters[k] = v;
    });

    return filters;
  };

  const refreshList = () => {
    runFilterRequest(buildActiveFilters());
  };

  const handlePageChange = async (page) => {
    await getPatients(page, buildActiveFilters(), true);

    const newUrl = new URL(window.location);
    newUrl.searchParams.set('page', page);
    window.history.pushState({}, '', newUrl);
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
          refreshList();
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
          refreshList();
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
        refreshList();
      } else {
        toast.error(result?.message);
      }
    } catch (error) {
      toast.error(error?.message);
    } finally {
      hideLoader();
    }
  };

  const exportExcel = async () => {

    Swal.fire({
      title: "Are you sure?",
      text: "You want to export patient's data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, export it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
      confirmButtonColor: "#009efb",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await exportToExcel({ 'diagnosis_status': diagnosis_status });

          if (!response || response.status !== 200) {
            Swal.showValidationMessage(
              response?.data?.message || 'Failed to export patients list. Please try again.'
            );
            return false;
          }

          return response;

        } catch (error) {
          Swal.showValidationMessage('Something went wrong. Please try again.');
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const response = result.value;
        if (response.status === 200) {

          Swal.fire({
            title: "Export",
            text: response?.data?.message || "Patients list exported successfully",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#009efb",
            timer: 2000,
            timerProgressBar: true
          });

          const url = response?.data?.download_url;

          const link = document.createElement('a');
          link.href = url;
          link.download = response?.data?.file_name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response?.data?.message || 'Failed to export patients list. Please try again.',
          });
          Swal.showValidationMessage('Failed to export patients list. Please try again.');
        }

        return false;
      }
    });


  }

  const filterConfig = [
    // {
    //   key: 'q',
    //   type: 'search',
    //   placeholder: 'Search patients...',
    //   value: filterValues.q,
    // },
    {
      key: 'first_name',
      type: 'text',
      label: 'First Name',
      placeholder: 'First Name',
      value: filterValues.first_name,
    },
    {
      key: 'last_name',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Last Name',
      value: filterValues.last_name,
    },
    {
      key: 'ehr',
      type: 'text',
      label: 'EHR',
      placeholder: 'EHR',
      value: filterValues.ehr,
    },
    {
      key: 'from_date',
      type: 'date',
      label: 'From Date',
      placeholder: 'MM-DD-YYYY',
      value: filterValues.from_date,
    },
    {
      key: 'to_date',
      type: 'date',
      label: 'To Date',
      placeholder: 'MM-DD-YYYY',
      value: filterValues.to_date,
      minDate: filterValues.from_date ? new Date(filterValues.from_date.replace(/-/g, '/')) : undefined,
    },
  ];

  return (
    <div className="py-6">
      <Breadcrumb />

      <div className="mb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

          <h1 className="text-2xl font-semibold text-gray-900">
            {getTitle()}
          </h1>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {!archived ? (
              <button
                onClick={() => navigate(getRoutePath('/patients/create'))}
                className="inline-flex items-center justify-center px-4 py-2 btn-sm btn-primary w-full sm:w-auto text-sm sm:text-base"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add New Patient
              </button>
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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">

        <div className='border-b border-gray-200 pb-3 mb-4'>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Filters</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Patient filter options and details.
          </p>
        </div>
        <div className='pb-3 mb-4 p-2'>
          <Filters
            filters={filterConfig}
            onFilterChange={filtersData}
            onApply={applyFilters}
            onReset={resetFilters}
            applyLabel="Filter"
            resetLabel="Reset"
          />
        </div>
      </div>

      <div className="bg-white rounded-t-lg p-2 border border-gray-200 shadow-sm mt-6">
        <div className="px-4 py-5 sm:px-6 flex flex-col gap-4">

          {/* Top Row: Title Left / Export Right */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <h3 className="text-lg font-medium text-gray-900">Patients</h3>
              <p className="mt-1 text-sm text-gray-500">
                Patient records and details.
              </p>
            </div>

            <button
              type="button"
              onClick={exportExcel}
              className="inline-flex items-center justify-center btn-primary-light btn-sm rounded px-4 py-2 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-34 h-4 mr-1" />
              Export to Excel
            </button>

          </div>

          {/* Bottom Row: Bulk Left */}
          {!isPendingDiagnosis && (
            <div className="flex flex-col sm:flex-row gap-2">

              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="w-full sm:w-44 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009efb]"
              >
                <option value="">Bulk Action</option>
                <option value="download_pdf">Download as PDF</option>
              </select>

              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={selectedIds.length === 0 || !bulkAction}
                className="inline-flex items-center justify-center btn btn-primary rounded disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
              >
                <Send className="w-4 h-4 mr-1" />
                Submit
              </button>

            </div>
          )}

        </div>
      </div>

      <div className={`mb-6`}>
        <Table
          columns={columns}
          data={patients || []}
          emptyMessage="No patients found"
          isDataLoaded={isDataLoaded}
          permissions={{ 'read': permission(2, 'read'), 'write': permission(2, 'write') }}
          forceLoading={true}
        />
      </div>

      {
        patients?.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            lastPage={pagination.lastPage}
            onPageChange={handlePageChange}
          />
        )
      }

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
    </div >
  );
};

export default PatientsList;
