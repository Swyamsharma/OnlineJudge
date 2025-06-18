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
        <header className='bg-white shadow-md'>
            <div className='container mx-auto flex h-16 items-center justify-between px-4'>
                <div className='logo'>
                    <Link to='/' className='text-2xl font-bold text-gray-800'>OnlineJudge</Link>
                </div>
                <ul className='flex items-center gap-6'>
                    {user ? (
                        <>
                            <li>
                                <Link to='/dashboard'>Dashboard</Link>
                            </li>
                            <li>
                                <button 
                                    className='rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                                    onClick={onLogout}>
                                Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to='/login' className='font-medium text-gray-600 hover:text-gray-900'>Login</Link>
                            </li>
                            <li>
                                <Link to='/register' className='font-medium text-gray-600 hover:text-gray-900'>Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </header>
    );
}
export default Header;