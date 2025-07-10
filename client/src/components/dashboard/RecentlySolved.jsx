import React from 'react';
import { Link } from 'react-router-dom';
import { VscCheck } from 'react-icons/vsc';

function RecentlySolved({ problems }) {
    if (!problems || problems.length === 0) {
        return (
            <div className="bg-primary border border-border-color p-5 rounded-lg text-center">
                <p className="text-text-secondary">No problems solved yet. Time to get started!</p>
                 <Link to="/problems" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
                    View Problems
                </Link>
            </div>
        );
    }
    
    return (
        <div className="bg-primary border border-border-color p-5 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Recently Solved Problems</h3>
            <div className="space-y-3">
                {problems.map(prob => (
                    <Link 
                        to={`/problems/${prob.problemId}?tab=submissions`} 
                        key={prob._id} 
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                       <div className="flex items-center space-x-3">
                            <VscCheck className="h-5 w-5 text-green-400" />
                            <div>
                                <p className="font-semibold text-text-primary">{prob.problemTitle}</p>
                                <p className="text-xs text-text-secondary">Solved on {new Date(prob.solvedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
export default RecentlySolved;