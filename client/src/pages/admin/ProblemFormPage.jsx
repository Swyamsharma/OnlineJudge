import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProblem, getProblem, updateProblem, reset } from '../../features/problems/problemSlice';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const HandleBar = ({ orientation }) => (
    <div className={`handle-bar ${orientation === 'vertical' ? 'w-1 h-8' : 'w-8 h-1'}`} />
);

function ProblemFormPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id: problemId } = useParams();
    const isEditMode = !!problemId;

    const { problem, isLoading, isError, message } = useSelector(state => state.problem);

    const [formData, setFormData] = useState({
        title: '', statement: '', difficulty: 'Easy',
        constraints: '', inputFormat: '', outputFormat: '',
        tags: '',
    });

    const [testcases, setTestcases] = useState([
        { input: '', expectedOutput: '', isSample: true, explanation: '' }
    ]);

    useEffect(() => {
        if (isError) { toast.error(message); }
        if (isEditMode) { dispatch(getProblem(problemId)); }
        return () => { dispatch(reset()); }
    }, [problemId, isEditMode, isError, message, dispatch]);

    useEffect(() => {
        if (isEditMode && problem && problem._id === problemId) {
            setFormData({
                title: problem.title || '', statement: problem.statement || '',
                difficulty: problem.difficulty || 'Easy', constraints: problem.constraints || '',
                inputFormat: problem.inputFormat || '', outputFormat: problem.outputFormat || '',
                tags: problem.tags?.join(', ') || '',
            });
            // Deep copy testcases to prevent direct state mutation
            const deepCopiedTestcases = JSON.parse(JSON.stringify(
                Array.isArray(problem.testcases) && problem.testcases.length > 0
                ? problem.testcases
                : [{ input: '', expectedOutput: '', isSample: true, explanation: '' }]
            ));
            setTestcases(deepCopiedTestcases);
        }
    }, [problem, isEditMode, problemId]);


    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTestcaseChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newTestcases = testcases.map((testcase, i) => {
            // If it's not the testcase we're editing, return it unchanged.
            if (i !== index) {
                return testcase;
            }
            // Otherwise, return a new object with the updated value.
            return {
                ...testcase,
                [name]: type === 'checkbox' ? checked : value
            };
        });
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
        setTestcases(testcases.filter((_, i) => i !== index));
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

    const inputClasses = "block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm";
    const labelClasses = "block text-sm font-medium text-text-secondary mb-1";
    
    return (
        <div className="max-w-7xl mx-auto w-full">
            <form onSubmit={onSubmit} className="flex flex-col h-[calc(100vh-150px)]">
                <h1 className="text-2xl font-bold mb-4 flex-none text-text-primary">{isEditMode ? 'Edit Problem' : 'Create New Problem'}</h1>

                <div className="flex-grow min-h-0">
                    <PanelGroup direction="horizontal">
                        <Panel defaultSize={50} minSize={30}>
                            <div className="p-6 h-full overflow-y-auto bg-primary border border-border-color rounded-lg space-y-4">
                                <div><label htmlFor="title" className={labelClasses}>Title</label><input id="title" name="title" value={formData.title} onChange={handleFormChange} required className={inputClasses} /></div>
                                <div><label htmlFor="statement" className={labelClasses}>Statement (Markdown)</label><textarea id="statement" name="statement" value={formData.statement} onChange={handleFormChange} rows="5" required className={inputClasses}></textarea></div>
                                <div><label htmlFor="difficulty" className={labelClasses}>Difficulty</label><select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleFormChange} className={inputClasses}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                                <div><label htmlFor="constraints" className={labelClasses}>Constraints</label><textarea id="constraints" name="constraints" value={formData.constraints} onChange={handleFormChange} rows="3" required className={inputClasses}></textarea></div>
                                <div><label htmlFor="inputFormat" className={labelClasses}>Input Format</label><textarea id="inputFormat" name="inputFormat" value={formData.inputFormat} onChange={handleFormChange} rows="3" required className={inputClasses}></textarea></div>
                                <div><label htmlFor="outputFormat" className={labelClasses}>Output Format</label><textarea id="outputFormat" name="outputFormat" value={formData.outputFormat} onChange={handleFormChange} rows="3" required className={inputClasses}></textarea></div>
                                <div><label htmlFor="tags" className={labelClasses}>Tags (comma-separated)</label><input id="tags" name="tags" value={formData.tags} onChange={handleFormChange} className={inputClasses} /></div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="ResizeHandleOuter"><HandleBar orientation="vertical" /></PanelResizeHandle>

                        <Panel defaultSize={50} minSize={30}>
                            <div className="p-6 h-full overflow-y-auto bg-primary border border-border-color rounded-lg">
                                <h2 className="text-xl font-semibold mb-4 text-text-primary">Test Cases</h2>
                                <div className="space-y-4">
                                {testcases.map((tc, index) => (
                                    <div key={index} className="space-y-2 border border-border-color p-4 rounded-md relative bg-secondary">
                                        <button type="button" onClick={() => removeTestcase(index)} className="absolute top-2 right-2 text-text-secondary hover:text-red-500 font-bold z-10 p-1 rounded-full">×</button>
                                        <h3 className="font-medium text-text-primary">Test Case #{index+1}</h3>
                                        <div><label className={labelClasses}>Input</label><textarea name="input" value={tc.input} onChange={(e) => handleTestcaseChange(index, e)} required className={inputClasses} rows="3"></textarea></div>
                                        <div><label className={labelClasses}>Expected Output</label><textarea name="expectedOutput" value={tc.expectedOutput} onChange={(e) => handleTestcaseChange(index, e)} required className={inputClasses} rows="3"></textarea></div>
                                        <div><label className={labelClasses}>Explanation (Optional)</label><textarea name="explanation" value={tc.explanation || ''} onChange={(e) => handleTestcaseChange(index, e)} className={inputClasses} rows="2"></textarea></div>
                                        <label className="flex items-center text-text-secondary"><input type="checkbox" name="isSample" checked={tc.isSample} onChange={(e) => handleTestcaseChange(index, e)} className="mr-2 h-4 w-4 rounded bg-secondary border-border-color text-accent focus:ring-accent" /> Is Sample Case</label>
                                    </div>
                                ))}
                                </div>
                                <button type="button" onClick={addTestcase} className="w-full mt-4 bg-slate-700 text-text-primary font-medium py-2 px-4 rounded-md hover:bg-slate-600 transition-colors">
                                    + Add Test Case
                                </button>
                            </div>
                        </Panel>
                    </PanelGroup>
                </div>

                <div className="flex-none pt-4">
                    <button type="submit" disabled={isLoading} className="w-full bg-accent text-white font-bold py-3 px-4 rounded-md hover:bg-accent-hover disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? 'Saving...' : (isEditMode ? 'Update Problem' : 'Create Problem')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProblemFormPage;