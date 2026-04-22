const InfoItem = ({
    label,
    value,
    valueNode,
    valueClass = "text-gray-900",
    labelClass = ""
}) => {
    return (
        <div className="flex flex-col sm:flex-row py-3">
            <div
                className={`w-full sm:w-1/2 text-sm font-medium text-gray-700 mb-1 sm:mb-0 pr-4 ${labelClass}`}
            >
                {label}
            </div>

            <div
                className={`w-full sm:w-1/2 text-sm ${valueClass} break-words`}
            >
                {valueNode !== undefined ? valueNode : (value || '-')}
            </div>
        </div>
    );
};

export default InfoItem;