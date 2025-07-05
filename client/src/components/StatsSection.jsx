import { useEffect, useState } from 'react';
import axios from '../api/axios';

const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    useEffect(() => {
        let currentFrame = 0;
        const counter = setInterval(() => {
            currentFrame++;
            const progress = currentFrame / totalFrames;
            setCount(Math.round(end * progress));

            if (currentFrame === totalFrames) {
                clearInterval(counter);
                setCount(end);
            }
        }, frameRate);
        
        return () => clearInterval(counter);
    }, [end, duration, totalFrames]);

    return count;
};

const StatItem = ({ value, label }) => {
    const count = useCountUp(value);
    return (
        <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {count.toLocaleString()}+
            </p>
            <p className="mt-2 text-sm uppercase tracking-wider text-text-secondary">{label}</p>
        </div>
    );
};

function StatsSection() {
    const [stats, setStats] = useState({
        totalProblems: 0,
        totalUsers: 0,
        totalSubmissions: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Could not fetch platform stats:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <section className="py-20 bg-primary border-y border-border-color">
            <div className="max-w-7xl mx-auto px-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatItem value={stats.totalProblems} label="Problems" />
                    <StatItem value={stats.totalUsers} label="Users" />
                    <StatItem value={stats.totalSubmissions} label="Submissions Judged" />
                </div>
            </div>
        </section>
    );
}
export default StatsSection;