'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'admin' | 'employee'>('admin');
  const [action, setAction] = useState<'login' | 'signup'>('login');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let endpoint: string;
    let body: any;

    if (action === 'login') {
      endpoint = mode === 'admin' ? '/api/auth/admin/login' : '/api/auth/employee/login';
      body = mode === 'admin'
        ? { userName: formData.identifier, password: formData.password }
        : { email: formData.identifier, password: formData.password };
    } else {
      endpoint = mode === 'admin' ? '/api/auth/admin/sign-up' : '/api/auth/employee/sign-up';
      if (mode === 'admin') {
        body = {
          userName: formData.identifier,
          password: formData.password,
          fullName: formData.fullName,
          Email: formData.Email
        };
      } else {
        body = {
          employeeId: formData.employeeId,
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
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
        if (action === 'login') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', mode);
          setIsOpen(false);
          alert('Login successful!');
          window.location.reload(); // Refresh to update navbar
        } else {
          setIsOpen(false);
          alert('Sign-up successful! Please login.');
          setAction('login');
        }
      } else {
        setError(data.error || `${action === 'login' ? 'Login' : 'Sign-up'} failed`);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-24 right-8 bg-green-600 text-white px-4 py-4 rounded-full hover:bg-green-700 z-50"
      >
        {<User />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 text-center">
                {mode === 'admin' ? 'Admin' : 'Employee'} {action === 'login' ? 'Login' : 'Sign-up'}
              </h2>

              {/* Action Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setAction('login')}
                  className={`flex-1 py-2 rounded-md font-medium ${
                    action === 'login'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAction('signup')}
                  className={`flex-1 py-2 rounded-md font-medium ${
                    action === 'signup'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Sign-up
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('admin')}
                  className={`flex-1 py-2 rounded-md font-medium ${
                    mode === 'admin'
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setMode('employee')}
                  className={`flex-1 py-2 rounded-md font-medium ${
                    mode === 'employee'
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Employee
                </button>
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">
                  {error}
                </p>
              )}

              {/* Identifier Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === 'admin' ? 'Username' : 'Email'}
                </label>
                <input
                  type={mode === 'admin' ? 'text' : 'email'}
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  required
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-black"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-black"
                />
              </div>

              {/* Additional fields for sign-up */}
              {action === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-black"
                    />
                  </div>

                  {mode === 'admin' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.Email}
                        onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                        required
                        className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-black"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          required
                          className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          value={formData.mobileNumber}
                          onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                          required
                          className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-black"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (action === 'login' ? 'Logging in...' : 'Signing up...') : `${action === 'login' ? 'Login' : 'Sign-up'} as ${mode === 'admin' ? 'Admin' : 'Employee'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}