import React, { useState, useEffect } from 'react';
import { getComplaints, getComplaintDetails } from '../utils/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Loader, Eye } from 'lucide-react';

// Reusable Modal Component to show full complaint text
const ComplaintDetailModal = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Complaint Details: ${complaint.subject || complaint.department}`}>
      <div className="space-y-4 text-sm">
        
        <div className="grid grid-cols-2 gap-4 border-b pb-4 dark:border-gray-700">
            <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Department</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{complaint.department}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Status</p>
                <p className={`text-lg font-bold ${complaint.status === 'Submitted' ? 'text-orange-500' : 'text-green-500'}`}>{complaint.status}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Submitted On</p>
                <p>{formatDate(complaint.createdAt)}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Area</p>
                <p>{complaint.area || 'N/A'}</p>
            </div>
        </div>
        
        <h3 className="text-md font-semibold mt-6 mb-2">Original Complaint Text (User Input)</h3>
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{complaint.originalText}</p>
        </div>

        <h3 className="text-md font-semibold mt-6 mb-2">Formal Complaint (Submitted)</h3>
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg max-h-80 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">
                {complaint.formalText}
            </pre>
        </div>

      </div>
    </Modal>
  );
};


export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    // Remove the mockData import which is no longer used
    // import { complaints } from '../utils/mockData'; 

    const fetchComplaints = async () => {
      try {
        const data = await getComplaints();
        // Add subject fallback and date formatting
        const formattedData = data.map(c => ({
            ...c,
            subject: c.subject || `Complaint to ${c.department}`,
            createdAt: new Date(c.createdAt).toLocaleDateString('en-IN')
        }));
        setComplaints(formattedData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch complaints.');
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleViewDetails = async (complaintId) => {
    setSelectedComplaint(null);
    setDetailsLoading(true);
    try {
        const details = await getComplaintDetails(complaintId);
        setSelectedComplaint(details);
    } catch (err) {
        alert('Failed to load full complaint details: ' + (err.message || 'An error occurred.'));
    } finally {
        setDetailsLoading(false);
    }
  };

  const columns = [
    { 
        header: 'Complaint Subject', 
        accessor: 'subject',
        render: (item) => (
            <div className="font-semibold text-gray-800 dark:text-gray-200">
                {item.subject}
            </div>
        )
    },
    { header: 'Department', accessor: 'department' },
    { header: 'Date', accessor: 'createdAt' },
    { 
        header: 'Status', 
        accessor: 'status',
        render: (item) => (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                item.status === 'Submitted' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                item.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
                {item.status}
            </span>
        )
    },
    { 
        header: 'Actions', 
        accessor: '_id',
        render: (item) => (
            <button
                onClick={() => handleViewDetails(item._id)}
                disabled={detailsLoading}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm disabled:opacity-50"
            >
                {detailsLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Eye className="w-4 h-4 mr-1" /> View
                    </>
                )}
            </button>
        )
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 flex flex-col">
     
      {/* Detail Modal */}
      <ComplaintDetailModal 
        complaint={selectedComplaint} 
        onClose={() => setSelectedComplaint(null)} 
      />

      <div className="flex-grow max-w-6xl mx-auto py-16 px-6 w-full">
        <h1 className="text-3xl font-bold mb-8">My Complaints</h1>
        
        {loading ? (
            <div className="flex items-center justify-center py-20">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                <p className="ml-3 text-lg">Loading your complaints...</p>
            </div>
        ) : error ? (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800">
                {error}
            </div>
        ) : complaints.length === 0 ? (
            <div className="p-8 bg-white dark:bg-gray-800 rounded-xl text-center border border-gray-200 dark:border-gray-700">
                <p className="text-lg text-gray-600 dark:text-gray-400">You have no complaints on file.</p>
                <p className="mt-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <a href="/complaint-generator">File a new complaint now!</a>
                </p>
            </div>
        ) : (
            <Table columns={columns} data={complaints} />
        )}
      </div>

    </div>
  );
}