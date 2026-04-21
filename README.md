# Finance App Authentication System

A complete TypeScript-based authentication system with DOM manipulation and local storage for the Finance application.

## Features

### ✅ Signup Functionality

- **Form Validation**: Real-time validation for name, email, password, and password confirmation
- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, and numbers
- **Email Validation**: Proper email format checking
- **Duplicate Prevention**: Prevents signup with existing email addresses
- **Password Visibility Toggle**: Eye icon to show/hide passwords
- **Success Feedback**: Visual confirmation and auto-redirect after successful signup

### ✅ Login Functionality

- **Email/Password Authentication**: Secure login with stored credentials
- **Form Validation**: Required field validation
- **Error Handling**: Clear error messages for invalid credentials
- **Password Visibility Toggle**: Eye icon for password field
- **Auto-redirect**: Redirects to dashboard after successful login

### ✅ Data Storage

- **Local Storage**: User data stored securely in browser local storage
- **Password Hashing**: Basic password hashing (use proper hashing in production)
- **User Sessions**: Current user session management
- **Data Persistence**: User accounts persist across browser sessions

### ✅ TypeScript Implementation

- **Type Safety**: Full TypeScript interfaces and type checking
- **Modular Architecture**: Separated concerns (Utils, Storage, DOM manipulation)
- **Error Handling**: Comprehensive error handling and user feedback
- **DOM Manipulation**: Type-safe DOM operations

## File Structure

```
├── signup.html          # Signup page with form
├── login.html           # Login page with form
├── index.css            # Styling for forms and validation
├── index.ts             # TypeScript source code
├── index.js             # Compiled JavaScript
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Key Components

### 1. User Interface (`interface User`)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}
```

### 2. Validation System (`AuthUtils`)

- Email validation with regex
- Password strength requirements
- Name validation (letters and spaces only)

### 3. Storage Management (`AuthStorageManager`)

- Local storage operations
- User CRUD operations
- Session management

### 4. DOM Manipulation (`DOMManager`)

- Form initialization
- Event handling
- Real-time validation feedback
- Password toggle functionality

## Usage

### Signup Process

1. User fills out the signup form
2. Real-time validation provides immediate feedback
3. Password requirements are enforced
4. Account is created and stored in local storage
5. User is automatically logged in and redirected

### Login Process

1. User enters email and password
2. Credentials are validated against stored users
3. Successful login sets user session
4. User is redirected to the main application

## Security Notes

⚠️ **This is a demo implementation for learning purposes**

- Passwords are hashed with `btoa()` (not secure for production)
- Data is stored in localStorage (not secure for sensitive data)
- No server-side validation or authentication
- For production use:
  - Implement proper password hashing (bcrypt, argon2)
  - Use secure HTTP-only cookies for sessions
  - Add server-side validation
  - Implement rate limiting and CSRF protection

## Browser Support

- Modern browsers with ES2020 support
- Local storage enabled
- JavaScript enabled

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Open in browser
# signup.html or login.html
```

## Validation Rules

### Name

- Minimum 2 characters
- Letters and spaces only

### Email

- Valid email format (user@domain.com)

### Password

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Error Messages

All forms provide clear, user-friendly error messages:

- Field-specific validation errors
- General form submission errors
- Success confirmations

## Future Enhancements

- Password reset functionality
- Email verification
- Two-factor authentication
- Account management features
- Server-side integration</content>
  <parameter name="filePath">c:\KLab\Typescript\Finance Dom Manipulation\README.md
