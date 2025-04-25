import AdminHeader from "@/components/common/AdminHeader"
import TransactionsTable from "@/components/transactions/TransactionsTable"

const Transactions = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <AdminHeader title='Transactions' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <TransactionsTable />
            </main>
        </div>
    )
}

export default Transactions