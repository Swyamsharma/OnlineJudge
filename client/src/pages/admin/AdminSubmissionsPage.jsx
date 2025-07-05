import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllSubmissions, deleteSubmission, reset } from '../../features/submissions/submissionSlice';
import Loader from '../../components/Loader';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

function AdminSubmissionsPage() {
    const dispatch = useDispatch();
    const { allSubmissions, isFetchingAll, isDeleting } = useSelector((state) => state.submission);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState(null);

    useEffect(() => {
        dispatch(getAllSubmissions());
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const handleDeleteClick = (id) => {
        setSubmissionToDelete(id);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (submissionToDelete) {
            dispatch(deleteSubmission(submissionToDelete)).then((result) => {
                if (deleteSubmission.fulfilled.match(result)) {
                    toast.success('Submission deleted successfully!');
                } else {
                    toast.error(result.payload || 'Failed to delete submission.');
                }
            });
        }
        closeModal();
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSubmissionToDelete(null);
    };

    if (isFetchingAll && !allSubmissions.length) {
        return <Loader />;
    }

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'text-green-400';
            case 'Wrong Answer': return 'text-red-400';
            case 'Time Limit Exceeded': case 'Memory Limit Exceeded': return 'text-orange-400';
            case 'Compilation Error': return 'text-yellow-400';
            default: return 'text-text-secondary';
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-text-primary">All Submissions</h1>
                    <Link to="/admin/dashboard" className="text-sm font-medium text-accent hover:text-accent-hover">
                        ← Back to Dashboard
                    </Link>
                </div>
                <div className="bg-primary border border-border-color rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-border-color">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Problem</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Verdict</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Submitted At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {allSubmissions.map(sub => (
                                <tr key={sub._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{sub.userId?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                        <Link to={`/problems/${sub.problemId?._id}`} className="hover:text-accent">
                                            {sub.problemId?.title || 'N/A'}
                                        </Link>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getVerdictColor(sub.verdict)}`}>{sub.verdict}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(sub.submittedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDeleteClick(sub._id)} className="text-red-500 hover:text-red-400" disabled={isDeleting}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {allSubmissions.length === 0 && !isFetchingAll && (
                    <div className="text-center py-10 text-text-secondary">
                        No submissions found.
                    </div>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this submission? This will also remove the source code from storage. This action is permanent and cannot be undone."
                confirmText="Delete"
            />
        </>
    );
}

export default AdminSubmissionsPage;