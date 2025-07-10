import React from 'react';
import {useSelector} from 'react-redux';
import {Navigate, Outlet} from 'react-router-dom';
import Loader from './Loader';

const AdminRoute = () => {
    const {user, isLoading} = useSelector((state) => state.auth);
    if (isLoading) {
        return <Loader />;
    }
    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />; 
};
export default AdminRoute;