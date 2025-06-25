import { useState, useEffect } from 'react';

// A helper function to get the right color for each verdict
const getVerdictColor = (verdict) => {
    switch (verdict) {
        case 'Success':
            return 'text-green-400';
        case 'Time Limit Exceeded':
        case 'Memory Limit Exceeded':
            return 'text-orange-400';
        case 'Compilation Error':
        case 'Runtime Error':
        case 'System Error':
            return 'text-red-400';
        default:
            return 'text-yellow-400'; // For any other status
    }
};

export default function ExecutionPanel({ executionResult, onCustomInputChange, activeTab, setActiveTab }) {
    // ** THE MAIN FIX IS HERE **
    // Changed `error: verdict` to just `verdict`
    const { output, stderr, verdict, isLoading } = executionResult;
    const [customInput, setCustomInput] = useState('');

    useEffect(() => {
        onCustomInputChange(customInput);
    }, [customInput, onCustomInputChange]);

    return (
        <div className="flex flex-col h-full bg-primary border border-border-color rounded-lg overflow-hidden">
            <div className="flex-none border-b border-border-color">
                <nav className="flex space-x-4 px-2">
                    <button onClick={() => setActiveTab('input')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'input' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary'}`}>Custom Input</button>
                    <button onClick={() => setActiveTab('result')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'result' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary'}`}>Result</button>
                </nav>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {activeTab === 'input' && (
                    <div>
                        <h3 className="font-semibold text-sm mb-1 text-text-primary">Input</h3>
                        <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            className="w-full h-24 p-2 font-mono text-sm resize-none bg-secondary text-text-primary rounded-md"
                            placeholder="Enter your custom input here..."
                        />
                    </div>
                )}
                 {activeTab === 'result' && (
                    <div>
                        {isLoading && <p className="text-sm text-yellow-400">Running...</p>}
                        {executionResult && !isLoading && (
                             <div className="space-y-4">
                                {verdict && (
                                    <div>
                                        <h4 className={`font-semibold ${getVerdictColor(verdict)}`}>Status: {verdict}</h4>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-text-primary">Output:</h4>
                                    <pre className="bg-secondary p-2 rounded text-sm mt-1 whitespace-pre-wrap">{output || '(No output)'}</pre>
                                </div>
                                {stderr && (
                                    <div>
                                        <h4 className="font-semibold text-yellow-500">Standard Error:</h4>
                                        <pre className="bg-secondary p-2 rounded text-xs mt-1 text-yellow-400/80 whitespace-pre-wrap">{stderr}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}