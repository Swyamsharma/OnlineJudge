import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <header className='sticky top-0 z-40 bg-secondary/80 backdrop-blur-sm border-b border-border-color'>
            <div className='flex h-16 items-center justify-between px-6'>
                <div>
                    <Link to='/' className='text-2xl font-bold text-text-primary'>OnlineJudge</Link>
                </div>
                <nav>
                    <ul className='flex items-center gap-6 text-sm font-medium'>
                        <li>
                            <Link to='/problems' className="text-text-secondary hover:text-text-primary transition-colors">Problems</Link>
                        </li>
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <li>
                                        <Link to='/admin/dashboard' className="text-red-400 hover:text-red-300 transition-colors">Admin</Link>
                                    </li>
                                )}
                                <li>
                                    <Link to='/dashboard' className="text-text-secondary hover:text-text-primary transition-colors">Dashboard</Link>
                                </li>
                                <li>
                                    <button
                                        className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-secondary'
                                        onClick={onLogout}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to='/login' className='text-text-secondary hover:text-text-primary transition-colors'>Login</Link>
                                </li>
                                <li>
                                    <Link to='/register' className='rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-secondary'>
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
export default Header;