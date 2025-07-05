import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { updateUserProfile, changeUserPassword, reset } from '../features/user/userSlice';
import Loader from '../components/Loader';

function ProfilePage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { isUpdating, isChangingPassword, isError, message } = useSelector((state) => state.user);

    const [profileData, setProfileData] = useState({ name: '', username: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name,
                username: user.username,
                email: user.email,
            });
        }
    }, [user]);

    useEffect(() => {
        if (isError && message) {
            toast.error(message);
        }
        return () => {
            dispatch(reset());
        }
    }, [isError, message, dispatch]);

    const handleProfileChange = (e) => {
        setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePasswordChange = (e) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUserProfile(profileData)).then(action => {
            if (updateUserProfile.fulfilled.match(action)) {
                toast.success("Profile updated successfully!");
            }
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const { newPassword, confirmNewPassword } = passwordData;
        if (newPassword !== confirmNewPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        dispatch(changeUserPassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
        })).then(action => {
            if (changeUserPassword.fulfilled.match(action)) {
                toast.success("Password changed successfully!");
                setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            }
        });
    };
    
    const inputClasses = "block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm disabled:opacity-50";
    const labelClasses = "block text-sm font-medium text-text-secondary";

    const isLoading = isUpdating || isChangingPassword;

    return (
        <div className="max-w-4xl mx-auto w-full">
            {isLoading && <Loader />}
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Your Profile</h1>
            
            {/* Profile Information Form */}
            <div className="bg-primary border border-border-color rounded-lg shadow-lg p-8 mb-8">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <h2 className="text-xl font-semibold text-text-primary">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className={labelClasses}>Full Name</label>
                            <input type="text" id="name" name="name" value={profileData.name} onChange={handleProfileChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="username" className={labelClasses}>Username</label>
                            <input type="text" id="username" name="username" value={profileData.username} onChange={handleProfileChange} required className={inputClasses} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClasses}>Email Address</label>
                        <input type="email" id="email" name="email" value={profileData.email} onChange={handleProfileChange} required className={inputClasses} />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isUpdating}
                            className="inline-flex justify-center rounded-md border border-transparent bg-accent py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary disabled:opacity-50">
                            {isUpdating ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-primary border border-border-color rounded-lg shadow-lg p-8">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <h2 className="text-xl font-semibold text-text-primary">Change Password</h2>
                     <div>
                        <label htmlFor="currentPassword" className={labelClasses}>Current Password</label>
                        <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className={inputClasses} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="newPassword" className={labelClasses}>New Password</label>
                            <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="confirmNewPassword" className={labelClasses}>Confirm New Password</label>
                            <input type="password" id="confirmNewPassword" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} required className={inputClasses} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isChangingPassword}
                            className="inline-flex justify-center rounded-md border border-transparent bg-accent py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary disabled:opacity-50">
                            {isChangingPassword ? 'Saving...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;