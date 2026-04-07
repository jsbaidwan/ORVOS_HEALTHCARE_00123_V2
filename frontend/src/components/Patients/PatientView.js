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

const DIAGNOSIS_OPTIONS = [
    "No diabetic retinopathy (E10.9)",
    "NPDR Mild/Minimal (E10.3291)",
    "NPDR Mild/Minimal with CSME (E10.3211)",
    "NPDR Moderate (E10.3391)",
    "NPDR Moderate with CSME (E10.3311)",
    "NPDR Severe (E10.349)",
    "NPDR Severe with CSME (E10.341)",
    "PDR (E10.3591)",
    "PDR with CSME (E10.3511)",
    "AMD Grade 1, Dry (H35.3111)",
    "AMD Grade 2, Drusen, Degenerative (H35.311x)",
    "AMD Grade 3, Degeneration, Retinal, Secondary Pigmentary (H35.4x)",
    "AMD Grade 4, Exudative (H35.32)",
    "AMD Grade 4, Chorioretinal scar, Posterior Pole (H31.011)",
    "Drusen, Hereditary (extramacular drusen) (H31.101)",
    "OTHER (H35.89)",
    "Glaucoma. Optic nerve cupping (H40.011)",
    "Image inadequate for assessment of retinal pathology (H57.89)",
    "This image is low quality and inadequate for interpretation (N/A)"
];

const InfoItem = ({ label, value, valueNode, valueClass = "text-gray-900", labelClass = "" }) => (
    <div className="flex flex-col sm:flex-row py-3">
        <div className={`w-full sm:w-1/2 text-sm font-medium text-gray-700 mb-1 sm:mb-0 pr-4 ${labelClass}`}>{label}</div>
        <div className={`w-full sm:w-1/2 text-sm ${valueClass} break-words`}>
            {valueNode !== undefined ? valueNode : (value || '-')}
        </div>
    </div>
);


