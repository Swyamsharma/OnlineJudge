import { useState, useEffect } from 'react';

const getVerdictColor = (verdict) => {
    switch (verdict) {
        case 'Success': case 'Passed': case 'Accepted': return 'text-green-400';
        case 'Time Limit Exceeded': case 'Memory Limit Exceeded': return 'text-orange-400';
        case 'Compilation Error': case 'Runtime Error': case 'System Error': case 'Wrong Answer': return 'text-red-400';
        default: return 'text-yellow-400';
    }
};

const SingleResultDisplay = ({ result }) => (
    <div className="space-y-4">
        {result.verdict && ( <div> <h4 className={`font-semibold ${getVerdictColor(result.verdict)}`}>Status: {result.verdict}</h4> </div> )}
        <div> <h4 className="font-semibold text-text-primary">Output:</h4> <pre className="bg-secondary p-2 rounded text-sm mt-1 whitespace-pre-wrap">{result.output || '(No output)'}</pre> </div>
        {result.stderr && ( <div> <h4 className="font-semibold text-yellow-500">Standard Error:</h4> <pre className="bg-secondary p-2 rounded text-xs mt-1 text-yellow-400/80 whitespace-pre-wrap">{result.stderr}</pre> </div> )}
    </div>
);

const SampleResultsDisplay = ({ results }) => (
     <div className="space-y-4">
        {results.map((res, index) => (
            <div key={index} className="p-3 bg-secondary rounded-lg border border-border-color">
                <h4 className="font-semibold text-md mb-2 flex justify-between items-center">
                    <span>Test Case {res.case}</span> <span className={`px-2 py-0.5 text-xs rounded-full ${getVerdictColor(res.verdict)} bg-opacity-20 bg-slate-500`}>{res.verdict}</span>
                </h4>
                {res.verdict !== 'Passed' && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div> <h5 className="font-medium text-text-secondary">Input</h5> <pre className="mt-1 p-2 bg-slate-900/50 rounded whitespace-pre-wrap font-mono">{res.input}</pre> </div>
                            <div> <h5 className="font-medium text-text-secondary">Expected</h5> <pre className="mt-1 p-2 bg-slate-900/50 rounded whitespace-pre-wrap font-mono">{res.expectedOutput}</pre> </div>
                        </div>
                        <div className="mt-2"> <h5 className="font-medium text-text-secondary">Your Output</h5> <pre className="mt-1 p-2 bg-slate-900/50 rounded whitespace-pre-wrap font-mono">{res.actualOutput || '(No output)'}</pre> </div>
                    </>
                )}
                {res.stderr && ( <div className="mt-2"> <h5 className="font-medium text-yellow-500">Error</h5> <pre className="mt-1 p-2 bg-slate-900/50 text-yellow-400/80 rounded whitespace-pre-wrap font-mono">{res.stderr}</pre> </div> )}
            </div>
        ))}
    </div>
);

export default function ExecutionPanel({ executionResult, onCustomInputChange, activeTab, setActiveTab, submissions, isFetchingSubmissions, onSubmissionSelect }) {
    const { data, isLoading, type } = executionResult;
    const [customInput, setCustomInput] = useState('');

    useEffect(() => { onCustomInputChange(customInput); }, [customInput, onCustomInputChange]);

    return (
        <div className="flex flex-col h-full bg-primary border border-border-color rounded-lg overflow-hidden">
            <div className="flex-none border-b border-border-color">
                <nav className="flex space-x-4 px-2">
                    <button onClick={() => setActiveTab('input')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'input' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary'}`}>Test Case</button>
                    <button onClick={() => setActiveTab('result')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'result' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary'}`}>Result</button>
                    <button onClick={() => setActiveTab('submissions')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'submissions' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary'}`}>Submissions</button>
                </nav>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {activeTab === 'input' && ( <div> <h3 className="font-semibold text-sm mb-1 text-text-primary">Custom Input</h3> <textarea value={customInput} onChange={(e) => setCustomInput(e.target.value)} className="w-full h-24 p-2 font-mono text-sm resize-none bg-secondary text-text-primary rounded-md border-border-color focus:ring-accent focus:border-accent" placeholder="Enter custom input. Leave empty to run against sample cases." /> </div> )}
                {activeTab === 'result' && ( <div> {isLoading && <p className="text-sm text-yellow-400">Running...</p>} {data && !isLoading && ( <> {type === 'custom' && <SingleResultDisplay result={data} />} {type === 'samples' && Array.isArray(data) && <SampleResultsDisplay results={data} />} {type === 'samples' && data && !Array.isArray(data) && <p className="text-red-400">{data.message || 'An error occurred while running sample tests.'}</p>} </> )} </div> )}
                {activeTab === 'submissions' && (
                    <div>
                        {isFetchingSubmissions && !submissions?.length ? ( <p className="text-sm text-yellow-400">Loading submissions...</p> ) : submissions && submissions.length > 0 ? (
                            <div className="space-y-2">
                                {submissions.map((sub) => (
                                    <button key={sub._id} onClick={() => onSubmissionSelect(sub._id)} className="w-full text-left flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-slate-700/50 transition-colors">
                                        <div>
                                            <p className={`font-semibold text-sm ${getVerdictColor(sub.verdict)}`}> {sub.verdict} </p>
                                            <p className="text-xs text-text-secondary mt-1"> {new Date(sub.submittedAt).toLocaleString()} </p>
                                        </div>
                                        <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded-md"> {sub.language} </span>
                                    </button>
                                ))}
                            </div>
                        ) : ( <p className="text-sm text-text-secondary">No submissions yet for this problem.</p> )}
                    </div>
                )}
            </div>
        </div>
    );
}