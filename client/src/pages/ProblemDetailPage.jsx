import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getProblem, reset } from '../features/problems/problemSlice';
import problemService from '../features/problems/problemService';
import { store } from '../store/store';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Loader from '../components/Loader';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor from '../components/CodeEditor';
import ExecutionPanel from '../components/ExecutionPanel';

const VerticalHandleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
        <path d="M10.5 6a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V6.75A.75.75 0 0 1 10.5 6Zm3.75.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0V6.75Z" />
    </svg>
);
const HorizontalHandleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
        <path d="M18 10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1 0-1.5h10.5a.75.75 0 0 1 .75.75Zm-.75 3.75a.75.75 0 0 0 0-1.5H6.75a.75.75 0 0 0 0 1.5h10.5Z" />
    </svg>
);

export default function ProblemDetailPage() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { problem, isLoading: isProblemLoading, isError, message } = useSelector((state) => state.problem);

    const [customInput, setCustomInput] = useState('');
    const [executionResult, setExecutionResult] = useState({ output: null, stderr: null, verdict: null, isLoading: false });
    const [activeBottomTab, setActiveBottomTab] = useState('input');

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        dispatch(getProblem(id));
        return () => dispatch(reset());
    }, [dispatch, id, isError, message]);

    const handleRunCode = useCallback(async ({ language, code }) => {
        setExecutionResult({ output: null, stderr: null, verdict: null, isLoading: true });
        setActiveBottomTab('result');

        try {
            const result = await problemService.runCode({ language, code, input: customInput }, { getState: store.getState });
            setExecutionResult({ ...result, isLoading: false });
        } catch (error) {
            const errorData = error.response?.data || {};
            setExecutionResult({
                output: null,
                stderr: errorData.message || error.message,
                verdict: errorData.error || 'Client Error',
                isLoading: false,
            });
        }
    }, [customInput]);

    const handleCustomInputChange = useCallback((input) => {
        setCustomInput(input);
    }, []);

    if (isProblemLoading || !problem.title) {
        return <Loader />;
    }

    return (
        <div className="h-full w-full">
            <PanelGroup direction="horizontal">
                <Panel defaultSize={50} minSize={30}>
                    <ProblemDescription problem={problem} />
                </Panel>
                <PanelResizeHandle className="ResizeHandleOuter">
                    <VerticalHandleIcon />
                </PanelResizeHandle>
                <Panel defaultSize={50} minSize={30}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={70} minSize={20}>
                            <CodeEditor 
                                onCodeRun={handleRunCode} 
                                isRunning={executionResult.isLoading} 
                            />
                        </Panel>
                        <PanelResizeHandle className="ResizeHandleOuter">
                            <HorizontalHandleIcon />
                        </PanelResizeHandle>
                        <Panel defaultSize={30} minSize={15}>
                            <ExecutionPanel 
                                executionResult={executionResult}
                                onCustomInputChange={handleCustomInputChange}
                                activeTab={activeBottomTab}
                                setActiveTab={setActiveBottomTab}
                            />
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}