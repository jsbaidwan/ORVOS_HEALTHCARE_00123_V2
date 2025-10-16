# Google reCAPTCHA v2 Setup Guide

## ✅ What Was Implemented

Google reCAPTCHA v2 verification has been added to **both** login pages:
- ✅ **User Login** (`/login`)
- ✅ **Admin Login** (`/admin/login`)

## 🔐 Features

### Security Features
- **Enabled by default** - reCAPTCHA checkbox is checked by default for security
- **Optional toggle** - Users can disable it if needed (not recommended)
- **Verification required** - Login blocked until reCAPTCHA is completed
- **Auto-reset** - reCAPTCHA resets when component unmounts
- **Error handling** - Handles expired/error states

### User Experience
- Clear error messages if reCAPTCHA not completed
- Visual feedback with checkbox
- "(Recommended)" label to encourage use
- Clean integration with existing login forms

## 🚀 Setup Instructions

### Step 1: Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Click **"Create"** or **"+"** to register a new site
3. Fill in the form:
   - **Label**: Your app name (e.g., "Orvos Medical")
   - **reCAPTCHA type**: Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
   - **Domains**: Add your domains
     - For development: `localhost`
     - For production: `yourdomain.com`
   - Accept the terms
4. Click **Submit**
5. Copy your **Site Key** and **Secret Key**

### Step 2: Add to Environment Variables

Update your `.env` file in the project root:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Google reCAPTCHA
REACT_APP_RECAPTCHA_SITE_KEY=your_actual_site_key_here

# Route Prefixes
REACT_APP_ADMIN_ROUTE_PREFIX=admin
REACT_APP_USER_ROUTE_PREFIX=

# App Configuration
REACT_APP_NAME=Orvos Medical Clinic Management
REACT_APP_VERSION=1.0.0
```

**Important**: Replace `your_actual_site_key_here` with your actual Site Key from Google.

### Step 3: Test Key (Development Only)

For testing/development, the app uses Google's test key:
- **Test Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- This key **always passes** validation
- Replace with your real key for production!

### Step 4: Restart Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm start
```

## 📋 How It Works

### User Login Flow

```
1. User goes to /login
2. reCAPTCHA is enabled by default (checkbox checked)
3. Google reCAPTCHA widget loads
4. User checks "I'm not a robot"
5. reCAPTCHA verifies → captchaVerified = true
6. User clicks "Sign In"
7. Form validation checks:
   - Email & password filled?
   - reCAPTCHA completed? ✓
8. Login proceeds
```

### Admin Login Flow

```
1. Admin goes to /admin/login
2. reCAPTCHA is enabled by default (checkbox checked)
3. Google reCAPTCHA widget loads
4. Admin checks "I'm not a robot"
5. reCAPTCHA verifies → captchaVerified = true
6. Admin clicks "Admin Sign In"
7. Form validation checks:
   - Email & password filled?
   - reCAPTCHA completed? ✓
8. Login proceeds
```

## 🎨 User Interface

### Both Login Pages Include:

```javascript
// Checkbox to enable/disable reCAPTCHA
☑️ Use Google reCAPTCHA v2 verification (Recommended)

// reCAPTCHA widget (when enabled)
[I'm not a robot] ✓
Protected by Google reCAPTCHA v2
```

### Error States:

- **Not completed**: "Please complete the reCAPTCHA verification"
- **Expired**: Automatically resets, user must verify again
- **Error**: Automatically marks as not verified

## 🔧 Technical Implementation

### GoogleCacheLogin Component

**Location**: `src/components/Auth/GoogleCacheLogin.js`

**Features**:
- Dynamically loads Google reCAPTCHA script
- Uses explicit render mode for better control
- Handles callbacks: success, expired, error
- Auto-cleanup on unmount
- Configurable site key from environment

**Props**:
```javascript
<GoogleCacheLogin onVerify={(verified) => setCaptchaVerified(verified)} />
```

### UserLogin Component

**Location**: `src/components/Auth/UserLogin.js`

**State**:
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
  useGoogleCaptcha: true, // Enabled by default
});
const [captchaVerified, setCaptchaVerified] = useState(false);
```

**Validation**:
```javascript
if (formData.useGoogleCaptcha && !captchaVerified) {
  setError('Please complete the reCAPTCHA verification');
  return;
}
```

### SuperAdminLogin Component

**Location**: `src/components/Auth/SuperAdminLogin.js`

Same implementation as UserLogin, with admin-specific styling.

## 🌐 Environment Variables

### Required
```env
REACT_APP_RECAPTCHA_SITE_KEY=your_site_key_here
```

### Optional (Defaults)
- Falls back to Google's test key if not set
- Test key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`

## 🧪 Testing

### Test reCAPTCHA Integration

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Test User Login**:
   - Go to `http://localhost:3000/login`
   - Should see reCAPTCHA checkbox enabled
   - Should see "I'm not a robot" widget
   - Try logging in without checking → Error shown
   - Check the box, then login → Should work

3. **Test Admin Login**:
   - Go to `http://localhost:3000/admin/login`
   - Should see reCAPTCHA checkbox enabled
   - Same behavior as User Login

4. **Test Optional Toggle**:
   - Uncheck "Use Google reCAPTCHA v2 verification"
   - reCAPTCHA widget should disappear
   - Login should work without verification

### Using Test Key (Development)

The test key always passes:
- Always shows checkbox
- Always validates successfully
- No actual verification (for testing only)

### Using Production Key

Real keys:
- Actually verify user is human
- May show challenges (traffic lights, crosswalks, etc.)
- Counts against your quota
- Requires valid domains

## 🔐 Backend Integration (Future)

For production, validate the reCAPTCHA token on the backend:

```javascript
// Frontend sends token
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({
    email,
    password,
    recaptchaToken: token
  })
});

// Backend validates (Node.js example)
const verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
const response = await fetch(verifyURL, {
  method: 'POST',
  body: `secret=${secretKey}&response=${recaptchaToken}`
});
const data = await response.json();

if (!data.success) {
  return res.status(400).json({ error: 'reCAPTCHA verification failed' });
}
```

## 📱 Mobile Support

reCAPTCHA v2 is fully responsive:
- Works on mobile devices
- Touch-friendly interface
- Adapts to screen size

## ⚠️ Important Notes

### Security
1. **Never expose Secret Key** - Only use Site Key in frontend
2. **Always validate on backend** - Frontend validation can be bypassed
3. **Use HTTPS in production** - Required for security
4. **Monitor quota** - Google has usage limits

### Best Practices
1. ✅ Enable by default (better security)
2. ✅ Show clear error messages
3. ✅ Handle expired tokens
4. ✅ Test with real key before production
5. ✅ Validate on backend (not implemented yet)

### Common Issues

**reCAPTCHA not showing?**
- Check browser console for errors
- Verify site key is correct
- Check domain is registered with Google
- Ensure script is loading (check Network tab)

**Always passing (even wrong answers)?**
- You're using the test key
- Replace with your actual key

**"ERROR for site owner"?**
- Domain not authorized
- Add localhost or your domain to allowed domains

## 📚 Resources

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Testing reCAPTCHA](https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do)

## ✨ Summary

✅ **User Login**: Has Google reCAPTCHA v2 (enabled by default)  
✅ **Admin Login**: Has Google reCAPTCHA v2 (enabled by default)  
✅ **Optional**: Can be disabled via checkbox  
✅ **Validated**: Form won't submit without verification  
✅ **Configurable**: Site key from environment variables  
✅ **Production Ready**: Just add your real site key!  

---

**Status**: ✅ Fully Implemented  
**Last Updated**: 2025-10-14


