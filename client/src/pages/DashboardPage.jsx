import { useSelector } from "react-redux";

function DashboardPage() {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <div className="mt-8 p-8 bg-primary border border-border-color rounded-lg">
                <h2 className="text-2xl font-semibold text-text-primary">Welcome back, {user?.name}!</h2>
                <p className="mt-2 text-text-secondary">This is your personal dashboard. More stats and features coming soon!</p>
            </div>
        </div>
    );
}

export default DashboardPage;