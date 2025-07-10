import React from "react";
import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";

function HomePage() {
    return (
        <div className="flex-1 w-full max-w-full overflow-y-auto">
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <Footer /> 
        </div>
    );
}
export default HomePage;