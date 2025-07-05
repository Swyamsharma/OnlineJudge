import DOMPurify from 'dompurify';
import { marked } from 'marked';
import SubmissionDetailView from './SubmissionDetailView';
import Loader from './Loader';

const ProblemView = ({ problem }) => {
    const sampleTestcases = problem.sampleTestcases || [];
    const difficultyColor = {
        Easy: 'bg-green-900 text-green-300',
        Medium: 'bg-yellow-900 text-yellow-300',
        Hard: 'bg-red-900 text-red-300',
    };

    marked.setOptions({
        breaks: true,
    });
    
    const getSanitizedHtml = (markdownText) => {
        if (!markdownText) return '';
        const rawHtml = marked.parse(markdownText);
        return DOMPurify.sanitize(rawHtml);
    };

    return (
        <div className="p-4 overflow-y-auto h-full text-text-secondary">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-text-primary">{problem.title}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${difficultyColor[problem.difficulty]}`}>
                    {problem.difficulty}
                </span>
            </div>

            <div className="prose prose-sm prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(problem.statement) }}></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <h3 className="font-semibold text-md mb-2 text-text-primary">Input Format</h3>
                    <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(problem.inputFormat) }}></div>
                </div>
                <div>
                    <h3 className="font-semibold text-md mb-2 text-text-primary">Output Format</h3>
                    <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(problem.outputFormat) }}></div>
                </div>
            </div>
            <div className="mb-6">
                <h3 className="font-semibold text-md mb-2 text-text-primary">Constraints</h3>
                <div className="prose prose-sm prose-invert max-w-none bg-secondary p-3 rounded-md" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(problem.constraints) }}></div>
            </div>
            {sampleTestcases.map((tc, index) => (
                 <div key={tc._id || index} className="mb-4">
                    <h3 className="font-semibold text-md mb-2 text-text-primary">Sample Case {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-sm mb-1">Input:</h4>
                            <pre className="bg-secondary p-3 rounded-md text-sm">{tc.input}</pre>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm mb-1">Output:</h4>
                            <pre className="bg-secondary p-3 rounded-md text-sm">{tc.expectedOutput}</pre>
                        </div>
                    </div>
                    {tc.explanation && (
                         <div className="mt-2">
                            <h4 className="font-medium text-sm mb-1">Explanation:</h4>
                            <div className="prose prose-sm prose-invert max-w-none bg-secondary/50 p-3 rounded-md" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(tc.explanation) }}></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};


export default function InfoPanel({ problem, activeTab, setActiveTab, selectedSubmission, isFetchingDetail }) {
    return (
        <div className="flex flex-col h-full bg-primary border border-border-color rounded-lg overflow-hidden">
            <div className="flex-none border-b border-border-color">
                <nav className="flex space-x-4 px-2">
                    <button onClick={() => setActiveTab('description')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'description' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary'}`}>Description</button>
                    {selectedSubmission && (
                        <button onClick={() => setActiveTab('submission')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'submission' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary'}`}>Submission</button>
                    )}
                </nav>
            </div>
            <div className="flex-grow min-h-0 relative">
                {activeTab === 'description' && <ProblemView problem={problem} />}
                {activeTab === 'submission' && (
                    isFetchingDetail 
                        ? <div className="absolute inset-0 flex items-center justify-center"><Loader /></div>
                        : selectedSubmission 
                            ? <SubmissionDetailView submission={selectedSubmission} /> 
                            : <div className="p-4 text-text-secondary">Select a submission to view details.</div>
                )}
            </div>
        </div>
    );
}