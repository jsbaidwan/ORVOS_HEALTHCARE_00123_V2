import React, { useEffect } from 'react';
import { useReport } from '../../context/ReportContext';
import { useTitle } from '../../context/TitleContext';

const ClinicPatients = ({ selectedClinic }) => {
  const { getClinicPatientsReport } = useReport();
  const patients = getClinicPatientsReport(selectedClinic);
  const { setPageTitle } = useTitle();

  useEffect(() => {
    setPageTitle('Clinic Patients Report');
  }, [setPageTitle]);

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Clinic Patients Report</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">EHR#</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Condition</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-primary-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
                    <p className="text-xs text-gray-500">{patient.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.ehr}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.medicalCondition}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    patient.status === 'Pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClinicPatients;


