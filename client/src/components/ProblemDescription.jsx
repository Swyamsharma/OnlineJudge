export default function ProblemDescription({ problem }) {
    const sampleTestcases = problem.testcases?.filter(tc => tc.isSample) || [];

    const difficultyColor = {
        Easy: 'bg-green-900 text-green-300',
        Medium: 'bg-yellow-900 text-yellow-300',
        Hard: 'bg-red-900 text-red-300',
    };

    return (
        <div className="p-4 overflow-y-auto h-full bg-primary border border-border-color rounded-lg text-text-secondary">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-text-primary">{problem.title}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${difficultyColor[problem.difficulty]}`}>
                    {problem.difficulty}
                </span>
            </div>

            <div className="prose prose-sm prose-invert max-w-none mb-6">
                <p>{problem.statement}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <h3 className="font-semibold text-md mb-2 text-text-primary">Input Format</h3>
                    <p className="text-sm">{problem.inputFormat}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-md mb-2 text-text-primary">Output Format</h3>
                    <p className="text-sm">{problem.outputFormat}</p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-md mb-2 text-text-primary">Constraints</h3>
                <pre className="bg-secondary p-3 rounded-md text-sm whitespace-pre-wrap">{problem.constraints}</pre>
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
                            <p className="bg-secondary/50 p-3 rounded-md text-sm">{tc.explanation}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}