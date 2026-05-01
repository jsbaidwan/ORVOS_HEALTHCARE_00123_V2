import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import {
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const multiSelectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    borderColor: hasError
      ? '#ef4444'
      : state.isFocused
        ? '#009efb'
        : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 158, 251, 0.2)' : base.boxShadow,
    '&:hover': { borderColor: state.isFocused ? '#009efb' : '#9ca3af' },
    minHeight: '38px',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
  }),
  multiValue: (base) => ({ ...base, backgroundColor: '#e0f2fe', borderRadius: '0.25rem' }),
  multiValueLabel: (base) => ({ ...base, color: '#0369a1', fontSize: '0.8rem' }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#0369a1',
    '&:hover': { backgroundColor: '#bae6fd', color: '#0c4a6e' },
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
});

// Convert Date object → "MM-DD-YYYY" string for the parent / API
const formatDateOut = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
};

// Convert "MM-DD-YYYY" string (or Date) → Date object for the picker
const parseDateIn = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const parts = String(value).split('-');
  if (parts.length !== 3) return null;
  const [mm, dd, yyyy] = parts;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
};

const Filters = ({
  filters = [],
  onFilterChange,
  errors = {},
  onApply,
  onReset,
  applyLabel = 'Apply Filter',
  resetLabel = 'Reset',
}) => {
  const handleInputChange = (key, value) => {
    onFilterChange(key, value);
  };

  const renderField = (filter, index) => {
    const fieldError = errors?.[filter.key];
    const errorBorder = fieldError ? 'border-red-500' : 'border-gray-300';

    let inputEl = null;

    if (filter.type === 'search') {
      inputEl = (
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder={filter.placeholder}
            value={filter.value || ''}
            onChange={(e) => handleInputChange(filter.key, e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border ${errorBorder} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
          />
        </div>
      );
    } else if (
      filter.type === 'text' ||
      filter.type === 'email' ||
      filter.type === 'number'
    ) {
      inputEl = (
        <input
          type={filter.type}
          placeholder={filter.placeholder}
          value={filter.value ?? ''}
          onChange={(e) => handleInputChange(filter.key, e.target.value)}
          className={`w-full px-4 py-2 border ${errorBorder} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
        />
      );
    } else if (filter.type === 'date') {
      inputEl = (
        <DatePicker
          selected={parseDateIn(filter.value)}
          onChange={(date) => handleInputChange(filter.key, formatDateOut(date))}
          dateFormat="MM-dd-yyyy"
          placeholderText={filter.placeholder || 'MM-DD-YYYY'}
          className={`w-full border ${errorBorder} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          maxDate={filter.maxDate ?? new Date()}
          minDate={filter.minDate}
          isClearable={filter.isClearable !== false}
          wrapperClassName="w-full"
        />
      );
    } else if (filter.type === 'select') {
      inputEl = (
        <select
          value={filter.value ?? ''}
          onChange={(e) => handleInputChange(filter.key, e.target.value)}
          className={`w-full px-4 py-2 border ${errorBorder} rounded-md focus:outline-none focus:ring-2 focus:ring-primary`}
        >
          {filter.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    } else if (filter.type === 'multi-select') {
      const options = filter.options || [];
      const selectedValues = Array.isArray(filter.value) ? filter.value : [];
      const selectedOptions = options.filter((o) =>
        selectedValues.map(String).includes(String(o.value))
      );

      inputEl = (
        <Select
          isMulti
          options={options}
          value={selectedOptions}
          onChange={(selected) =>
            handleInputChange(
              filter.key,
              selected ? selected.map((s) => s.value) : []
            )
          }
          placeholder={filter.placeholder || 'Select...'}
          classNamePrefix="react-select"
          isClearable={filter.isClearable !== false}
          closeMenuOnSelect={false}
          styles={multiSelectStyles(!!fieldError)}
        />
      );
    } else {
      return null;
    }

    return (
      <div key={index} className="flex flex-col">
        {filter.label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {filter.label}
          </label>
        )}
        {inputEl}
        {fieldError && (
          <p className="mt-1 text-sm text-red-600">{fieldError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-end">
      {filters.map(renderField)}

      {(onApply || onReset) && (
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-1 flex flex-col sm:flex-row gap-2 w-full">

          {onApply && (
            <button
              type="button"
              onClick={onApply}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 btn-success-light btn-sm rounded"
            >
              <FunnelIcon className="w-3 h-3 mr-2" />
              {applyLabel}
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 btn-danger-light btn-sm rounded"
            >
              <ArrowPathIcon className="w-3 h-3 mr-2" />
              {resetLabel}
            </button>
          )}

        </div>
      )}
    </div>
  );
};

export default Filters;
