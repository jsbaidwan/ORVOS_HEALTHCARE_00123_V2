import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { usePatient } from '../../context/PatientContext';
import FormField from '../UI/FormField';
import Table from '../Common/Table';
import Breadcrumb from '../Common/Breadcrumb';

const Reports = () => {
  const { getActiveeClinics } = useClinic();
  const { patients } = usePatient();
  const [selectedClinic, setSelectedClinic] = useState('');
  const [reportType, setReportType] = useState('clinic-patients');

  const clinics = getActiveeClinics();

  const getClinicPatients = () => {
    if (!selectedClinic) return patients;
    return patients.filter(p => p.clinic === selectedClinic);
  };

  const clinicPatients = getClinicPatients();

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Clinic', 'Status', 'Medical Condition', 'Date Added'];
    const data = clinicPatients.map(p => [
      `${p.firstName} ${p.lastName}`,
      p.email,
      p.phone,
      p.clinic,
      p.status,
      p.medicalCondition,
      p.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Breadcrumb />
      <div className="bg-primary rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-primary-100">Generate and view clinic reports</p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Report Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            label="Report Type"
            name="reportType"
            type="select"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'clinic-patients', label: 'Clinic Patients' },
              { value: 'doctor-review', label: 'Orvos Doctor Review' },
            ]}
          />

          <FormField
            label="Select Clinic"
            name="clinic"
            type="select"
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            options={[
              { value: '', label: 'All Clinics' },
              ...clinics.map(c => ({ value: c.companyName, label: c.companyName }))
            ]}
          />
        </div>

        <button onClick={exportToCSV} className="btn-primary flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{clinicPatients.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {clinicPatients.filter(p => p.status === 'Pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {clinicPatients.filter(p => p.status === 'Completed').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Clinics</p>
              <p className="text-2xl font-bold text-purple-600">{clinics.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Details</h2>
        
        <Table
          columns={[
            {
              header: 'Patient',
              accessor: 'name',
              sortValue: (row) => `${row.firstName} ${row.lastName}`,
              render: (row) => (
                <div>
                  <p className="font-semibold text-gray-900">{row.firstName} {row.lastName}</p>
                  <p className="text-xs text-gray-500">{row.email}</p>
                </div>
              ),
            },
            {
              header: 'Clinic',
              accessor: 'clinic',
            },
            {
              header: 'Contact',
              accessor: 'phone',
            },
            {
              header: 'Condition',
              accessor: 'medicalCondition',
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  row.status === 'Pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {row.status}
                </span>
              ),
            },
            {
              header: 'Date',
              accessor: 'createdAt',
              sortValue: (row) => new Date(row.createdAt).getTime(),
              render: (row) => new Date(row.createdAt).toLocaleDateString(),
            },
          ]}
          data={clinicPatients}
          emptyMessage="No patients found for the selected criteria"
        />
      </div>
    </div>
  );
};

export default Reports;


