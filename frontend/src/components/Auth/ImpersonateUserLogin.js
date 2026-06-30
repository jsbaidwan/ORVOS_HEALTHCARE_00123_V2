import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  IdentificationIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useLoader } from '../../context/LoaderContext';
import { useTitle } from '../../context/TitleContext';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { useRoutePath } from '../../hooks/useRoutePath';
import ErrorHandle from '../Common/ErrorHandle';
import { errorsFormatted } from '../../utils/errorHandler';

const impersonateSchema = yup.object({
  user_id: yup
    .string()
    .required('Please select a user to impersonate'),
});

const getUserLabel = (user) => {
  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  const role = user?.role?.name ? ` • ${user.role.name}` : '';
  return `${name || user?.email || `User #${user?.id}`}${role}`;
};

const ImpersonateUserLogin = () => {
  const { loginAsUser, user: currentUser, isSuperAdmin } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const { setPageTitle } = useTitle();
  const navigate = useNavigate();
  const getRoutePath = useRoutePath();
  const { getUsersList } = useUser();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(impersonateSchema),
    defaultValues: {
      user_id: '',
    },
  });

  const selectedUserId = watch('user_id');

  useEffect(() => {
    setPageTitle('Impersonate User');
  }, [setPageTitle]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);

      try {
        const list = await getUsersList({ active: 1, is_archived: 0 });
        const activeUsers = (Array.isArray(list) ? list : [])
          .filter((item) => item?.id !== currentUser?.id)
          .sort((a, b) => getUserLabel(a).localeCompare(getUserLabel(b)));

        setUsers(activeUsers);
      } catch (error) {
        toast.error('Unable to load users. Please try again.');
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [getUsersList, currentUser?.id]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const label = getUserLabel(user).toLowerCase();
      const email = (user?.email || '').toLowerCase();
      return label.includes(query) || email.includes(query);
    });
  }, [users, searchQuery]);

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === String(selectedUserId)),
    [users, selectedUserId]
  );

  const onSubmit = async (data) => {
    showLoader();

    try {
      const response = await loginAsUser(data.user_id);
      if (response?.status === 200) {
        toast.success(response?.message || 'Logged in as user successfully');
        navigate(getRoutePath('/dashboard'));
      } else {
        errorsFormatted(response, setError);
      }
    } catch (error) {
      errorsFormatted(error, setError);
    } finally {
      hideLoader();
    }
  };

  if (!isSuperAdmin()) {
    return (
      <div className="min-h-[70vh] bg-white flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-600">
            Only super administrators can impersonate another user account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <IdentificationIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Impersonate User</h2>
              <p className="text-sm text-gray-500">Sign in as another user for support or testing</p>
            </div>
          </div>

          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                Actions performed while impersonating a user will appear as that user. Use this feature responsibly.
              </p>
            </div>
          </div>

          <ErrorHandle errors={errors} title="Unable to switch user" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="user-search" className="block text-sm font-semibold text-gray-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="user-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name, email, or role"
                  className="pl-10 text-black input-field"
                  disabled={loadingUsers}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="user_id" className="block text-sm font-semibold text-gray-700">
                  Select User
                </label>
                <span className="text-xs text-gray-500">
                  {loadingUsers ? 'Loading...' : `${filteredUsers.length} available`}
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircleIcon className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  id="user_id"
                  {...register('user_id')}
                  disabled={loadingUsers || filteredUsers.length === 0}
                  className={`pl-10 text-black input-field appearance-none ${
                    errors?.user_id ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                >
                  <option value="">
                    {loadingUsers
                      ? 'Loading users...'
                      : filteredUsers.length === 0
                        ? 'No users found'
                        : 'Choose a user'}
                  </option>
                  {filteredUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {getUserLabel(user)} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {errors?.user_id && (
                <p className="mt-1 text-sm text-red-600">{errors.user_id.message}</p>
              )}
            </div>

            {selectedUser && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  Selected User
                </p>
                <p className="text-sm font-semibold text-gray-900">{getUserLabel(selectedUser)}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || loadingUsers || !selectedUserId}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Switching User...' : 'Switch User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImpersonateUserLogin;
