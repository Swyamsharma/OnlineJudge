import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProblems, reset } from '../../features/problems/problemSlice';
import Loader from '../../components/Loader';

function AdminProblemListPage() {
    const dispatch = useDispatch();
    const { problems, isLoading } = useSelector((state) => state.problem);

    useEffect(() => {
        dispatch(getProblems());
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Problems</h1>
                <Link to="/admin/problems/new" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700">
                    + Create New Problem
                </Link>
            </div>
            <div className="bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {problems.map(problem => (
                            <tr key={problem._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{problem.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.difficulty}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/problems/edit/${problem._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                    <button className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminProblemListPage;