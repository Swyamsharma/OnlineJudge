import { React, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProblem, getProblem, updateProblem, reset as resetProblem } from '../../features/problems/problemSlice';
import { generateTestcases, reset as resetAI } from '../../features/ai/aiSlice';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';

const AITestcaseModal = ({ isOpen, onClose, onGenerate, isGenerating }) => {
    const [referenceSolution, setReferenceSolution] = useState('#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Paste your correct C++ solution here\n    return 0;\n}');
    const [language, setLanguage] = useState('cpp');
    const [count, setCount] = useState(10);

    if (!isOpen) return null;

    const handleGenerateClick = () => {
        onGenerate({ referenceSolution, language, count });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-primary border border-border-color rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-text-primary mb-4">Generate Test Cases with AI</h2>
                <p className="text-sm text-text-secondary mb-4">
                    Provide a correct reference solution. The AI will generate inputs, and we will run your solution to get the verified correct outputs.
                </p>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Language</label>
                            <select value={language} onChange={e => setLanguage(e.target.value)} className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm">
                                <option value="cpp">C++</option>
                                <option value="javascript">JavaScript</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">Number of Cases</label>
                            <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value, 10))} min="1" max="50" className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Reference Solution</label>
                        <div className="h-64 border border-border-color rounded-md overflow-hidden">
                             <Editor
                                height="100%"
                                language={language}
                                value={referenceSolution}
                                onChange={(value) => setReferenceSolution(value)}
                                theme="vs-dark"
                                options={{ minimap: { enabled: false } }}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md bg-secondary text-text-primary ring-1 ring-inset ring-border-color hover:bg-slate-800">
                        Cancel
                    </button>
                    <button type="button" onClick={handleGenerateClick} disabled={isGenerating} className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-accent hover:bg-accent-hover disabled:opacity-50">
                        {isGenerating ? 'Generating & Verifying...' : 'Generate'}
                    </button>
                </div>
            </div>
        </div>
    );
};


function ProblemFormPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id: problemId } = useParams();
    const isEditMode = !!problemId;

    const { problem, isLoading, isError, message } = useSelector(state => state.problem);
    const { isGenerating } = useSelector(state => state.ai);

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '', statement: '', difficulty: 'Easy',
        constraints: '', inputFormat: '', outputFormat: '',
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
            setIsDataLoaded(false); 
            dispatch(getProblem(problemId));
        }
        return () => {
            dispatch(resetProblem());
            dispatch(resetAI());
        }
    }, [problemId, isEditMode, isError, message, dispatch]);

    useEffect(() => {
        if (isEditMode && problem && problem._id === problemId && !isDataLoaded) {
            setFormData({
                title: problem.title || '',
                statement: problem.statement || '',
                difficulty: problem.difficulty || 'Easy',
                constraints: problem.constraints || '',
                inputFormat: problem.inputFormat || '',
                outputFormat: problem.outputFormat || '',
                tags: problem.tags?.join(', ') || '',
            });

            const deepCopiedTestcases = JSON.parse(JSON.stringify(
                Array.isArray(problem.testcases) && problem.testcases.length > 0
                ? problem.testcases
                : [{ input: '', expectedOutput: '', isSample: true, explanation: '' }]
            ));
            setTestcases(deepCopiedTestcases);

            setIsDataLoaded(true);
        }
    }, [problem, isEditMode, problemId, isDataLoaded]);

    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTestcaseChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newTestcases = testcases.map((testcase, i) => 
            i === index
                ? { ...testcase, [name]: type === 'checkbox' ? checked : value }
                : testcase
        );
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

    const handleGenerateTestcases = (aiData) => {
        const sampleCases = testcases.filter(tc => tc.isSample && tc.input && tc.expectedOutput);
        
        if (!formData.statement || !formData.constraints || !formData.inputFormat) {
            toast.error("Please provide a Problem Statement, Constraints, and Input Format on the main form first.");
            return;
        }
        if (sampleCases.length === 0) {
            toast.error("Please provide at least one complete Sample Case to use as a format guide for the AI.");
            return;
        }
        dispatch(generateTestcases({
            problemStatement: formData.statement,
            constraints: formData.constraints,
            referenceSolution: aiData.referenceSolution,
            language: aiData.language,
            count: aiData.count,
            inputFormat: formData.inputFormat,
            outputFormat: formData.outputFormat,
            sampleTestcases: sampleCases,
        })).then(action => {
            if (action.type.endsWith('/fulfilled')) {
                const newCases = action.payload.map(tc => ({ ...tc, isSample: false, explanation: '' }));
                setTestcases(prev => [...prev, ...newCases]);
                toast.success(`${action.payload.length} verified test cases generated!`);
                setIsModalOpen(false);
            } else {
                toast.error(action.payload || "Failed to generate test cases.");
            }
        });
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

    if (isEditMode && !isDataLoaded) {
        return <Loader />;
    }

    const mainInputClasses = "block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm";
    const testCaseInputClasses = "block w-full rounded-md border-border-color bg-slate-800 py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm";
    const labelClasses = "block text-sm font-medium text-text-secondary mb-1";
    
    return (
        <>
            <AITestcaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGenerate={handleGenerateTestcases}
                isGenerating={isGenerating}
            />
            <div className="max-w-screen-2xl mx-auto w-full"> 
                <form onSubmit={onSubmit} className="flex flex-col h-[calc(100vh-150px)]">
                    <h1 className="text-3xl font-bold mb-6 flex-none text-text-primary">{isEditMode ? 'Edit Problem' : 'Create New Problem'}</h1>
                    <div className="flex-grow min-h-0">
                        <PanelGroup direction="horizontal">
                            <Panel defaultSize={50} minSize={30}>
                                <div className="p-6 h-full overflow-y-auto bg-primary border border-border-color rounded-lg space-y-6">
                                    <div><label htmlFor="title" className={labelClasses}>Title</label><input id="title" name="title" value={formData.title} onChange={handleFormChange} required className={mainInputClasses} /></div>
                                    <div><label htmlFor="statement" className={labelClasses}>Statement (Markdown)</label><textarea id="statement" name="statement" value={formData.statement} onChange={handleFormChange} rows="10" required className={mainInputClasses}></textarea></div>
                                    <div><label htmlFor="difficulty" className={labelClasses}>Difficulty</label><select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleFormChange} className={mainInputClasses}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                                    <div><label htmlFor="constraints" className={labelClasses}>Constraints</label><textarea id="constraints" name="constraints" value={formData.constraints} onChange={handleFormChange} rows="5" required className={mainInputClasses}></textarea></div>
                                    <div><label htmlFor="inputFormat" className={labelClasses}>Input Format</label><textarea id="inputFormat" name="inputFormat" value={formData.inputFormat} onChange={handleFormChange} rows="4" required className={mainInputClasses}></textarea></div>
                                    <div><label htmlFor="outputFormat" className={labelClasses}>Output Format</label><textarea id="outputFormat" name="outputFormat" value={formData.outputFormat} onChange={handleFormChange} rows="4" required className={mainInputClasses}></textarea></div>
                                    <div><label htmlFor="tags" className={labelClasses}>Tags (comma-separated)</label><input id="tags" name="tags" value={formData.tags} onChange={handleFormChange} className={mainInputClasses} /></div>
                                </div>
                            </Panel>

                            <PanelResizeHandle className="ResizeHandleOuter" />

                            <Panel defaultSize={50} minSize={30}>
                                <div className="p-6 h-full overflow-y-auto bg-primary border border-border-color rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-text-primary">Test Cases</h2>
                                        <button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M9.965 4.026a2.498 2.498 0 1 0-3.374-1.258 2.498 2.498 0 0 0 3.374 1.258ZM6.249 2.772a.999.999 0 1 1 1.5 0 .999.999 0 0 1-1.5 0ZM8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm-2.3-5.322a.75.75 0 0 1 1.06 0L8 10.939l1.24-1.261a.75.75 0 1 1 1.06 1.06l-1.75 1.78a.75.75 0 0 1-1.06 0l-1.75-1.78a.75.75 0 0 1 0-1.06Z" /></svg>
                                            Generate with AI
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                    {testcases.map((tc, index) => (
                                        <div key={tc._id || index} className="space-y-4 border border-border-color p-4 rounded-lg relative bg-secondary">
                                            <button type="button" onClick={() => removeTestcase(index)} className="absolute top-2 right-2 text-text-secondary hover:text-red-500 font-bold z-10 p-1 rounded-full">×</button>
                                            <h3 className="text-lg font-semibold text-text-primary">Test Case #{index+1}</h3>
                                            <div><label className={labelClasses}>Input</label><textarea name="input" value={tc.input} onChange={(e) => handleTestcaseChange(index, e)} required className={testCaseInputClasses} rows="6"></textarea></div>
                                            <div><label className={labelClasses}>Expected Output</label><textarea name="expectedOutput" value={tc.expectedOutput} onChange={(e) => handleTestcaseChange(index, e)} required className={testCaseInputClasses} rows="6"></textarea></div>
                                            <div><label className={labelClasses}>Explanation (Optional)</label><textarea name="explanation" value={tc.explanation || ''} onChange={(e) => handleTestcaseChange(index, e)} className={testCaseInputClasses} rows="3"></textarea></div>
                                            <label className="flex items-center text-text-secondary pt-2"><input type="checkbox" name="isSample" checked={tc.isSample} onChange={(e) => handleTestcaseChange(index, e)} className="mr-2 h-4 w-4 rounded bg-slate-700 border-border-color text-accent focus:ring-accent" /> Is Sample Case</label>
                                        </div>
                                    ))}
                                    </div>
                                    <button type="button" onClick={addTestcase} className="w-full mt-6 bg-slate-700 text-text-primary font-medium py-2 px-4 rounded-md hover:bg-slate-600 transition-colors">
                                        + Add Test Case
                                    </button>
                                </div>
                            </Panel>
                        </PanelGroup>
                    </div>

                    <div className="flex-none pt-6">
                        <button type="submit" disabled={isLoading || isGenerating} className="w-full bg-accent text-white font-bold py-3 px-4 rounded-md hover:bg-accent-hover disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors text-lg">
                            {isLoading ? 'Saving...' : (isEditMode ? 'Update Problem' : 'Create Problem')}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default ProblemFormPage;