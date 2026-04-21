"use strict";
// TypeScript Authentication System with DOM Manipulation and Local Storage
// Local Storage Keys
const USERS_STORAGE_KEY = 'finance_app_users';
const CURRENT_USER_KEY = 'finance_app_current_user';
// Utility Functions
class AuthUtils {
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    static hashPassword(password) {
        // Simple hash for demo purposes 
        return btoa(password);
    }
    static validatePassword(password) {
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long' };
        }
        // if (!/(?=.*[a-z])/.test(password)) {
        //     return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        // }
        // if (!/(?=.*[A-Z])/.test(password)) {
        //     return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        // }
        // if (!/(?=.*\d)/.test(password)) {
        //     return { isValid: false, message: 'Password must contain at least one number' };
        // }
        return { isValid: true, message: 'Password is valid' };
    }
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        return { isValid: true, message: 'Email is valid' };
    }
    static validateName(name) {
        if (name.trim().length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long' };
        }
        if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
            return { isValid: false, message: 'Name can only contain letters and spaces' };
        }
        return { isValid: true, message: 'Name is valid' };
    }
}
// Local Storage Management
class AuthStorageManager {
    static getUsers() {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    }
    static saveUsers(users) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    static getCurrentUser() {
        const user = localStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    }
    static setCurrentUser(user) {
        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }
        else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    }
    static addUser(user) {
        const users = this.getUsers();
        const existingUser = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (existingUser) {
            return false; // User already exists
        }
        users.push(user);
        this.saveUsers(users);
        return true;
    }
    static authenticateUser(email, password) {
        const users = this.getUsers();
        const hashedPassword = AuthUtils.hashPassword(password);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() &&
            u.password === hashedPassword);
        return user || null;
    }
}
// DOM Manipulation Class
class DOMManager {
    static showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }
    static hideError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }
    static showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }
    static hideSuccess(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }
    static setInputError(inputId, hasError) {
        const input = document.getElementById(inputId);
        if (input) {
            if (hasError) {
                input.classList.add('error');
                input.classList.remove('success');
            }
            else {
                input.classList.remove('error');
                input.classList.add('success');
            }
        }
    }
    static clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error', 'success');
        });
        this.hideSuccess('successMessage');
        this.hideError('loginError');
    }
    static togglePasswordVisibility(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        if (input && toggle) {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            toggle.textContent = type === 'password' ? '👁' : '🙈';
        }
    }
    static setButtonLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = isLoading;
            button.textContent = isLoading ? 'Processing...' : (buttonId === 'signupBtn' ? 'Create Account' : 'Login');
        }
    }
    static saveRememberedCredentials(email, password) {
        const credentials = {
            email: email,
            password: password,
            timestamp: Date.now()
        };
        localStorage.setItem('finance_remembered_credentials', JSON.stringify(credentials));
    }
    static getRememberedCredentials() {
        const stored = localStorage.getItem('finance_remembered_credentials');
        return stored ? JSON.parse(stored) : null;
    }
    static clearRememberedCredentials() {
        localStorage.removeItem('finance_remembered_credentials');
    }
    static restoreRememberedCredentials() {
        const credentials = this.getRememberedCredentials();
        if (credentials) {
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            const rememberCheckbox = document.getElementById('rememberMe');
            if (emailInput && passwordInput && rememberCheckbox) {
                emailInput.value = credentials.email;
                passwordInput.value = credentials.password;
                rememberCheckbox.checked = true;
            }
        }
    }
    static showLoadingSpinner(show) {
        let spinner = document.getElementById('loadingSpinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'loadingSpinner';
            spinner.className = 'loading-spinner';
            spinner.innerHTML = `
                <div class="spinner-overlay">
                    <div class="spinner-content">
                        <div class="spinner"></div>
                        <p class="spinner-text">Loading...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(spinner);
        }
        spinner.style.display = show ? 'flex' : 'none';
    }
    // Public methods for form handling
    static initializeSignupForm() {
        const form = document.getElementById('signupForm');
        if (!form)
            return;
        // Password toggle events
        const passwordToggle = document.getElementById('passwordToggle');
        const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
        passwordToggle?.addEventListener('click', () => {
            this.togglePasswordVisibility('password', 'passwordToggle');
        });
        confirmPasswordToggle?.addEventListener('click', () => {
            this.togglePasswordVisibility('confirmPassword', 'confirmPasswordToggle');
        });
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });
    }
    static initializeLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form)
            return;
        // Restore remembered credentials if available
        this.restoreRememberedCredentials();
        // Password toggle event
        const passwordToggle = document.getElementById('loginPasswordToggle');
        passwordToggle?.addEventListener('click', () => {
            this.togglePasswordVisibility('loginPassword', 'loginPasswordToggle');
        });
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }
    static async handleSignup() {
        this.clearAllErrors();
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            this.showError('nameError', 'Form elements not found');
            return;
        }
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        // Validate name
        const nameValidation = AuthUtils.validateName(name);
        if (!nameValidation.isValid) {
            this.showError('nameError', nameValidation.message);
            this.setInputError('name', true);
            return;
        }
        this.setInputError('name', false);
        // Validate email
        const emailValidation = AuthUtils.validateEmail(email);
        if (!emailValidation.isValid) {
            this.showError('emailError', emailValidation.message);
            this.setInputError('email', true);
            return;
        }
        this.setInputError('email', false);
        // Validate password
        const passwordValidation = AuthUtils.validatePassword(password);
        if (!passwordValidation.isValid) {
            this.showError('passwordError', passwordValidation.message);
            this.setInputError('password', true);
            return;
        }
        this.setInputError('password', false);
        // Check password confirmation
        if (password !== confirmPassword) {
            this.showError('confirmPasswordError', 'Passwords do not match');
            this.setInputError('confirmPassword', true);
            return;
        }
        this.setInputError('confirmPassword', false);
        // Set loading state
        this.setButtonLoading('signupBtn', true);
        try {
            // Create user object
            const newUser = {
                id: AuthUtils.generateId(),
                name: name,
                email: email.toLowerCase(),
                password: AuthUtils.hashPassword(password),
                createdAt: new Date()
            };
            // Save user
            const success = AuthStorageManager.addUser(newUser);
            if (success) {
                // Don't set as current user - user must login manually
                // Show success message
                this.showSuccess('successMessage', 'Account created successfully! Redirecting to login...');
                // Clear form
                nameInput.value = '';
                emailInput.value = '';
                passwordInput.value = '';
                confirmPasswordInput.value = '';
                // Redirect to login after delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
            else {
                this.showError('emailError', 'An account with this email already exists');
                this.setInputError('email', true);
            }
        }
        catch (error) {
            console.error('Signup error:', error);
            this.showError('nameError', 'An error occurred during signup. Please try again.');
        }
        finally {
            this.setButtonLoading('signupBtn', false);
        }
    }
    static async handleLogin() {
        this.clearAllErrors();
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        if (!emailInput || !passwordInput) {
            this.showError('loginError', 'Form elements not found');
            return;
        }
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        // Basic validation
        if (!email) {
            this.showError('loginEmailError', 'Email is required');
            this.setInputError('loginEmail', true);
            return;
        }
        if (!password) {
            this.showError('loginPasswordError', 'Password is required');
            this.setInputError('loginPassword', true);
            return;
        }
        // Set loading state
        this.setButtonLoading('loginBtn', true);
        try {
            // Authenticate user
            const user = AuthStorageManager.authenticateUser(email, password);
            if (user) {
                // Check if remember me is checked
                const rememberCheckbox = document.getElementById('rememberMe');
                if (rememberCheckbox && rememberCheckbox.checked) {
                    this.saveRememberedCredentials(email, password);
                }
                else {
                    this.clearRememberedCredentials();
                }
                // Show loading state
                this.showLoadingSpinner(true);
                // Set as current user
                AuthStorageManager.setCurrentUser(user);
                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
            else {
                this.showError('loginError', 'Invalid email or password');
                this.setInputError('loginEmail', true);
                this.setInputError('loginPassword', true);
            }
        }
        catch (error) {
            console.error('Login error:', error);
            this.showLoadingSpinner(false);
            this.showError('loginError', 'An error occurred during login. Please try again.');
        }
        finally {
            this.setButtonLoading('loginBtn', false);
        }
    }
    static checkAuthState() {
        const currentUser = AuthStorageManager.getCurrentUser();
        return {
            isLoggedIn: !!currentUser,
            currentUser: currentUser
        };
    }
    static logout() {
        // Clear only the current user session
        AuthStorageManager.setCurrentUser(null);
        // Clear remembered credentials on logout if user wants privacy
        // Users list remains in local storage for future logins
        // Redirect to login
        window.location.href = 'login.html';
    }
}
// Initialize forms based on current page
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('signup.html')) {
        DOMManager.initializeSignupForm();
    }
    else if (currentPath.includes('login.html')) {
        DOMManager.initializeLoginForm();
    }
    else if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
        // Protect dashboard - redirect to login if not authenticated
        const authState = DOMManager.checkAuthState();
        if (!authState.isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }
    }
    // Check if user is already logged in
    const authState = DOMManager.checkAuthState();
    if (authState.isLoggedIn && (currentPath.includes('login.html') || currentPath.includes('signup.html'))) {
        // Redirect to dashboard if already logged in
        window.location.href = 'index.html';
    }
});
// Export for potential use in other files
window.AuthSystem = {
    logout: DOMManager.logout,
    checkAuthState: DOMManager.checkAuthState
};
