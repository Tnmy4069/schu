'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

interface ApplicationData {
  id: number;
  name: string;
  course_name: string;
  year_of_study: number;
  created_at: string | null;
  updated_at: string | null;
  student_salaried: boolean;
  father_alive: boolean;
  father_working: boolean;
  father_occupation: string | null;
  mother_alive: boolean;
  mother_working: boolean;
  mother_occupation: string | null;
  marksheet_upload: string | null;
  aadhar_no: string;
  cap_id: string;
}

interface ApiResponse {
  code?: string;
  error?: string;
  details?: string;
  id?: number;
  name?: string;
}

export default function TrackApplication() {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      applicationId: '',
    },
    validationSchema: Yup.object({
      applicationId: Yup.string()
        .required('Application ID is required')
        .matches(/^\d+$/, 'Application ID must be a number'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setApplicationData(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`/api/track?id=${values.applicationId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: ApiResponse = await response.json();

        if (!response.ok) {
          let errorMessage = 'Failed to fetch application details';

          if (data.code) {
            const errorMessages: Record<string, string> = {
              NOT_FOUND: `Application with ID ${values.applicationId} was not found`,
              CONNECTION_ERROR: 'Unable to connect to the database. Please try again later',
              TABLE_ERROR: 'Database configuration error. Please contact support',
            };
            errorMessage = errorMessages[data.code] || data.error || data.details || errorMessage;
          }

          throw new Error(errorMessage);
        }

        if (!data.id || !data.name) {
          throw new Error('Incomplete application data received');
        }

        setApplicationData(data as ApplicationData);
        toast.success('Application details fetched successfully');
      } catch (err) {
        const errorObj = err as Error;

        let errorMessage = 'Failed to fetch application details';

        if (!navigator.onLine) {
          errorMessage = 'No internet connection. Please check your network and try again.';
        } else if (errorObj.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please try again later.';
        } else {
          errorMessage = errorObj.message;
        }

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not Available';
    
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Application</h1>

        <form onSubmit={formik.handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="applicationId" className="block text-sm font-medium text-gray-700 mb-1">
              Application ID
            </label>
            <input
              id="applicationId"
              name="applicationId"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.applicationId}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your application ID"
            />
            {formik.touched.applicationId && formik.errors.applicationId && (
              <p className="mt-2 text-sm text-red-600">{formik.errors.applicationId}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Fetching details...' : 'Track Application'}
          </button>
        </form>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-8">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

{applicationData && (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
        <p className="text-sm text-gray-500 mt-1">Application ID: {applicationData.id}</p>
      </div>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-500">
        Under Review
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
        <dl className="mt-3 space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-900">Name</dt>
            <dd className="mt-1 text-sm text-gray-500">{applicationData.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-900">Course</dt>
            <dd className="mt-1 text-sm text-gray-500">{applicationData.course_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-900">Year of Study</dt>
            <dd className="mt-1 text-sm text-gray-500">{applicationData.year_of_study}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-900">CAP ID</dt>
            <dd className="mt-1 text-sm text-gray-500">{applicationData.cap_id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-900">Aadhar Number</dt>
            <dd className="mt-1 text-sm text-gray-500">
              {applicationData.aadhar_no.replace(/(\d{4})/g, '$1 ').trim()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Family Information */}
      <div>
        <h3 className="text-sm font-medium text-gray-500">Family Information</h3>
        <dl className="mt-3 space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-900">Father&apos;s Status</dt>
            <dd className="mt-1 text-sm text-gray-500">
              {applicationData.father_alive ? 'Alive' : 'Deceased'} • 
              {applicationData.father_working ? ' Working' : ' Not Working'}
              {applicationData.father_occupation && ` • ${applicationData.father_occupation}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-900">Mother&apos;s Status</dt>
            <dd className="mt-1 text-sm text-gray-500">
              {applicationData.mother_alive ? 'Alive' : 'Deceased'} • 
              {applicationData.mother_working ? ' Working' : ' Not Working'}
              {applicationData.mother_occupation && ` • ${applicationData.mother_occupation}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-900">Student Employment</dt>
            <dd className="mt-1 text-sm text-gray-500">
              {applicationData.student_salaried ? 'Employed' : 'Not Employed'}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    {/* Application Timeline */}
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h3 className="text-sm font-medium text-gray-500">Application Timeline</h3>
      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-900">Submitted On</dt>
          <dd className="mt-1 text-sm text-gray-500">{formatDate(applicationData.created_at)}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-900">Last Updated</dt>
          <dd className="mt-1 text-sm text-gray-500">{formatDate(applicationData.updated_at)}</dd>
        </div>
      </dl>
    </div>
  </div>
)}

      </div>
    </div>
  );
}
