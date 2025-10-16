import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useClinic } from '../../context/ClinicContext';
import FormField from '../UI/FormField';

const UserForm = ({ user, onClose }) => {
  const { addUser, updateUser } = useUser();
  const { clinics } = useClinic();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    userType: user?.userType || '',
    clinicId: user?.clinicId || '',
    address: user?.address || '',
    avatar: user?.avatar || null,
    shortBiography: user?.shortBiography || '',
    status: user?.status || 'Active',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);

  const userTypeOptions = [
    { value: '2', label: 'Orvos Doctor' },
    { value: '3', label: 'Doctor' },
    { value: '4', label: 'Medical Assistant' },
    { value: '5', label: 'User' },
    { value: '6', label: 'Clinic Admin' },
  ];

  const clinicOptions = clinics.map(clinic => ({
    value: clinic.id.toString(),
    label: clinic.companyName,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      if (value.length > 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
      } else if (value.length > 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
      setFormData({ ...formData, phone: value });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, avatar: 'Please upload a valid image file (JPEG, PNG, GIF)' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'File size must be less than 5MB' });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setFormData({ ...formData, avatar: file });
      setErrors({ ...errors, avatar: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.userType) {
      newErrors.userType = 'User type is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Password validation only for new users or if password is being changed
    if (!user || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      userType: formData.userType,
      clinicId: formData.clinicId,
      address: formData.address,
      avatar: formData.avatar,
      shortBiography: formData.shortBiography,
      status: formData.status,
    };

    if (user) {
      updateUser(user.id, userData);
    } else {
      addUser(userData);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter First Name"
          required
          error={errors.firstName}
        />

        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter Last Name"
          required
          error={errors.lastName}
        />
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Email"
          required
          error={errors.email}
        />

        <FormField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder="(xxx) xxx-xxxx"
          error={errors.phone}
        />
      </div>

      {/* User Type and Clinic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="User Type"
          name="userType"
          type="select"
          value={formData.userType}
          onChange={handleChange}
          options={userTypeOptions}
          required
          error={errors.userType}
        />

        <FormField
          label="Choose Clinic"
          name="clinicId"
          type="select"
          value={formData.clinicId}
          onChange={handleChange}
          options={clinicOptions}
          error={errors.clinicId}
        />
      </div>

      {/* Address */}
      <FormField
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Enter full address"
        required
        error={errors.address}
      />

      {/* Avatar Upload */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Avatar
        </label>
        <div className="flex items-center space-x-4">
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
            />
          )}
          <input
            type="file"
            id="avatar"
            name="avatar"
            onChange={handleAvatarChange}
            accept="image/jpeg,image/jpg,image/png,image/gif"
            className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>
        {errors.avatar && <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>}
      </div>

      {/* Short Biography */}
      <FormField
        label="Short Biography"
        name="shortBiography"
        type="textarea"
        value={formData.shortBiography}
        onChange={handleChange}
        placeholder="Enter Short Biography"
        rows={3}
        error={errors.shortBiography}
      />

      {/* Status */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center space-x-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="status"
              value="Active"
              checked={formData.status === 'Active'}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="status"
              value="Inactive"
              checked={formData.status === 'Inactive'}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Inactive</span>
          </label>
        </div>
      </div>

      {/* Password Fields */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {user ? 'Change Password (leave blank to keep current)' : 'Set Password'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••••••••••"
            required={!user}
            error={errors.password}
          />

          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••••••••••"
            required={!user}
            error={errors.confirmPassword}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {user ? 'Update User' : 'Add User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;

