import ClinicGroupList from "./ClinicGroupList"

const ArchiveClinicGroups = () => {
    return (
        <div>
            <ClinicGroupList archived={true} />
        </div>
    )
}

export default ArchiveClinicGroups;