import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, reset } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const dispatch = useDispatch();
    const { isError, isLoading, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        return () => {
            dispatch(reset());
        }
    }, [isError, message, dispatch]);


    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const resultAction = await dispatch(forgotPassword({ email }));
            if (forgotPassword.fulfilled.match(resultAction)) {
                toast.success("If an account with that email exists, a reset link has been sent.");
                setSubmitted(true);
            } else {
                toast.error(resultAction.payload || 'An error occurred. Please try again.');
            }
        } catch (err) {
            toast.error('An unexpected error occurred.');
        }
    };

    if (isLoading) return <Loader />;

    if (submitted) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                 <div className="sm:mx-auto sm:w-full sm:max-w-md bg-primary p-8 rounded-lg border border-border-color shadow-lg">
                    <h2 className="text-2xl font-bold text-text-primary">Request Sent</h2>
                    <p className="mt-4 text-text-secondary">Please check your email (and spam folder) for the reset link.</p>
                    <Link to="/login" className="mt-6 inline-block font-semibold text-accent hover:text-accent-hover">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-1 flex flex-col justify-center items-center">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-primary p-8 rounded-lg border border-border-color shadow-lg">
                <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-text-primary">
                    Forgot Password?
                </h2>
                <p className="mb-6 text-center text-sm text-text-secondary">
                    No problem. Enter your email and we'll send you a reset link.
                </p>
                <form className="space-y-6" onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md border border-transparent bg-accent py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
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