import { VscArrowSmallUp, VscPass, VscCheckAll, VscFlame } from "react-icons/vsc";

const iconMap = {
    solved: VscPass,
    submissions: VscCheckAll,
    acceptance: VscArrowSmallUp,
    flame: VscFlame,
};

const colorMap = {
    solved: 'text-green-400',
    submissions: 'text-blue-400',
    acceptance: 'text-cyan-400',
    flame: 'text-orange-400',
}

function StatCard({ title, value, icon, subValue, subTitle }) {
    const IconComponent = iconMap[icon] || VscPass; 
    const colorClass = colorMap[icon] || 'text-text-primary';

    return (
        <div className="bg-primary border border-border-color p-5 rounded-lg flex items-start space-x-4">
            <div className={`p-3 rounded-lg bg-secondary ${colorClass}`}>
                <IconComponent className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
                 {subValue && subTitle && (
                    <p className="text-xs text-text-secondary mt-1">{subValue} {subTitle}</p>
                )}
            </div>
        </div>
    );
}

export default StatCard;