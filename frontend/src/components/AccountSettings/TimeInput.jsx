import React, { useRef, useEffect } from 'react';

const TimeColumn = ({ options, value, onChange, label }) => {
    const scrollRef = useRef(null);

    // Scroll to selected item on mount/update
    useEffect(() => {
        if (scrollRef.current) {
            const selectedIndex = options.indexOf(value);
            if (selectedIndex !== -1) {
                const itemHeight = 40; // Height of each item
                scrollRef.current.scrollTop = selectedIndex * itemHeight;
            }
        }
    }, [value, options]);

    return (
        <div className="flex flex-col items-center">
            {label && <span className="text-xs text-gray-400 mb-1">{label}</span>}
            <div
                className="h-32 w-16 overflow-y-auto scrollbar-hide snap-y snap-mandatory bg-white border border-gray-200 rounded-lg relative"
                ref={scrollRef}
            >
                {/* Selection Highlight Overlay */}
                <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-[#1a3a1d]/5 pointer-events-none border-y border-[#1a3a1d]/20 opacity-50"></div>

                <div className="h-10 w-full" /> {/* Top Spacer */}
                {options.map((option) => (
                    <div
                        key={option}
                        onClick={() => onChange(option)}
                        className={`h-10 flex items-center justify-center snap-center cursor-pointer transition-colors ${value === option
                                ? 'text-deep-green font-bold text-lg'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {option}
                    </div>
                ))}
                <div className="h-10 w-full" /> {/* Bottom Spacer */}
            </div>
        </div>
    );
};

const TimeInput = ({ value, onChange, label }) => {
    // Parse value "HH:MM AM/PM" or default to now
    const parseTime = (timeStr) => {
        if (!timeStr) return { hour: '12', minute: '00', period: 'AM' };
        const [time, period] = timeStr.split(' ');
        const [hour, minute] = time.split(':');
        return { hour, minute, period };
    };

    const { hour, minute, period } = parseTime(value);

    const hours = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i + 1).padStart(2, '0')); // 12, 01, 02...
    // Adjust logic to correctly order 12, 01, 02... -> Actually standard is 12, 1, 2...11 or 01..12
    // Let's use 01-12
    const hours12 = ['12', ...Array.from({ length: 11 }, (_, i) => String(i + 1).padStart(2, '0'))];

    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 00, 05, 10...
    const periods = ['AM', 'PM'];

    const handleChange = (type, newVal) => {
        let newHour = hour;
        let newMinute = minute;
        let newPeriod = period;

        if (type === 'hour') newHour = newVal;
        if (type === 'minute') newMinute = newVal;
        if (type === 'period') newPeriod = newVal;

        onChange(`${newHour}:${newMinute} ${newPeriod}`);
    };

    return (
        <div className="flex flex-col gap-2">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <TimeColumn
                    options={hours12}
                    value={hour}
                    onChange={(v) => handleChange('hour', v)}
                    label="Hr"
                />
                <span className="text-xl font-bold text-gray-300">:</span>
                <TimeColumn
                    options={minutes}
                    value={minute}
                    onChange={(v) => handleChange('minute', v)}
                    label="Min"
                />
                <div className="w-2"></div>
                <TimeColumn
                    options={periods}
                    value={period}
                    onChange={(v) => handleChange('period', v)}
                    label="Am/Pm"
                />
            </div>
        </div>
    );
};

export default TimeInput;
