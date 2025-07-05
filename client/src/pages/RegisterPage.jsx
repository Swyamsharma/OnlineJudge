import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";
import PasswordInput from "../components/PasswordInput";

function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        password2: "",
    });
    const { name, username, email, password, password2 } = formData;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (user) {
            navigate('/');
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, dispatch, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (password !== password2) {
            toast.error("Passwords do not match");
        } else {
            const userData = { name, username, email, password };
            dispatch(register(userData));
        }
    };
    
    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="flex-1 flex flex-col justify-center items-center">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-primary p-8 rounded-lg border border-border-color shadow-lg">
                <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-text-primary">
                    Create your account
                </h2>
                <form className="space-y-6" onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Full Name</label>
                        <div className="mt-1">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={name}
                                onChange={onChange}
                                required
                                className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-text-secondary">Username</label>
                        <div className="mt-1">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={username}
                                onChange={onChange}
                                required
                                className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email address</label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={onChange}
                                required
                                className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                            />
                        </div>
                    </div>
                    <PasswordInput
                        id="password"
                        name="password"
                        label="Password"
                        value={password}
                        onChange={onChange}
                        required
                        className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                    />
                    <PasswordInput
                        id="password2"
                        name="password2"
                        label="Confirm Password"
                        value={password2}
                        onChange={onChange}
                        required
                        className="block w-full rounded-md border-border-color bg-secondary py-2 px-3 text-text-primary shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                    />

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md border border-transparent bg-accent py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
                        >
                            Sign up
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-text-secondary">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;