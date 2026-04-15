'use client';

import { useState } from 'react';
import { User, X } from 'lucide-react';

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'employee'>('employee');
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    fullName: '',
    email: '',
    employeeId: '',
    mobileNumber: '',
    Email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({
      identifier: '',
      password: '',
      fullName: '',
      email: '',
      employeeId: '',
      mobileNumber: '',
      Email: ''
    });
    setError('');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let endpoint: string;
    let body: any;

    if (!isSignup) {
      endpoint = userType === 'admin' ? '/api/auth/admin/login' : '/api/auth/employee/login';
      body = userType === 'admin'
        ? { userName: formData.identifier.trim(), password: formData.password }
        : { email: formData.identifier.trim(), password: formData.password };
    } else {
      endpoint = userType === 'admin' ? '/api/auth/admin/sign-up' : '/api/auth/employee/sign-up';
      if (userType === 'admin') {
        body = {
          userName: formData.identifier.trim(),
          password: formData.password,
          fullName: formData.fullName.trim(),
          Email: formData.Email.trim()
        };
      } else {
        body = {
          employeeId: formData.employeeId.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          password: formData.password
        };
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (!isSignup) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', userType);
          localStorage.setItem('id', data.id);
          handleClose();
          alert('Login successful!');
          window.location.reload();
        } else {
          handleClose();
          alert('Sign-up successful! Please login.');
          setIsSignup(false);
        }
      } else {
        setError(data.error || `${isSignup ? 'Sign-up' : 'Login'} failed`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-24 right-8 bg-slate-800 text-white p-4 rounded-full hover:bg-slate-700 shadow-lg transition-all hover:shadow-xl z-50"
        aria-label="Login"
      >
        <User size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-green-800 to-green-900 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-center">
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-center text-slate-300 text-sm mt-1">
                {isSignup ? 'Sign up to get started' : 'Login to continue'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  I am a/an:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setUserType('employee');
                      resetForm();
                    }}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      userType === 'employee'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserType('admin');
                      setIsSignup(false);
                      resetForm();
                    }}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      userType === 'admin'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Login Fields */}
              {!isSignup ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {userType === 'admin' ? 'Username' : 'Email Address'}
                    </label>
                    <input
                      type={userType === 'admin' ? 'text' : 'email'}
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      placeholder={userType === 'admin' ? 'Enter your username' : 'Enter your email'}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                </>
              ) : (
                // Signup Fields
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>

                  {userType === 'admin' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.identifier}
                          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                          placeholder="Choose a username"
                          required
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.Email}
                          onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                          placeholder="Enter your email"
                          required
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          placeholder="Enter your employee ID"
                          required
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                          required
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={formData.mobileNumber}
                          onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                          placeholder="Enter your mobile number"
                          required
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>
                    </>
                  )}

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a password"
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isSignup ? 'Creating Account...' : 'Logging In...'}
                  </span>
                ) : (
                  isSignup ? 'Create Account' : 'Login'
                )}
              </button>

              {/* Toggle between Login/Signup */}
              {userType === 'employee' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                  >
                    {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
