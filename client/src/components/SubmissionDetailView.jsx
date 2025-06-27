import Editor from '@monaco-editor/react';
import Loader from './Loader';

const getVerdictColor = (verdict) => {
    switch (verdict) {
        case 'Accepted': return 'text-green-400';
        case 'Time Limit Exceeded': case 'Memory Limit Exceeded': return 'text-orange-400';
        case 'Wrong Answer': case 'Compilation Error': case 'Runtime Error': return 'text-red-400';
        default: return 'text-yellow-400';
    }
};

const StatCard = ({ label, value, unit = '' }) => (
    <div className="bg-secondary p-3 rounded-lg">
        <div className="text-xs text-text-secondary">{label}</div>
        <div className="text-lg font-semibold text-text-primary">
            {value ?? 'N/A'}{value && unit}
        </div>
    </div>
);

export default function SubmissionDetailView({ submission }) {
    if (!submission) return null;

    const languageMap = {
        cpp: 'cpp',
        javascript: 'javascript',
    };

    return (
        <div className="p-4 overflow-y-auto h-full space-y-6">
            <div>
                <h2 className={`text-3xl font-bold ${getVerdictColor(submission.verdict)}`}>
                    {submission.verdict}
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                    Submitted on {new Date(submission.submittedAt).toLocaleString()}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Language" value={submission.language} />
            </div>

            <div>
                <h3 className="font-semibold text-md mb-2 text-text-primary">Submitted Code</h3>
                <div className="h-96 border border-border-color rounded-lg overflow-hidden">
                    <Editor
                        height="100%"
                        language={languageMap[submission.language]}
                        value={submission.code}
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
            
            {/* Future enhancement: Display failed test case details here */}
        </div>
    );
}