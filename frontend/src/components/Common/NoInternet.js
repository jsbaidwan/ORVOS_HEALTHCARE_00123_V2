import { WifiOff, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

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
                window.location.href = "/";
            }, 1000);
        }

    }, [isOnline]);

    return (
        <div className="py-6 flex items-center justify-center">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">

                <div className="flex justify-center mb-6">
                    <div className={`${isOnline ? "bg-green-100" : "bg-red-100"} p-5 rounded-full`}>

                        {
                            isOnline
                                ? <Wifi className="w-14 h-14 text-green-500" />
                                : <WifiOff className="w-14 h-14 text-red-500" />
                        }

                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-3">

                    {
                        isOnline
                            ? "Internet Connected"
                            : "No Internet Connection"
                    }

                </h1>

                <p className="text-gray-500 text-base leading-relaxed mb-8">

                    {
                        isOnline
                            ? "Redirecting you back to the application..."
                            : "Your device appears to be offline. Please check your Wi-Fi or mobile network."
                    }

                </p>

                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-4">
                    <div
                        className={`h-full transition-all duration-500 ${isOnline ? "w-full bg-green-500" : "w-1/3 bg-red-500"
                            }`}
                    />
                </div>

                <p className="text-sm text-gray-500">
                    {isOnline ? "Connection Restored" : "Waiting for connection..."}
                </p>

                <p className="text-xs text-gray-400 mt-5">
                    {isOnline ? "STATUS: ONLINE" : "ERROR CODE: NETWORK_OFFLINE"}
                </p>

            </div>

        </div>
    );
}

export default NoInternet;