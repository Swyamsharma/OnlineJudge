import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getProblems, reset } from "../features/problems/problemSlice";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";

function ProblemListPage() {
    const dispatch = useDispatch();
    const { problems, isLoading, isError, message } = useSelector((state) => state.problem);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        dispatch(getProblems());
        return () => {
            dispatch(reset());
        };
    }, [dispatch, isError, message]);

    // if (isLoading) {
    //     return <Loader />;
    // }

    const difficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400';
            case 'Medium': return 'text-yellow-400';
            case 'Hard': return 'text-red-400';
            default: return 'text-text-secondary';
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Problem Set</h1>
            <div className="bg-primary border border-border-color rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Difficulty</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tags</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {problems.length > 0 ? (
                            problems.map((problem) => (
                                <tr key={problem._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/problems/${problem._id}`} className="text-sm font-medium text-text-primary hover:text-accent">
                                            {problem.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-medium ${difficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-2">
                                            {problem.tags.map(tag => (
                                                <span key={tag} className="text-xs bg-secondary text-text-secondary px-2 py-1 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="p-6 text-center text-text-secondary">No problems found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default ProblemListPage;