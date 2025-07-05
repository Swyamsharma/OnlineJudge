import { useState, useRef, useEffect } from 'react';
import { VscChevronDown } from "react-icons/vsc";

function FilterPopover({ label, selectedCount, children, widthClass = 'w-72' }) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const buttonText = selectedCount > 0 ? `${label} (${selectedCount})` : `All ${label}`;

    return (
        <div className="relative w-full" ref={popoverRef}>
            <label className="text-sm font-medium text-text-secondary mb-1 block">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full p-2 rounded-md border border-border-color bg-secondary text-text-primary focus:border-accent focus:ring-accent sm:text-sm flex justify-between items-center"
            >
                <span className="truncate">{buttonText}</span>
                <VscChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className={`absolute z-20 mt-1 bg-primary border border-border-color rounded-lg shadow-xl p-4 ${widthClass}`}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default FilterPopover;