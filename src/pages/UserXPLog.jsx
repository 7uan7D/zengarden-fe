import AdminHeader from "@/components/common/AdminHeader"
import UserXPLogTable from "@/components/logTable/UserXPLogTable"

const UserXPLog = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <AdminHeader title='User Experience Log' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <UserXPLogTable />
            </main>
        </div>
    )
}

export default UserXPLog