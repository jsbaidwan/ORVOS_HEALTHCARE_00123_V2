import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import { useClinic } from '../../context/ClinicContext';
import StatsCard from './StatsCard';
import { useTitle } from "../../context/TitleContext";
import Table from '../Common/Table';
import { useUser } from '../../context/UserContext';
import { useRoutePath } from '../../hooks/useRoutePath';
import { PreviewImage } from '../Patients/EyeImageUploader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { patients, getPatients } = usePatient();
  const { clinics, getClinics } = useClinic();
  const { users, getUsers } = useUser();
  const { setPageTitle } = useTitle();
  const getRoutePath = useRoutePath();

  const pendingPatients = patients?.filter(patient => patient.diagnosis_status === 0) || [];
  const completedPatients = patients?.filter(patient => patient.diagnosis_status === 1) || [];
  const orvosDoctors = users?.filter(user => user.role_id === 2) || [];
  const topOrvosDoctors = orvosDoctors?.slice(0, 5) || [];

  useEffect(() => {
    getClinics(1, { active: 1 }, false);
  }, [getClinics]);

  useEffect(() => {
    getPatients(1, {}, false);
  }, [getPatients]);

  useEffect(() => {
    getUsers(1, { active: 1 }, false);
  }, [getUsers]);

  const topClinics = clinics?.slice(0, 5) || [];

  const clinicColumns = [
    {
      header: 'Clinics',
      accessor: 'name',
      render: (row) => (
        <div className="w-48">
          <div className="flex items-center">

            <div className="h-10 w-10 min-w-10 shrink-0 rounded-full bg-gray-200 mr-3 flex items-center justify-center overflow-hidden">
              {row?.display_image?.status === 200 ? (
                <div className="w-full h-full object-cover">
                  <PreviewImage
                    preview={row?.display_image?.src}
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

            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 break-words">
                {row?.name}
              </div>

              <div className="text-xs text-gray-500">
                <Link
                  to={getRoutePath(`/clinics/view/${row.id}`)}
                  className="text-primary hover:text-primary-700 break-words"

                >
                  {row?.code || "-"}
                </Link>
              </div>
            </div>

          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'poc_email',
      render: (row) => (
        <p className="text-sm text-primary-500">{row.poc_email || '-'}</p>
      )
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (row) => (
        <p className="text-sm text-gray-500 truncate" title={row?.city ? `${row.city}${row.state?.name ? `, ${row.state.name}` : ''}` : row?.address || '-'}>
          {row?.city ? `${row.city}${row.state?.name ? `, ${row.state.name}` : ''}` : row?.address || '-'}
        </p>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`text-sm ${row?.status === 1 ? 'text-gray-500' : 'text-red-500'}`}>
          {row?.is_active_status?.name
            ? row.is_active_status.name.charAt(0).toUpperCase() + row.is_active_status.name.slice(1)
            : (row?.status === 1 ? 'Active' : 'Inactive')}
        </span>
      )
    }
  ];

  useEffect(() => {
    setPageTitle("Dashboard");
  }, [setPageTitle]);

  const stats = [
    {
      title: 'Total Clinics',
      value: clinics?.length || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Orvos Doctors',
      value: orvosDoctors?.length || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Pending Patients',
      value: pendingPatients?.length,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed Patients',
      value: completedPatients?.length,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Patients',
      value: pendingPatients?.length + completedPatients?.length,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const doctorColumns = [
    {
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <div className="w-48">
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

            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 break-words">
                {row?.first_name} {row?.last_name}
              </div>

              <Link
                to={getRoutePath(`/users/view/${row.id}`)}
                className="text-primary hover:text-primary-700 break-words"

              >
                {row.code || "-"}
              </Link>
            </div>

          </div>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      render: (row) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {row.first_name || '-'} {row.last_name || '-'}
        </span>
      ),

    },

  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to {process.env.REACT_APP_NAME} Dashboard</h1>
        <p className="text-primary-100">Manage your medical clinic operations efficiently</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Pending & Completed Patients Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Patients Card */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">

            {/* Left Side */}
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                Pending Patients
              </h2>

            </div>

            {/* Right Side */}
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              {pendingPatients?.length}
            </span>

          </div>

          <div className="space-y-3 mb-4">
            {pendingPatients?.slice(0, 5)?.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors duration-200 cursor-pointer"
                onClick={() => navigate(getRoutePath(`/patients/view/${patient.id}`))}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-yellow-700 font-semibold text-sm">
                      {patient?.first_name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {patient?.first_name} {patient?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{patient?.clinic?.name || '-'}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}

            {pendingPatients?.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No pending patients</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate(getRoutePath('/patients/pending'))}
            className="w-full btn-primary"
          >
            View All Pending
          </button>
        </div>

        {/* Completed Patients Card */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">

            {/* Left Side */}
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                Completed Patients
              </h2>

            </div>

            {/* Right Side */}
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              {completedPatients?.length}
            </span>

          </div>

          <div className="space-y-3 mb-4">
            {completedPatients?.slice(0, 5)?.map((patient) => (

              < div
                key={patient.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200 cursor-pointer"
                onClick={() => navigate(getRoutePath(`/patients/view/${patient.id}`))}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-semibold text-sm">
                      {patient?.first_name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {patient?.first_name} {patient?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{patient?.clinic?.name}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

            ))}

            {completedPatients?.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No completed patients</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate(getRoutePath('/patients/completed'))}
            className="w-full btn-primary"
          >
            View All Completed
          </button>
        </div>
      </div>

      {/* Clinics and Doctors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinics Table */}
        <div className="bg-white rounded-xl shadow-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Clinics</h2>
            <button
              onClick={() => navigate(getRoutePath('/clinics'))}
              className="btn-primary text-sm px-4 py-1.5"
            >
              View all
            </button>
          </div>
          <div className="mb-4">
            <Table
              columns={clinicColumns}
              data={topClinics}
              emptyMessage="No clinics available"
              isDataLoaded={true}
              onRowClick={(row) => navigate(getRoutePath(`/clinics/view/${row.id}`))}
              permissions={{ read: true, write: true }}
            />
          </div>
        </div>

        {/* Orvos Doctors */}
        <div className="bg-white rounded-xl shadow-card p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Orvos Doctors</h2>
            <button
              onClick={() => navigate(getRoutePath('/users/orvos-doctor'))}
              className="btn-primary text-sm px-4 py-1.5"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">

            <Table
              columns={doctorColumns}
              data={topOrvosDoctors}
              emptyMessage="No doctors available"
              isDataLoaded={true}
              onRowClick={(row) => navigate(getRoutePath(`/users/view/${row.id}`))}
              permissions={{ read: true, write: true }}
            />

          </div>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
