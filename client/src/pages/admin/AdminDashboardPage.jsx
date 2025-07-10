import React from 'react';
import { Link } from 'react-router-dom';
import { VscCode, VscPerson, VscChecklist } from "react-icons/vsc";

function AdminDashboardPage() {
    return (
        <div className='max-w-7xl mx-auto w-full'>
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Admin Dashboard</h1>
            <p className="mb-8 text-text-secondary">Welcome, Admin. Use the links below to manage the platform.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/admin/problems" className="bg-primary p-6 rounded-lg border border-border-color hover:border-accent transition-all hover:-translate-y-1 group">
                    <VscCode className="h-8 w-8 text-accent mb-4" />
                    <h2 className="text-xl font-semibold text-text-primary group-hover:text-accent transition-colors">Manage Problems</h2>
                    <p className="text-text-secondary mt-2">Create, view, edit, and delete coding problems.</p>
                </Link>
                 <Link to="/admin/submissions" className="bg-primary p-6 rounded-lg border border-border-color hover:border-accent transition-all hover:-translate-y-1 group">
                    <VscChecklist className="h-8 w-8 text-accent mb-4" />
                    <h2 className="text-xl font-semibold text-text-primary group-hover:text-accent transition-colors">View Submissions</h2>
                    <p className="text-text-secondary mt-2">Review and manage all recent user submissions.</p>
                </Link>
                 <Link to="/admin/users" className="bg-primary p-6 rounded-lg border border-border-color hover:border-accent transition-all hover:-translate-y-1 group">
                    <VscPerson className="h-8 w-8 text-accent mb-4" />
                    <h2 className="text-xl font-semibold text-text-primary group-hover:text-accent transition-colors">Manage Users</h2>
                    <p className="text-text-secondary mt-2">View user roles and activity.</p>
                </Link>
            </div>
        </div>
    );
}

export default AdminDashboardPage;