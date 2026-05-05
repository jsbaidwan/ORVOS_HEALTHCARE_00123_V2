import React, { useState, useEffect, useRef } from 'react';
import { useClinicStaffs } from '../../../context/ClinicStaffsContext';
import Table from '../../Common/Table';
import Pagination from '../../Common/Pagination';
import Breadcrumb from '../../Common/Breadcrumb';
import Filters from '../../Common/Filters';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRoutePath } from '../../../hooks/useRoutePath';
import ErrorHandle from '../../Common/ErrorHandle';
import { useTitle } from '../../../context/TitleContext';
import { usePermissions } from '../../../context/PermissionsContext';
import { PreviewImage } from '../../Patients/EyeImageUploader';

const StaffsList = () => {
    const { id: clinicId } = useParams();
    const {
        staffs,
        setStaffs,
        pagination,
        getStaffs,
    } = useClinicStaffs();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const getRoutePath = useRoutePath();
    const navigate = useNavigate();
    const [errors, setErrors] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const { setPageTitle } = useTitle();
    const { permission } = usePermissions();
    const [tab, setTab] = useState(1);
    const prevTab = useRef(tab);
    const searchDebounceRef = useRef(null);
    const requestSeqRef = useRef(0);

    useEffect(() => {
        setPageTitle('Clinic Staffs');
    }, [setPageTitle]);

    useEffect(() => {
        setTab(1);
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, []);

    useEffect(() => {
        setErrors(null);
        if (tab !== prevTab.current) {
            setStaffs([]);
        }
        prevTab.current = tab;

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = null;
        }

        const loadData = async () => {
            const params = new URLSearchParams(window.location.search);
            const page = parseInt(params.get('page')) || 1;
            const q = params.get('q') || '';
            const active = params.get('active') || 'all';

            setSearchTerm(q);
            setStatusFilter(active);

            const filters = {};
            if (q) filters.q = q;
            if (active && active !== 'all') filters.active = active;
            filters.active = tab;

            const seq = ++requestSeqRef.current;
            try {
                const response = await getStaffs(clinicId, page, filters, true);

                if (seq !== requestSeqRef.current) return;

                if (response?.status && response?.status !== 200) {

                    setStaffs(response?.clinicUsers || []);
                    setErrors({ general: response?.message });
                }
                setIsDataLoaded(true);
            } catch (error) {
                if (seq !== requestSeqRef.current) return;
                setIsDataLoaded(true);
                setErrors({ general: error });
            }
        };

        if (clinicId) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useLocation(), tab, clinicId]);

    const runFilterRequest = async (filters) => {
        const seq = ++requestSeqRef.current;
        const response = await getStaffs(clinicId, 1, filters, true);

        if (seq !== requestSeqRef.current) return;

        if (response?.status && response?.status !== 200) {
            setStaffs([]);
            setErrors({ general: response?.message });
        }
    };

    const filtersData = (key, value) => {
        if (key === 'q') setSearchTerm(value);
        if (key === 'active') setStatusFilter(value);

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

        if (key === 'active') {
            filters.active = value;
            if (value && value !== 'all') {
                newUrl.searchParams.set('active', value);
            } else {
                newUrl.searchParams.delete('active');
            }
        }

        newUrl.searchParams.delete('page');
        window.history.pushState({}, '', newUrl);

        if (key === 'q') {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = setTimeout(() => {
                runFilterRequest(filters);
            }, 400);
            return;
        }

        runFilterRequest(filters);
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            render: (row) => (
                <div className="w-auto">
                    <div className="flex items-center">
                        <div className="h-10 w-10 min-w-10 shrink-0 rounded-full bg-gray-200 mr-3 flex items-center justify-center overflow-hidden">
                            {row?.user?.profile_image?.status === 200 ? (
                                <div className="w-full h-full object-cover">
                                    <PreviewImage
                                        preview={row?.user?.profile_image?.src}
                                        hasCustomClass="h-10 w-10 object-contain"
                                        hasRemoveButton={false}
                                        hasViewButton={false}
                                        index={0}
                                        key={0}
                                    />
                                </div>
                            ) : (
                                <span className="text-gray-500 text-sm">
                                    {row?.user?.first_name?.charAt(0)?.toUpperCase() || row?.user?.first_name?.charAt(0)?.toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 lg:min-w-full">
                            <div className="text-sm font-medium text-gray-900 break-words">
                                {row?.user?.first_name || `${row.user?.first_name || ''} ${row.user?.last_name || ''}`}

                            </div>

                            <div className="text-sm">
                                <span className="text-primary hover:text-primary-700">
                                    {row?.user?.email || "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (row) => (
                <div>
                    {console.log(row)}
                    <p className="text-gray-900 text-sm">{row?.user?.roles?.[0]?.name || row?.user?.role?.name || '-'}</p>
                </div>
            ),
        },
        {
            header: 'Contact',
            accessor: 'phone',
            render: (row) => (
                <div>
                    <p className="text-gray-900 text-sm">{row?.user?.phone_number || '-'}</p>
                </div>
            ),
        },
        {
            header: 'Status',
            accessor: 'active',
            sortable: false,
            render: (row) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${row?.user?.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                >
                    {row?.user?.is_active_status?.name
                        ? row?.user?.is_active_status.name.charAt(0).toUpperCase() + row?.user?.is_active_status.name.slice(1)
                        : (row?.user?.status === 1 ? 'Active' : 'Inactive')}
                </span>
            ),
        },
        {
            header: 'Created At',
            accessor: 'created_at',
            sortValue: (row) => row?.formated_created_at,
            render: (row) => (
                <div>
                    <p className="text-gray-900 text-sm">{row?.formated_created_at || row.created_at}</p>
                </div>
            ),
        },
        {
            header: 'Actions',
            accessor: 'actions',
            sortable: false,
            render: (row) => (
                <div className="flex items-center space-x-2">
                    {/* Action buttons can go here */}
                </div>
            ),
        },
    ];

    const handlePageChange = async (page) => {
        let filters = {};
        filters.active = tab;

        if (searchTerm) filters.q = searchTerm;
        if (statusFilter && statusFilter !== 'all') filters.active = statusFilter;

        await getStaffs(clinicId, page, filters, true);

        const newUrl = new URL(window.location);
        newUrl.searchParams.set('page', page);
        window.history.pushState({}, '', newUrl);
    };

    const filterConfig = [
        {
            key: 'q',
            type: 'search',
            placeholder: 'Search staffs...',
            value: searchTerm,
        },
    ];

    return (
        <div className="py-6">
            <Breadcrumb />

            <div className="mb-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Clinic Staffs</h1>

                    <div className="flex flex-wrap justify-end items-center gap-3 w-full">
                        <button
                            onClick={() => navigate(getRoutePath('/clinics'))}
                            className="inline-flex items-center justify-center px-4 py-2 w-full sm:w-auto btn-primary text-sm sm:text-base"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back to Clinics
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {/* <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setTab(1)}
                    className={`px-4 py-2 font-medium transition-all duration-200 ${tab === 1
                        ? "flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 border-b-2 border-primary-600 text-primary-600 bg-primary-50"
                        : "flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setTab(0)}
                    className={`px-4 py-2 font-medium transition-all duration-200 ${tab === 0
                        ? "flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 border-b-2 border-primary-600 text-primary-600 bg-primary-50"
                        : "flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                >
                    Inactive
                </button>
            </div> */}

            <ErrorHandle errors={errors} />
            <Filters filters={filterConfig} onFilterChange={filtersData} />

            <div className='bg-white rounded-t-lg p-2 border border-gray-200 shadow-sm'>
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Staffs</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Clinic staffs and details.
                    </p>
                </div>
            </div>
            <div className="mb-6">
                <Table
                    columns={columns}
                    data={staffs || []}
                    emptyMessage="No staffs found"
                    isDataLoaded={isDataLoaded}
                    permissions={{ 'read': permission(1, 'read'), 'write': permission(1, 'write') }}
                />
            </div>

            {staffs?.length > 0 && (
                <Pagination
                    currentPage={pagination.currentPage}
                    lastPage={pagination.lastPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default StaffsList;
