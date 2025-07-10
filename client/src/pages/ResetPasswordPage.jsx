import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import PasswordInput from '../components/PasswordInput';

function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    
    const { resettoken } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    useEffect(() => {
        return () => {
            dispatch(reset());
        }
    }, [dispatch]);


    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            toast.error('Passwords do not match');
            return;
        }

        const userData = { password, token: resettoken };
        
        try {
            const resultAction = await dispatch(resetPassword(userData));
            
            if (resetPassword.fulfilled.match(resultAction)) {
                toast.success("Password has been reset successfully. Please log in.");
                navigate('/login');
            } else {
                toast.error(resultAction.payload || "Failed to reset password. The link may be invalid or expired.");
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="flex-1 flex flex-col justify-center items-center">
             <div className="sm:mx-auto sm:w-full sm:max-w-md bg-primary p-8 rounded-lg border border-border-color shadow-lg">
                <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                    Set a New Password
                </h2>
                <form className="space-y-6" onSubmit={onSubmit}>
                    <PasswordInput
                        id="password"
                        name="password"
                        label="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                    />
                    <PasswordInput
                        id="password2"
                        name="password2"
                        label="Confirm New Password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                        className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                    />
                    <div>
                        <button type="submit" className="flex w-full justify-center rounded-md border border-transparent bg-accent py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary">
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordPage;