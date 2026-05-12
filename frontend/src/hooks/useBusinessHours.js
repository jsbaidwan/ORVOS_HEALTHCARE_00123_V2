import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const hoursData = [
    ["Mon", { open: 9, close: 17 }],
    ["Tue", { open: 9, close: 17 }],
    ["Wed", { open: 9, close: 17 }],
    ["Thu", { open: 9, close: 17 }],
    ["Fri", { open: 9, close: 17 }],
    ["Sat", null],
    ["Sun", null],
];

export const useBusinessHours = () => {
    const [open, setOpen] = useState(true);

    const now = new Date();

    const formatTime = (hour) => {
        const suffix = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;

        return `${formattedHour}:00 ${suffix}`;
    };

    const todayMap = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
    ];

    const todayName = todayMap[now.getDay()];

    const todayData = hoursData.find(
        ([day]) => day === todayName
    )?.[1];

    let status = "Closed";
    let currentHoursTime = "";

    if (todayData) {
        const { open: start, close } = todayData;

        currentHoursTime = `${formatTime(
            start
        )} – ${formatTime(close)}`;

        const currentHour = now.getHours();

        if (currentHour < start) {
            status = "Opens soon";
        } else if (
            currentHour >= start &&
            currentHour < close
        ) {
            status = "Open";
        }
    }

    const renderBusinessHours = () => (
        <>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 text-lg text-gray-700 hover:text-black"
            >
                <span
                    className={`font-semibold ${status === "Open"
                        ? "text-green-600"
                        : status === "Opens soon"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                >
                    {status}
                    {currentHoursTime &&
                        " - " + currentHoursTime}
                </span>

                <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div className="mt-5 space-y-3 border-t border-gray-200 pt-4">
                    {hoursData.map(([day, data]) => {
                        const isToday = day === todayName;

                        const time = data
                            ? `${formatTime(
                                data.open
                            )} – ${formatTime(data.close)}`
                            : "Closed";

                        return (
                            <div
                                key={day}
                                className={`flex justify-between rounded text-sm px-2 py-1 ${isToday
                                    ? status === "Closed"
                                        ? "bg-red-100 text-red-600 font-semibold"
                                        : status === "Opens soon"
                                            ? "bg-yellow-100 text-yellow-700 font-semibold"
                                            : "bg-green-100 text-green-700 font-semibold"
                                    : time === "Closed"
                                        ? "text-red-600"
                                        : "text-gray-600"
                                    }`}
                            >
                                <span>{day}</span>
                                <span>{time}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );

    return {
        status,
        currentHoursTime,
        renderBusinessHours,
    };
};