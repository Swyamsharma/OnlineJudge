import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblem, reset as resetProblem } from '../features/problems/problemSlice';
import { createSubmission, getSubmissions, updateSubmission, reset as resetSubmission } from '../features/submissions/submissionSlice';
import problemService from '../features/problems/problemService';
import { store } from '../store/store';
import io from 'socket.io-client';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Loader from '../components/Loader';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor from '../components/CodeEditor';
import ExecutionPanel from '../components/ExecutionPanel';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

const VerticalHandleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400"><path d="M10.5 6a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V6.75A.75.75 0 0 1 10.5 6Zm3.75.75a.75.75 0 0 0-1.5 0v10.5a.75.75 0 0 0 1.5 0V6.75Z" /></svg>);
const HorizontalHandleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400"><path d="M18 10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1 0-1.5h10.5a.75.75 0 0 1 .75.75Zm-.75 3.75a.75.75 0 0 0 0-1.5H6.75a.75.75 0 0 0 0 1.5h10.5Z" /></svg>);


export default function ProblemDetailPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: problemId } = useParams();
    
    const { problem, isLoading: isProblemLoading } = useSelector((state) => state.problem);
    const { submissions, isSubmitting, isFetching: isFetchingSubmissions } = useSelector((state) => state.submission);
    const { user } = useSelector((state) => state.auth); 

    const [customInput, setCustomInput] = useState('');
    const [executionResult, setExecutionResult] = useState({ isLoading: false });
    const [activeBottomTab, setActiveBottomTab] = useState('input');

    useEffect(() => {
        dispatch(getProblem(problemId));
        if (user) {
            dispatch(getSubmissions(problemId));
            
            const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
            socket.emit('register', user.token);

            socket.on('submission:update', (updatedSubmission) => {
                dispatch(updateSubmission(updatedSubmission));
                toast.success(`Submission verdict: ${updatedSubmission.verdict}`, { id: 'verdict-toast' });
            });

            return () => {
                socket.disconnect();
                dispatch(resetProblem());
                dispatch(resetSubmission());
            };
        }
    }, [dispatch, problemId, user]);
    
    const showLoginToast = useCallback(() => toast.error("Please log in to perform this action."), []);

    const handleRunCode = useCallback(async ({ language, code }) => {
        if (!user) { showLoginToast(); return; }
        setExecutionResult({ isLoading: true });
        setActiveBottomTab('result');
        try {
            const result = await problemService.runCode({ language, code, input: customInput }, { getState: store.getState });
            setExecutionResult({ ...result, isLoading: false });
        } catch (error) {
            setExecutionResult({ verdict: 'Client Error', stderr: error.message, isLoading: false });
        }
    }, [customInput, user, showLoginToast]);

    const handleCodeSubmit = useCallback(async ({ language, code }) => {
        if (!user) { showLoginToast(); return; }
        setActiveBottomTab('submissions');
        dispatch(createSubmission({ problemId, language, code }));
    }, [user, dispatch, problemId, showLoginToast]);

    const handleCustomInputChange = useCallback((input) => setCustomInput(input), []);


    if (isProblemLoading || !problem.title) return <Loader />;
    const sanitizedProblem = {
        ...problem,
        statement: DOMPurify.sanitize(problem.statement),
        outputFormat: DOMPurify.sanitize(problem.outputFormat),
        constraints: DOMPurify.sanitize(problem.constraints),
    };

    return (
        <div className="h-full w-full">
            <PanelGroup direction="horizontal">
                <Panel defaultSize={50} minSize={30}>
                    <ProblemDescription problem={sanitizedProblem} /> 
                </Panel>
                <PanelResizeHandle className="ResizeHandleOuter"><VerticalHandleIcon /></PanelResizeHandle>
                <Panel defaultSize={50} minSize={30}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={70} minSize={20}>
                            <CodeEditor 
                                onCodeRun={handleRunCode} 
                                isRunning={executionResult.isLoading}
                                onCodeSubmit={handleCodeSubmit}
                                isSubmitting={isSubmitting}
                            />
                        </Panel>
                        <PanelResizeHandle className="ResizeHandleOuter"><HorizontalHandleIcon /></PanelResizeHandle>
                        <Panel defaultSize={30} minSize={15}>
                            <ExecutionPanel 
                                executionResult={executionResult}
                                onCustomInputChange={handleCustomInputChange}
                                activeTab={activeBottomTab}
                                setActiveTab={setActiveBottomTab}
                                submissions={submissions}
                                isFetchingSubmissions={isFetchingSubmissions}
                            />
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}