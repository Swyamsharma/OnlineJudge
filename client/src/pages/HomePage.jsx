import { useSelector } from "react-redux";

function HomePage() {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="container mx-auto mt-10 text-center">
            <h1 className="text-4xl font-bold text-gray-800">Welcome to OnlineJudge</h1>
            <div className="text-gray-600 mt-4 text-lg">
                {user ? (
                    <p className="mb-4">Hello, {user.name}! You are logged in.</p>
                ) : (
                    <p className="mb-4">Please log in or register to start coding.</p>
                )}
            </div>
        </div>
    );
}
export default HomePage;