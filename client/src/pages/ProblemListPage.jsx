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
    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Problem Set</h1>
            <div className="bg-white shadow-md rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {problems.length > 0 ? (
                        problems.map((problem) => (
                            <li key={problem._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <Link to={`/problems/${problem._id}`} className="text-lg font-semibold text-indigo-600 hover:text-indigo-800">
                                        {problem.title}
                                    </Link>
                                    <div className="text-sm text-gray-500 mt-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    {problem.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="p-6 text-center text-gray-500">No problems found.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}
export default ProblemListPage;