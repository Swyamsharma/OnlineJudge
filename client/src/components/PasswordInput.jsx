import { React, useState } from 'react';
import { VscEye, VscEyeClosed } from "react-icons/vsc";

function PasswordInput({ id, name, value, onChange, required, className, label }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            {label && <label htmlFor={id} className="block text-sm font-medium text-text-secondary">{label}</label>}
            <div className={`relative ${label ? 'mt-1' : ''}`}>
                <input
                    id={id}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={className}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <VscEyeClosed className="h-5 w-5" /> : <VscEye className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
}

export default PasswordInput;