import React from 'react';
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';

function LoginSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            const fetchUser = async (token) => {
                try {
                    const response = await fetch('/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch user data');
                    }
                    const user = await response.json();
                    dispatch(loginSuccess({ ...user, token }));
                    toast.success('Logged in successfully!');
                    navigate('/');

                } catch (error) {
                    toast.error('Login failed. Please try again.');
                    navigate('/login');
                }
            };
            
            fetchUser(token);
            
        } else {
            toast.error('Google login failed. Please try again.');
            navigate('/login');
        }
    }, [searchParams, navigate, dispatch]);

    return <Loader />;
}

export default LoginSuccess;