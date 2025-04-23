import AdminHeader from "@/components/common/AdminHeader"
import PackagesTable from "@/components/package/PackagesTable"

const Packages = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <AdminHeader title='Packages' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <PackagesTable />
            </main>
        </div>
    )
}

export default Packages