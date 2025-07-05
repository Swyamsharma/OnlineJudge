import { VscSearch, VscCode, VscTelescope } from 'react-icons/vsc';

const features = [
    {
        icon: VscSearch,
        title: "Choose Your Challenge",
        description: "Explore our growing library of problems. Use filters for difficulty, tags, and your personal progress to find the perfect challenge."
    },
    {
        icon: VscCode,
        title: "Code & Learn",
        description: "Write your solution in our feature-rich IDE. If you get stuck, leverage our integrated AI to get a helpful hint and learn new concepts."
    },
    {
        icon: VscTelescope,
        title: "Analyze & Improve",
        description: "Get instant feedback on your submission. For accepted solutions, unlock an AI-powered analysis of your code's time and space complexity."
    }
];

function FeaturesSection() {
    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary">How It Works</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">A streamlined experience from problem to solution.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                             <div key={index} className="text-center">
                                <div className="flex justify-center items-center mb-6">
                                    <div className="p-4 bg-secondary rounded-lg border border-border-color">
                                        <Icon className="h-8 w-8 text-accent"/>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-text-primary">{feature.title}</h3>
                                <p className="mt-2 text-text-secondary">{feature.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}

export default FeaturesSection;