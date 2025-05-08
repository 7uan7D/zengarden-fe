import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import useTransactionData from "@/hooks/useTransactionData"
import { useEffect, useState } from 'react';

const DailyTransactions = () => {
    const { transactionData, isLoading, error } = useTransactionData()
    const [dailyTransactionsData, setDailyTransactionsData] = useState([]);

    useEffect(() => {
        if (transactionData) {
            const transformedData = transformTransactionDataForDailyChart(transactionData);
            setDailyTransactionsData(transformedData);
        }
    }, [transactionData]);

    function transformTransactionDataForDailyChart(transactionData) {
        if (!transactionData) {
            return []
        }

        const dailyTransactionsMap = {}

        transactionData.forEach(transaction => {
            const createdAtDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit', // Changed to 2-digit month
            }).replace(/^(\d)\//, '0$1/');

            if (dailyTransactionsMap[createdAtDate]) {
                dailyTransactionsMap[createdAtDate]++
            } else {
                dailyTransactionsMap[createdAtDate] = 1
            }
        })

        const resultData = Object.entries(dailyTransactionsMap).map(([date, count]) => {
            const [month, day] = date.split('/') // Destructure with year
            return {
                date: `${day}/${month}`, // Include year in the date
                transactions: count
            }
        })

        resultData.sort((a, b) => {
            const [dayA, monthA] = a.date.split('/').map(Number) // Destructure with year
            const [dayB, monthB] = b.date.split('/').map(Number)

            if (monthA !== monthB) {
                return monthA - monthB
            }
            return dayA - dayB
        })

        return resultData
    }



    if (isLoading) {
        return <div></div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Daily Transactions Analytics</h2>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={dailyTransactionsData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis dataKey='date' stroke='#9CA3AF' />
                        <YAxis stroke='#9CA3AF' />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4B5563',
                            }}
                            itemStyle={{ color: '#E5E7EB' }}
                        />
                        <Legend />
                        <Line type='linear' dataKey='transactions' stroke='#8B5CF6' strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export default DailyTransactions
