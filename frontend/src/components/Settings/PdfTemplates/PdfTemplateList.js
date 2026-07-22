import React, { useState, useEffect, useRef } from 'react';
import { usePdfTemplate } from '../../../context/PdfTemplateContext';
import Table from '../../Common/Table';
import Pagination from '../../Common/Pagination';
import Modal from '../../Common/Modal';
import Breadcrumb from '../../Common/Breadcrumb';
import Filters from '../../Common/Filters';
import { ArrowLeftIcon, ArchiveBoxIcon, ArrowUpCircleIcon,PlusIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoader } from '../../../context/LoaderContext';
import { useRoutePath } from '../../../hooks/useRoutePath';
import ErrorHandle from '../../Common/ErrorHandle';
import { useTitle } from '../../../context/TitleContext';
import EllipsisMenu from '../../Common/EllipsisMenu';
import { usePermissions } from '../../../context/PermissionsContext';
import Swal from 'sweetalert2';
import { TrashIcon } from '@heroicons/react/24/solid';
import { useAdditionalData } from '../../../context/AdditionalDataContext';

const PdfTemplateList = ({ archived = false }) => {
  const {
    pdfTemplates,
    setPdfTemplates,
    pagination,
    getPdfTemplates,
    archivePdfTemplate,
    unarchivePdfTemplate,
    deletePdfTemplate,
  } = usePdfTemplate();
  const { additionalData } = useAdditionalData();

  const initialFilters = { q: '' };
  const [filterValues, setFilterValues] = useState(initialFilters);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [templateToArchive, setTemplateToArchive] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const { permission } = usePermissions();
  const navigate = useNavigate();
  const [errors, setErrors] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { setPageTitle } = useTitle();
  const location = useLocation();
  const searchDebounceRef = useRef(null);
  const requestSeqRef = useRef(0);
  const [activeEllipsisMenu, setActiveEllipsisMenu] = useState(null);

  useEffect(() => {
    setPageTitle(archived ? 'Archived PDF Templates' : 'PDF Templates');
  }, [setPageTitle, archived]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    setErrors(null);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page')) || 1;

      const loadedFilters = { q: params.get('q') || '' };
      setFilterValues(loadedFilters);

      const filters = {};
      if (loadedFilters.q) filters.q = loadedFilters.q;
      filters.status = archived ? 0 : 1;

      const seq = ++requestSeqRef.current;
      try {
        const response = await getPdfTemplates(page, filters, true);

        if (seq !== requestSeqRef.current) return;

        if (response?.status && response?.status !== 200) {
          setPdfTemplates([]);
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
  }, [location, archived]);

  const handleArchive = (template) => {
    setShowArchiveConfirm(true);
    setTemplateToArchive(template);
  };

  const handleDelete = (template) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this template?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
      confirmButtonColor: "#d33",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await deletePdfTemplate(template.id);
  
          if (!response || response.status !== 200) {
            Swal.showValidationMessage(
              response?.message || "Failed to delete template."
            );
            return false;
          }
  
          return response;
        } catch (error) {
          Swal.showValidationMessage(
            error?.message || "Something went wrong."
          );
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const response = result.value;
  
        Swal.fire({
          title: "Deleted!",
          text: response?.message || "Template deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
  
        navigate(getRoutePath('/settings/pdf-templates/archived'));
      }
    });
  };

  const confirmArchive = async () => {
    if (templateToArchive) {
      showLoader();
      try {
        const result = await archivePdfTemplate(templateToArchive.id);
        if (result && result?.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setTemplateToArchive(null);
          navigate(getRoutePath('/settings/pdf-templates'));
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
    if (templateToArchive) {
      showLoader();
      try {
        const result = await unarchivePdfTemplate(templateToArchive.id);
        if (result && result.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setTemplateToArchive(null);
          navigate(getRoutePath('/settings/pdf-templates'));
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

  const buildActiveFilters = (values = filterValues) => {
    const filters = {};
    filters.is_archived = archived;
    if (values.q) filters.q = values.q;
    return filters;
  };

  const runFilterRequest = async (filters) => {
    const seq = ++requestSeqRef.current;
    const response = await getPdfTemplates(1, filters, true);

    if (seq !== requestSeqRef.current) return;

    if (response?.status && response?.status !== 200) {
      setPdfTemplates([]);
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

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      runFilterRequest(buildActiveFilters(nextValues));
    }, 400);
  };

  const applyFilters = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    const newUrl = new URL(window.location);
    Object.entries(filterValues).forEach(([k, v]) => {
      if (!v) {
        newUrl.searchParams.delete(k);
      } else {
        newUrl.searchParams.set(k, v);
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

    runFilterRequest(buildActiveFilters(initialFilters));
  };

  const { currentPage = 1, perPage = 10 } = pagination || {};

  const columns = [
    {
      header: '#',
      accessor: 'sno',
      className: 'w-10',
      render: (row, index) => (
        <div className="flex items-center justify-center">
          <span className="text-gray-500">
            {((currentPage - 1) * perPage) + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <span className="font-medium text-gray-900">{row.name}</span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="text-gray-600">{row.category?.name || row.category_name || '-'}</span>
      ),
    },
    {
      header: 'Screening Type',
      accessor: 'screening_type_id',
      render: (row) => {
        const type = additionalData?.screeningTypes?.find(
          (s) => String(s.id) === String(row.screening_type_id)
        );
        return <span className="text-gray-600">{type?.name || '-'}</span>;
      },
    },
    {
      header: 'Clinic',
      accessor: 'clinic',
      render: (row) => (
        <span className="text-gray-600">{row.clinic?.name || row.clinic_name || '-'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          row.status === 1 || row.status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status === 1 || row.status === 'Active' ? 'Active' : 'Inactive'}
        </span>
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
            <Link to={getRoutePath(`/settings/pdf-templates/${row.id}/edit`)} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="Edit">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
          )}

          {!archived ? (
            <button
              title="archive"
              onClick={() => handleArchive(row)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <ArchiveBoxIcon className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                title="unarchive"
                onClick={() => handleArchive(row)}
                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-200"
              >
                <ArrowUpCircleIcon className="w-5 h-5" />
              </button>

              <button 
              title="delete"
              onClick={() => handleDelete(row)}
               className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
              <TrashIcon className="w-5 h-5" />
              </button>
            </>
          )}

          <EllipsisMenu
            row={row}
            activeMenu={activeEllipsisMenu}
            setActiveMenu={setActiveEllipsisMenu}
            menus={[
              {
                label: 'View',
                path: (r) => getRoutePath(`/settings/pdf-templates/view/${r.id}`),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumb />

      <ErrorHandle errors={errors} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {archived ? 'Archived PDF Templates' : 'PDF Templates'}
        </h1>
        <div className="flex items-center space-x-2">
          {!archived ? (
            <>
              <button
                onClick={() => navigate(getRoutePath('/settings/pdf-templates/archived'))}
                className="inline-flex items-center justify-center px-4 py-2 btn-warning w-full sm:w-auto text-sm sm:text-base"
              >
                <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                 Archived 
              </button>

              <button
                onClick={() => navigate(getRoutePath('/settings/pdf-templates/create'))}
                className="inline-flex items-center justify-center px-4 py-2 btn-primary w-full sm:w-auto text-sm sm:text-base"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Template
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate(getRoutePath('/settings/pdf-templates'))}
              className="inline-flex items-center justify-center px-4 py-2 w-full sm:w-auto btn-primary text-sm sm:text-base"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Templates
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Filters</h3>
        </div>
        <div className="pb-3 mb-4 p-2">
          <Filters
            filters={[
              {
                key: 'q',
                type: 'search',
                placeholder: 'Search templates...',
                value: filterValues.q,
              },
            ]}
            onFilterChange={filtersData}
            onApply={applyFilters}
            onReset={resetFilters}
            applyLabel="Filter"
            resetLabel="Reset"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={pdfTemplates}
        isDataLoaded={isDataLoaded}
        emptyMessage={archived ? 'No archived PDF templates found' : 'No PDF templates found'}
        permissions={{ 'read': permission(7, 'read'), 'write': permission(7, 'write') }}
      />

      <Pagination
        currentPage={pagination.currentPage}
        lastPage={pagination.lastPage}
        onPageChange={(page) => {
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('page', page);
          window.history.pushState({}, '', newUrl);
          const filters = buildActiveFilters();
          getPdfTemplates(page, filters, true);
        }}
      />

      {/* Archive/Unarchive Confirmation Modal */}
      <Modal
        isOpen={showArchiveConfirm}
        onClose={() => {
          setShowArchiveConfirm(false);
          setTemplateToArchive(null);
        }}
        title={archived ? 'Unarchive PDF Template' : 'Archive PDF Template'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {archived
              ? `Are you sure you want to unarchive "${templateToArchive?.name}"?`
              : `Are you sure you want to archive "${templateToArchive?.name}"?`
            }
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowArchiveConfirm(false);
                setTemplateToArchive(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={archived ? confirmUnarchive : confirmArchive}
              className={archived ? 'btn-primary' : 'btn-danger'}
            >
              {archived ? 'Unarchive' : 'Archive'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PdfTemplateList;
