import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getDashboardStats, reset } from '../features/user/userSlice';
import Loader from '../components/Loader';
import StatCard from '../components/dashboard/StatCard';
import ActivityCalendar from '../components/dashboard/ActivityCalendar';
import RecentSubmissions from '../components/dashboard/RecentSubmissions';
import { toast } from 'react-hot-toast';

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

    // if (isLoading) {
    //     return <Loader />;
    // }

    if (isError || !dashboardData) {
        return (
            <div className="max-w-7xl mx-auto w-full text-center p-8 bg-primary border border-border-color rounded-lg">
                <h2 className="text-xl font-semibold text-red-400">Could not load dashboard</h2>
                <p className="text-text-secondary mt-2">There was an error fetching your statistics. Please try refreshing the page.</p>
            </div>
        );
    }
    
    const { stats, activity, recentSubmissions } = dashboardData;

    return (
        <div className="max-w-7xl mx-auto w-full space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Welcome back, {user?.name}!</h1>
                <p className="mt-1 text-text-secondary">Here's a snapshot of your progress. Keep up the great work.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Problems Solved" value={stats.problemsSolved} icon="solved" />
                <StatCard title="Total Submissions" value={stats.totalSubmissions} icon="submissions" />
                <StatCard title="Acceptance Rate" value={`${stats.acceptanceRate}%`} icon="acceptance" />
                 <div className="bg-primary border border-border-color p-5 rounded-lg flex items-center justify-around">
                    <div className="text-center">
                        <p className="text-sm text-green-400">Easy</p>
                        <p className="text-2xl font-bold text-text-primary">{stats.easySolved}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-sm text-yellow-400">Medium</p>
                        <p className="text-2xl font-bold text-text-primary">{stats.mediumSolved}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-sm text-red-400">Hard</p>
                        <p className="text-2xl font-bold text-text-primary">{stats.hardSolved}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <div className="bg-primary border border-border-color p-5 rounded-lg items-center justify-around lg:col-span-2">
                    
                </div>
                <div className="lg:col-span-8">
                    <ActivityCalendar data={activity} stats={stats} />
                </div>
            </div>

            <div>
                <RecentSubmissions submissions={recentSubmissions} />
            </div>
        </div>
    );
}

export default DashboardPage;