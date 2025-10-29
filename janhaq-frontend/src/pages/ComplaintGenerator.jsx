import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDepartments, rewriteComplaint, submitComplaint } from '../utils/api';
import { FileText, Send, Loader, Zap, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComplaintGenerator = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        area: '',
        department: '',
        originalText: '',
    });
    const [formalComplaint, setFormalComplaint] = useState(null); // { formalText: string, formalSubject: string }
    
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch departments on load
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const depts = await getDepartments();
                setDepartments(depts);
                // Set first department as default if list is not empty
                if (depts.length > 0) {
                    setFormData(prev => ({ ...prev, department: depts[0].name }));
                }
            } catch (err) {
                console.error("Error fetching departments:", err);
                setError('Failed to load departments. Please try refreshing.');
            }
        };
        fetchDepts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear formal complaint if original text changes
        if (name === 'originalText' && formalComplaint) {
            setFormalComplaint(null);
            setError(null);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError(null);
        setFormalComplaint(null);

        if (!formData.department || !formData.originalText || !formData.fullName || !formData.area) {
            return setError('Please fill in Department, Full Name, Area/Locality, and Complaint Description.');
        }

        setGenerating(true);
        try {
            const data = {
                department: formData.department,
                description: formData.originalText,
                name: formData.fullName,
                area: formData.area
            };
            const result = await rewriteComplaint(data);
            setFormalComplaint(result);
        } catch (err) {
            setError(err.message || 'Error generating formal complaint.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmitComplaint = async () => {
        if (!formalComplaint) {
            return setError('Please generate the formal complaint first.');
        }
        
        setLoading(true);
        setError(null);
        setSuccess(false);

        const fullEmailText = generateFullEmailText(formalComplaint.formalText, formalComplaint.formalSubject);

        const complaintData = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            area: formData.area,
            department: formData.department,
            originalText: formData.originalText,
            formalText: fullEmailText,
        };
        
        try {
            await submitComplaint(complaintData);
            setSuccess(true);
            setFormalComplaint(null);
            setFormData(prev => ({
                ...prev,
                phone: '',
                area: '',
                originalText: '',
            }));

            // Auto-navigate after a short delay (This is the required line)
            setTimeout(() => {
                navigate('/my-complaints');
            }, 3000);

        } catch (err) {
            setError(err.message || 'Error submitting complaint.');
        } finally {
            setLoading(false);
        }
    };
    
    const selectedDepartment = useMemo(() => 
        departments.find(d => d.name === formData.department), 
        [departments, formData.department]
    );

    const generateFullEmailText = (bodyText, subject) => {
        const today = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Structure the final email text for saving to DB and preview
        return `To: The ${formData.department} Department
Subject: ${subject}

Dear Sir/Madam,

${bodyText}

Sincerely,
${formData.fullName}
Contact Email: ${formData.email}
Contact Phone: ${formData.phone || 'N/A'}
Locality: ${formData.area}
Date: ${today}`;
    };


    const previewText = formalComplaint 
        ? generateFullEmailText(formalComplaint.formalText, formalComplaint.formalSubject)
        : null;

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-12 px-6">
                
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Dashboard
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <h1 className="text-3xl font-bold">Complaint Generator</h1>
                </div>

                {/* Status/Feedback Messages */}
                {success && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 flex items-center gap-3">
                        <Send className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium">✅ Complaint submitted successfully! Redirecting to My Complaints...</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium">Error: {error}</p>
                    </div>
                )}


                <div className="grid lg:grid-cols-2 gap-10">
                    
                    {/* Complaint Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-fit sticky top-24 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
                            1. Enter Complaint Details
                        </h2>

                        <form onSubmit={handleGenerate} className="space-y-4">
                            
                            {/* Full Name & Email (Prefilled) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={!!user} // Disable if user is logged in and prefilled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={!!user} // Disable if user is logged in and prefilled
                                    />
                                </div>
                            </div>
                            
                            {/* Phone Number & Area/Locality */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="area" className="block text-sm font-medium mb-1">Area / Locality</label>
                                    <input
                                        type="text"
                                        id="area"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., Sector 10, Ramnagar"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Select Department */}
                            <div>
                                <label htmlFor="department" className="block text-sm font-medium mb-1">Select Department</label>
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={departments.length === 0}
                                >
                                    {departments.length === 0 ? (
                                        <option value="">Loading departments...</option>
                                    ) : (
                                        departments.map(dept => (
                                            <option key={dept.name} value={dept.name}>{dept.name}</option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Complaint Description */}
                            <div>
                                <label htmlFor="originalText" className="block text-sm font-medium mb-1">Complaint Description (In your own words)</label>
                                <textarea
                                    id="originalText"
                                    name="originalText"
                                    value={formData.originalText}
                                    onChange={handleChange}
                                    rows="5"
                                    required
                                    placeholder="e.g., The street light near my house (H.No 123) has been broken for 3 days and I almost fell last night. Please fix it."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={generating || loading || !formData.department || !formData.originalText || !formData.fullName || !formData.area}
                                className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                            >
                                {generating ? (
                                    <>
                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                        Generating Formal Complaint...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 mr-2" />
                                        Generate Formal Complaint
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* AI-Generated Complaint Preview */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
                            2. Review & Submit
                        </h2>

                        {formalComplaint ? (
                            <>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 overflow-x-auto">
                                    <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                                        {previewText}
                                    </pre>
                                </div>
                                
                                <button
                                    onClick={handleSubmitComplaint}
                                    disabled={loading || generating}
                                    className="mt-6 w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150 disabled:bg-green-400 dark:disabled:bg-green-800 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                                            Submitting Complaint...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Send Complaint
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                                    By clicking 'Send Complaint', you agree to submit the formal text above to the {formData.department} Department.
                                </p>
                            </>
                        ) : (
                            <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                <Zap className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Enter your details on the left and click **'Generate Formal Complaint'** to see the AI-rewritten version here.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ComplaintGenerator;