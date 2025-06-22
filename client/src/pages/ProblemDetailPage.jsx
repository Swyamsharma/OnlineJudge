import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getProblem, reset } from '../features/problems/problemSlice';
import Loader from '../components/Loader';
import { toast } from 'react-hot-toast';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const VerticalHandleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-500">
        <path d="M10.5 6a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V6.75A.75.75 0 0 1 10.5 6Zm3.75.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0V6.75Z" />
    </svg>
);
const HorizontalHandleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-500">
        <path d="M18 10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1 0-1.5h10.5a.75.75 0 0 1 .75.75Zm-.75 3.75a.75.75 0 0 0 0-1.5H6.75a.75.75 0 0 0 0 1.5h10.5Z" />
    </svg>
);


function ProblemDetailPage() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { problem, isLoading, isError, message } = useSelector((state) => state.problem);
    
    const [activeTab, setActiveTab] = useState('testcases');
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('// Your code here');

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

    const renderProblemDetails = () => (
        <div className="p-4 overflow-y-auto h-full bg-white border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{problem.title}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {problem.difficulty}
                </span>
            </div>

            <div className="prose prose-sm max-w-none mb-6">
                <p>{problem.statement}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <h3 className="font-semibold text-md mb-2">Input Format</h3>
                    <p className="text-gray-700 text-sm">{problem.inputFormat}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-md mb-2">Output Format</h3>
                    <p className="text-gray-700 text-sm">{problem.outputFormat}</p>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-md mb-2">Constraints</h3>
                <pre className="bg-gray-100 p-3 rounded-md text-sm whitespace-pre-wrap">{problem.constraints}</pre>
            </div>
            
            {sampleTestcases.map((tc, index) => (
                <div key={index} className="mb-4">
                    <h3 className="font-semibold text-md mb-2">Sample Case {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-sm mb-1">Input:</h4>
                            <pre className="bg-gray-100 p-3 rounded-md text-sm">{tc.input}</pre>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm mb-1">Output:</h4>
                            <pre className="bg-gray-100 p-3 rounded-md text-sm">{tc.expectedOutput}</pre>
                        </div>
                    </div>
                    {tc.explanation && (
                         <div className="mt-2">
                            <h4 className="font-medium text-sm mb-1">Explanation:</h4>
                            <p className="text-gray-600 bg-blue-50 p-3 rounded-md text-sm">{tc.explanation}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderIde = () => (
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex-none p-2 border-b">
                 <select value={language} onChange={e => setLanguage(e.target.value)} className="p-1 border rounded text-sm">
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                </select>
            </div>
            <div className="flex-grow">
                <textarea 
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm resize-none border-none outline-none bg-gray-800 text-gray-100"
                    placeholder="// Your code here..."
                />
            </div>
        </div>
    );

    const renderBottomPanel = () => (
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex-none border-b">
                <nav className="flex space-x-4 px-2">
                    <button onClick={() => setActiveTab('testcases')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'testcases' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Testcases</button>
                    <button onClick={() => setActiveTab('result')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'result' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Result</button>
                </nav>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {activeTab === 'testcases' && (
                    <div>
                        {sampleTestcases.map((tc, index) => (
                             <div key={index} className="mb-4">
                                <p className="font-semibold text-sm mb-1">Case {index + 1}</p>
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">Input</label>
                                        <pre className="bg-gray-100 p-2 rounded text-xs mt-1">{tc.input}</pre>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">Output</label>
                                        <pre className="bg-gray-100 p-2 rounded text-xs mt-1">{tc.expectedOutput}</pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {activeTab === 'result' && (
                    <div>
                        <p className="text-sm text-gray-600">Run your code to see the result here.</p>
                    </div>
                )}
            </div>
            <div className="flex-none p-2 border-t flex justify-end items-center space-x-2">
                <button className="px-4 py-1.5 text-sm font-semibold rounded-md bg-gray-200 hover:bg-gray-300">Run</button>
                <button className="px-4 py-1.5 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700">Submit</button>
            </div>
        </div>
    );

    return (
        <div className="h-full w-full"> 
            <PanelGroup direction="horizontal">
                <Panel defaultSize={50} minSize={30}>
                    {renderProblemDetails()}
                </Panel>
                <PanelResizeHandle className="ResizeHandleOuter">
                    <VerticalHandleIcon />
                </PanelResizeHandle>
                <Panel defaultSize={50} minSize={30}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={70} minSize={20}>
                            {renderIde()}
                        </Panel>
                        <PanelResizeHandle className="ResizeHandleOuter">
                            <HorizontalHandleIcon />
                        </PanelResizeHandle>
                        <Panel defaultSize={30} minSize={15}>
                            {renderBottomPanel()}
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}

export default ProblemDetailPage;