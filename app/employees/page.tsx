"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, ArrowLeft, User } from "lucide-react";
import Link from "next/link";

interface Employee {
  id: number;
  employeeId: string;
  fullName: string | null;
  email: string | null;
  mobileNumber: string | null;
  password: string;
  status: boolean | null;
  regDate: Date;
  updationDate: Date | null;
}

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        // Check if user is admin
        if (role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetch('/api/employees', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 403) {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch employee data');
        }

        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [router]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-green-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
          <Link href="/dashboard" className="mt-4 inline-block text-green-700 hover:text-green-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-green-700 hover:text-green-800 transition"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-green-700" />
              <h1 className="text-3xl font-bold text-black">Employee Data</h1>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Total Employees: <span className="font-bold text-green-700">{employees.length}</span>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Employee ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Full Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mobile Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Password</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Registration Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">{employee.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{employee.employeeId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{employee.fullName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{employee.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{employee.mobileNumber || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono break-all max-w-xs">
                        {employee.password}
                        {employee.password.startsWith('$2b$') && (
                          <span className="text-xs text-gray-500 block mt-1">(Legacy hashed - cannot be unhashed)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            employee.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {employee.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(employee.regDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(employee.updationDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;

