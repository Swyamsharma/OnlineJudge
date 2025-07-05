import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from 'react-router-dom';
import { getDashboardStats, reset } from '../features/user/userSlice';
import Loader from '../components/Loader';
import StatCard from '../components/dashboard/StatCard';
import ActivityCalendar from '../components/dashboard/ActivityCalendar';
import RecentlySolved from '../components/dashboard/RecentlySolved';
import DifficultyChart from '../components/dashboard/DifficultyChart';
import { toast } from 'react-hot-toast';
import { VscSettings } from 'react-icons/vsc';

function DashboardPage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { dashboardData, isLoading, isError, message } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getDashboardStats());
        return () => {
            dispatch(reset());
        }
    }, [dispatch]);
    
    useEffect(() => {
        if (isError) {
            toast.error(message || "Failed to load dashboard data.");
        }
    }, [isError, message]);

    if (isLoading && !dashboardData) {
        return <Loader />;
    }

    if (isError && !dashboardData) {
        return (
            <div className="max-w-7xl mx-auto w-full text-center p-8 bg-primary border border-border-color rounded-lg">
                <h2 className="text-xl font-semibold text-red-400">Could not load dashboard</h2>
                <p className="text-text-secondary mt-2">There was an error fetching your statistics. Please try refreshing the page.</p>
            </div>
        );
    }
    
    const { stats, activity, recentlySolved } = dashboardData || { stats: {}, activity: [], recentlySolved: [] };

    if (!stats.totalProblems) {
        return <Loader />;
    }

    return (
        <div className="max-w-7xl mx-auto w-full space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Welcome back, {user?.name}!</h1>
                    <p className="mt-1 text-text-secondary">Here's a snapshot of your progress. Keep up the great work.</p>
                </div>
                 <Link to="/profile" className="p-2 rounded-lg text-text-secondary hover:bg-slate-700/50 hover:text-accent transition-colors" title="Profile Settings">
                    <VscSettings className="h-6 w-6" />
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Problems Solved" value={stats.problemsSolved} icon="solved" />
                <StatCard title="Total Submissions" value={stats.totalSubmissions} icon="submissions" />
                <StatCard title="Acceptance Rate" value={`${stats.acceptanceRate}%`} icon="acceptance" />
                <StatCard title="Max Streak" value={`${stats.maxStreak} ${stats.maxStreak === 1 ? 'day' : 'days'}`} icon="flame" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <div className="lg:col-span-2">
                    <DifficultyChart 
                        solved={{
                            easy: stats.easySolved,
                            medium: stats.mediumSolved,
                            hard: stats.hardSolved
                        }}
                        total={stats.totalProblems}
                    />
                </div>
                <div className="lg:col-span-8">
                    <ActivityCalendar data={activity} stats={stats} />
                </div>
            </div>

            <div>
                <RecentlySolved problems={recentlySolved} />
            </div>
        </div>
    );
}

export default DashboardPage;