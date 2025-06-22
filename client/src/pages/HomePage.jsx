import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function HomePage() {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Sharpen Your Skills
                </span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-text-secondary">
                The ultimate platform for practicing coding problems, competing with peers, and preparing for technical interviews.
            </p>
            <div className="mt-8 flex gap-4">
                {user ? (
                     <Link to="/problems" className="rounded-md bg-accent px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-accent-hover transition-transform hover:scale-105">
                        Browse Problems
                    </Link>
                ) : (
                    <>
                        <Link to="/register" className="rounded-md bg-accent px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-accent-hover transition-transform hover:scale-105">
                            Get Started
                        </Link>
                        <Link to="/login" className="rounded-md bg-primary px-6 py-3 text-base font-semibold text-text-primary shadow-lg hover:bg-slate-700 border border-border-color transition-transform hover:scale-105">
                            Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
export default HomePage;