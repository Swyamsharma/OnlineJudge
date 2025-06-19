import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; // We'll add this
import ResetPasswordPage from "./pages/ResetPasswordPage";   // We'll add this
import LoginSuccess from "./pages/LoginSuccess";
import DashboardPage from "./pages/DashboardPage"; // Add a placeholder dashboard

function App() {
  return (
    <>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:resettoken" element={<ResetPasswordPage />} />
              <Route path="/login/success" element={<LoginSuccess />} />

              {/* Private Routes */}
              <Route path='/dashboard' element={<PrivateRoute />}>
                <Route path='/dashboard' element={<DashboardPage />} />
              </Route>

            </Routes>
          </main>
        </div>
      </Router>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 4000 }} />
    </>
  );
}
export default App;