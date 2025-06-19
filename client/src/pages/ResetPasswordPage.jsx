import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';

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
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Reset Your Password
                </h2>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={onSubmit}>
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 text-left">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 text-left">Confirm New Password</label>
                        <input
                            type="password"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 p-2"
                        />
                    </div>
                    <div>
                        <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordPage;