import React, { useEffect } from 'react';
import ChangePassword from './ChangePassword';
import Breadcrumb from '../Common/Breadcrumb';
import { useTitle } from '../../context/TitleContext';

const Settings = () => {
  const { setPageTitle } = useTitle();

  useEffect(() => {
    setPageTitle('Change Password');
  }, [setPageTitle]);

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <div className="bg-white rounded-xl shadow-card overflow-hidden p-6">
        <ChangePassword />
      </div>
    </div>
  );
};

export default Settings;
