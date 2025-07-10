import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const AppScreenshotPlaceholder = () => (
    <div className="relative mt-12 lg:mt-0 lg:ml-12 w-full max-w-xl">
        <div className="w-full bg-primary border-2 border-border-color rounded-xl shadow-2xl aspect-video">
            <div className="p-2 border-b border-border-color flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <div className="p-4 flex gap-4">
                <div className="w-1/3 space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded-md"></div>
                    <div className="h-20 bg-slate-700/50 rounded-md"></div>
                    <div className="h-4 bg-slate-700/50 rounded-md w-2/3"></div>
                </div>
                <div className="w-2/3 space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded-md"></div>
                    <div className="h-4 bg-slate-700/50 rounded-md"></div>
                    <div className="h-4 bg-slate-700/50 rounded-md w-3/4"></div>
                </div>
            </div>
        </div>
    </div>
);


function HeroSection() {
    const { user } = useSelector((state) => state.auth);

    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center">
                <div className="lg:w-1/2 text-center lg:text-left">
                     <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        <span className="block text-text-primary">Master Your</span>
                        <span className="block bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mt-2 leading-tight">
                            Coding Craft
                        </span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-text-secondary">
                        The ultimate platform for practicing coding problems, competing with peers, and preparing for technical interviews.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                         {user ? (
                            <Link to="/problems" className="w-full sm:w-auto rounded-md bg-accent px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-accent-hover transition-transform hover:scale-105">
                                Browse Problems
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="w-full sm:w-auto rounded-md bg-accent px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-accent-hover transition-transform hover:scale-105">
                                    Get Started
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto rounded-md bg-primary px-8 py-3 text-base font-semibold text-text-primary shadow-lg hover:bg-slate-700 border border-border-color transition-transform hover:scale-105">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="lg:w-1/2 flex justify-center">
                   <AppScreenshotPlaceholder />
                </div>
            </div>
        </section>
    );
}

export default HeroSection;