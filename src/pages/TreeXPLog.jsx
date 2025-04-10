import AdminHeader from "@/components/common/AdminHeader"
import TreeXPLogTable from "@/components/logTable/TreeXPLogTable"

const TreeXPLog = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <AdminHeader title='Tree Experience Log' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <TreeXPLogTable />
            </main>
        </div>
    )
}

export default TreeXPLog