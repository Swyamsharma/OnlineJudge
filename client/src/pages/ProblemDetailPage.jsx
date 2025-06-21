import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getProblem, reset } from '../features/problems/problemSlice';
import Loader from '../components/Loader';
import { toast } from 'react-hot-toast';

function ProblemDetailPage() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { problem, isLoading, isError, message } = useSelector((state) => state.problem);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        dispatch(getProblem(id));
        return () => {
            dispatch(reset());
        };
    }, [dispatch, id, isError, message]);

    if (isLoading || !problem.title) {
        return <Loader />;
    }

    const sampleTestcases = problem.testcases?.filter(tc => tc.isSample) || [];

    return (
        <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold text-gray-800">{problem.title}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {problem.difficulty}
                </span>
            </div>

            <div className="prose max-w-none mb-6">
                <p>{problem.statement}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Input Format</h3>
                    <p className="text-gray-700">{problem.inputFormat}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-2">Output Format</h3>
                    <p className="text-gray-700">{problem.outputFormat}</p>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="font-semibold text-lg mb-2">Constraints</h3>
                <pre className="bg-gray-100 p-3 rounded-md text-sm whitespace-pre-wrap">{problem.constraints}</pre>
            </div>
            
            {sampleTestcases.map((tc, index) => (
                <div key={index} className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Sample Case {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-md mb-1">Input:</h4>
                            <pre className="bg-gray-100 p-3 rounded-md text-sm">{tc.input}</pre>
                        </div>
                        <div>
                            <h4 className="font-medium text-md mb-1">Output:</h4>
                            <pre className="bg-gray-100 p-3 rounded-md text-sm">{tc.expectedOutput}</pre>
                        </div>
                    </div>
                    {tc.explanation && (
                         <div className="mt-3">
                            <h4 className="font-medium text-md mb-1">Explanation:</h4>
                            <p className="text-gray-600 bg-blue-50 p-3 rounded-md">{tc.explanation}</p>
                        </div>
                    )}
                </div>
            ))}
            
            {/* The Code Editor and Submit button */}
        </div>
    );
}

export default ProblemDetailPage;