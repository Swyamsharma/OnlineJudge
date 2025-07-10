import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProblems, reset, deleteProblem } from '../../features/problems/problemSlice';
import Loader from '../../components/Loader';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { VscSearch, VscCheck } from 'react-icons/vsc';
import FilterPopover from '../../components/FilterPopover';

function AdminProblemListPage() {
    const dispatch = useDispatch();
    const { problems, isLoading } = useSelector((state) => state.problem);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [problemToDelete, setProblemToDelete] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulties, setSelectedDifficulties] = useState(new Set());

    useEffect(() => {
        dispatch(getProblems());
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const filteredProblems = useMemo(() => {
        return problems
            .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(p => selectedDifficulties.size === 0 || selectedDifficulties.has(p.difficulty));
    }, [problems, searchQuery, selectedDifficulties]);
    
    const handleDifficultyToggle = (difficulty) => {
        const newSet = new Set(selectedDifficulties);
        if (newSet.has(difficulty)) newSet.delete(difficulty);
        else newSet.add(difficulty);
        setSelectedDifficulties(newSet);
    };

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

    const difficultyColor = { Easy: 'text-green-400', Medium: 'text-yellow-400', Hard: 'text-red-400' };

    return (
        <>
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-text-primary">Manage Problems</h1>
                    <Link to="/admin/problems/new" className="inline-flex items-center justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover">
                        + Create New Problem
                    </Link>
                </div>
                
                {/* Filter Bar for Admin Problems */}
                <div className="bg-primary border border-border-color rounded-lg p-4 mb-6 flex items-end gap-4">
                    <div className="relative flex-grow">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Search</label>
                        <VscSearch className="absolute left-3 bottom-2.5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 p-2 rounded-md border-border-color bg-secondary text-text-primary focus:border-accent focus:ring-accent sm:text-sm"
                        />
                    </div>
                    <div className="w-48">
                         <FilterPopover label="Difficulty" selectedCount={selectedDifficulties.size} widthClass="w-48">
                            <ul className="space-y-1">
                                {['Easy', 'Medium', 'Hard'].map(d => (
                                    <li key={d} onClick={() => handleDifficultyToggle(d)} className={`flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50 cursor-pointer ${selectedDifficulties.has(d) ? 'bg-slate-700/50' : ''}`}>
                                        <span className={difficultyColor[d]}>{d}</span>
                                        {selectedDifficulties.has(d) && <VscCheck className="text-accent"/>}
                                    </li>
                                ))}
                            </ul>
                        </FilterPopover>
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
                                        <span className={difficultyColor[problem.difficulty]}>{problem.difficulty}</span>
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