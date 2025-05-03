import AdminHeader from "@/components/common/AdminHeader"
import TradeHistoryTable from "@/components/tradeHistory/TradeHistoryTable"

const TradeHistory = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <AdminHeader title='Trade History' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <TradeHistoryTable />
            </main>
        </div>
    )
}

export default TradeHistory