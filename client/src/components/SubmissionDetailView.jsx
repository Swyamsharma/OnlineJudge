import { React, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getHint, getAnalysis, reset as resetAI } from '../features/ai/aiSlice';
import Editor from '@monaco-editor/react';
import Loader from './Loader';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

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
            {value ?? 'N/A'}{value != null ? unit : ''}
        </div>
    </div>
);

const AIFeatureButton = ({ onClick, isFetching, children }) => (
    <button onClick={onClick} disabled={isFetching} className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-500 disabled:bg-slate-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M9.965 4.026a2.498 2.498 0 1 0-3.374-1.258 2.498 2.498 0 0 0 3.374 1.258ZM6.249 2.772a.999.999 0 1 1 1.5 0 .999.999 0 0 1-1.5 0ZM8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm-2.3-5.322a.75.75 0 0 1 1.06 0L8 10.939l1.24-1.261a.75.75 0 1 1 1.06 1.06l-1.75 1.78a.75.75 0 0 1-1.06 0l-1.75-1.78a.75.75 0 0 1 0-1.06Z" /></svg>
        {children}
    </button>
);

const HintPanel = ({ submission }) => {
    const dispatch = useDispatch();
    const { hint: fetchedHint, isFetchingHint } = useSelector(state => state.ai);
    const hint = submission.aiHint || fetchedHint;

    const handleGetHint = () => {
        // CORRECTED: Dispatching the new 'getHint' action
        dispatch(getHint(submission._id)).then(action => {
            if (action.type.endsWith('/rejected')) {
                toast.error(action.payload || "Failed to get hint.");
            }
        });
    };

    return (
        <div className="pt-2">
            {!hint && (
                <AIFeatureButton onClick={handleGetHint} isFetching={isFetchingHint}>
                    {isFetchingHint ? 'Analyzing...' : 'Get AI Hint'}
                </AIFeatureButton>
            )}
            {hint && (
                <div className="mt-4 border-t border-border-color pt-4">
                    <h4 className="font-semibold text-md mb-2 text-indigo-400">AI Tutor says:</h4>
                    <p className="text-text-secondary text-sm whitespace-pre-wrap">{hint}</p>
                </div>
            )}
        </div>
    );
};

const AnalysisPanel = ({ submission }) => {
    const dispatch = useDispatch();
    const { analysis: fetchedAnalysis, isFetchingAnalysis } = useSelector(state => state.ai);
    const analysis = submission.aiAnalysis || fetchedAnalysis;

    const handleGetAnalysis = () => {
        dispatch(getAnalysis(submission._id)).then(action => {
            if (action.type.endsWith('/rejected')) {
                toast.error(action.payload || "Failed to get analysis.");
            }
        });
    };
    
    return (
        <div className="bg-secondary p-4 rounded-lg space-y-3 border border-border-color">
            <h3 className="font-semibold text-md text-text-primary">Code Analysis</h3>
            {!analysis && (
                <AIFeatureButton onClick={handleGetAnalysis} isFetching={isFetchingAnalysis}>
                    {isFetchingAnalysis ? 'Analyzing...' : 'Get AI Analysis'}
                </AIFeatureButton>
            )}
            {analysis && (
                <div className="pt-2 space-y-3">
                    <div>
                        <h4 className="font-medium text-sm mb-1 text-indigo-400">Complexity</h4>
                        <p className="text-text-secondary font-mono bg-slate-900/80 p-2 rounded-md">{analysis.complexity}</p>
                    </div>
                     <div>
                        <h4 className="font-medium text-sm mb-1 text-indigo-400">Feedback & Optimizations</h4>
                        <div className="prose prose-sm prose-invert max-w-none text-text-secondary space-y-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(analysis.feedback) }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function SubmissionDetailView({ submission }) {
    const dispatch = useDispatch();
    const hintableVerdicts = ['Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded'];

    useEffect(() => {
        return () => {
            dispatch(resetAI());
        }
    }, [submission, dispatch]);

    if (!submission) return null;

    const languageMap = { cpp: 'cpp', javascript: 'javascript' };

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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Language" value={submission.language} />
                <StatCard label="Execution Time" value={submission.executionTime} unit=" ms" />
                <StatCard label="Memory Used" value={submission.memoryUsed} unit=" KB" />
            </div>

            {submission.verdict === 'Accepted' && (
                <AnalysisPanel submission={submission} />
            )}

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
                    <HintPanel submission={submission} />
                </div>
            )}

            {hintableVerdicts.includes(submission.verdict) && submission.verdict !== 'Wrong Answer' && (
                <div className="bg-secondary p-4 rounded-lg space-y-3 border border-border-color">
                    <h3 className="font-semibold text-md text-text-primary">Performance Issue</h3>
                    <p className="text-sm text-text-secondary">Your solution did not pass within the required resource limits. An AI hint may help identify the performance bottleneck.</p>
                    <HintPanel submission={submission} />
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
                            readOnly: true, domReadOnly: true, padding: { top: 10 },
                            fontSize: 14, minimap: { enabled: false }, contextmenu: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}