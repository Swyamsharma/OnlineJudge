import { Link } from 'react-router-dom';
import { VscCircleSlash, VscCheck, VscError, VscHistory, VscWarning } from 'react-icons/vsc';

const getVerdictInfo = (verdict) => {
    switch (verdict) {
        case 'Accepted': return { color: 'text-green-400', Icon: VscCheck };
        case 'Wrong Answer': return { color: 'text-red-400', Icon: VscError };
        case 'Time Limit Exceeded': return { color: 'text-orange-400', Icon: VscHistory };
        case 'Memory Limit Exceeded': return { color: 'text-orange-400', Icon: VscWarning };
        case 'Compilation Error': return { color: 'text-yellow-400', Icon: VscWarning };
        default: return { color: 'text-text-secondary', Icon: VscCircleSlash };
    }
};

function RecentSubmissions({ submissions }) {
    if (!submissions || submissions.length === 0) {
        return (
            <div className="bg-primary border border-border-color p-5 rounded-lg text-center">
                <p className="text-text-secondary">No recent submissions. Go solve a problem!</p>
                 <Link to="/problems" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
                    View Problems
                </Link>
            </div>
        );
    }
    
    return (
        <div className="bg-primary border border-border-color p-5 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Submissions</h3>
            <div className="space-y-3">
                {submissions.map(sub => {
                    const { color, Icon } = getVerdictInfo(sub.verdict);
                    return (
                        <Link to={`/problems/${sub.problemId}`} key={sub._id} className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-slate-700/50 transition-colors">
                           <div className="flex items-center space-x-3">
                                <Icon className={`h-5 w-5 ${color}`} />
                                <div>
                                    <p className="font-semibold text-text-primary">{sub.problemTitle}</p>
                                    <p className="text-xs text-text-secondary">{new Date(sub.submittedAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold text-sm ${color}`}>{sub.verdict}</p>
                                <p className="text-xs text-text-secondary">{sub.language}</p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
export default RecentSubmissions;