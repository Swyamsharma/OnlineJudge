import { useSelector } from "react-redux";

function DashboardPage() {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-4 text-lg">Welcome back, {user?.name}!</p>
            <p>This is a protected page. Only logged-in users can see this.</p>
        </div>
    );
}

export default DashboardPage;