# Orvos - Medical Clinic Management System

A comprehensive React-based medical clinic management system for managing clinics, patients, and medical records with a beautiful, modern UI using Tailwind CSS.

## Features

### Authentication
- **User Login** - Standard user authentication
- **Super Admin Login** - Administrative access with Google reCAPTCHA v2 option
- Secure session management with JWT tokens

### Dashboard
- Overview of pending and completed patients
- Statistics for clinics and patients
- Recent activity feed
- Quick access to key metrics

### Clinic Management
- Add, edit, and archive clinics
- Clinic information including contact details, address, and contract documents
- Clinic logo upload
- Archive management for inactive clinics

### Patient Management
- Comprehensive patient records with personal and medical information
- Eye image upload for left and right eyes (JPG, JPEG, PNG, WEBP)
- Primary and secondary insurance tracking
- Medical history and conditions
- Pending and completed patient status tracking
- EHR# management

### Reports
- Clinic patients report with filtering
- Orvos doctor review workflow
- Export to CSV functionality
- Statistical analysis

### Settings
- Password management
- Email template customization with variables
- Clinic-specific settings
- Patient field visibility controls
- Appointment reminder configuration (120 days from last image)
- Public patient submission URL

### Support
- Comprehensive FAQ section
- Help documentation
- Contact support form

## Tech Stack

- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.6
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **State Management**: React Context API

## Project Structure

```
src/
├─ components/
│  ├─ Auth/
│  │  ├─ UserLogin.js
│  │  ├─ SuperAdminLogin.js
│  │  └─ GoogleCacheLogin.js
│  │
│  ├─ Common/
│  │  ├─ Header.js
│  │  ├─ Footer.js
│  │  ├─ Sidebar.js
│  │  ├─ Loader.js
│  │  ├─ Modal.js
│  │  └─ Table.js
│  │
│  ├─ Dashboard/
│  │  ├─ Dashboard.js
│  │  └─ StatsCard.js
│  │
│  ├─ Clinics/
│  │  ├─ ClinicsList.js
│  │  ├─ ClinicForm.js
│  │  ├─ ClinicRow.js
│  │  └─ ArchiveClinics.js
│  │
│  ├─ Patients/
│  │  ├─ PatientsList.js
│  │  ├─ PatientForm.js
│  │  ├─ PatientRow.js
│  │  ├─ EyeImageUploader.js
│  │  └─ MedicalHistorySection.js
│  │
│  ├─ Reports/
│  │  ├─ Reports.js
│  │  ├─ ClinicPatients.js
│  │  └─ OrvosDoctorReview.js
│  │
│  ├─ Settings/
│  │  ├─ Settings.js
│  │  ├─ ChangePassword.js
│  │  ├─ EmailTemplates.js
│  │  ├─ EmailTemplateForm.js
│  │  └─ ClinicSettings.js
│  │
│  ├─ Support/
│  │  ├─ Faq.js
│  │  └─ Help.js
│  │
│  └─ UI/
│     └─ FormField.js
│
├─ context/
│  ├─ AuthContext.js
│  ├─ ClinicContext.js
│  ├─ PatientContext.js
│  ├─ ReportContext.js
│  └─ SettingsContext.js
│
├─ utils/
│  ├─ api.js
│  ├─ localStore.js
│  ├─ validators.js
│  └─ formatters.js
│
├─ hooks/
│  ├─ useLocalStorage.js
│  ├─ useForm.js
│  └─ useFetch.js
│
├─ App.js
├─ index.js
└─ index.css
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd orvos-theme
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from Create React App (irreversible)

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

### Tailwind Configuration

The Tailwind configuration is customized with:
- Primary color palette (blue-based medical theme)
- Custom shadows (soft, card)
- Extended font family (Inter)
- Medical-specific colors

## Key Features Details

### Patient Image Upload
- Supports JPG, JPEG, PNG, WEBP formats
- Maximum file size: 5MB per image
- Multiple images allowed for each eye
- Drag and drop or click to upload
- Image preview with remove functionality
- Separate uploaders for left and right eyes with color coding

### Email Templates
- Customizable templates with variable support
- Available variables: `{{patient_name}}`, `{{clinic_name}}`, `{{appointment_date}}`, `{{doctor_name}}`, `{{patient_email}}`, `{{patient_phone}}`
- Template activation/deactivation
- Reminder configuration

### Reports
- Clinic patients filtering by clinic
- Export to CSV functionality
- Doctor review workflow
- Statistical summaries

### Form Validation
- Built-in validators for email, phone, passwords
- Custom validation rules
- Real-time error feedback
- Form state management with custom hooks

### Local Storage Management
- Persistent user sessions
- Cached application data
- Utility functions for storage operations

## Routes

### Public Routes
- `/login` - User login page
- `/admin/login` - Super admin login page

### Protected Routes (Require Authentication)
- `/dashboard` - Main dashboard
- `/clinics` - Active clinics list
- `/clinics/archived` - Archived clinics
- `/patients` - All patients
- `/patients/pending` - Pending patients
- `/patients/completed` - Completed patients
- `/patients/add` - Add new patient
- `/patients/edit/:id` - Edit patient
- `/reports` - Reports section
- `/settings` - Settings panel
- `/support` - Support center

## Design Theme

The application features a medical/healthcare-inspired design with:
- Clean, professional interface
- Blue color scheme (primary medical color)
- Gradient accents for visual appeal
- Card-based layout for organization
- Responsive design for all devices
- Smooth transitions and hover effects
- Accessible color contrasts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Architecture

### Component Structure
- **Atomic Design**: Components are organized by feature and reusability
- **Context API**: Global state management for auth, clinics, patients, reports, and settings
- **Custom Hooks**: Reusable logic for forms, data fetching, and local storage
- **Utility Functions**: Helper functions for validation, formatting, and API calls

### State Management
- **React Context**: For global application state
- **Local State**: For component-specific state
- **Custom Hooks**: For shared stateful logic

### Routing
- **React Router v6**: Client-side routing
- **Protected Routes**: Authentication-based route guards
- **Layout Wrapper**: Consistent layout across protected routes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@orvos.com or visit the Support section in the application.

## Credits

Built with ❤️ for medical professionals to streamline clinic and patient management.

---

**Version**: 1.0.0  
**Last Updated**: 2025
