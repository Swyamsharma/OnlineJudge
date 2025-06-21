import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProblem } from '../../features/problems/problemSlice';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

function ProblemFormPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.problem);

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
    
    const handleFormChange = (e) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
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
        const newTestcases = testcases.filter((_, i) => i !== index);
        setTestcases(newTestcases);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const problemData = {
            ...formData,
            // Convert comma-separated tags string into an array
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            testcases
        };

        dispatch(createProblem(problemData)).then((result) => {
            if (createProblem.fulfilled.match(result)) {
                toast.success('Problem created successfully!');
                navigate('/admin/problems');
            } else {
                toast.error(result.payload || 'Failed to create problem');
            }
        });
    };
    
    if (isLoading) return <Loader />;

    return (
        <form onSubmit={onSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold">Create New Problem</h1>
            
            {/* Problem Details */}
            <div className="grid grid-cols-1 gap-6">
                <input name="title" value={formData.title} onChange={handleFormChange} placeholder="Problem Title" required className="p-2 border rounded" />
                <textarea name="statement" value={formData.statement} onChange={handleFormChange} placeholder="Problem Statement (supports Markdown)" rows="5" required className="p-2 border rounded"></textarea>
                <select name="difficulty" value={formData.difficulty} onChange={handleFormChange} className="p-2 border rounded">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>
                <textarea name="constraints" value={formData.constraints} onChange={handleFormChange} placeholder="Constraints (e.g., 1 <= N <= 1000)" rows="3" required className="p-2 border rounded"></textarea>
                <textarea name="inputFormat" value={formData.inputFormat} onChange={handleFormChange} placeholder="Input Format" rows="2" required className="p-2 border rounded"></textarea>
                <textarea name="outputFormat" value={formData.outputFormat} onChange={handleFormChange} placeholder="Output Format" rows="2" required className="p-2 border rounded"></textarea>
                <input name="tags" value={formData.tags} onChange={handleFormChange} placeholder="Tags (comma-separated, e.g., array, dp, graph)" className="p-2 border rounded" />
            </div>

            {/* Testcases Section */}
            <div>
                <h2 className="text-xl font-bold mb-4">Test Cases</h2>
                {testcases.map((tc, index) => (
                    <div key={index} className="space-y-2 border p-4 rounded-md mb-4 relative">
                         <button type="button" onClick={() => removeTestcase(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">X</button>
                        <textarea name="input" value={tc.input} onChange={(e) => handleTestcaseChange(index, e)} placeholder={`Input for TC #${index + 1}`} required className="w-full p-2 border rounded"></textarea>
                        <textarea name="expectedOutput" value={tc.expectedOutput} onChange={(e) => handleTestcaseChange(index, e)} placeholder={`Expected Output for TC #${index + 1}`} required className="w-full p-2 border rounded"></textarea>
                        <textarea name="explanation" value={tc.explanation} onChange={(e) => handleTestcaseChange(index, e)} placeholder="Explanation (for sample cases)" className="w-full p-2 border rounded"></textarea>
                        <label className="flex items-center">
                            <input type="checkbox" name="isSample" checked={tc.isSample} onChange={(e) => handleTestcaseChange(index, e)} className="mr-2" /> Is Sample Case
                        </label>
                    </div>
                ))}
                <button type="button" onClick={addTestcase} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300">
                    + Add Test Case
                </button>
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded hover:bg-indigo-700">
                Create Problem
            </button>
        </form>
    );
}

export default ProblemFormPage;