import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  
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
import { PreviewImage } from '../Patients/EyeImageUploader';

const impersonateSchema = yup.object({
  user_id: yup
    .string()
    .required('Please select a user to impersonate'),
});

const getUserLabel = (user) => {
  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
  const role = roleName ? ` • ${roleName}` : '';
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
        const list = await getUsersList();
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
      const code = (user?.code || '').toLowerCase();
      return label.includes(query) || email.includes(query) || code.includes(query);
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
      <>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            User Impersonation
          </h1>

          <p className="mt-2 text-gray-600">
            Sign in as another user for support, troubleshooting, or testing.
            All actions performed will be logged and attributed to the impersonated user.
          </p>
        </div>

        <div className="min-h-[70vh] flex items-center justify-center">
          
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border border-red-100">
                <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
              </div>

              <div className="mt-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Access Restricted
                </h1>

                <p className="mt-3 text-gray-600 max-w-lg mx-auto">
                  You do not have permission to access the User Impersonation feature.
                  This functionality is restricted to Super Administrators only for
                  security and auditing purposes.
                </p>
              </div>

              <div className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-start gap-3 text-left">
                  
                  <div>
                    <h3 className="font-semibold text-red-900">
                      Permission Required
                    </h3>

                    <p className="text-sm text-red-700 mt-1">
                      To impersonate another user, your account must have the
                      <strong> Super Admin </strong>
                      role. Contact your system administrator if you believe this is an
                      error.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <button
                  onClick={() => navigate(getRoutePath('/dashboard'))}
                  className="px-5 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition"
                >
                  Return to Dashboard
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Go Back
                </button>
              </div>

            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="p-3">
      <div className="max-w-10xl mx-auto">
  
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            User Impersonation
          </h1>
  
          <p className="mt-2 text-gray-600">
            Sign in as another user for support, troubleshooting, or testing.
            All actions performed will be logged and attributed to the impersonated user.
          </p>
        </div>
  
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">Available Users</p>
            <p className="text-3xl font-bold text-gray-900">
              {filteredUsers.length}
            </p>
          </div>
  
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">Selected User</p>
            <p className="text-3xl font-bold text-primary">
              {selectedUser ? "1" : "0"}
            </p>
          </div>
  
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">Access Level</p>
            <p className="text-lg font-semibold text-green-600">
              Super Admin
            </p>
          </div>
        </div>
  
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
  
          {/* Left Side */}
          <div className="xl:col-span-2">
  
            <div className="bg-white rounded-2xl border shadow-sm p-6">
  
              {/* Warning */}
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 shrink-0" />
  
                  <div>
                    <h3 className="font-semibold text-amber-900">
                      Security Notice
                    </h3>
  
                    <p className="text-sm text-amber-800 mt-1">
                      Actions performed while impersonating a user will appear as
                      that user. Use this feature responsibly and only for support
                      or testing purposes.
                    </p>
                  </div>
                </div>
              </div>
  
              <ErrorHandle
                errors={errors}
                title="Unable to switch user"
              />
  
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
  
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Users
                  </label>
  
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
  
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.target.value)
                      }
                      placeholder="Search by name, email, role..."
                      className="input-field pl-10 text-black"
                      disabled={loadingUsers}
                    />
                  </div>
                </div>
  
                {/* Select User */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="user_id"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Select User
                    </label>
  
                    <span className="text-xs text-gray-500">
                      {loadingUsers
                        ? "Loading..."
                        : `${filteredUsers.length} users`}
                    </span>
                  </div>
  
                  <div className="relative">
                    <UserCircleIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
  
                    <select
                      id="user_id"
                      {...register("user_id")}
                      disabled={
                        loadingUsers ||
                        filteredUsers.length === 0
                      }
                      className={`input-field pl-10 appearance-none text-black ${
                        errors?.user_id
                          ? "border-red-500"
                          : ""
                      }`}
                    >
                      <option value="">
                        {loadingUsers
                          ? "Loading users..."
                          : filteredUsers.length === 0
                          ? "No users found"
                          : "Choose a user"}
                      </option>
  
                      {filteredUsers.map((user) => (
                        <option
                          key={user.id}
                          value={user.id}
                        >
                          {getUserLabel(user)} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
  
                  {errors?.user_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.user_id.message}
                    </p>
                  )}
                </div>
  
                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    loadingUsers ||
                    !selectedUserId
                  }
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Switching User..."
                    : "Switch User"}
                </button>
              </form>
            </div>
          </div>
  
          {/* Right Side */}
          <div>
  
            <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-6">
  
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                User Preview
              </h3>
  
              {selectedUser ? (
                <>
                  <div className="flex items-center mb-5">
                    <div className="h-10 w-10 min-w-10 shrink-0 rounded-full bg-gray-200 mr-3 flex items-center justify-center overflow-hidden">
                      {selectedUser?.display_avatar?.status === 200 ? (
                        <div className="w-full h-full object-cover">
                          <PreviewImage
                            preview={selectedUser.display_avatar.src}
                            hasCustomClass="h-10 w-10 object-cover"
                            hasRemoveButton={false}
                            hasViewButton={false}
                            index={0}
                            key={0}
                          />
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {selectedUser?.first_name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
  
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">
                        {getUserLabel(selectedUser)}
                      </h4>
  
                      <p className="text-sm text-gray-500">
                        {selectedUser?.email}
                      </p>
                    </div>
                  </div>
  
                  <div className="space-y-3">
  
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">
                        User ID
                      </span>
  
                      <span className="font-medium">
                        #{selectedUser?.code}
                      </span>
                    </div>
  
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">
                        Email
                      </span>
  
                      <span className="font-medium">
                        {selectedUser?.email}
                      </span>
                    </div>
  
                    {selectedUser.role && (
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">
                          Role
                        </span>
  
                        <span className="font-medium">
                          {typeof selectedUser.role === 'string'
                            ? selectedUser.role
                            : selectedUser.role?.name}
                        </span>
                      </div>
                    )}


                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">
                        Status
                      </span>
                      
                      <span className={`font-medium ${selectedUser?.is_active_status?.class} px-3 py-1 rounded-full text-xs font-semibold`}>
                        {selectedUser?.is_active_status?.name.charAt(0).toUpperCase() + selectedUser?.is_active_status?.name.slice(1)}
                      </span>
                    </div>
  
                  </div>
  
                  <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4">
                    <p className="text-sm text-blue-800">
                      You are about to access this user's account.
                      All permissions and restrictions of the selected
                      user will apply during the impersonation session.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <UserCircleIcon className="h-16 w-16 mx-auto text-gray-300" />
  
                  <p className="mt-4 text-gray-500">
                    Select a user to view details
                  </p>
                </div>
              )}
  
            </div>
          </div>
  
        </div>
      </div>
    </div>
  );
};

export default ImpersonateUserLogin;
