import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import Breadcrumb from '../Common/Breadcrumb';
import ErrorHandle from '../Common/ErrorHandle';
import { useTitle } from '../../context/TitleContext';
import NoRecord from '../Common/NoRecord';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { PreviewImage } from './EyeImageUploader';
import EyeImageSlider from './EyeImageSlider';
import { useAuth } from '../../context/AuthContext';
import FormField from '../UI/FormField';
import PageLoader from '../Common/PageLoader';
import { useAdditionalData } from '../../context/AdditionalDataContext';
import Table from '../Common/Table';
import Swal from 'sweetalert2';
import { Mail, Download, Printer, Upload } from 'lucide-react';
import Api from '../../utils/api';
import { useRoutePath } from '../../hooks/useRoutePath';
import { useNavigate } from 'react-router-dom';
import InfoItem from '../UI/InfoItem';

const PatientView = () => {
    const { id } = useParams();
    const { getPatientById, getExistingPatient, downloadReport, sendReport, sendFax, sendDicomFile, reDiagnosis } = usePatient();
    const { user, getToken } = useAuth();

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState(null);
    const [patient, setPatient] = useState(null);
    const getRoutePath = useRoutePath();
    const navigate = useNavigate();
    const [reportDownloadStatusData, setReportDownloadStatusData] = useState([]);
    const [reportSentStatusData, setReportSentStatusData] = useState([]);
    const [faxStatusData, setFaxStatusData] = useState([]);
    const [dicomStatusData, setDicomStatusData] = useState([]);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

    // Stepper state for diagnosis formatting
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        rightEyeSelections: [],
        leftEyeSelections: [],
        rightEyeTed: '',
        leftEyeTed: '',
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

    // Thyroid Eye Disease screening uses a single radio result per eye
    // (from additionalData.tedDisease) instead of multi-select exam types.
    const isTed = String(patient?.screening_type_id) === '2';
    const TED_OPTIONS = useMemo(() => additionalData?.tedDisease || [], [additionalData]);
    const tedName = (val) =>
        TED_OPTIONS.find((o) => String(o.id) === String(val))?.name || '-';

    // CAS questions definitions (from additional data) + patient's stored answers
    const CAS_QUESTIONS = useMemo(() => additionalData?.casQuestions || [], [additionalData]);
    const casAnswers = useMemo(() => {
        const raw = patient?.cas_questions;
        if (!raw) return {};
        if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
        if (Array.isArray(raw)) return { ...raw };
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                return parsed && typeof parsed === 'object' ? parsed : {};
            } catch (e) {
                return {};
            }
        }
        return {};
    }, [patient]);

    const casAnswerLabel = (q) => {
        const val = casAnswers?.[q.id];
        if (val === undefined || val === null || val === '') return '-';
        return q.options?.[val] ?? String(val);
    };

    useEffect(() => {
        setPageTitle('Patient Details');
    }, [setPageTitle]);

    useEffect(() => {
        setReportDownloadStatusData(patient?.report_download_status_data || []);
        setReportSentStatusData(patient?.report_sent_status || []);
        setFaxStatusData(patient?.fax_status_data || []);
        setDicomStatusData(patient?.dicom_file_status_data || []);

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
        if (currentStepName === 'RIGHT_EYE') {
            const invalid = isTed ? !formData.rightEyeTed : formData.rightEyeSelections.length === 0;
            if (invalid) {
                setFormErrors({ rightEye: isTed ? 'Please select an option.' : 'Please select at least one option.' });
                return;
            }
        }
        if (currentStepName === 'LEFT_EYE') {
            const invalid = isTed ? !formData.leftEyeTed : formData.leftEyeSelections.length === 0;
            if (invalid) {
                setFormErrors({ leftEye: isTed ? 'Please select an option.' : 'Please select at least one option.' });
                return;
            }
        }
        setFormErrors({});
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        setFormErrors({});
        setCurrentStep(prev => prev - 1);
    };

    // Single-page validation + submit for Thyroid Eye Disease (screening_type_id === 2)
    const handleTedSubmit = async () => {
        const errs = {};
        if (!formData.rightEyeTed) errs.rightEye = 'Please select an option.';
        if (!formData.leftEyeTed) errs.leftEye = 'Please select an option.';
        if (!formData.follow_up) errs.follow_up = 'Please choose a follow up.';

        if (Object.keys(errs).length > 0) {
            setFormErrors(errs);
            return;
        }
        setFormErrors({});
        await submitDiagnosis();
    };

    const handleSubmit = async () => {
        if (!formData.follow_up && currentStepName === 'COMMENTS') {
            setFormErrors({ follow_up: 'Please choose a follow up.' });
            return;
        }
        setFormErrors({});
        await submitDiagnosis();
    };

    const submitDiagnosis = async () => {
        const data = new FormData();

        data.append('remark', formData.remark);

        if (isTed) {
            // TED: single scalar result per eye -> exam_data: { rightEye: "1", leftEye: "2" }
            if (formData.rightEyeTed) data.append('exam_data[rightEye]', formData.rightEyeTed);
            if (formData.leftEyeTed) data.append('exam_data[leftEye]', formData.leftEyeTed);
        } else {
            // Left Eye
            formData.leftEyeSelections.forEach((item, index) => {
                data.append(`exam_data[leftEye][${index}][exam_type]`, item);
            });
            // Right Eye
            formData.rightEyeSelections.forEach((item, index) => {
                data.append(`exam_data[rightEye][${index}][exam_type]`, item);
            });
        }

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
                    rightEyeTed: '',
                    leftEyeTed: '',
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

    const bothEyeImages = patient?.display_both_eye_images?.length > 0 ? (
        patient.display_both_eye_images.map((img, i) => (
            <div key={i} className="relative rounded border border-gray-200 overflow-hidden shadow-sm">
                <PreviewImage
                    preview={img?.src || img}
                    index={i}
                    eyeType="both"
                    eyeColor="yellow"
                    hasRemoveButton={false}
                    fullSize={true}
                />
            </div>
        ))
    ) : (
        <div className="col-span-full h-[150px] bg-gray-100 flex items-center justify-center text-sm text-gray-400 rounded border border-gray-200">No Both Eye Images</div>
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
                    const response = await downloadReport(id);

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

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response?.data?.message,
                    });

                    Swal.showValidationMessage('Failed to generate report. Please try again.');
                }

                setReportDownloadStatusData(response?.data?.report_download_status_data || []);

                return false;

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

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response?.data?.message,
                    });
                    Swal.showValidationMessage('Failed to send report. Please try again.');
                }
                setReportSentStatusData(response?.data?.report_sent_status || []);
                return false;
            }
        });
    }

    const handleFaxSend = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to send this patient's fax?",
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
                    const response = await sendFax(id);

                    if (!response || response.status !== 200) {
                        Swal.showValidationMessage(
                            response?.data?.message || 'Failed to send fax. Please try again.'
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
                if (response.status_code === 2) {
                    Swal.fire({
                        title: "Fax Sent",
                        text: response?.data?.message,
                        icon: "success",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#009efb",
                        timer: 2000,
                        timerProgressBar: true
                    });


                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response?.data?.err_msg,
                    });
                    Swal.showValidationMessage('Failed to send fax. Please try again.');
                }

                setFaxStatusData(response?.data?.fax_status_data || []);
                return false;
            }
        });
    }

    const handleDicomSend = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to send this patient's DICOM file?",
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
                    const response = await sendDicomFile(id);

                    if (!response || response.status !== 200) {
                        Swal.showValidationMessage(
                            response?.data?.message || 'Failed to send DICOM file. Please try again.'
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
                if (response.status === 2) {
                    Swal.fire({
                        title: "DICOM File Sent",
                        text: response?.data?.message,
                        icon: "success",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#009efb",
                        timer: 2000,
                        timerProgressBar: true
                    });


                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response?.data?.dicom_file_status_data?.message,
                    });
                    Swal.showValidationMessage('Failed to send DICOM file. Please try again.');
                }

                setDicomStatusData(response?.data?.dicom_file_status_data || []);
                return false;
            }
        });
    }

    const handleReDiagnosis = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to re-diagnosis this patient?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, re-diagnosis it!",
            cancelButtonText: "No, cancel!",
            reverseButtons: true,
            confirmButtonColor: "#009efb",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const response = await reDiagnosis(id);

                    if (!response || response.status !== 200) {
                        Swal.showValidationMessage(
                            response?.data?.message || 'Failed to re-diagnosis. Please try again.'
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
                        title: "Re-Diagnosis",
                        text: response?.data?.message,
                        icon: "success",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#009efb",
                        timer: 2000,
                        timerProgressBar: true
                    });


                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response?.data?.message,
                    });
                    Swal.showValidationMessage('Failed to re-diagnosis. Please try again.');
                }


                return false;
            }
        });
    }

    let columns = [
        {
            header: 'PDF Download',
            accessor: 'report_download_status_data',
            sortable: false,
            render: (row) => (
                <div className="bg-white rounded-2xl shadow-sm border p-3 sm:p-4 space-y-3 min-w-[220px]">

                    <button
                        onClick={() => handlePDFDownload(row.id)}
                        className="w-full h-11 rounded btn-primary text-white text-sm font-medium flex items-center justify-center gap-2 transition"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>

                    <div className='text-xs'>
                        <p className="text-gray-500 uppercase tracking-wide">Status</p>
                        <p className={`font-medium mt-1 break-words ${reportDownloadStatusData?.class}`}>
                            {reportDownloadStatusData?.name}
                        </p>
                    </div>
                </div>
            )
        },

        {
            header: 'Email Report',
            accessor: 'patient_report_email_enabled',
            sortable: false,
            render: (row) => (
                <div className="bg-white rounded-2xl shadow-sm border p-3 sm:p-4 space-y-3 min-w-[220px]">

                    <button
                        onClick={() => handlePDFSend(row.id)}
                        className="w-full h-11 rounded btn-warning text-white text-sm font-medium flex items-center justify-center gap-2 transition"
                    >
                        <Mail className="w-4 h-4" />
                        Send Email
                    </button>


                    <div className='text-xs'>
                        <p className="text-gray-500 uppercase tracking-wide">Status</p>
                        <p className={`font-medium mt-1 break-words ${reportSentStatusData?.class}`}>
                            {reportSentStatusData?.status}
                        </p>
                    </div>
                </div>
            )
        },

        {
            header: 'Fax',
            accessor: 'fax_status',
            sortable: false,
            render: (row) => (
                <div className="bg-white rounded-2xl shadow-sm border p-3 sm:p-4 space-y-3 min-w-[220px]">

                    <button
                        onClick={() => handleFaxSend(row.id)}
                        className="w-full h-11 rounded btn-info text-white text-sm font-medium flex items-center justify-center gap-2 transition"
                    >
                        <Printer className="w-4 h-4" />
                        Send Fax
                    </button>

                    <div className='text-xs'>
                        <p className="text-gray-500 uppercase tracking-wide">Status</p>

                        <p className={`font-medium mt-1 break-words ${faxStatusData?.class}`}>
                            {faxStatusData?.name}
                        </p>

                        {faxStatusData?.message && (
                            <p className={`mt-1 italic break-words ${faxStatusData?.class}`}>
                                {faxStatusData?.message}
                            </p>
                        )}
                    </div>
                </div>
            )
        },

        {
            header: 'DICOM',
            accessor: 'dicom_file_status',
            sortable: false,
            render: (row) => (
                <div className="bg-white rounded-2xl shadow-sm border p-3 sm:p-4 space-y-3 min-w-[220px]">

                    <button
                        onClick={() => handleDicomSend(row.id)}
                        className="w-full h-11 rounded btn-teal text-white text-sm font-medium flex items-center justify-center gap-2 transition"
                    >
                        <Upload className="w-4 h-4" />
                        Send DICOM
                    </button>

                    <div className='text-xs'>
                        <p className="text-gray-500 uppercase tracking-wide">Status</p>

                        <p className={`font-medium mt-1 break-words ${dicomStatusData?.class}`}>
                            {dicomStatusData?.name}
                        </p>

                        {dicomStatusData?.message && (
                            <p className={`mt-1 italic break-words ${dicomStatusData?.class}`}>
                                {dicomStatusData?.message}
                            </p>
                        )}
                    </div>
                </div>
            )
        }
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
                            isTed ? (
                                <>
                                    {/* TOP SUMMARY GRID */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-200">
                                        <div className="space-y-1">
                                            <InfoItem label="Patient Name" value={`${patient?.first_name || ''} ${patient?.last_name || ''}`} />
                                            <InfoItem label="#EHR" value={patient?.ehr} />
                                            <InfoItem label="Medical History" value={Array.isArray(patient?.medical_history_data) ? patient.medical_history_data?.map((item) => item.name).join(', ') : '-'} />
                                            <InfoItem label="Note" value={patient?.note} />
                                        </div>
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
                                            <InfoItem label="DOB" value={patient?.date_of_birth} />
                                            <InfoItem label="Gender" value={patient?.gender_data?.name} />
                                        </div>
                                        <div className="space-y-1">
                                            <InfoItem label="Clinic Name" value={patient?.clinic?.name} />
                                            <InfoItem label="Clinic Note" value={patient?.clinic_note || patient?.clinic?.note} />
                                            <InfoItem label="Medical Condition" value={patient?.medical_condition?.name || patient?.medical_condition_data?.name} />
                                        </div>
                                    </div>

                                    
                                    {/* EYE IMAGES SLIDERS + TED RESULTS */}
                                   <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3">

                                        {/* col-md-3 */}
                                        <div className="md:col-span-2 space-y-6">
                                            <EyeImageSlider
                                                label="Right Eye"
                                                images={patient?.display_right_eye_images || []}
                                                eyeType="right"
                                                widthClass="w-full"
                                                heightClass="h-48"
                                                emptyMessage="No Right Eye Images"
                                            />

                                            <EyeImageSlider
                                                label="Left Eye"
                                                images={patient?.display_left_eye_images || []}
                                                eyeType="left"
                                                widthClass="w-full"
                                                heightClass="h-48"
                                                emptyMessage="No Left Eye Images"
                                            />
                                        </div>

                                        {/* col-md-5 */}
                                        <div className="md:col-span-4">
                                            <EyeImageSlider
                                                label="Both Eyes"
                                                images={patient?.display_both_eye_images || []}
                                                eyeType="both"
                                                widthClass="w-full"
                                                heightClass="h-[26rem]"
                                                emptyMessage="No Both Eye Images"
                                            />
                                        </div>

                                        {/* col-md-4 */}
                                        <div className="md:col-span-4 space-y-6">

                                            <div>
                                                <div className="text-xs font-semibold mb-2 text-gray-800">
                                                    Left Eye
                                                </div>

                                                <div className="grid grid-cols-1 gap-[0.08rem]">
                                                    {TED_OPTIONS.map((opt) => (
                                                        <label
                                                            key={opt.id}
                                                            className="flex items-center space-x-2 border border-gray-200 rounded p-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="ted_leftEye"
                                                                className="h-4 w-4 text-[#009efb] border-gray-300 focus:ring-[#009efb]"
                                                                value={opt.id}
                                                                checked={String(formData.leftEyeTed) === String(opt.id)}
                                                                onChange={() => {
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        leftEyeTed: String(opt.id)
                                                                    }));

                                                                    setFormErrors((prev) => ({
                                                                        ...prev,
                                                                        leftEye: undefined
                                                                    }));
                                                                }}
                                                            />

                                                            <span className="text-xs">{opt.name}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                {formErrors.leftEye && (
                                                    <p className="text-red-500 text-xs mt-2 font-medium">
                                                        {formErrors.leftEye}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <div className="text-xs font-semibold mb-2 text-gray-800">
                                                    Right Eye
                                                </div>

                                                <div className="grid grid-cols-1 gap-[0.08rem]">
                                                    {TED_OPTIONS.map((opt) => (
                                                        <label
                                                            key={opt.id}
                                                            className="flex items-center space-x-2 border border-gray-200 rounded p-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="ted_rightEye"
                                                                className="h-4 w-4 text-[#009efb] border-gray-300 focus:ring-[#009efb]"
                                                                value={opt.id}
                                                                checked={String(formData.rightEyeTed) === String(opt.id)}
                                                                onChange={() => {
                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        rightEyeTed: String(opt.id)
                                                                    }));

                                                                    setFormErrors((prev) => ({
                                                                        ...prev,
                                                                        rightEye: undefined
                                                                    }));
                                                                }}
                                                            />

                                                            <span className="text-xs">{opt.name}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                {formErrors.rightEye && (
                                                    <p className="text-red-500 text-xs mt-2 font-medium">
                                                        {formErrors.rightEye}
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    {/* COMMENTS / FOLLOW UP + CAS QUESTIONS */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 mt-6 border-t border-gray-100">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Comments</label>
                                                <FormField
                                                    type="textarea"
                                                    name="remark"
                                                    value={formData.remark}
                                                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                                    placeholder="Enter remark here"
                                                    rows="4"
                                                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-primary focus:border-primary shadow-sm"
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

                                        {/* CAS Questions read-only table */}
                                        {CAS_QUESTIONS.length > 0 && (
                                            <div className="border border-[#0d5b74] rounded-md overflow-hidden self-start bg-white">
                                                <div className="bg-[#0d5b74] px-4 py-2">
                                                    <h4 className="text-sm font-semibold text-white">CAS Questions</h4>
                                                </div>
                                                <table className="w-full text-xs bg-white">
                                                    <thead>
                                                        <tr className="text-left bg-[#0d5b74] text-white">
                                                            <th className="px-4 py-2 font-medium">Question</th>
                                                            <th className="px-4 py-2 font-medium text-right">Response</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {CAS_QUESTIONS.map((q) => (
                                                            <tr key={q.id} className="border-b border-gray-200 last:border-0">
                                                                <td className="px-4 py-2 text-gray-700">{q.question}</td>
                                                                <td className="px-4 py-2 text-right font-medium text-gray-800">{casAnswerLabel(q)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* SUBMIT */}
                                    <div className="flex justify-end mt-6">
                                        {isLoadingSubmit ? (
                                            <span className="inline-flex items-center gap-1 btn btn-success-50 btn-xs rounded cursor-not-allowed">
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>
                                                <span className='text-xs text-muted'> Loading...</span>
                                            </span>
                                        ) : (
                                            <button onClick={handleTedSubmit} className="btn btn-success btn-xs cursor-pointer rounded">
                                                Submit
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                            <>
                                {/* 1. TOP SUMMARY GRID FOR PENDING STATUS */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-200">
                                    {/* Column 1 */}
                                    <div className="space-y-1">
                                        <InfoItem label="Patient Name" value={`${patient?.first_name || ''} ${patient?.last_name || ''}`} />
                                        <InfoItem label="#EHR" value={patient?.ehr} />
                                        <InfoItem label="Medical History" value={Array.isArray(patient?.medical_history_data) ? patient.medical_history_data?.map((item) => item.name).join(', ') : '-'} />
                                        <InfoItem label="Note" value={patient?.note} />
                                        <InfoItem label="Doctor's Comments" valueNode={<span className={`font-medium`}>{patient?.remark_result?.remark || '-'}</span>} />
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
                                        <InfoItem label="DOB" value={patient?.date_of_birth} />
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
                                <div className={`pt-4 w-full ${isTed ? 'max-w-6xl' : 'max-w-5xl'}`}>
                                    <div className="mb-4">

                                        <div className={currentStepName === 'RIGHT_EYE' ? 'block' : 'hidden'}>
                                            <div>
                                                <div className="text-xs font-medium text-gray-700 mb-2">Right Eye: Yes</div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    {rightEyeImages}

                                                </div>
                                            </div>
                                        </div>

                                        <div className={currentStepName === 'LEFT_EYE' ? 'block' : 'hidden'}>
                                            <div>
                                                <div className="text-xs font-medium text-gray-700 mb-2">Left Eye: Yes</div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    {leftEyeImages}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={currentStepName === 'COMMENTS' ? 'block' : 'hidden'}>
                                            {isTed ? (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Left: Both Eyes Images */}
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-700 mb-2">Both Eyes Images</div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {bothEyeImages}
                                                        </div>
                                                    </div>
                                                    {/* Right: Doctor's Comments + Follow Up */}
                                                    <div className="space-y-2">
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
                                            ) : (
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
                                            )}
                                        </div>

                                    </div>

                                    {/* 3. STEP SPECIFIC BOTTOM SECTIONS (TED radios OR exam checkboxes) & BUTTONS */}
                                    <div className={currentStepName === 'RIGHT_EYE' ? 'block' : 'hidden'}>
                                        <div className="mb-4 pt-4 border-t border-gray-100">
                                            <div className="text-xs font-semibold mb-2 text-gray-800">
                                                {isTed
                                                    ? 'Right Eye'
                                                    : `Right Eye (${patient?.medical_condition?.name || patient?.medical_condition_data?.name || 'Condition'})`}
                                            </div>
                                            {isTed ? (
                                                <div className="grid grid-cols-1 gap-[0.08rem] max-w-md">
                                                    {TED_OPTIONS.map((opt) => (
                                                        <label
                                                            key={opt.id}
                                                            className="flex items-center space-x-2 border border-gray-200 rounded p-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="rightEyeTed"
                                                                className="h-4 w-4 text-[#009efb] border-gray-300 focus:ring-[#009efb]"
                                                                value={opt.id}
                                                                checked={String(formData.rightEyeTed) === String(opt.id)}
                                                                onChange={() => {
                                                                    setFormData((prev) => ({ ...prev, rightEyeTed: String(opt.id) }));
                                                                    setFormErrors((prev) => ({ ...prev, rightEye: undefined }));
                                                                }}
                                                            />
                                                            <span className="text-xs">{opt.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.08rem]">
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
                                                            <span className="text-xs">{opt?.name} {opt?.code ? `(${opt?.code})` : ''}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                            {formErrors.rightEye && (
                                                <p className="text-red-500 text-sm mt-3 font-medium">{formErrors.rightEye}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className={currentStepName === 'LEFT_EYE' ? 'block' : 'hidden'}>
                                        <div className="mb-4 pt-4 border-t border-gray-100">
                                            <div className="text-xs font-semibold mb-2 text-gray-800">
                                                {isTed
                                                    ? 'Left Eye'
                                                    : `Left Eye (${patient?.medical_condition?.name || patient?.medical_condition_data?.name || 'Condition'})`}
                                            </div>
                                            {isTed ? (
                                                <div className="grid grid-cols-1 gap-[0.08rem] max-w-md">
                                                    {TED_OPTIONS.map((opt) => (
                                                        <label
                                                            key={opt.id}
                                                            className="flex items-center space-x-2 border border-gray-200 rounded p-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="leftEyeTed"
                                                                className="h-4 w-4 text-[#009efb] border-gray-300 focus:ring-[#009efb]"
                                                                value={opt.id}
                                                                checked={String(formData.leftEyeTed) === String(opt.id)}
                                                                onChange={() => {
                                                                    setFormData((prev) => ({ ...prev, leftEyeTed: String(opt.id) }));
                                                                    setFormErrors((prev) => ({ ...prev, leftEye: undefined }));
                                                                }}
                                                            />
                                                            <span className="text-xs">{opt.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.08rem]">
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
                                                            <span className="text-xs">{opt?.name} {opt?.code ? `(${opt?.code})` : ''}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                            {formErrors.leftEye && (
                                                <p className="text-red-500 text-sm mt-3 font-medium">{formErrors.leftEye}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions Container */}
                                    <div className="flex space-x-3 mt-6">
                                        {currentStep > 0 && (
                                            <button onClick={handlePrevious} className="btn btn-secondary btn-xs cursor-pointer rounded">
                                                <span className='text-xs'>Previous</span>
                                            </button>
                                        )}
                                        {currentStep < steps.length - 1 ? (
                                            <button onClick={handleNext} className="btn btn-primary btn-xs cursor-pointer rounded">
                                                <span className='text-xs'>Next</span>
                                            </button>
                                        ) : (
                                            isLoadingSubmit ? (
                                                <span className="inline-flex items-center gap-1 btn btn-success-50 btn-xs rounded cursor-not-allowed">
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
                                                    <span className='text-xs text-muted'> Loading...</span>
                                                </span>
                                            ) : (
                                                <button onClick={handleSubmit} className="btn btn-success btn-xs cursor-pointer rounded">
                                                    Submit
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </>
                            )
                        ) : (
                            <>
                                {/* COMPLETED VIEW DESIGN */}
                                {/* Images Section */}
                                <div className={`grid grid-cols-1 ${isTed ? 'md:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-2'} gap-6 mb-10`}>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800 mb-4">Right Eye Images</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-3 min-h-[120px]">
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
                                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-3 min-h-[120px]">
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
                                    {isTed && (
                                        <div className="md:col-span-2 xl:col-span-1">
                                            <h3 className="text-sm font-semibold text-gray-800 mb-4">Both Eyes Images</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-3 min-h-[120px]">
                                                {patient?.display_both_eye_images?.length > 0 ? (
                                                    patient.display_both_eye_images.map((img, i) => (
                                                        <div key={i} className="relative rounded-lg overflow-hidden border">
                                                            <PreviewImage
                                                                preview={img.src ? img.src : img}
                                                                index={i}
                                                                eyeType="both"
                                                                eyeColor="yellow"
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
                                    )}
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                                    {/* Column 1 */}
                                    <div className="space-y-1">
                                        <InfoItem label="Patient Name" value={`${patient?.first_name || ''} ${patient?.last_name || ''}`} />
                                        <InfoItem label="#EHR" value={patient?.ehr} />
                                        <InfoItem
                                            label="Medical History"
                                            value={Array.isArray(patient?.medical_history_data) ? patient.medical_history_data?.map((item) => item.name).join(', ') : '-'}
                                        />
                                        <InfoItem label="Note" value={patient?.note} />
                                        <InfoItem label="Doctor's Comments" valueNode={<span className={`font-medium`}>{patient?.remark_result?.remark || '-'}</span>} />

                                        <InfoItem label="Left Eye Diagnosis Details" value={
                                            isTed ? (
                                                tedName(patient?.remark_result?.exam_data?.leftEye)
                                            ) : patient?.remark_result?.exam_data?.leftEye?.length ? (
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
                                                <span style={{ backgroundColor: patient?.follow_up_data?.fStatus?.color }} className={`inline-flex px-3 py-1 rounded-sm text-xs font-semibold text-white cursor-pointer`}>
                                                    {patient?.follow_up_data?.status === 200 ? patient?.follow_up_data?.fStatus?.name : '-'}
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
                                        <InfoItem label="DOB" value={patient?.date_of_birth} />
                                        <InfoItem label="Gender" value={patient?.gender_data?.name} />
                                        <InfoItem
                                            label="Right Eye Diagnosis Details"
                                            valueNode={
                                                <div className="space-y-2">
                                                    <div>{
                                                        isTed ? (
                                                            tedName(patient?.remark_result?.exam_data?.rightEye)
                                                        ) : patient?.remark_result?.exam_data?.rightEye?.length ? (
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
                                        <InfoItem label="Remark At" value={patient?.display_remark_at || patient?.diagnosis?.display_remark_at} />

                                        <InfoItem
                                            label="Remark By"
                                            valueNode={
                                                patient?.remark_by ? (
                                                    <span className="text-green-600 font-medium">
                                                        {patient.remark_by.first_name} {patient.remark_by.last_name} ({patient.remark_by?.role?.name})
                                                    </span>
                                                ) : (
                                                    '-'
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                                {patient?.diagnosis_status === 1 && (
                                    <>
                                        {/* Bottom Actions */}
                                        <div className="mt-8 border-t border-gray-100 pt-6">
                                            <h3 className="text-sm font-medium text-gray-700 mb-4">Clone and Re-diagnosis the Patient</h3>
                                            <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#009efb] hover:bg-[#0089db] rounded shadow-sm focus:outline-none" onClick={() => handleReDiagnosis(patient.id)}>
                                                <ArrowPathIcon className="w-4 h-4 mr-2" />
                                                Re diagnosis
                                            </button>
                                        </div>

                                        <div className="mt-8 border-t border-gray-100 pt-6">
                                            <h3 className="text-sm font-medium text-gray-700 mb-4">Chart Status </h3>
                                            <Table
                                                columns={columns}
                                                data={Array(patient)}
                                                emptyMessage="No chart status found"
                                                tableClass="min-w-auto"
                                            />
                                        </div>
                                    </>
                                )}
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
