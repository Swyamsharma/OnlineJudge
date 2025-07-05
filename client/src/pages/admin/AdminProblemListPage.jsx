import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProblems, reset, deleteProblem } from '../../features/problems/problemSlice';
import Loader from '../../components/Loader';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { VscSearch } from 'react-icons/vsc';

function AdminProblemListPage() {
    const dispatch = useDispatch();
    const { problems, isLoading } = useSelector((state) => state.problem);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [problemToDelete, setProblemToDelete] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');

    useEffect(() => {
        dispatch(getProblems());
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const filteredProblems = useMemo(() => {
        return problems
            .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(p => selectedDifficulty === 'All' || p.difficulty === selectedDifficulty);
    }, [problems, searchQuery, selectedDifficulty]);

    const handleDeleteClick = (id) => {
        setProblemToDelete(id);
        setIsModalOpen(true);
    };
    const handleConfirmDelete = () => {
        if (problemToDelete) {
            dispatch(deleteProblem(problemToDelete)).then((result) => {
                if (deleteProblem.fulfilled.match(result)) {
                    toast.success('Problem deleted successfully!');
                } else {
                    toast.error(result.payload || 'Failed to delete problem.');
                }
            });
        }
        closeModal();
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setProblemToDelete(null);
    };

    if (isLoading && !problems.length) {
        return <Loader />;
    }

    const difficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400';
            case 'Medium': return 'text-yellow-400';
            case 'Hard': return 'text-red-400';
            default: return 'text-text-secondary';
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-text-primary">Manage Problems</h1>
                    <Link to="/admin/problems/new" className="inline-flex items-center justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover">
                        + Create New Problem
                    </Link>
                </div>
                
                <div className="bg-primary border border-border-color rounded-lg p-4 mb-6 flex items-center gap-4">
                    <div className="relative flex-grow">
                        <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 p-2 rounded-md border-border-color bg-secondary text-text-primary focus:border-accent focus:ring-accent sm:text-sm"
                        />
                    </div>
                    <div className="w-48">
                         <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="w-full p-2 rounded-md border-border-color bg-secondary text-text-primary focus:border-accent focus:ring-accent sm:text-sm">
                            <option>All Difficulties</option>
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>
                </div>

                <div className="bg-primary border border-border-color rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-border-color">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {filteredProblems.map(problem => (
                                <tr key={problem._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{problem.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={difficultyColor(problem.difficulty)}>{problem.difficulty}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <Link to={`/admin/problems/edit/${problem._id}`} className="text-accent hover:text-accent-hover">Edit</Link>
                                        <button onClick={() => handleDeleteClick(problem._id)} className="text-red-500 hover:text-red-400">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredProblems.length === 0 && (
                        <div className="text-center py-10 text-text-secondary">No problems found.</div>
                    )}
                </div>
            </div>
            
            {/* Render the modal */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this problem? This action is permanent and cannot be undone."
                confirmText="Delete"
            />
        </>
    );
}

export default AdminProblemListPage;