import { VscInfo } from 'react-icons/vsc';

const ActivityCalendar = ({ data, stats }) => {

    const activityData = {};
    if (data) {
        data.forEach(d => {
            activityData[d.date] = d.count;
        });
    }

    const today = new Date();
    const monthsToDisplay = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        monthsToDisplay.unshift(date);
    }

    const getIntensityClass = (count) => {
        if (!count || count === 0) return 'bg-slate-700/50';
        if (count <= 2) return 'bg-accent/50';
        if (count <= 5) return 'bg-accent/70';
        if (count <= 10) return 'bg-accent/90';
        return 'bg-accent';
    };
    
    const monthNames = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    return (
        <div className="bg-primary border border-border-color p-5 rounded-lg">
            {/* Header with Stats */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-text-primary">{stats.yearlySubmissions || 0}</span>
                    <span className="text-sm text-text-secondary">submissions in the past one year</span>
                    <VscInfo className="text-text-secondary" title="Submissions are recorded in the UTC timezone"/>
                </div>
                <div className="flex space-x-6 text-sm text-text-secondary">
                    <span>Total active days: <span className="text-text-primary font-semibold">{stats.activeDays || 0}</span></span>
                </div>
            </div>

            {/* Main Grid Container */}
            <div className="grid grid-flow-col auto-cols-max gap-x-3.5 overflow-x-auto pb-2 pl-2">
                {monthsToDisplay.map((monthDate, i) => {
                    const year = monthDate.getFullYear();
                    const month = monthDate.getMonth();
                    const monthName = monthNames[i];
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDayOfWeek = monthDate.getDay(); 

                    const days = Array.from({ length: daysInMonth }, (_, dayIndex) => {
                        const day = dayIndex + 1;
                        const date = new Date(year, month, day);
                        const dateString = date.toISOString().split('T')[0];
                        return {
                            date: dateString,
                            count: activityData[dateString] || 0,
                        };
                    });
                    
                    const placeholders = Array.from({ length: firstDayOfWeek });

                    return (
                        <div key={i} className="flex flex-col">
                            <div className="text-xs text-text-secondary mb-1">{monthName}</div>
                            <div className="grid grid-rows-7 grid-flow-col gap-1">
                                {placeholders.map((_, index) => <div key={`p-${index}`} />)}
                                {days.map((day, index) => (
                                    <div
                                        key={index}
                                        className={`w-2.5 h-2.5 rounded-sm ${getIntensityClass(day.count)}`}
                                        title={`${day.count} submissions on ${day.date}`}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityCalendar;