import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import Breadcrumb from '../Common/Breadcrumb';
import ErrorHandle from '../Common/ErrorHandle';
import { useRoutePath } from '../../hooks/useRoutePath';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { useTitle } from '../../context/TitleContext';
import NoRecord from '../Common/NoRecord';
import useBlobUrl from '../../hooks/useBlobUrl';
import BlobFileItem from '../UI/BlobFileItem';

const UserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getRoutePath = useRoutePath();
  const { getUserById,getExistingUser } = useUser();

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const [user, setUser] = useState(null);

  const { setPageTitle } = useTitle();

  useEffect(() => {
    setPageTitle('User View');
  }, [setPageTitle]);

     
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setErrors(null);
  
      try {
        const existingUser = getExistingUser(id);
  
        // ✅ Use cached data if available
        if (existingUser) {
          setUser(existingUser);
          setLoading(false);
          
        }
  
        // ❌ Otherwise call API
        const data = await getUserById(id,{action:'view'});
        
        if (data?.status && data?.status !== 200) {
          setErrors({
            general: data?.message || 'Unable to load user'
          });
        } else {
          setUser(data?.user);
        }
  
      } catch (err) {
        setErrors({
          general: err?.message || 'Something went wrong'
        });
      } finally {
        setLoading(false);
      }
    };
  
    if (id) loadDetails();
  
  }, [id, getUserById, getExistingUser]);
   

  const { blobUrl } = useBlobUrl(user?.display_avatar?.src || '');
  const imgBlobUrl = blobUrl
  
  return (
    <div className="py-6  mx-auto">
      <Breadcrumb />
  
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          User Details
        </h1>
  
        <button
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white btn-primary rounded-lg shadow"
          onClick={() => navigate(getRoutePath('/users'))}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>
  
      <ErrorHandle errors={errors} />
  
      {/* Main Card */}
      <div className={`bg-white rounded-lg shadow border ${loading ? 'animate-pulse opacity-70' : ''}`}>
        
        {/* Top Section */}
        <div className="flex items-center gap-6 p-6 border-b">
          
          {/* Logo */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {!imgBlobUrl ? (
              <UserIcon className="w-10 h-10 text-gray-400" />
            ) : (
              <img
                src={imgBlobUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
  
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.first_name || '-'} {user?.last_name || '-'}
            </h2>
            <p className="text-sm text-gray-500">
              Code: {user?.code || '-'}
            </p>
  
            <div className="mt-2 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user?.status === 1
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {user?.is_active_status?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
  
        {/* Details Grid */}
        {user ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  
            {[
              { label: 'Email', value: user?.email },
              { label: 'Phone', value: user?.phone_number },
              { label: 'Address', value: user?.address },
              { label: 'User Type', value: user?.role?.name || '-' },
              { label: 'Archived', value: user?.is_archived ? 'Yes' : 'No' },
               
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="mt-1 font-medium text-gray-900 break-words">
                  {item.value || '-'}
                </p>
              </div>
            ))}
   
  
            {/* Files */}
            <div className="md:col-span-2 lg:col-span-3 bg-gray-50 rounded-xl p-4 border">
              <p className="text-xs text-gray-500 mb-2">Contract Documents</p>
  
              {user?.display_documents?.length ? (
                <div className="space-y-2">
                  {user.display_documents.map((file, index) =>
                    file.status === 200 && (
                      <BlobFileItem
                        key={index}
                        file={file}
                        index={index}
                        onRemove={null}
                        onRemoveEnable={false}
                      />
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No files available</p>
              )}
            </div>
  
          </div>
        ) : (
          !loading && <NoRecord message="User not found" />
        )}
      </div>
    </div>
  );
};

export default UserView;