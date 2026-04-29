import UsersList from "./UsersList"

const ArchiveUsers = ({ roleId = null }) => {
    return (
        <div>
            <UsersList archived={true} roleId={roleId} />
        </div>
    )
}

export default ArchiveUsers;
