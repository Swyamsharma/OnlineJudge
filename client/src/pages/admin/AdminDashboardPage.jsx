import { Link } from 'react-router-dom';

function AdminDashboardPage() {
    return (
        <div className='container mx-auto'>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <p className="mb-4">Welcome, Admin. Use the links below to manage the platform.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/problems" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-indigo-600">Manage Problems</h2>
                    <p className="text-gray-600 mt-2">Create, view, edit, and delete coding problems.</p>
                </Link>
                {/* Add more links here later, e.g., Manage Users, View Submissions */}
            </div>
        </div>
    );
}

export default AdminDashboardPage;