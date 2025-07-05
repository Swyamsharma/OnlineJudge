import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAllUsers, updateUserByAdmin, deleteUserByAdmin, reset } from '../../features/user/userSlice';
import Loader from '../../components/Loader';
import ConfirmationModal from '../../components/ConfirmationModal';

function AdminUsersPage() {
    const dispatch = useDispatch();
    const { user: loggedInAdmin } = useSelector((state) => state.auth);
    const { adminUsers, isLoading, isUpdating } = useSelector((state) => state.user);

    const [modalState, setModalState] = useState({ isOpen: false, userId: null });

    useEffect(() => {
        dispatch(getAllUsers());
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const handleRoleChange = (userId, newRole) => {
        dispatch(updateUserByAdmin({ userId, userData: { role: newRole } })).then((action) => {
            if (updateUserByAdmin.fulfilled.match(action)) {
                toast.success("User role updated successfully!");
            } else {
                toast.error(action.payload || "Failed to update role.");
            }
        });
    };

    const handleDeleteClick = (userId) => {
        setModalState({ isOpen: true, userId });
    };

    const handleConfirmDelete = () => {
        if (modalState.userId) {
            dispatch(deleteUserByAdmin(modalState.userId)).then((action) => {
                if (deleteUserByAdmin.fulfilled.match(action)) {
                    toast.success("User deleted successfully!");
                } else {
                    toast.error(action.payload || "Failed to delete user.");
                }
            });
        }
        setModalState({ isOpen: false, userId: null });
    };
    
    const closeModal = () => {
        setModalState({ isOpen: false, userId: null });
    };

    if (isLoading && !adminUsers.length) {
        return <Loader />;
    }

    return (
        <>
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold mb-1 text-text-primary">Manage Users</h1>
                    <Link to="/admin/dashboard" className="text-sm font-medium text-accent hover:text-accent-hover">
                        ← Back to Dashboard
                    </Link>
                </div>
                <div className="bg-primary border border-border-color rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-border-color">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {adminUsers.map(user => (
                                <tr key={user._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {user._id === loggedInAdmin._id ? (
                                            <span className="font-semibold text-accent">{user.role}</span>
                                        ) : (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                disabled={isUpdating}
                                                className="p-1 border rounded text-sm bg-secondary text-text-primary border-border-color focus:ring-accent focus:border-accent disabled:opacity-50"
                                            >
                                                <option value="user">user</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {user._id !== loggedInAdmin._id ? (
                                            <button 
                                                onClick={() => handleDeleteClick(user._id)} 
                                                className="text-red-500 hover:text-red-400"
                                            >
                                                Delete
                                            </button>
                                        ) : (
                                            <span className="text-slate-500 text-xs">Cannot Delete Self</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirmDelete}
                title="Confirm User Deletion"
                message="Are you sure you want to delete this user? All associated data will be orphaned. This action is permanent."
                confirmText="Delete User"
            />
        </>
    );
}

export default AdminUsersPage;