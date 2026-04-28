import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import FormField from '../UI/FormField';
import ErrorHandle from '../Common/ErrorHandle';
import { errorsFormatted } from '../../utils/errorHandler';
import { useLoader } from '../../context/LoaderContext';
import { useChangePassword } from '../../context/ChangePasswordContext';

const passwordSchema = yup.object({
  current_password: yup
    .string()
    .required('Current password is required'),
  new_password: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/,
      'The password must contain at least one capital letter, one number, and one special character.'
    ),
  confirm_password: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('new_password')], 'Passwords do not match'),
});

const buildDefaults = () => ({
  current_password: '',
  new_password: '',
  confirm_password: '',
});

const ChangePassword = () => {
  const { changePassword } = useChangePassword();
  const { showLoader, hideLoader } = useLoader();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: buildDefaults(),
  });

  const onSubmit = async (data) => {
    const payload = {
      current_password: data.current_password,
      new_password: data.new_password,
      confirm_password: data.confirm_password,
    };

    try {
      showLoader();
      const result = await changePassword(payload);

      if (result && (result.status === 200 || result.success)) {
        toast.success(result?.message);
        reset(buildDefaults());
      } else {
        errorsFormatted(result, setError);
      }
    } catch (error) {
      errorsFormatted(error, setError);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
      <p className="text-gray-600 mb-6">Update your password to keep your account secure</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ErrorHandle errors={errors} />

        <FormField
          label="Current Password"
          name="current_password"
          type="password"
          registration={register('current_password')}
          placeholder="Enter current password"
          required
          error={errors.current_password?.message}
        />

        <FormField
          label="New Password"
          name="new_password"
          type="password"
          registration={register('new_password')}
          placeholder="Enter new password (min. 8 characters)"
          required
          error={errors.new_password?.message}
        />

        <FormField
          label="Confirm New Password"
          name="confirm_password"
          type="password"
          registration={register('confirm_password')}
          placeholder="Confirm new password"
          required
          error={errors.confirm_password?.message}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-blue-900 mb-2">Password Requirements:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>At least 8 characters long</li>
            <li>Include uppercase and lowercase letters</li>
            <li>Include at least one number</li>
            <li>Include at least one special character</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="btn-primary flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Processing...'
            ) : (
              <>
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
