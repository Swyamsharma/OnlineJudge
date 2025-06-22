import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProblem, getProblem, updateProblem, reset } from '../../features/problems/problemSlice';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// Re-using the handle icon for a consistent UI
const VerticalHandleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-500">
        <path d="M10.5 6a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V6.75A.75.75 0 0 1 10.5 6Zm3.75.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0V6.75Z" />
    </svg>
);

function ProblemFormPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id: problemId } = useParams();
    const isEditMode = !!problemId;

    const { problem, isLoading, isError, message } = useSelector(state => state.problem);

    const [formData, setFormData] = useState({
        title: '',
        statement: '',
        difficulty: 'Easy',
        constraints: '',
        inputFormat: '',
        outputFormat: '',
        tags: '',
    });

    const [testcases, setTestcases] = useState([
        { input: '', expectedOutput: '', isSample: true, explanation: '' }
    ]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isEditMode) {
            dispatch(getProblem(problemId));
        }
        return () => {
            dispatch(reset());
        }
    }, [problemId, isEditMode, isError, message, dispatch]);

    useEffect(() => {
        if (isEditMode && problem && problem._id === problemId) {
            setFormData({
                title: problem.title || '',
                statement: problem.statement || '',
                difficulty: problem.difficulty || 'Easy',
                constraints: problem.constraints || '',
                inputFormat: problem.inputFormat || '',
                outputFormat: problem.outputFormat || '',
                tags: problem.tags?.join(', ') || '',
            });
            setTestcases(Array.isArray(problem.testcases) && problem.testcases.length > 0
                ? problem.testcases
                : [{ input: '', expectedOutput: '', isSample: true, explanation: '' }]
            );
        }
    }, [problem, isEditMode, problemId]);


    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTestcaseChange = (index, e) => {
        const newTestcases = [...testcases];
        const { name, value, type, checked } = e.target;
        newTestcases[index][name] = type === 'checkbox' ? checked : value;
        setTestcases(newTestcases);
    };

    const addTestcase = () => {
        setTestcases([...testcases, { input: '', expectedOutput: '', isSample: false, explanation: '' }]);
    };

    const removeTestcase = (index) => {
        if (testcases.length <= 1) {
            toast.error("You must have at least one test case.");
            return;
        }
        const newTestcases = testcases.filter((_, i) => i !== index);
        setTestcases(newTestcases);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const problemData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            testcases
        };

        const action = isEditMode ? updateProblem({ id: problemId, ...problemData }) : createProblem(problemData);

        dispatch(action).then((result) => {
            if (result.type.endsWith('/fulfilled')) {
                toast.success(`Problem ${isEditMode ? 'updated' : 'created'} successfully!`);
                navigate('/admin/problems');
            } else {
                toast.error(result.payload || `Failed to ${isEditMode ? 'update' : 'create'} problem`);
            }
        });
    };

    if (isLoading && !problem.title && isEditMode) return <Loader />;

    return (
        <div className="container mx-auto">
            <form onSubmit={onSubmit} className="flex flex-col h-[calc(100vh-150px)]">
                <h1 className="text-2xl font-bold mb-4 flex-none">{isEditMode ? 'Edit Problem' : 'Create New Problem'}</h1>

                <div className="flex-grow min-h-0">
                    <PanelGroup direction="horizontal">
                        <Panel defaultSize={50} minSize={30}>
                            <div className="p-6 h-full overflow-y-auto bg-white border rounded-lg space-y-4">
                                <input name="title" value={formData.title} onChange={handleFormChange} placeholder="Problem Title" required className="w-full p-2 border rounded" />
                                <textarea name="statement" value={formData.statement} onChange={handleFormChange} placeholder="Problem Statement (supports Markdown)" rows="6" required className="w-full p-2 border rounded"></textarea>
                                <select name="difficulty" value={formData.difficulty} onChange={handleFormChange} className="w-full p-2 border rounded">
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                                <textarea name="constraints" value={formData.constraints} onChange={handleFormChange} placeholder="Constraints (e.g., 1 <= N <= 1000)" rows="3" required className="w-full p-2 border rounded"></textarea>
                                <textarea name="inputFormat" value={formData.inputFormat} onChange={handleFormChange} placeholder="Input Format" rows="3" required className="w-full p-2 border rounded"></textarea>
                                <textarea name="outputFormat" value={formData.outputFormat} onChange={handleFormChange} placeholder="Output Format" rows="3" required className="w-full p-2 border rounded"></textarea>
                                <input name="tags" value={formData.tags} onChange={handleFormChange} placeholder="Tags (comma-separated, e.g., array, dp, graph)" className="w-full p-2 border rounded" />
                            </div>
                        </Panel>

                        <PanelResizeHandle className="ResizeHandleOuter">
                            <VerticalHandleIcon />
                        </PanelResizeHandle>

                        <Panel defaultSize={50} minSize={30}>
                            <div className="p-6 h-full overflow-y-auto bg-white border rounded-lg">
                                <h2 className="text-xl font-bold mb-4">Test Cases</h2>
                                {testcases.map((tc, index) => (
                                    <div key={index} className="space-y-2 border p-4 rounded-md mb-4 relative bg-gray-50">
                                        <button type="button" onClick={() => removeTestcase(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold z-10">X</button>
                                        <textarea name="input" value={tc.input} onChange={(e) => handleTestcaseChange(index, e)} placeholder={`Input for TC #${index + 1}`} required className="w-full p-2 border rounded" rows="3"></textarea>
                                        <textarea name="expectedOutput" value={tc.expectedOutput} onChange={(e) => handleTestcaseChange(index, e)} placeholder={`Expected Output for TC #${index + 1}`} required className="w-full p-2 border rounded" rows="3"></textarea>
                                        <textarea name="explanation" value={tc.explanation || ''} onChange={(e) => handleTestcaseChange(index, e)} placeholder="Explanation (optional, for sample cases)" className="w-full p-2 border rounded" rows="2"></textarea>
                                        <label className="flex items-center">
                                            <input type="checkbox" name="isSample" checked={tc.isSample} onChange={(e) => handleTestcaseChange(index, e)} className="mr-2" /> Is Sample Case
                                        </label>
                                    </div>
                                ))}
                                <button type="button" onClick={addTestcase} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300">
                                    + Add Test Case
                                </button>
                            </div>
                        </Panel>
                    </PanelGroup>
                </div>

                <div className="flex-none pt-4">
                    <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        {isLoading ? 'Saving...' : (isEditMode ? 'Update Problem' : 'Create Problem')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProblemFormPage;