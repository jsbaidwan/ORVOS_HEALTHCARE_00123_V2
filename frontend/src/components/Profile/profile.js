import UserForm from "../Users/UserForm";
import { useAuth } from "../../context/AuthContext";
import Breadcrumb from "../Common/Breadcrumb";

export default function Profile() {
    const { user } = useAuth();

    return (
        <div className="py-6">
            <Breadcrumb />

            <div className="mb-3">
                <div className="bg-white px-6 py-4 border-b rounded-t-lg shadow-sm border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Profile
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Basic information about the user.</p>
                </div>

                <div className="bg-white px-1 p-1">

                    <UserForm user={user} isProfile />

                </div>
            </div>
        </div>
    );
}