import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import Table from '../Common/Table';
import Pagination from '../Common/Pagination';
import Modal from '../Common/Modal';
import Breadcrumb from '../Common/Breadcrumb';
import Filters from '../Common/Filters';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoader } from '../../context/LoaderContext';
import { useRoutePath } from '../../hooks/useRoutePath';
import ErrorHandle from '../Common/ErrorHandle';
import { useTitle } from '../../context/TitleContext';
import { usePermissions } from '../../context/PermissionsContext';
import { ArchiveBoxIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline';
import { PreviewImage } from '../Patients/EyeImageUploader';
import { useUserRoleSlugs } from '../../constants/userRoles';
import EllipsisMenu from '../Common/EllipsisMenu';

const UsersList = ({ archived = false, roleId: roleIdProp = null }) => {
  const {
    users,
    setUsers,
    pagination,
    getUsers,
    getUsersList,
    archiveUser,
    unarchiveUser,
  } = useUser();

  const initialFilters = {
    q: '',
    user_ids: [],
    emails: [],
  };
  const [filterValues, setFilterValues] = useState(initialFilters);
  const [filterOptionUsers, setFilterOptionUsers] = useState([]);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  const [errors, setErrors] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { setPageTitle } = useTitle();
  const { permission } = usePermissions();
  const [tab, setTab] = useState(1);
  const prevTab = useRef(tab);
  const location = useLocation();
  const userRoleSlugs = useUserRoleSlugs();
  const searchDebounceRef = useRef(null);
  const requestSeqRef = useRef(0);
  const [activeEllipsisMenu, setActiveEllipsisMenu] = useState(null);

  const parseListParam = (value) =>
    !value ? [] : String(value).split(',').map((v) => v.trim()).filter(Boolean);

  const roleEntry = roleIdProp
    ? userRoleSlugs.find((r) => r.roleId === roleIdProp)
    : null;
  const roleSlug = roleEntry?.slug || null;
  const roleTitle = roleEntry?.title || null;
  const listBasePath = roleSlug ? `/users/${roleSlug}` : '/users';
  const archivedBasePath = roleSlug ? `/users/${roleSlug}/archived` : '/users/archived';

  const getUserSlug = (rid) =>
    userRoleSlugs.find((r) => r.roleId === Number(rid))?.slug || null;
  const buildEditPath = (row) => {
    const slug = getUserSlug(row?.role_id);
    return slug ? `/users/${slug}/${row.id}/edit` : `/users/${row.id}/edit`;
  };
  const buildViewPath = (row) => {
    const slug = getUserSlug(row?.role_id);
    return slug ? `/users/${slug}/view/${row.id}` : `/users/view/${row.id}`;
  };

  useEffect(() => {

    const base = roleTitle ? `${roleTitle}` : 'Users';
    setPageTitle(archived ? `Archived ${base}` : base);
  }, [setPageTitle, archived, roleTitle]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    setErrors(null);
    if (tab !== prevTab.current) {
      setUsers([])
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page')) || 1;
      const roleId = roleIdProp ?? params.get('role_id') ?? '';

      const loadedFilters = {
        q: params.get('q') || '',
        user_ids: parseListParam(params.get('user_ids')),
        emails: parseListParam(params.get('emails')),
      };
      setFilterValues(loadedFilters);

      const filters = {};
      if (loadedFilters.q) filters.q = loadedFilters.q;
      if (loadedFilters.user_ids.length) filters.user_ids = loadedFilters.user_ids;
      if (loadedFilters.emails.length) filters.emails = loadedFilters.emails;
      if (roleId) filters.role_id = roleId;
      filters.active = tab;
      filters.is_archived = archived;

      const seq = ++requestSeqRef.current;
      try {
        const response = await getUsers(page, filters, true);

        if (seq !== requestSeqRef.current) return;

        if (response?.status && response?.status !== 200) {
          setUsers([]);
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
  }, [location, tab, roleIdProp, archived]);

  useEffect(() => {
    const loadOptions = async () => {
      const optionFilters = {};
      if (roleIdProp) optionFilters.role_id = roleIdProp;
      optionFilters.is_archived = archived;
      optionFilters.active = tab;
      const list = await getUsersList(optionFilters);
      setFilterOptionUsers(Array.isArray(list) ? list : []);
    };
    loadOptions();
  }, [getUsersList, roleIdProp, archived, tab]);


  const handleArchive = (user) => {
    setShowArchiveConfirm(true);
    setUserToArchive(user);
  };

  const confirmArchive = async () => {
    if (userToArchive) {
      showLoader();
      try {
        const result = await archiveUser(userToArchive.id);
        if (result && result?.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setUserToArchive(null);
          navigate(getRoutePath(listBasePath));
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
    if (userToArchive) {
      showLoader();
      try {
        const result = await unarchiveUser(userToArchive.id);
        if (result && result.status === 200) {
          toast.success(result?.message);
          setShowArchiveConfirm(false);
          setUserToArchive(null);
          navigate(getRoutePath(listBasePath));
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
    filters.active = tab;
    filters.is_archived = archived;

    const params = new URLSearchParams(window.location.search);
    const roleId = roleIdProp ?? params.get('role_id');
    if (roleId) filters.role_id = roleId;

    if (values.q) filters.q = values.q;
    if (values.user_ids?.length) filters.user_ids = values.user_ids;
    if (values.emails?.length) filters.emails = values.emails;

    return filters;
  };

  const runFilterRequest = async (filters) => {
    const seq = ++requestSeqRef.current;
    const response = await getUsers(1, filters, true);

    if (seq !== requestSeqRef.current) return;

    if (response?.status && response?.status !== 200) {
      setUsers([]);
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
      const isEmpty = Array.isArray(v) ? v.length === 0 : !v;
      if (isEmpty) {
        newUrl.searchParams.delete(k);
      } else if (Array.isArray(v)) {
        newUrl.searchParams.set(k, v.join(','));
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

  let columns = [
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
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <div className="w-auto">
          <div className="flex items-center">

            <div className="h-10 w-10 min-w-10 shrink-0 rounded-full bg-gray-200 mr-3 flex items-center justify-center overflow-hidden">
              {row?.display_avatar?.status === 200 ? (
                <div className="w-full h-full object-cover">
                  <PreviewImage
                    preview={row.display_avatar.src}
                    hasCustomClass="h-10 w-10 object-cover"
                    hasRemoveButton={false}
                    hasViewButton={false}
                    index={0}
                    key={0}
                  />
                </div>
              ) : (
                <span className="text-gray-500 text-sm">
                  {row.first_name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 lg:min-w-full">
              <div className="text-sm font-medium text-gray-900 break-words">
                {row?.first_name} {row?.last_name}
              </div>

              <Link
                to={getRoutePath(buildViewPath(row))}
                className="text-primary hover:text-primary-700 break-words"
                target="_blank"
              >
                {row.code || "-"}
              </Link>
            </div>

          </div>
        </div>
      ),
    },

    {
      header: 'Contact',
      accessor: 'email',
      render: (row) => (
        <div>
          <p className="text-gray-900 text-sm">{row.email || '-'}</p>
          <p className="text-gray-500 text-xs">{row.phone_number || '-'}</p>
        </div>
      ),
    },

    {
      header: 'User Type',
      accessor: 'role_id',
      render: (row) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {row.role?.name || '-'}
        </span>
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
            : row.active === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Clinics',
      accessor: 'clinics',
      sortable: false,
      render: (row) => (
        <>
          <ul className="px-3 py-1 text-xs font-semibold  text-blue-800">
            {row?.clinic_users?.length > 0 ? (
              row.clinic_users.map((c, index) => (
                <li key={c.clinic_id}>
                  <Link
                    to={getRoutePath(`/clinics/view/${c.clinic_id}`)}
                    className='underline'
                  >
                    {c?.clinic?.name}
                  </Link>

                </li>
              ))
            ) : (
              "-"
            )}
          </ul>
        </>
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
      className: 'w-10',
      render: (row) => (
        <div className="flex items-center">

          <Link to={getRoutePath(buildEditPath(row))} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="Edit">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>

          <button
            onClick={() => handleArchive(row)}
            className="p-2 hover:bg-warning-50 rounded-lg transition-colors duration-200"
            title={archived ? 'Unarchive' : 'Archive'}
          >
            {archived ? <ArrowUpCircleIcon className="w-5 h-5 text-warning" /> : <ArchiveBoxIcon className="w-5 h-5 text-warning" />}
          </button>

          <EllipsisMenu
            row={row}
            activeMenu={activeEllipsisMenu}
            setActiveMenu={setActiveEllipsisMenu}
            menus={[
              {
                label: "View",
                path: (row) => getRoutePath(`/users/view/${row.id}`),

              }
            ]}
          />

        </div>
      ),
    },
  ];

  if (roleIdProp === 2) {
    columns = columns.filter(c => !['clinics'].includes(c.accessor));
  }

  const handlePageChange = async (page) => {
    await getUsers(page, buildActiveFilters(), true);

    const newUrl = new URL(window.location);
    newUrl.searchParams.set('page', page);
    window.history.pushState({}, '', newUrl);
  };

  const nameOptions = filterOptionUsers.map((u) => ({
    value: String(u.id),
    label: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || `#${u.id}`,
  }));

  const emailOptions = Array.from(
    new Map(
      filterOptionUsers
        .filter((u) => !!u.email)
        .map((u) => [u.email, { value: u.email, label: u.email }])
    ).values()
  );

  const filterConfig = [
    {
      key: 'user_ids',
      type: 'multi-select',
      label: 'Names',
      placeholder: 'Select names...',
      value: filterValues.user_ids,
      options: nameOptions,
    },
    {
      key: 'emails',
      type: 'multi-select',
      label: 'Emails',
      placeholder: 'Select emails...',
      value: filterValues.emails,
      options: emailOptions,
    },
  ];

  return (
    <div className="py-6">
      <Breadcrumb />

      <div className="mb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

          <h1 className="text-2xl font-semibold text-gray-900">
            {roleTitle ? `${roleTitle}` : 'Users'}
          </h1>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {!archived ? (
              <>
                <button
                  onClick={() => navigate(getRoutePath(archivedBasePath))}
                  className="inline-flex items-center justify-center px-4 py-2 btn-warning w-full sm:w-auto text-sm sm:text-base"
                >
                  <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                  Archived Users
                </button>

              </>
            ) : (
              <button
                onClick={() => navigate(getRoutePath(listBasePath))}
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
            ? 'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 border-b-2 border-primary-600 text-primary-600 bg-primary-50'
            : 'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          Active
        </button>
        <button
          onClick={() => setTab(0)}
          className={`px-4 py-2 font-medium transition-all duration-200 ${tab === 0
            ? 'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 border-b-2 border-primary-600 text-primary-600 bg-primary-50'
            : 'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          Inactive
        </button>
      </div>

      <ErrorHandle errors={errors} />

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className='border-b border-gray-200 pb-3 mb-4'>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Filters</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            User filter options and details.
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
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{roleTitle ? `${roleTitle}` : 'Users'}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            User information and details.
          </p>
        </div>
      </div>
      <div className="mb-6">
        <Table
          columns={columns}
          data={users || []}
          emptyMessage="No users found"
          isDataLoaded={isDataLoaded}
          permissions={{ read: permission(3, 'read'), write: permission(3, 'write') }}

        />
      </div>

      {users?.length > 0 && (
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
          setUserToArchive(null);
        }}
        title={`Confirm ${archived ? 'Unarchive' : 'Archive'}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to archive <strong>{userToArchive?.first_name} {userToArchive?.last_name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowArchiveConfirm(false);
                setUserToArchive(null);
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

export default UsersList;
