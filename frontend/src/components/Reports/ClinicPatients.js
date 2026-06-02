import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useReport } from '../../context/ReportContext';
import { useTitle } from '../../context/TitleContext';
import Breadcrumb from '../Common/Breadcrumb';
import Filters from '../Common/Filters';
import ErrorHandle from '../Common/ErrorHandle';
import PageLoader from '../Common/PageLoader';
import {
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

/* ── helpers ────────────────────────────────── */
const formatMonthLabel = (ym) => {
  // ym = "2026-05"  →  "May'26"
  const [y, m] = ym.split('-');
  const dt = new Date(Number(y), Number(m) - 1, 1);
  const short = dt.toLocaleString('en', { month: 'short' });
  return `${short}'${y.slice(-2)}`;
};

const ClinicPatients = () => {
  const {
    reports,
    setReports,
    getClinicPatientsReport,
    exportReport,
  } = useReport();

  const initialFilters = {
    from_date: '',
    to_date: '',
    month: '',
    clinics: [],
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
        clinics: params.getAll('clinics[]').length
          ? params.getAll('clinics[]')
          : params.get('clinics')
            ? params.get('clinics').split(',')
            : [],
      };
      setFilterValues(loadedFilters);

      const filters = {};
      if (loadedFilters.from_date) filters.from_date = loadedFilters.from_date;
      if (loadedFilters.to_date) filters.to_date = loadedFilters.to_date;
      if (loadedFilters.month) filters.month = loadedFilters.month;
      if (loadedFilters.clinics.length) filters.clinics = loadedFilters.clinics;

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
    if (values.clinics?.length) filters.clinics = values.clinics;
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
      if (k === 'clinics') {
        newUrl.searchParams.delete('clinics[]');
        newUrl.searchParams.delete('clinics');
        if (Array.isArray(v) && v.length) {
          v.forEach((id) => newUrl.searchParams.append('clinics[]', id));
        }
      } else if (!v) {
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
    Object.keys(initialFilters).forEach((k) => {
      newUrl.searchParams.delete(k);
      newUrl.searchParams.delete(k + '[]');
    });
    window.history.pushState({}, '', newUrl);

    runFilterRequest(buildActiveFilters(initialFilters));
  };

  /* ── data from API ──────────────────────── */
  const patientsUploaded = reports?.patientsUploaded || {};
  const totalSummary = reports?.totalSummary || {};
  const allMonths = useMemo(() => reports?.allMonths || [], [reports?.allMonths]);
  const monthlyBilling = useMemo(() => reports?.monthlyBilling || {}, [reports?.monthlyBilling]);
  const monthlyBillingByDoctor = reports?.monthlyBillingByDoctor || {};
  const clinicsList = useMemo(() => reports?.clinics || [], [reports?.clinics]);

  const hasData = Object.keys(patientsUploaded).length > 0;

  /* ── clinics options for multi-select ───── */
  const clinicOptions = useMemo(
    () => clinicsList.map((c) => ({ label: c.name, value: String(c.id) })),
    [clinicsList]
  );

  /* ── filter config ────────────────────────── */
  const filterConfig = [
    {
      key: 'from_date',
      type: 'date',
      label: 'From Date',
      value: filterValues.from_date,
    },
    {
      key: 'to_date',
      type: 'date',
      label: 'To Date',
      value: filterValues.to_date,
    },
    {
      key: 'month',
      type: 'month',
      label: 'Pick Month',
      placeholder: 'Select month',
      value: filterValues.month,
    },
    {
      key: 'clinics',
      type: 'multi-select',
      label: 'Clinics',
      placeholder: 'Choose Clinic',
      options: clinicOptions,
      value: filterValues.clinics,
    },
  ];

  /* ── computed monthly totals ─────────────── */
  const grandMonthlyTotals = useMemo(() => {
    const totals = {};
    allMonths.forEach((m) => {
      totals[m] = Object.values(monthlyBilling).reduce(
        (s, clinicMonths) => s + (clinicMonths?.[m] ?? 0),
        0
      );
    });
    return totals;
  }, [allMonths, monthlyBilling]);

  const grandTotal = useMemo(
    () => Object.values(grandMonthlyTotals).reduce((s, v) => s + v, 0),
    [grandMonthlyTotals]
  );


  const exportExcel = async (endpoint) => {

    const params = new URLSearchParams();
    if (filterValues.from_date) params.set('from_date', filterValues.from_date);
    if (filterValues.to_date) params.set('to_date', filterValues.to_date);
    if (filterValues.month) params.set('month', filterValues.month);
    if (filterValues.clinics?.length) {
      filterValues.clinics.forEach((id) => params.append('clinics[]', id));
    }

    const getExportExcel = await exportReport(filterValues, endpoint);
    if (getExportExcel?.status === 200) {
      const link = document.createElement('a');
      link.href = getExportExcel.data.url;
      link.download = endpoint + '.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <div className="py-6">
      <Breadcrumb removeSegments={['reports']} />

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
          layout="row"
          errors={filterErrors}
        />
        {hasData && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => exportExcel('clinic-patient')}

              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        )}
      </div>

      {isDataLoaded ? (
        <>
          {/* ───────── Monthly Summary ───────── */}
          {hasData && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Summary</h3>
              </div>

              <div className="p-6">
                {/* Grand Total Banner */}
                <div className="rounded-lg mb-4" style={{ background: '#d4edda' }}>
                  <div className="px-4 py-3">
                    <div className="flex flex-wrap items-center text-center gap-y-3">
                      <div className="w-full md:w-auto px-3 mb-3 md:mb-0">
                        <h6 className="font-bold text-sm mb-0">Grand Total</h6>
                      </div>
                      {allMonths.map((month) => (
                        <div key={month} className="flex-1 min-w-[80px] px-2 mb-3 md:mb-0">
                          <div className="text-xs text-gray-500">{month}</div>
                          <div className="font-bold text-sm">{grandMonthlyTotals[month] || 0}</div>
                        </div>
                      ))}
                      <div className="w-auto px-3">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="font-bold text-sm">{totalSummary?.['Total'] ?? grandTotal}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left border border-gray-200 font-semibold">#</th>
                        <th className="px-3 py-2 text-left border border-gray-200 font-semibold">Clinic / Doctor</th>
                        {allMonths.map((month) => (
                          <th key={month} className="px-3 py-2 text-center border border-gray-200 font-semibold">
                            {formatMonthLabel(month)}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-center border border-gray-200 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(patientsUploaded).map(([clinic, doctors], clinicIdx) => {
                        const doctorEntries = Object.entries(doctors).filter(([k]) => k !== 'Total');
                        const clinicMonthData = monthlyBilling[clinic] || {};
                        const clinicDoctorMonthData = monthlyBillingByDoctor[clinic] || {};

                        return (
                          <React.Fragment key={clinic}>
                            {/* Clinic header row */}
                            <tr style={{ background: '#e2e6ea' }}>
                              <td className="px-3 py-2 border border-gray-200 font-bold">{clinicIdx + 1}</td>
                              <td
                                className="px-3 py-2 border border-gray-200 font-bold whitespace-nowrap"
                                colSpan={allMonths.length + 2}
                              >
                                {clinic}
                              </td>
                            </tr>

                            {/* Doctor rows */}
                            {doctorEntries.map(([doctorName]) => {
                              const doctorMonthData = clinicDoctorMonthData[doctorName] || {};
                              const doctorRowTotal = allMonths.reduce(
                                (s, m) => s + (doctorMonthData[m] ?? 0),
                                0
                              );
                              return (
                                <tr key={doctorName} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 border border-gray-200"></td>
                                  <td className="px-3 py-2 border border-gray-200 whitespace-nowrap pl-6">
                                    {doctorName}
                                  </td>
                                  {allMonths.map((m) => (
                                    <td key={m} className="px-3 py-2 border border-gray-200 text-center">
                                      {doctorMonthData[m] ?? 0}
                                    </td>
                                  ))}
                                  <td className="px-3 py-2 border border-gray-200 text-center">{doctorRowTotal}</td>
                                </tr>
                              );
                            })}

                            {/* Clinic total row */}
                            <tr style={{ background: '#f0f0f0' }}>
                              <td className="px-3 py-2 border border-gray-200"></td>
                              <td className="px-3 py-2 border border-gray-200 font-bold whitespace-nowrap">
                                {clinic} - Total
                              </td>
                              {allMonths.map((m) => (
                                <td key={m} className="px-3 py-2 border border-gray-200 text-center font-bold">
                                  {clinicMonthData[m] ?? 0}
                                </td>
                              ))}
                              <td className="px-3 py-2 border border-gray-200 text-center font-bold">
                                {allMonths.reduce((s, m) => s + (clinicMonthData[m] ?? 0), 0)}
                              </td>
                            </tr>

                            {/* spacer */}
                            {clinicIdx < Object.keys(patientsUploaded).length - 1 && (
                              <tr>
                                <td
                                  colSpan={allMonths.length + 3}
                                  style={{ border: 'none', height: '10px' }}
                                ></td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ border: 'none' }}>
                        <td colSpan={allMonths.length + 3} style={{ border: 'none' }}></td>
                      </tr>
                      <tr style={{ border: 'none' }}>
                        <td colSpan={allMonths.length + 3} style={{ border: 'none' }}></td>
                      </tr>
                      <tr style={{ background: '#d4edda' }}>
                        <td className="px-3 py-2 border border-gray-200"></td>
                        <td className="px-3 py-2 border border-gray-200 font-bold">Grand Total</td>
                        {allMonths.map((m) => (
                          <td key={m} className="px-3 py-2 border border-gray-200 text-center font-bold">
                            {grandMonthlyTotals[m] || 0}
                          </td>
                        ))}
                        <td className="px-3 py-2 border border-gray-200 text-center font-bold">{grandTotal}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ───────── Total Summary ───────── */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Total Summary</h3>
            </div>
            <div className="p-6">
              {Object.keys(totalSummary).length === 0 ? (
                <div className="text-center text-gray-500 py-4">No Record Found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                          Total Patients
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(totalSummary).map(([doctorName, count], idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        return (
                          <tr
                            key={doctorName}
                            className={isLast ? 'bg-gray-50 font-bold' : 'hover:bg-gray-50 transition-colors duration-150'}
                          >
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isLast ? 'text-gray-900 font-bold' : 'text-primary font-medium'}`}>
                              {doctorName}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isLast ? 'text-gray-900 font-bold' : 'text-gray-900 font-semibold'}`}>
                              {count}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 animate-pulse opacity-70">
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
