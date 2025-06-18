import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { isError, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isError) {
            toast.error(message);
            setLoading(false);
        }
        return () => {
            dispatch(reset());
        }
    }, [isError, message, dispatch]);


    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const resultAction = await dispatch(forgotPassword(email));
            if (forgotPassword.fulfilled.match(resultAction)) {
                toast.success("If an account with that email exists, a reset link has been sent.");
                setSubmitted(true);
            } else {
                toast.error(resultAction.payload || 'An error occurred. Please try again.');
            }
        } catch (err) {
            toast.error('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (submitted) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold">Request Sent</h2>
                <p className="mt-4">Please check your email (and spam folder) for the reset link.</p>
                <Link to="/login" className="mt-6 inline-block text-indigo-600 hover:text-indigo-500">
                    Back to Login
                </Link>
            </div>
        );
    }
    
    // Default: show the form
    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Forgot Your Password?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email and we'll send you a reset link.
                </p>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 text-left">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500"
                        >
                            Send Reset Link
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;