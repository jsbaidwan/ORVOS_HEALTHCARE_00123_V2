import {
    Wifi,
    WifiOff,
    ShieldCheck,

} from "lucide-react";
import { useEffect, useState } from "react";
import orvosBackground from "../../assets/images/orvos_background2.webp"; 
import orvosLogo from "../../assets/images/OrvosTransparentLogo1.png";

function NoInternet() {

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {

        const handleOnline = () => {
            setIsOnline(true);

        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };

    }, []);

    useEffect(() => {

        if (isOnline) {
            setTimeout(() => {
                //window.location.href = "/";
            }, 1000);
        }

    }, [isOnline]);

    return (
        <>
            <div className="w-full h-32 sm:h-60 relative bg-white overflow-hidden">

                <img
                    src={orvosBackground}
                    alt="Background"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = "none";
                        document.getElementById("heading").style.display = "flex";
                    }}
                />

                {/* Fallback */}
                <div
                    id="heading"
                    className="hidden absolute inset-0 flex flex-col items-center justify-center bg-primary backdrop-blur-sm text-white"
                >
                    <h1 className="text-xl md:text-5xl font-semibold">
                        {process.env.REACT_APP_NAME}
                    </h1>

                </div>
                <img
                    src={orvosLogo}
                    alt="Orvos Logo"
                    className="absolute w-40 h-auto top-4 left-1/2 transform -translate-x-1/2 sm:top-4 sm:left-4 sm:translate-x-0 sm:w-60 md:w-72 lg:w-96"
                    onError={(e) => {
                        e.target.style.display = "none";
                        document.getElementById("heading").style.display = "flex";
                    }}
                />
            </div>

            {/* Main Section */}
            <div className="bg-white relative overflow-hidden">

                {/* Background Effects */}

                <div className="mt-10 grid lg:grid-cols-2">

                    {/* Left Side */}
                    <div className="hidden lg:flex flex-col justify-center px-20">

                        <h1 className="text-6xl font-bold leading-tight mb-6 text-gray-800">
                            Stay Connected
                        </h1>

                        <p className="text-xl text-gray-500 leading-relaxed max-w-lg mb-10">
                            Your application requires an active internet connection
                            to sync data, receive updates, and continue working
                            seamlessly across devices.
                        </p>

                        {/* Widgets Grid */}
                        <div className="grid grid-cols-2 gap-6 max-w-2xl">

                            {/* Widget 1 */}
                            <div className="bg-white shadow-xl rounded-3xl border border-gray-100 p-6 hover:scale-105 transition-all duration-300">

                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-green-100 p-3 rounded-2xl">
                                        <Wifi className="w-7 h-7 text-green-500" />
                                    </div>

                                    <span className="text-sm text-green-500 font-semibold">
                                        LIVE
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-800">
                                    99.9%
                                </h2>

                                <p className="text-gray-500 mt-2">
                                    Network Stability
                                </p>

                            </div>

                            {/* Widget 2 */}
                            <div className="bg-white shadow-xl rounded-3xl border border-gray-100 p-6 hover:scale-105 transition-all duration-300">

                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-blue-100 p-3 rounded-2xl">
                                        <ShieldCheck className="w-7 h-7 text-blue-500" />
                                    </div>

                                    <span className="text-sm text-blue-500 font-semibold">
                                        SAFE
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-800">
                                    Secure
                                </h2>

                                <p className="text-gray-500 mt-2">
                                    Encrypted Connection
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Right Side */}
                    <div className="flex items-center justify-center p-6">

                        <div className="w-full max-w-lg bg-white rounded-3xl p-10 text-center shadow-2xl border border-gray-100">

                            <div className="flex justify-center mb-8">

                                <div
                                    className={`p-6 rounded-full ${isOnline
                                        ? "bg-green-100"
                                        : "bg-red-100"
                                        }`}
                                >
                                    {isOnline ? (
                                        <Wifi className="w-16 h-16 text-green-500" />
                                    ) : (
                                        <WifiOff className="w-16 h-16 text-red-500" />
                                    )}
                                </div>

                            </div>

                            <h1 className="text-4xl font-bold mb-4 text-gray-800">
                                {isOnline
                                    ? "Internet Connected"
                                    : "No Internet"}
                            </h1>

                            <p className="text-gray-500 leading-relaxed mb-8">
                                {isOnline
                                    ? "Connection restored successfully. Redirecting you back..."
                                    : "Please check your Wi-Fi or mobile network connection and try again."}
                            </p>

                            {/* Progress */}
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-5">

                                <div
                                    className={`h-full transition-all duration-700 ${isOnline
                                        ? "w-full bg-green-500"
                                        : "w-1/3 bg-red-500"
                                        }`}
                                />

                            </div>

                            <div className="flex justify-between text-sm text-gray-500">

                                <span>
                                    {isOnline
                                        ? "STATUS: ONLINE"
                                        : "STATUS: OFFLINE"}
                                </span>

                                <span>
                                    {isOnline
                                        ? "CONNECTED"
                                        : "RECONNECTING"}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

export default NoInternet;