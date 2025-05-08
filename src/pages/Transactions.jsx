import { useEffect, useState } from "react"
import { DollarSign, Table2 } from "lucide-react"
import { motion } from "framer-motion"

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import TransactionsTable from "@/components/transactions/TransactionsTable"
import useTransactionData from "@/hooks/useTransactionData"
import DailyTransactions from "@/components/transactions/DailyTransactions"

const Transactions = () => {
    const { transactionData, isLoading, error } = useTransactionData()
    const [totalRevenue, setTotalRevenue] = useState(0)
    
    useEffect(() => {
        if (transactionData && transactionData.length > 0) {
            const revenue = transactionData.reduce(
                (sum, transaction) => sum + transaction.amount,
                0
            );
            setTotalRevenue(revenue);
        } else {
            setTotalRevenue(0);
        }
    }, [transactionData]);

    const transactionStats = {
        totalTransactions: transactionData?.length || 0,
        successTransactions: transactionData?.filter(transaction => transaction.status === 2).length || 0,
        pendingTransactions: transactionData?.filter(transaction => transaction.status === 1).length || 0,
        totalRevenue: totalRevenue,
    }

    if (isLoading) {
        return <div></div>
    }

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <AdminHeader title='Transactions' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
            <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Transactions' icon={Table2} value={transactionStats.totalTransactions} color='#6366F1' />
                    <StatCard name='Success Transactions' icon={Table2} value={transactionStats.successTransactions} color='#10B981' />
                    <StatCard name='Pending Transactions' icon={Table2} value={transactionStats.pendingTransactions} color='#FFFFFF' />
                    <StatCard name='Total Revenue' icon={DollarSign} value={totalRevenue} color='#3B82F6' />
                </motion.div>

                <TransactionsTable />

                <div className='grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8'>
                    <DailyTransactions />
                </div>
            </main>
        </div>
    )
}

export default Transactions