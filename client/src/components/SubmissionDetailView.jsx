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
                <StatCard label="Execution Time" value={submission.executionTime} unit=" ms" />
                <StatCard label="Memory Used" value={submission.memoryUsed} unit=" KB" />
            </div>

            {submission.verdict === 'Wrong Answer' && submission.failedTestCase && (
                <div className="bg-secondary p-4 rounded-lg space-y-3 border border-border-color">
                    <h3 className="font-semibold text-md text-text-primary">Failed on Test Case</h3>
                    
                    <div>
                        <h4 className="font-medium text-sm mb-1 text-text-secondary">Input</h4>
                        <pre className="bg-slate-900/80 p-2 rounded-md text-sm font-mono whitespace-pre-wrap">{submission.failedTestCase.input}</pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-sm mb-1 text-red-400">Your Output</h4>
                            <pre className="bg-slate-900/80 p-2 rounded-md text-sm font-mono text-red-400/80 whitespace-pre-wrap">{submission.failedTestCase.actualOutput || '(No output)'}</pre>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm mb-1 text-green-400">Expected Output</h4>
                            <pre className="bg-slate-900/80 p-2 rounded-md text-sm font-mono text-green-400/80 whitespace-pre-wrap">{submission.failedTestCase.expectedOutput}</pre>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
}