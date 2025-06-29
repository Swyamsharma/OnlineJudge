const ProgressBar = ({ color, label, solved, total }) => {
    const percentage = total > 0 ? (solved / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-semibold" style={{ color }}>{label}</span>
                <span className="text-text-secondary">{solved} / {total}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                    className="h-2 rounded-full" 
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                ></div>
            </div>
        </div>
    );
};


const DifficultyChart = ({ solved, total }) => {
    if (!solved || !total || typeof total.Easy === 'undefined') {
        return <div className="bg-primary border border-border-color p-5 rounded-lg h-full" />;
    }
    
    return (
        <div className="bg-primary border border-border-color p-4 rounded-lg h-full flex flex-col">
            <h3 className="text-md font-semibold text-text-primary mb-4 flex-none">Solved by Difficulty</h3>
            <div className="flex-grow flex flex-col justify-center space-y-4">
                <ProgressBar 
                    label="Easy"
                    color="#22c55e" // green-500
                    solved={solved.easy}
                    total={total.Easy}
                />
                <ProgressBar 
                    label="Medium"
                    color="#f59e0b" // amber-500
                    solved={solved.medium}
                    total={total.Medium}
                />
                 <ProgressBar 
                    label="Hard"
                    color="#ef4444" // red-500
                    solved={solved.hard}
                    total={total.Hard}
                />
            </div>
        </div>
    );
};

export default DifficultyChart;