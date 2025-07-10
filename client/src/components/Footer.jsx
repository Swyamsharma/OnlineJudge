import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-primary border-t border-border-color">
            <div className="max-w-7xl mx-auto py-12 px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-2">
                        <h2 className="text-xl font-bold text-text-primary">OnlineJudge</h2>
                        <p className="text-sm text-text-secondary mt-2">Sharpen Your Skills. Ace Your Interviews.</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Navigation</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/problems" className="text-text-primary hover:text-accent">Problems</Link></li>
                            <li><Link to="/dashboard" className="text-text-primary hover:text-accent">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Connect</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="https://github.com/Swyamsharma" target="_blank" rel="noopener noreferrer" className="text-text-primary hover:text-accent">GitHub</a></li>
                            <li><a href="https://www.linkedin.com/in/swyam-sharma-525237258" target="_blank" rel="noopener noreferrer" className="text-text-primary hover:text-accent">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-border-color pt-8 text-center text-sm text-text-secondary">
                    <p>© {new Date().getFullYear()} OnlineJudge by Swyam Sharma. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;