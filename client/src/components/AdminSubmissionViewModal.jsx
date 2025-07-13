import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Loader from './Loader';

function AdminSubmissionViewModal({ isOpen, onClose, submission, isFetchingDetail }) {
    if (!isOpen) return null;

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'text-green-400';
            case 'Wrong Answer': return 'text-red-400';
            case 'Time Limit Exceeded': case 'Memory Limit Exceeded': return 'text-orange-400';
            case 'Compilation Error': return 'text-yellow-400';
            default: return 'text-text-secondary';
        }
    };

    const languageMap = {
        cpp: 'cpp',
        javascript: 'javascript',
    };

    const renderContent = () => {
        if (isFetchingDetail) {
            return (
                <div className="h-96 flex items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-t-transparent"></div>
                </div>
            );
        }

        if (!submission) {
            return <div className="p-6 text-center text-text-secondary">Could not load submission details.</div>;
        }

        return (
            <>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-text-primary">Submission Details</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div>
                            <span className="font-semibold text-text-secondary">User: </span>
                            <span className="text-text-primary">{submission.userId?.name || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-text-secondary">Problem: </span>
                             <Link to={`/problems/${submission.problemId?._id}`} className="text-accent hover:underline">
                                {submission.problemId?.title || 'N/A'}
                            </Link>
                        </div>
                        <div>
                            <span className="font-semibold text-text-secondary">Verdict: </span>
                            <span className={getVerdictColor(submission.verdict)}>{submission.verdict}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-text-secondary">Language: </span>
                            <span className="text-text-primary">{submission.language}</span>
                        </div>
                        <div className="col-span-2">
                             <span className="font-semibold text-text-secondary">Submitted: </span>
                            <span className="text-text-primary">{new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-6 h-96">
                     <h4 className="font-semibold text-text-secondary mb-2">Submitted Code</h4>
                    <div className="h-full border border-border-color rounded-lg overflow-hidden">
                        <Editor
                            height="100%"
                            language={languageMap[submission.language]}
                            value={submission.code || ''}
                            theme="vs-dark"
                            loading={<Loader />}
                            options={{
                                readOnly: true,
                                domReadOnly: true,
                                padding: { top: 10 },
                                fontSize: 14,
                                minimap: { enabled: false },
                                contextmenu: false,
                            }}
                        />
                    </div>
                </div>
            </>
        );
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl bg-primary border border-border-color rounded-lg shadow-xl flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {renderContent()}
                <div className="flex-shrink-0 px-6 py-4 border-t border-border-color flex justify-end">
                    <button
                        type="button"
                        className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-text-primary shadow-sm ring-1 ring-inset ring-border-color hover:bg-slate-800"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminSubmissionViewModal;