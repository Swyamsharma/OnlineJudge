import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Loader from './Loader';

const PrivateRoute = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  // Show a loader while the auth state is being determined
  if (isLoading) {
    return <Loader />;
  }

  // If user is logged in, render the child route. Otherwise, navigate to login.
  // The <Outlet /> component from react-router-dom is a placeholder for the nested route's component.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;