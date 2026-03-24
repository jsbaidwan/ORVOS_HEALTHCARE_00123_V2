import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import Table from '../Common/Table';
import Pagination from '../Common/Pagination';
import Modal from '../Common/Modal';
import Breadcrumb from '../Common/Breadcrumb';
import Filters from '../Common/Filters';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoader } from '../../context/LoaderContext';
import { useRoutePath } from '../../hooks/useRoutePath';
import ErrorHandle from '../Common/ErrorHandle';
import { useTitle } from '../../context/TitleContext';
import { usePermissions } from '../../context/PermissionsContext';

const UsersList = () => {
  const {
    users,
    setUsers,
    pagination,
    getUsers,
    deleteUser,
  } = useUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  const [errors, setErrors] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { setPageTitle } = useTitle();
  const { permission } = usePermissions();
  const [tab, setTab] = useState(1);

  useEffect(() => {
    setPageTitle('Users');
  }, [setPageTitle]);

  useEffect(() => {
    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page')) || 1;
      const q = params.get('q') || '';

      setSearchTerm(q);

      const filters = {};
      if (q) filters.q = q;
      filters.active = tab;

      try {
        const response = await getUsers(page, filters, true);

        if (response?.status && response?.status !== 200) {
          setUsers([]);
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

    const newUrl = new URL(window.location);
    let filters = {};
    filters.active = tab;

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
    const response = await getUsers(1, filters, true);

    if (response?.status && response?.status !== 200) {
      setUsers([]);
      setErrors({ general: response?.message });
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <div className="w-48">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
              <span className="text-gray-500 text-sm">{row.first_name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{row?.first_name} {row?.last_name}</div>
              <div className="text-sm text-gray-500">{row?.email || '-'}</div>
            </div>
          </div>
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
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === 1
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
          <Link to={getRoutePath(`/users/${row.id}/edit`)} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="Edit">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>

          <Link to={getRoutePath(`/users/view/${row.id}`)} className="p-2 text-primary hover:bg-primary-200 rounded-lg transition-colors duration-200" title="View">
            <EyeIcon className="w-5 h-5" />
          </Link>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setUserToDelete(row);
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

  const handlePageChange = async (page) => {
    let filters = {};
    filters.active = tab;

    if (searchTerm) filters.q = searchTerm;

    await getUsers(page, filters, true);

    const newUrl = new URL(window.location);
    newUrl.searchParams.set('page', page);
    window.history.pushState({}, '', newUrl);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      showLoader();
      try {
        const result = await deleteUser(userToDelete.id);
        if (result && result.status === 200) {
          toast.success(result?.message);
          setShowDeleteConfirm(false);
          setUserToDelete(null);
          navigate(getRoutePath('/users'));
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

  const filterConfig = [
    {
      key: 'q',
      type: 'text',
      placeholder: 'Search users...',
      value: searchTerm,
    },
  ];

  return (
    <div className="py-6">
      <Breadcrumb />

      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>

          <div className="flex flex-wrap justify-end items-center gap-3 w-full">
            <Link to={getRoutePath('/users/create')} className="inline-flex items-center justify-center px-4 py-2.5 w-full sm:w-auto border border-transparent rounded-md shadow-sm text-[0.775rem] xs:text-base font-medium text-white bg-[#009efb] hover:bg-[#0089db] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009efb]">
              <PlusIcon className="w-3 h-3 mr-1" />
              Add New User
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab(1)}
          className={`px-4 py-2 font-medium transition-all duration-200 ${
            tab === 1
              ? 'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 border-b-2 border-primary-600 text-primary-600 bg-primary-50'
              : 'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setTab(0)}
          className={`px-4 py-2 font-medium transition-all duration-200 ${
            tab === 0
              ? 'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 border-b-2 border-primary-600 text-primary-600 bg-primary-50'
              : 'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Inactive
        </button>
      </div>

      <ErrorHandle errors={errors} />
      <Filters filters={filterConfig} onFilterChange={filtersData} />

      <div className="bg-white rounded-t-lg p-2 border border-gray-200 shadow-sm">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Users</h3>
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

      <Pagination
        currentPage={pagination.currentPage}
        lastPage={pagination.lastPage}
        onPageChange={handlePageChange}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setUserToDelete(null);
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

export default UsersList;
