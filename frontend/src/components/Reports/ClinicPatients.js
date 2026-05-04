import React, { useState, useEffect, useRef } from 'react';
import { useReport } from '../../context/ReportContext';
import { useTitle } from '../../context/TitleContext';
import Breadcrumb from '../Common/Breadcrumb';
import Filters from '../Common/Filters';
import ErrorHandle from '../Common/ErrorHandle';
import PageLoader from '../Common/PageLoader';

const ClinicPatients = () => {
  const {
    reports,
    setReports,
    getClinicPatientsReport,
  } = useReport();

  const initialFilters = {
    from_date: '',
    to_date: '',
    month: '',
  };

  const [filterValues, setFilterValues] = useState(initialFilters);
  const [errors, setErrors] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { setPageTitle } = useTitle();
  const requestSeqRef = useRef(0);
  const [filterErrors, setFilterErrors] = useState(null);

  useEffect(() => {
    setPageTitle('Clinic Patients');
  }, [setPageTitle]);

  useEffect(() => {
    setErrors(null);
    setReports({});

    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const loadedFilters = {
        from_date: params.get('from_date') || '',
        to_date: params.get('to_date') || '',
        month: params.get('month') || '',
      };
      setFilterValues(loadedFilters);

      const filters = {};
      if (loadedFilters.from_date) filters.from_date = loadedFilters.from_date;
      if (loadedFilters.to_date) filters.to_date = loadedFilters.to_date;
      if (loadedFilters.month) filters.month = loadedFilters.month;

      const seq = ++requestSeqRef.current;
      try {
        const response = await getClinicPatientsReport(1, filters, false);

        if (seq !== requestSeqRef.current) return;

        if (response?.status && response?.status !== 200) {
          setReports({});
          setErrors({ general: response?.message });
        }
        setIsDataLoaded(true);
      } catch (error) {
        if (seq !== requestSeqRef.current) return;
        setIsDataLoaded(true);
        setErrors({ general: error?.message || 'An error occurred' });
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getClinicPatientsReport]);

  const buildActiveFilters = (values = filterValues) => {
    const filters = {};
    if (values.from_date) filters.from_date = values.from_date;
    if (values.to_date) filters.to_date = values.to_date;
    if (values.month) filters.month = values.month;
    return filters;
  };

  const runFilterRequest = async (filters) => {
    setFilterErrors(null);
    setErrors(null);
    const seq = ++requestSeqRef.current;
    const response = await getClinicPatientsReport(1, filters, false);

    if (response?.errors) {
      setFilterErrors(response?.errors || null);
    }
    if (seq !== requestSeqRef.current) return;

    if (response?.status && response?.status !== 200) {
      setReports({});
      setErrors({ general: response?.message });
    }
  };

  const filtersData = (key, value) => {
    if (!(key in initialFilters)) return;
    const nextValues = { ...filterValues, [key]: value };
    setFilterValues(nextValues);
  };

  const applyFilters = () => {
    const newUrl = new URL(window.location);
    Object.entries(filterValues).forEach(([k, v]) => {
      if (!v) {
        newUrl.searchParams.delete(k);
      } else {
        newUrl.searchParams.set(k, v);
      }
    });
    window.history.pushState({}, '', newUrl);

    runFilterRequest(buildActiveFilters());
  };

  const resetFilters = () => {
    setFilterValues(initialFilters);

    const newUrl = new URL(window.location);
    Object.keys(initialFilters).forEach((k) => newUrl.searchParams.delete(k));
    window.history.pushState({}, '', newUrl);

    runFilterRequest(buildActiveFilters(initialFilters));
  };

  const filterConfig = [
    {
      key: 'from_date',
      type: 'date',
      label: 'Reference date from',
      value: filterValues.from_date,
    },
    {
      key: 'to_date',
      type: 'date',
      label: 'Reference date to',
      value: filterValues.to_date,
    },
    {
      key: 'month',
      type: 'month',
      label: 'Select month',
      placeholder: 'Select month',
      value: filterValues.month,
    },
  ];

  const patientsUploaded = reports?.patientsUploaded || {};
  const totalSummary = reports?.totalSummary || {};

  return (
    <div className="py-6">
      <Breadcrumb removeSegemnts={['reports']} />

      <div className="mb-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Clinic Patients</h1>
        </div>
      </div>

      <ErrorHandle errors={errors} />

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <Filters
          filters={filterConfig}
          onFilterChange={filtersData}
          onApply={applyFilters}
          onReset={resetFilters}
          applyLabel="Filter"
          resetLabel="Reset"
          layout="row" // Optional prop if Filters supports horizontal layouts
          errors={filterErrors}
        />
      </div>

      {isDataLoaded ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Clinic Patients Summary</h3>
            </div>

            <div className="p-6 space-y-8">
              {Object.keys(patientsUploaded).length === 0 ? (
                <div className="text-center text-gray-500 py-4">No data available</div>
              ) : (
                Object.entries(patientsUploaded).map(([clinicName, doctors]) => (
                  <div key={clinicName} className="mb-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">{clinicName}</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Doctor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                              Patients Count
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(doctors).map(([doctorName, count]) => {
                            if (doctorName === 'Total') return null; // Handle Total at the end
                            return (
                              <tr key={doctorName} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                                  {doctorName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                  {count}
                                </td>
                              </tr>
                            );
                          })}
                          {/* Total Row */}
                          {doctors['Total'] !== undefined && (
                            <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                Total
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {doctors['Total']}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Total Summary</h3>
            </div>
            <div className="p-6">
              {Object.keys(totalSummary).length === 0 ? (
                <div className="text-center text-gray-500 py-4">No data available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                          Patients Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(totalSummary).map(([doctorName, count]) => {
                        if (doctorName === 'Total') return null;
                        return (
                          <tr key={doctorName} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                              {doctorName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                              {count}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Total Row */}
                      {totalSummary['Total'] !== undefined && (
                        <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Total
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {totalSummary['Total']}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Clinic Patients Summary</h3>
          </div>
          <PageLoader loading={true} title="Clinic Patients Report..." />
        </div>
      )}
    </div>
  );
};

export default ClinicPatients;
