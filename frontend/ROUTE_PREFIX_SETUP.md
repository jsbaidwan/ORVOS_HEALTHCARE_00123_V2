# Route Prefix Setup Guide

## ✅ What Was Implemented

### 1. **Custom Hook: `useRoutePath`**
Located at: `src/hooks/useRoutePath.js`

This hook automatically adds route prefixes based on the user's role:
- **Admin** (role_id = 1): Routes prefixed with `/admin` (configurable)
- **User** (role_id = 2): Routes with no prefix or custom prefix (configurable)

```javascript
import { useRoutePath } from '../hooks/useRoutePath';

const getRoutePath = useRoutePath();
const dashboardPath = getRoutePath('/dashboard');
// For Admin: /admin/dashboard
// For User: /dashboard
```

### 2. **Environment Variables**
Create a `.env` file in the project root with the following content:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Route Prefixes
REACT_APP_ADMIN_ROUTE_PREFIX=admin
REACT_APP_USER_ROUTE_PREFIX=

# App Configuration
REACT_APP_NAME=Orvos Medical Clinic Management
REACT_APP_VERSION=1.0.0
```

**Important**: The `.env` file must be in the root directory (same level as `package.json`)

### 3. **Updated Authentication**
`src/context/AuthContext.js` now includes:
- `role_id` field: 1 for Admin, 2 for User
- Automatic navigation to correct route based on role after login

```javascript
// Admin Login
{
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  role_id: 1  // Admin identifier
}

// User Login
{
  id: 2,
  name: 'Medical User',
  email: 'user@example.com',
  role: 'user',
  role_id: 2  // User identifier
}
```

### 4. **Updated Routing**
`src/App.js` now creates routes for both:
- **Admin routes**: `/admin/dashboard`, `/admin/clinics`, etc.
- **User routes**: `/dashboard`, `/clinics`, etc.

### 5. **Updated Sidebar**
`src/components/Common/Sidebar.js` now uses `useRoutePath` hook to automatically generate correct navigation links based on user role.

## 🚀 How It Works

### Login Flow:

1. **User Login** (`/login`):
   - User enters credentials
   - Role set to `user` with `role_id: 2`
   - Redirects to `/dashboard`

2. **Admin Login** (`/admin/login`):
   - Admin enters credentials
   - Role set to `admin` with `role_id: 1`
   - Redirects to `/admin/dashboard`

### Route Protection:

- Routes check `role_id` to ensure users only access their designated routes
- Admins are redirected to `/admin/*` routes
- Regular users are redirected to `/*` routes
- Unauthorized access redirects to appropriate dashboard

## 📋 Available Routes

### Public Routes
- `/login` - User login
- `/admin/login` - Admin login

### Admin Routes (role_id = 1)
- `/admin/dashboard`
- `/admin/clinics`
- `/admin/clinics/archived`
- `/admin/patients`
- `/admin/patients/pending`
- `/admin/patients/completed`
- `/admin/patients/add`
- `/admin/patients/edit/:id`
- `/admin/reports`
- `/admin/settings`
- `/admin/support`

### User Routes (role_id = 2)
- `/dashboard`
- `/clinics`
- `/clinics/archived`
- `/patients`
- `/patients/pending`
- `/patients/completed`
- `/patients/add`
- `/patients/edit/:id`
- `/reports`
- `/settings`
- `/support`

## 🔧 Customization

### Change Admin Prefix
Edit `.env` file:
```env
REACT_APP_ADMIN_ROUTE_PREFIX=super-admin
```
Admin routes will become: `/super-admin/dashboard`, `/super-admin/clinics`, etc.

### Add User Prefix
Edit `.env` file:
```env
REACT_APP_USER_ROUTE_PREFIX=user
```
User routes will become: `/user/dashboard`, `/user/clinics`, etc.

## 🧪 Testing

### Test Admin Login:
1. Go to `/admin/login`
2. Enter any credentials
3. Should redirect to `/admin/dashboard`
4. All sidebar links should have `/admin` prefix

### Test User Login:
1. Go to `/login`
2. Enter any credentials
3. Should redirect to `/dashboard`
4. All sidebar links should have no prefix (or custom prefix if set)

## 💡 Usage in Components

### Using the Hook:
```javascript
import { useRoutePath } from '../../hooks/useRoutePath';

function MyComponent() {
  const getRoutePath = useRoutePath();
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Automatically adds correct prefix based on user role
    navigate(getRoutePath('/patients'));
  };
  
  return <button onClick={handleClick}>View Patients</button>;
}
```

### Link with Dynamic Prefix:
```javascript
import { Link } from 'react-router-dom';
import { useRoutePath } from '../../hooks/useRoutePath';

function MyComponent() {
  const getRoutePath = useRoutePath();
  
  return (
    <Link to={getRoutePath('/dashboard')}>
      Go to Dashboard
    </Link>
  );
}
```

## ⚠️ Important Notes

1. **Environment File**: Make sure to create the `.env` file in the root directory
2. **Restart Server**: After creating/modifying `.env`, restart the development server
3. **Role IDs**: 
   - `role_id: 1` = Admin
   - `role_id: 2` = User
4. **Protected Routes**: All routes are protected and check for authentication and role
5. **Navigation**: The `useRoutePath` hook should be used for all internal navigation

## 🔐 Security

- Routes are protected by role-based authentication
- Unauthorized access attempts redirect to appropriate dashboard
- User role is stored in localStorage (should use secure cookies in production)
- Token-based authentication ready for backend integration

---

**Status**: ✅ Fully Implemented  
**Last Updated**: 2025-10-14


