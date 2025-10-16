import { useState } from 'react';
import { validators, validationMessages } from '../utils/validators';

const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    let newValue = value;
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      newValue = files;
    }

    setValues({
      ...values,
      [name]: newValue,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    // Validate field on blur
    if (validationRules[name]) {
      validateField(name, values[name]);
    }
  };

  // Validate a single field
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return true;

    let error = '';

    for (const rule of rules) {
      if (typeof rule === 'string') {
        // Simple validation rule
        if (rule === 'required' && !validators.required(value)) {
          error = validationMessages.required;
          break;
        } else if (rule === 'email' && !validators.email(value)) {
          error = validationMessages.email;
          break;
        } else if (rule === 'phone' && !validators.phone(value)) {
          error = validationMessages.phone;
          break;
        } else if (rule === 'password' && !validators.password(value)) {
          error = validationMessages.password;
          break;
        }
      } else if (typeof rule === 'object') {
        // Complex validation rule with parameters
        const { type, params, message } = rule;

        if (type === 'minLength' && !validators.minLength(value, params)) {
          error = message || `Minimum length is ${params} characters`;
          break;
        } else if (type === 'maxLength' && !validators.maxLength(value, params)) {
          error = message || `Maximum length is ${params} characters`;
          break;
        } else if (type === 'range' && !validators.range(value, params.min, params.max)) {
          error = message || `Value must be between ${params.min} and ${params.max}`;
          break;
        } else if (type === 'match' && !validators.match(value, values[params])) {
          error = message || validationMessages.match;
          break;
        } else if (type === 'custom' && params && !params(value, values)) {
          error = message || 'Invalid value';
          break;
        }
      } else if (typeof rule === 'function') {
        // Custom validation function
        const result = rule(value, values);
        if (result !== true) {
          error = result || 'Invalid value';
          break;
        }
      }
    }

    setErrors({
      ...errors,
      [fieldName]: error,
    });

    return !error;
  };

  // Validate all fields
  const validate = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const rules = validationRules[fieldName];
      const value = values[fieldName];

      for (const rule of rules) {
        let error = '';

        if (typeof rule === 'string') {
          if (rule === 'required' && !validators.required(value)) {
            error = validationMessages.required;
          } else if (rule === 'email' && value && !validators.email(value)) {
            error = validationMessages.email;
          } else if (rule === 'phone' && value && !validators.phone(value)) {
            error = validationMessages.phone;
          } else if (rule === 'password' && value && !validators.password(value)) {
            error = validationMessages.password;
          }
        } else if (typeof rule === 'object') {
          const { type, params, message } = rule;

          if (type === 'minLength' && !validators.minLength(value, params)) {
            error = message || `Minimum length is ${params} characters`;
          } else if (type === 'maxLength' && !validators.maxLength(value, params)) {
            error = message || `Maximum length is ${params} characters`;
          } else if (type === 'match' && !validators.match(value, values[params])) {
            error = message || validationMessages.match;
          } else if (type === 'custom' && params && !params(value, values)) {
            error = message || 'Invalid value';
          }
        } else if (typeof rule === 'function') {
          const result = rule(value, values);
          if (result !== true) {
            error = result || 'Invalid value';
          }
        }

        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
          break;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submit
  const handleSubmit = (callback) => async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(values).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    if (validate()) {
      try {
        await callback(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  };

  // Reset form
  const reset = (newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Set field value
  const setFieldValue = (name, value) => {
    setValues({
      ...values,
      [name]: value,
    });
  };

  // Set field error
  const setFieldError = (name, error) => {
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validate,
  };
};

export default useForm;


