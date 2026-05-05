import { useRef, useEffect } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

function EllipsisMenu({ row, activeMenu, setActiveMenu, menus = [] }) {
    const ref = useRef();
    const isOpen = activeMenu === row.id;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setActiveMenu]);

    return (
        <div className="relative inline-block" ref={ref}>

            {/* Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(isOpen ? null : row.id);
                }}
                className="p-1 hover:bg-gray-200 rounded cursor-pointer"
            >
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-lg z-[9999] pointer-events-auto">
                    {menus.map((menu, index) => (
                        <Link
                            key={index}
                            to={typeof menu.path === "function" ? menu.path(row) : menu.path}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                            onMouseDown={(e) => e.stopPropagation()} // 🔥 FIX
                            onClick={() => setActiveMenu(null)}
                        >
                            {menu.icon && <span className="w-4 h-4">{menu.icon}</span>}
                            <span>{menu.label}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EllipsisMenu;