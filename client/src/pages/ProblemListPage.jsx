import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getProblems, reset as resetProblems } from "../features/problems/problemSlice";
import { getMySubmissions } from "../features/submissions/submissionSlice";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { VscSearch, VscCheck, VscClose, VscSync } from "react-icons/vsc";
import FilterPopover from "../components/FilterPopover";

const PROBLEMS_PER_PAGE = 15;

function ProblemListPage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { problems, isLoading, isError, message } = useSelector((state) => state.problem);
    const { mySubmissions } = useSelector((state) => state.submission);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDifficulties, setSelectedDifficulties] = useState(new Set());
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedTags, setSelectedTags] = useState(new Set());
    const [tagSearchQuery, setTagSearchQuery] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        dispatch(getProblems());
        if (user) {
            dispatch(getMySubmissions());
        }
        return () => {
            dispatch(resetProblems());
        };
    }, [dispatch, isError, message, user]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedDifficulties, selectedStatus, selectedTags]);

    // Memoize processing of submission data
    const { solvedProblemIds, attemptedProblemIds } = useMemo(() => {
        if (!user || mySubmissions.length === 0) {
            return { solvedProblemIds: new Set(), attemptedProblemIds: new Set() };
        }
        const solved = new Set();
        const attempted = new Set();
        mySubmissions.forEach(sub => {
            attempted.add(sub.problemId);
            if (sub.verdict === 'Accepted') {
                solved.add(sub.problemId);
            }
        });
        return { solvedProblemIds: solved, attemptedProblemIds: attempted };
    }, [mySubmissions, user]);
    
    // Memoize and filter available tags for the popover
    const availableTags = useMemo(() => {
        const allTags = new Set();
        problems.forEach(p => p.tags.forEach(tag => allTags.add(tag)));
        return Array.from(allTags).sort();
    }, [problems]);
    
    const filteredAvailableTags = useMemo(() => {
        if (!tagSearchQuery) return availableTags;
        return availableTags.filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()));
    }, [availableTags, tagSearchQuery]);
    
    const handleDifficultyToggle = (difficulty) => {
        const newSet = new Set(selectedDifficulties);
        if (newSet.has(difficulty)) newSet.delete(difficulty);
        else newSet.add(difficulty);
        setSelectedDifficulties(newSet);
    };

    const handleTagToggle = (tag) => {
        const newSet = new Set(selectedTags);
        if (newSet.has(tag)) newSet.delete(tag);
        else newSet.add(tag);
        setSelectedTags(newSet);
    };

    // Main filtering logic
    const filteredProblems = useMemo(() => {
        return problems
            .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(p => selectedDifficulties.size === 0 || selectedDifficulties.has(p.difficulty))
            .filter(p => {
                if (!user || selectedStatus === "All") return true;
                if (selectedStatus === "Solved") return solvedProblemIds.has(p._id);
                if (selectedStatus === "Attempted") return attemptedProblemIds.has(p._id) && !solvedProblemIds.has(p._id);
                if (selectedStatus === "To-Do") return !attemptedProblemIds.has(p._id);
                return true;
            })
            .filter(p => selectedTags.size === 0 || Array.from(selectedTags).every(tag => p.tags.includes(tag)));
    }, [problems, searchQuery, selectedDifficulties, selectedStatus, selectedTags, solvedProblemIds, attemptedProblemIds, user]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedDifficulties(new Set());
        setSelectedStatus("All");
        setSelectedTags(new Set());
        setTagSearchQuery("");
    };
    
    const totalPages = Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
    const endIndex = startIndex + PROBLEMS_PER_PAGE;
    const currentProblems = filteredProblems.slice(startIndex, endIndex);

    const difficultyColor = { Easy: 'text-green-400', Medium: 'text-yellow-400', Hard: 'text-red-400' };
    const statusOptions = ["All", "To-Do", "Attempted", "Solved"];
    const difficultyOptions = { Easy: 'Easy', Medium: 'Med.', Hard: 'Hard' };
    
    if (isLoading && !problems.length) return <Loader />;

    return (
        <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Problem Set</h1>
            
            <div className="bg-primary border border-border-color rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-grow">
                        <label className="text-sm font-medium text-text-secondary mb-1 block">Search</label>
                        <div className="relative">
                            <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input type="text" placeholder="Search by title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 p-2 rounded-md border-border-color bg-secondary text-text-primary focus:border-accent focus:ring-accent sm:text-sm"/>
                        </div>
                    </div>
                    {/* Difficulty Popover */}
                    <div className="w-full md:w-40">
                         <FilterPopover label="Difficulty" selectedCount={selectedDifficulties.size} widthClass="w-40">
                            <ul className="space-y-1">
                                {Object.keys(difficultyOptions).map(d => (
                                    <li key={d} onClick={() => handleDifficultyToggle(d)} className={`flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50 cursor-pointer ${selectedDifficulties.has(d) ? 'bg-slate-700/50' : ''}`}>
                                        <span className={difficultyColor[d]}>{difficultyOptions[d]}</span>
                                        {selectedDifficulties.has(d) && <VscCheck className="text-accent"/>}
                                    </li>
                                ))}
                            </ul>
                        </FilterPopover>
                    </div>
                    {/* Status Popover */}
                    {user && (
                         <div className="w-full md:w-40">
                            <FilterPopover label="Status" selectedCount={selectedStatus === 'All' ? 0 : 1} widthClass="w-40">
                                <ul className="space-y-1">
                                    {statusOptions.map(s => (
                                        <li key={s} onClick={() => setSelectedStatus(s)} className={`flex items-center justify-between p-1 rounded-md hover:bg-slate-700/50 cursor-pointer ${selectedStatus === s ? 'bg-slate-700/50' : ''}`}>
                                            <span className="text-text-primary">{s}</span>
                                            {selectedStatus === s && <VscCheck className="text-accent"/>}
                                        </li>
                                    ))}
                                </ul>
                            </FilterPopover>
                        </div>
                    )}
                    {/* Tags Popover */}
                    <div className="w-full md:w-48">
                        <FilterPopover label="Tags" selectedCount={selectedTags.size}>
                            <div className="space-y-3">
                                <div className="relative">
                                    <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                    <input type="text" placeholder="Search tags..." value={tagSearchQuery} onChange={(e) => setTagSearchQuery(e.target.value)} className="w-full pl-9 p-2 rounded-md border-border-color bg-secondary text-text-primary focus:border-accent focus:ring-accent"/>
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                                    {filteredAvailableTags.length > 0 ? filteredAvailableTags.map(tag => (
                                        <button key={tag} onClick={() => handleTagToggle(tag)} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedTags.has(tag) ? 'bg-accent text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                            {tag}
                                        </button>
                                    )) : <span className="text-xs text-text-secondary px-1">No tags found.</span>}
                                </div>
                                <div className="border-t border-border-color pt-3 flex justify-end">
                                    <button onClick={() => setSelectedTags(new Set())} className="text-sm text-accent hover:underline flex items-center gap-1"><VscSync /> Reset</button>
                                </div>
                            </div>
                        </FilterPopover>
                    </div>
                    {/* Clear Button */}
                    <div className="flex-shrink-0">
                         <button onClick={clearFilters} className="w-full md:w-auto px-4 py-2 text-sm rounded-md bg-secondary hover:bg-slate-700/50 text-text-primary border border-border-color">Clear</button>
                    </div>
                </div>
            </div>

            <div className="bg-primary border border-border-color rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-1/12">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-5/12">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-2/12">Difficulty</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-4/12">Tags</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {currentProblems.length > 0 ? (
                            currentProblems.map((problem) => {
                                const isSolved = solvedProblemIds.has(problem._id);
                                const isAttempted = attemptedProblemIds.has(problem._id);
                                const displayedTags = problem.tags.slice(0, 3);
                                const remainingTags = problem.tags.length - 3;
                                return (
                                <tr key={problem._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user && (
                                            <div className="flex justify-center">
                                                {isSolved ? <VscCheck className="h-5 w-5 text-green-400" title="Solved" /> : isAttempted ? <VscClose className="h-5 w-5 text-red-400" title="Attempted" /> : null}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/problems/${problem._id}`} className="text-sm font-medium text-text-primary hover:text-accent">
                                            {problem.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-medium ${difficultyColor[problem.difficulty]}`}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {displayedTags.map(tag => (
                                                <span key={tag} className="text-xs bg-secondary text-text-secondary px-2 py-1 rounded-full">{tag}</span>
                                            ))}
                                            {remainingTags > 0 && (
                                                <span className="text-xs text-text-secondary px-2 py-1 rounded-full border border-dashed border-border-color">
                                                    +{remainingTags}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-text-secondary">No problems match your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                 <div className="mt-6 flex justify-between items-center text-sm">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-md bg-secondary hover:bg-slate-700/50 text-text-primary border border-border-color disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-text-secondary">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-md bg-secondary hover:bg-slate-700/50 text-text-primary border border-border-color disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
export default ProblemListPage;