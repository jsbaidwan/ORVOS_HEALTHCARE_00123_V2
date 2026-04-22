const InfoItem = ({
    label,
    value,
    valueNode,
    valueClass = "text-gray-900",
    labelClass = ""
}) => {
    return (
        <div className="flex flex-col sm:flex-row py-[0.2rem]">
            <div
                className={`w-full sm:w-1/2 text-xs font-medium text-gray-700 mb-1 sm:mb-0 pr-4 ${labelClass}`}
            >
                {label}
            </div>

            <div
                className={`w-full sm:w-1/2 text-xs ${valueClass} break-words`}
            >
                {valueNode !== undefined ? valueNode : (value || '-')}
            </div>
        </div>
    );
};

export default InfoItem;