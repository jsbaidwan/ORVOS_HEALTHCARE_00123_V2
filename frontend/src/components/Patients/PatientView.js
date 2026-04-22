import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import Breadcrumb from '../Common/Breadcrumb';
import ErrorHandle from '../Common/ErrorHandle';
import { useTitle } from '../../context/TitleContext';
import NoRecord from '../Common/NoRecord';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { PreviewImage } from './EyeImageUploader';
import { useAuth } from '../../context/AuthContext';
import FormField from '../UI/FormField';
import PageLoader from '../Common/PageLoader';
import { useAdditionalData } from '../../context/AdditionalDataContext';
import Table from '../Common/Table';
import Swal from 'sweetalert2';
import { FileText, Mail } from 'lucide-react';
import Api from '../../utils/api';
import { useRoutePath } from '../../hooks/useRoutePath';
import { useNavigate } from 'react-router-dom';
import InfoItem from '../UI/InfoIteam';

const PatientView = () => {
    const { id } = useParams();
    const { getPatientById, getExistingPatient, reportDownload, sendReport } = usePatient();
    const { user, getToken } = useAuth();

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState(null);
    const [patient, setPatient] = useState(null);
    const getRoutePath = useRoutePath();
    const navigate = useNavigate();
    const [reportDownloadStatusData, setReportDownloadStatusData] = useState([]);
    const [reportSentStatusData, setReportSentStatusData] = useState([]);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

    // Stepper state for diagnosis formatting
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        rightEyeSelections: [],
        leftEyeSelections: [],
        remark: '',
        follow_up: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const { setPageTitle } = useTitle();
    const { additionalData } = useAdditionalData();

    const DIAGNOSIS_OPTIONS =
        patient?.medical_condition_id === 1
            ? additionalData?.examTypes1
            : patient?.medical_condition_id === 2
                ? additionalData?.examTypes2
                : additionalData?.examTypes;

    useEffect(() => {
        setPageTitle('Patient Details');
    }, [setPageTitle]);

    useEffect(() => {
        setReportDownloadStatusData(patient?.report_download_status_data || []);
        setReportSentStatusData(patient?.report_sent_status || []);

    }, [patient]);


    useEffect(() => {
        const loadDetails = async () => {
            setLoading(true);
            setErrors(null);

            try {
                const existingPatient = getExistingPatient(id);

                if (existingPatient) {
                    setPatient(existingPatient);
                    setLoading(false);
                }

                const data = await getPatientById(id, { action: 'view' });

                if (data?.status && data?.status !== 200) {
                    setErrors({
                        general: data?.message || 'Unable to load patient'
                    });
                } else {
                    setPatient(data?.patient);
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

    }, [id, getPatientById, getExistingPatient]);

    // Derived logic for pending / steps
    const isPending = patient?.diagnosis_status === 0 || patient?.diagnosis_status === '0';
    const isOrvosDoctor = user?.role_id === 1 || user?.role_id === 2;

    const steps = useMemo(() => {
        if (!patient) return [];
        const s = [];
        if (String(patient.r_eye) === '1') s.push('RIGHT_EYE');
        if (String(patient.l_eye) === '1') s.push('LEFT_EYE');
        s.push('COMMENTS');
        return s;
    }, [patient]);

    const currentStepName = steps[currentStep];

    const handleNext = () => {
        if (currentStepName === 'RIGHT_EYE' && formData.rightEyeSelections.length === 0) {
            setFormErrors({ rightEye: 'Please select at least one option.' });
            return;
        }
        if (currentStepName === 'LEFT_EYE' && formData.leftEyeSelections.length === 0) {
            setFormErrors({ leftEye: 'Please select at least one option.' });
            return;
        }
        setFormErrors({});
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        setFormErrors({});
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!formData.follow_up && currentStepName === 'COMMENTS') {
            setFormErrors({ follow_up: 'Please choose a follow up.' });
            return;
        }
        setFormErrors({});
        const data = new FormData();

        data.append('remark', formData.remark);

        // Left Eye
        formData.leftEyeSelections.forEach((item, index) => {
            data.append(`exam_data[leftEye][${index}][exam_type]`, item);
        });
        // Right Eye

        formData.rightEyeSelections.forEach((item, index) => {
            data.append(`exam_data[rightEye][${index}][exam_type]`, item);
        });

        data.append('follow_up', formData.follow_up);

        const api = Api(() => getToken());
        if (!api) {
            setErrors({ general: 'Unable to load API' });
            return;
        }
        setIsLoadingSubmit(true)
        const response = await api.call(`remark/${id}`, 'POST', data, true);
        if (response?.status === 200) {
            setIsLoadingSubmit(false)
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response?.message,
            });
            if (response?.data?.redirect_url) {
                navigate(getRoutePath(response?.data?.redirect_url));
                setFormData({
                    rightEyeSelections: [],
                    leftEyeSelections: [],
                    remark: '',
                    follow_up: ''
                });
                setCurrentStep(0);
            } else {
                navigate(getRoutePath('/patients/pending'));
            }

        } else {
            setIsLoadingSubmit(false)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response?.message,
            });
        }

        // Submit implementation goes here...
    };


    const rightEyeImages = patient?.display_right_eye_images?.length > 0 ? (
        patient.display_right_eye_images.map((img, i) => (
            <div key={i} className="relative rounded border border-gray-200 overflow-hidden shadow-sm">
                <PreviewImage
                    preview={img?.src || img}
                    index={i}
                    eyeType="right"
                    eyeColor="green"
                    hasRemoveButton={false}
                    fullSize={true}
                />
            </div>
        ))
    ) : (
        <div className="col-span-full h-[150px] bg-gray-100 flex items-center justify-center text-sm text-gray-400 rounded border border-gray-200">No Right Eye Images</div>
    );

    const leftEyeImages = patient?.display_left_eye_images?.length > 0 ? (
        patient.display_left_eye_images.map((img, i) => (
            <div key={i} className="relative rounded border border-gray-200 overflow-hidden shadow-sm">
                <PreviewImage
                    preview={img?.src || img}
                    index={i}
                    eyeType="left"
                    eyeColor="blue"
                    hasRemoveButton={false}
                    fullSize={true}
                />
            </div>
        ))
    ) : (
        <div className="col-span-full h-[150px] bg-gray-100 flex items-center justify-center text-sm text-gray-400 rounded border border-gray-200">No Left Eye Images</div>
    );


    const handlePDFDownload = (id) => {

        Swal.fire({
            title: "Are you sure?",
            text: "You want to download this patient's report?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, download it!",
            cancelButtonText: "No, cancel!",
            reverseButtons: true,
            confirmButtonColor: "#009efb",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const response = await reportDownload(id);

                    if (!response || response.status !== 200) {
                        Swal.showValidationMessage(
                            response?.data?.message || 'Failed to generate report. Please try again.'
                        );
                        return false;
                    }

                    return response;

                } catch (error) {
                    Swal.showValidationMessage('Something went wrong. Please try again.');
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const response = result.value;
                if (response.status === 200) {
                    const base64 = response.data.pdf;

                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "application/pdf" });

                    const blobUrl = URL.createObjectURL(blob);

                    const link = document.createElement("a");
                    link.href = blobUrl;
                    link.download = response.data.fileName || "report.pdf";
                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                    setReportDownloadStatusData(response?.data?.report_download_status_data || []);

                    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

                    Swal.fire({
                        title: "Report Downloaded",
                        text: response?.data?.message,
                        icon: "success",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#009efb",
                        timer: 2000,
                        timerProgressBar: true
                    });
                } else {

                    return Swal.showValidationMessage('Failed to generate report. Please try again.');
                }

            }
        });

    }

    const handlePDFSend = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to send this patient's report?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, send it!",
            cancelButtonText: "No, cancel!",
            reverseButtons: true,
            confirmButtonColor: "#009efb",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const response = await sendReport(id);

                    if (!response || response.status !== 200) {
                        Swal.showValidationMessage(
                            response?.data?.message || 'Failed to send report. Please try again.'
                        );
                        return false;
                    }

                    return response;

                } catch (error) {
                    Swal.showValidationMessage('Something went wrong. Please try again.');
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const response = result.value;
                if (response.status === 200) {
                    Swal.fire({
                        title: "Report Sent",
                        text: response?.data?.message,
                        icon: "success",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#009efb",
                        timer: 2000,
                        timerProgressBar: true
                    });
                    setReportSentStatusData(response?.data?.report_sent_status || []);

                } else {
                    return Swal.showValidationMessage('Failed to send report. Please try again.');
                }
            }
        });
    }

    let columns = [
        {
            header: 'PDF Download Status',
            accessor: 'report_download_status_data',
            render: (row) => {
                return <>
                    <button className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#009efb] hover:bg-[#0089db] rounded shadow-sm focus:outline-none' onClick={() => handlePDFDownload(row.id)}>
                        <FileText className='w-4 h-4 mr-2' /> Download
                    </button>
                    <div className="flex items-center gap-2 mt-2">
                        <p className='text-black'>Status:-</p>
                        <span className={`${reportDownloadStatusData?.class} text-sm`}>
                            {reportDownloadStatusData?.name}
                        </span>
                    </div>
                </>
            }
        },
        {
            header: 'Patient Report Email',
            accessor: 'patient_report_email_enabled',
            render: (row) => {
                return <>
                    <button className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-warning hover:bg-warning rounded shadow-sm focus:outline-none' onClick={() => handlePDFSend(row.id)}>
                        <Mail className='w-4 h-4 mr-2' /> Send
                    </button>
                    <div className="flex items-center gap-2 mt-2">
                        <p className='text-black'>Status:-</p>
                        <span className={`${reportSentStatusData?.class} text-sm`}>
                            {reportSentStatusData?.status}
                        </span>
                    </div>
                </>
            }
        },
        {
            header: 'Fax Status',
            accessor: 'fax_status',
            render: (row) => {
                return <>
                    <div className="flex items-center gap-2 mt-2">
                        <p className='text-black'>Status:-</p>
                        <span className={`${row.fax_status_data?.class} text-sm`}>
                            {row.fax_status_data?.name}
                        </span>
                    </div>
                </>
            }
        },
        {
            header: 'DICOM File Status',
            accessor: 'dicom_file_status',
            render: (row) => {
                return <>
                    <div className="flex items-center gap-2 mt-2">
                        <p className='text-black'>Status:-</p>
                        <span className={`${row.dicom_file_status_data?.class} text-sm`}>
                            {row.dicom_file_status_data?.name}
                        </span>
                    </div>
                </>
            }
        },
    ];

    // remove by accessor
    const removeColumn = (accessor) => {
        const index = columns.findIndex(col => col.accessor === accessor);
        if (index !== -1) columns.splice(index, 1);
    };


    // remove columns dynamically
    if (patient?.clinic?.is_patient_report_email_enabled === 0) {
        removeColumn('patient_report_email_enabled');
    }

    if (patient?.clinic?.is_fax_enabled === 0) {
        removeColumn('fax_status');
    }

    if (patient?.clinic?.is_stow_enabled === 0) {
        removeColumn('dicom_file_status');
    }

    return (
        <div className="py-6 mx-auto">
            <Breadcrumb />

            <ErrorHandle errors={errors} />

            <div className={`bg-white rounded-lg shadow-sm border ${loading ? 'animate-pulse opacity-70' : ''} ${isOrvosDoctor ? 'orvos-doctor-section' : ''}`}>

                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
                    <p className="mt-1 text-sm  ">
                        Basic information about the patient.
                    </p>
                </div>

                <PageLoader loading={loading} title="Loading Patient Details..." />

                {patient ? (
                    <div className="p-6">

                        {/* CONDITIONAL RENDER BASED ON isPending */}
                        {isPending && isOrvosDoctor ? (
                            <>
                                {/* 1. TOP SUMMARY GRID FOR PENDING STATUS */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-200">
                                    {/* Column 1 */}
                                    <div className="space-y-1">
                                        <InfoItem label="Patient Name" value={`${patient?.first_name || ''} ${patient?.last_name || ''}`} />
                                        <InfoItem label="#EMR" value={patient?.ehr} />
                                        <InfoItem label="Medical History" value={Array.isArray(patient?.medical_history_data) ? patient.medical_history_data?.map((item) => item.name).join(', ') : '-'} />
                                        <InfoItem label="Note" value={patient?.note} />
                                        <InfoItem label="Doctor's Comments" value="No Yet remark by orvos doctor" valueClass="text-red-500 font-medium" />
                                    </div>
                                    {/* Column 2 */}
                                    <div className="space-y-1">
                                        <InfoItem
                                            label="Patient Code"
                                            valueNode={
                                                <div>
                                                    <div>{patient?.p_code || '-'}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {patient?.created_at ? `(${new Date(patient.created_at).toLocaleDateString()})` : ''}
                                                    </div>
                                                </div>
                                            }
                                        />
                                        <InfoItem label="DOB" value={patient?.dob} />
                                        <InfoItem label="Gender" value={patient?.gender_data?.name} />
                                        <InfoItem
                                            label="Diagnosis Status"
                                            valueNode={
                                                patient?.diagnosis_status_data ? (
                                                    <span className={`text-${patient?.diagnosis_status_data?.color || 'green'}-600 font-medium`}>
                                                        {patient.diagnosis_status_data.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 font-medium">{patient?.diagnosis_status || 'Completed'}</span>
                                                )
                                            }
                                        />
                                        <InfoItem label="DOS" value={patient?.dos} />
                                    </div>
                                    {/* Column 3 */}
                                    <div className="space-y-1">
                                        <InfoItem label="Clinic Name" value={patient?.clinic?.name} />
                                        <InfoItem label="Clinic Note" value={patient?.clinic_note || patient?.clinic?.note} />
                                        <InfoItem label="Medical Condition" value={patient?.medical_condition?.name || patient?.medical_condition_data?.name} />

                                    </div>
                                </div>

                                {/* 2. DIAGNOSIS STEPPER FORM (Below the top summary grid) */}
                                <div className="pt-4 w-full max-w-5xl">
                                    <div className="mb-4">

                                        <div className={currentStepName === 'RIGHT_EYE' ? 'block' : 'hidden'}>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 mb-2">Right Eye: Yes</div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    {rightEyeImages}

                                                </div>
                                            </div>
                                        </div>

                                        <div className={currentStepName === 'LEFT_EYE' ? 'block' : 'hidden'}>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 mb-2">Left Eye: Yes</div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    {leftEyeImages}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={currentStepName === 'COMMENTS' ? 'block' : 'hidden'}>
                                            <div className="space-y-2 max-w-2xl">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Comments</label>
                                                    <FormField
                                                        type="textarea"
                                                        name="remark"
                                                        value={formData.remark}
                                                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                                        placeholder="Enter remark here"
                                                        rows="4"
                                                        className="w-full border border-gray-300 rounded-md p-3 text-sm  focus:ring-primary focus:border-primary shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow Up <span className="text-red-500">*</span></label>
                                                    <FormField
                                                        type="select"
                                                        name="follow_up"
                                                        value={formData.follow_up}
                                                        onChange={(e) => setFormData({ ...formData, follow_up: e.target.value })}
                                                        options={additionalData?.followUps?.map((item) => ({ value: item?.id, label: item?.name }))}
                                                        error={formErrors.follow_up}

                                                    />

                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* 3. STEP SPECIFIC BOTTOM SECTIONS (Checkboxes) & BUTTONS */}
                                    <div className={currentStepName === 'RIGHT_EYE' ? 'block' : 'hidden'}>
                                        <div className="mb-4 pt-4 border-t border-gray-100">
                                            <div className="text-sm font-semibold mb-2 text-gray-800">Right Eye ({patient?.medical_condition?.name || patient?.medical_condition_data?.name || 'Condition'})</div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                                {DIAGNOSIS_OPTIONS?.rightEye?.map((opt, i) => (
                                                    <label key={i} className="flex items-center space-x-2 border border-gray-200 rounded p-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors">
                                                        <input type="checkbox"
                                                            className="h-4 w-4 text-[#009efb] rounded border-gray-300 focus:ring-[#009efb]"
                                                            checked={formData.rightEyeSelections.includes(opt?.id)}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    rightEyeSelections: checked
                                                                        ? [...prev.rightEyeSelections, opt?.id]
                                                                        : prev.rightEyeSelections.filter(x => x !== opt?.id)
                                                                }));
                                                            }}
                                                        />
                                                        <span>{opt?.name} {opt?.code ? `(${opt?.code})` : ''}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {formErrors.rightEye && <p className="text-red-500 text-sm mt-3 font-medium">Please select at least one option.</p>}
                                        </div>
                                    </div>

                                    <div className={currentStepName === 'LEFT_EYE' ? 'block' : 'hidden'}>
                                        <div className="mb-4 pt-4 border-t border-gray-100">
                                            <div className="text-sm font-semibold mb-2 text-gray-800">Left Eye ({patient?.medical_condition?.name || patient?.medical_condition_data?.name || 'Condition'})</div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                                {DIAGNOSIS_OPTIONS?.leftEye?.map((opt, i) => (
                                                    <label key={i} className="flex items-center space-x-2 border border-gray-200 rounded p-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors">
                                                        <input type="checkbox"
                                                            className="h-4 w-4 text-[#009efb] rounded border-gray-300 focus:ring-[#009efb]"
                                                            checked={formData.leftEyeSelections.includes(opt?.id)}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    leftEyeSelections: checked
                                                                        ? [...prev.leftEyeSelections, opt?.id]
                                                                        : prev.leftEyeSelections.filter(x => x !== opt?.id)
                                                                }));
                                                            }}
                                                        />
                                                        <span>{opt?.name} {opt?.code ? `(${opt?.code})` : ''}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {formErrors.leftEye && <p className="text-red-500 text-sm mt-3 font-medium">Please select at least one option.</p>}
                                        </div>
                                    </div>

                                    {/* Actions Container */}
                                    <div className="flex space-x-3 mt-6">
                                        {currentStep > 0 && (
                                            <button onClick={handlePrevious} className="px-5 py-2.5 bg-gray-500 text-white font-medium rounded-md text-sm hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm">
                                                Previous
                                            </button>
                                        )}
                                        {currentStep < steps.length - 1 ? (
                                            <button onClick={handleNext} className="px-5 py-2.5 bg-[#009efb] text-white font-medium rounded-md text-sm hover:bg-[#0089db] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009efb] shadow-sm">
                                                Next
                                            </button>
                                        ) : (
                                            isLoadingSubmit ? (
                                                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-medium rounded-md text-sm shadow-sm cursor-not-allowed">
                                                    <svg
                                                        className="animate-spin h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                        ></path>
                                                    </svg>
                                                    Loading...
                                                </span>
                                            ) : (
                                                <button onClick={handleSubmit} className="px-5 py-2.5 bg-green-500 text-white font-medium rounded-md text-sm hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm">
                                                    Submit
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* COMPLETED VIEW DESIGN */}
                                {/* Images Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-4">Right Eye Images</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[120px]">
                                            {patient?.display_right_eye_images?.length > 0 ? (
                                                patient.display_right_eye_images.map((img, i) => (
                                                    <div key={i} className="relative rounded-lg overflow-hidden border">
                                                        <PreviewImage
                                                            preview={img.src ? img.src : img}
                                                            index={i}
                                                            eyeType="right"
                                                            eyeColor="green"
                                                            hasRemoveButton={false}
                                                            fullSize={true}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-400 flex items-center col-span-full">No images</div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-4">Left Eye Images</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[120px]">
                                            {patient?.display_left_eye_images?.length > 0 ? (
                                                patient.display_left_eye_images.map((img, i) => (
                                                    <div key={i} className="relative rounded-lg overflow-hidden border">
                                                        <PreviewImage
                                                            preview={img.src ? img.src : img}
                                                            index={i}
                                                            eyeType="left"
                                                            eyeColor="blue"
                                                            hasRemoveButton={false}
                                                            fullSize={true}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-400 flex items-center col-span-full">No images</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                                    {/* Column 1 */}
                                    <div className="space-y-1">
                                        <InfoItem label="Patient Name" value={`${patient?.first_name || ''} ${patient?.last_name || ''}`} />
                                        <InfoItem label="#EMR" value={patient?.ehr} />
                                        <InfoItem
                                            label="Medical History"
                                            value={Array.isArray(patient?.medical_history_data) ? patient.medical_history_data?.map((item) => item.name).join(', ') : '-'}
                                        />
                                        <InfoItem label="Note" value={patient?.note} />

                                        <InfoItem label="Left Eye Diagnosis Details" value={
                                            patient?.remark_result?.exam_data?.leftEye?.length ? (
                                                patient.remark_result.exam_data.leftEye.map((item, index, arr) => (
                                                    <span key={index}>
                                                        {item.exam_type_arr?.examType?.name}
                                                        {index < arr.length - 1 ? ', ' : '.'}
                                                        <br />
                                                    </span>
                                                ))
                                            ) : (
                                                patient?.left_eye_diagnosis_details ||
                                                patient?.diagnosis?.left_eye_details ||
                                                '-'
                                            )
                                        } />
                                        <InfoItem
                                            label="Follow Up"
                                            valueNode={
                                                <span className="inline-flex px-3 py-1 rounded-sm text-xs font-semibold bg-green-500 text-white cursor-pointer hover:bg-green-600">
                                                    {additionalData?.followUps?.find((item) => item?.id === patient?.follow_up)?.name}
                                                </span>
                                            }
                                        />
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-1">
                                        <InfoItem
                                            label="Patient Code"
                                            valueNode={
                                                <div>
                                                    <div>{patient?.p_code || '-'}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {patient?.created_at ? `(${new Date(patient.created_at).toLocaleDateString()})` : ''}
                                                    </div>
                                                </div>
                                            }
                                        />
                                        <InfoItem label="DOB" value={patient?.dob} />
                                        <InfoItem label="Gender" value={patient?.gender_data?.name} />
                                        <InfoItem
                                            label="Right Eye Diagnosis Details"
                                            valueNode={
                                                <div className="space-y-2">
                                                    <div>{
                                                        patient?.remark_result?.exam_data?.rightEye?.length ? (
                                                            patient.remark_result.exam_data.rightEye.map((item, index, arr) => (
                                                                <span key={index}>
                                                                    {item.exam_type_arr?.examType?.name}
                                                                    {index < arr.length - 1 ? ', ' : '.'}
                                                                    <br />
                                                                </span>
                                                            ))
                                                        ) : (
                                                            patient?.right_eye_diagnosis_details ||
                                                            patient?.diagnosis?.right_eye_details ||
                                                            '-'
                                                        )
                                                    }</div>
                                                </div>
                                            }
                                        />

                                    </div>

                                    {/* Column 3 */}
                                    <div className="space-y-1">
                                        <InfoItem label="Clinic Name" value={patient?.clinic?.name} />
                                        <InfoItem label="Clinic Note" value={patient?.clinic_note || patient?.clinic?.note} />
                                        <InfoItem label="Medical Condition" value={patient?.medical_condition?.name || patient?.medical_condition_data?.name} />
                                        <InfoItem
                                            label="Diagnosis Status"
                                            valueNode={
                                                patient?.diagnosis_status_data ? (
                                                    <span className={`text-${patient?.diagnosis_status_data?.color || 'green'}-600 font-medium`}>
                                                        {patient.diagnosis_status_data.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 font-medium">{patient?.diagnosis_status || 'Completed'}</span>
                                                )
                                            }
                                        />
                                        <InfoItem label="DOS" value={patient?.dos || patient?.diagnosis?.dos} />
                                        <InfoItem label="Remark At" value={patient?.remark_at || patient?.diagnosis?.remark_at} />

                                        <InfoItem
                                            label="Remark By"
                                            valueNode={
                                                patient?.remark_by ? (
                                                    <span className="text-green-600 font-medium">
                                                        {patient.remark_by.first_name} {patient.remark_by.last_name} (Orvos Doctor)
                                                    </span>
                                                ) : (
                                                    '-'
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                                {/* Bottom Actions */}
                                <div className="mt-8 border-t border-gray-100 pt-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">Clone and Re-diagnosis the Patient</h3>
                                    <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#009efb] hover:bg-[#0089db] rounded shadow-sm focus:outline-none">
                                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                                        Re diagnosis
                                    </button>
                                </div>

                                <div className="mt-8 border-t border-gray-100 pt-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">Chart Status</h3>
                                    <Table
                                        columns={columns}
                                        data={Array(patient)}
                                        emptyMessage="No chart status found"

                                    />
                                </div>
                            </>
                        )}

                    </div>
                ) : (
                    !loading && <NoRecord message="Patient not found" />
                )}
            </div>
        </div>
    );
};

export default PatientView;