const PatientView = () => {
    const { id } = useParams();
    const { getPatientById, getExistingPatient } = usePatient();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState(null);
    const [patient, setPatient] = useState(null);

    // Stepper state for diagnosis formatting
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        rightEyeSelections: [],
        leftEyeSelections: [],
        doctorComments: '',
        followUp: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const { setPageTitle } = useTitle();

    useEffect(() => {
        setPageTitle('Patient Details');
    }, [setPageTitle]);

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

    const handleSubmit = () => {
        if (!formData.follow_up && currentStepName === 'COMMENTS') {
            setFormErrors({ follow_up: 'Please choose a follow up.' });
            return;
        }
        setFormErrors({});
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


    return (
        <div className="py-6 mx-auto">
            <Breadcrumb />

            <ErrorHandle errors={errors} />

            <div className={`bg-white rounded-lg shadow-sm border ${loading ? 'animate-pulse opacity-70' : ''} ${user?.role_id === 2 ? 'orvos-doctor-section' : ''}`}>

                {patient ? (
                    <div className="p-6">

                        {/* CONDITIONAL RENDER BASED ON isPending */}
                        {isPending ? (
                            <>
                                {/* 1. TOP SUMMARY GRID FOR PENDING STATUS */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-200">
                                    {/* Column 1 */}
                                    <div className="space-y-1">
                                        <InfoItem label="Patient Name" value={`${patient?.first_name || ''} ${patient?.last_name || ''}`} />
                                        <InfoItem label="#EMR" value={patient?.ehr} />
                                        <InfoItem label="Medical History" value={Array.isArray(patient?.medical_history_data) ? patient.medical_history_data?.map((item) => item.name).join(', ') : '-'} />
                                        <InfoItem label="Note" value={patient?.note} />
                                        <InfoItem label="Remark Status" value="Pending" valueClass="text-red-500 font-medium" />
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
                                        <InfoItem label="Diagnosis Status" value="Pending" valueClass="text-red-500 font-medium" />
                                        <InfoItem label="DOS" value={patient?.dos} />
                                    </div>
                                    {/* Column 3 */}
                                    <div className="space-y-1">
                                        <InfoItem label="Clinic Name" value={patient?.clinic?.name} />
                                        <InfoItem label="Clinic Note" value={patient?.clinic_note || patient?.clinic?.note} />
                                        <InfoItem label="Medical Condition" value={patient?.medical_condition?.name || patient?.medical_condition_data?.name} />
                                        <InfoItem label="Remarks" value="Not Yet Remarked" valueClass="text-red-500 font-medium" />
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
                                                        name="comment"
                                                        value={formData.comment}
                                                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
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
                                                        options={[
                                                            { value: "", label: "Choose Follow Up" },
                                                            { value: "Schedule Dr Visit", label: "Schedule Dr Visit" },
                                                            { value: "Follow up in 6 months", label: "Follow up in 6 months" },
                                                            { value: "Follow up in 1 year", label: "Follow up in 1 year" },
                                                            { value: "Follow up in 2 years", label: "Follow up in 2 years" },
                                                            { value: "Follow up in 3 years", label: "Follow up in 3 years" },
                                                            { value: "Follow up in 4 years", label: "Follow up in 4 years" },
                                                            { value: "Follow up in 5 years", label: "Follow up in 5 years" },
                                                            { value: "Follow up in 6 years", label: "Follow up in 6 years" },
                                                            { value: "Follow up in 7 years", label: "Follow up in 7 years" },
                                                            { value: "Follow up in 8 years", label: "Follow up in 8 years" },
                                                            { value: "Follow up in 9 years", label: "Follow up in 9 years" },
                                                            { value: "Follow up in 10 years", label: "Follow up in 10 years" },
                                                        ]}
                                                        className={`w-full border ${formErrors.follow_up ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 text-sm focus:ring-primary focus:border-primary shadow-sm`}
                                                    />

                                                    {formErrors.follow_up && <p className="text-red-500 text-xs">{formErrors.follow_up}</p>}
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* 3. STEP SPECIFIC BOTTOM SECTIONS (Checkboxes) & BUTTONS */}
                                    <div className={currentStepName === 'RIGHT_EYE' ? 'block' : 'hidden'}>
                                        <div className="mb-4 pt-4 border-t border-gray-100">
                                            <div className="text-sm font-semibold mb-2 text-gray-800">Right Eye ({patient?.medical_condition?.name || patient?.medical_condition_data?.name || 'Condition'})</div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                                {DIAGNOSIS_OPTIONS.map((opt, i) => (
                                                    <label key={i} className="flex items-center space-x-2 border border-gray-200 rounded p-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors">
                                                        <input type="checkbox"
                                                            className="h-4 w-4 text-[#009efb] rounded border-gray-300 focus:ring-[#009efb]"
                                                            checked={formData.rightEyeSelections.includes(opt)}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    rightEyeSelections: checked
                                                                        ? [...prev.rightEyeSelections, opt]
                                                                        : prev.rightEyeSelections.filter(x => x !== opt)
                                                                }));
                                                            }}
                                                        />
                                                        <span>{opt}</span>
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
                                                {DIAGNOSIS_OPTIONS.map((opt, i) => (
                                                    <label key={i} className="flex items-center space-x-2 border border-gray-200 rounded p-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors">
                                                        <input type="checkbox"
                                                            className="h-4 w-4 text-[#009efb] rounded border-gray-300 focus:ring-[#009efb]"
                                                            checked={formData.leftEyeSelections.includes(opt)}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    leftEyeSelections: checked
                                                                        ? [...prev.leftEyeSelections, opt]
                                                                        : prev.leftEyeSelections.filter(x => x !== opt)
                                                                }));
                                                            }}
                                                        />
                                                        <span>{opt}</span>
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
                                            <button onClick={handleSubmit} className="px-5 py-2.5 bg-green-500 text-white font-medium rounded-md text-sm hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm">
                                                Submit
                                            </button>
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
                                        <InfoItem
                                            label="Remark Status"
                                            value={patient?.remark_status || patient?.diagnosis?.remark_status}
                                            valueClass="text-green-600 font-medium"
                                        />
                                        <InfoItem label="Left Eye Diagnosis Details" value={patient?.left_eye_diagnosis_details || patient?.diagnosis?.left_eye_details} />
                                        <InfoItem
                                            label="Follow Up"
                                            valueNode={
                                                <span className="inline-flex px-3 py-1 rounded-sm text-xs font-semibold bg-green-500 text-white cursor-pointer hover:bg-green-600">
                                                    Schedule Dr Visit
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
                                                    <div>{patient?.right_eye_diagnosis_details || patient?.diagnosis?.right_eye_details || '-'}</div>
                                                </div>
                                            }
                                        />
                                        <InfoItem label="Remarks" value={patient?.remarks || patient?.diagnosis?.remarks} />
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
