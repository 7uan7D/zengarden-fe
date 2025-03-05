import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const salesData = [
    { month: 'Jan', sales: 4200 },
    { month: 'Feb', sales: 3800 },
    { month: 'Mar', sales: 5100 },
    { month: 'Apr', sales: 4600 },
    { month: 'May', sales: 5400 },
    { month: 'Jun', sales: 7200 },
    { month: 'Jul', sales: 6100 },
    { month: 'Aug', sales: 5900 },
    { month: 'Sep', sales: 6800 },
    { month: 'Oct', sales: 6300 },
    { month: 'Nov', sales: 7100 },
    { month: 'Dec', sales: 6800 },
];

const SalesOverviewChart = () => {
    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Overview</h2>

            <div className='h-80'>
                <ResponsiveContainer width={'100%'} height={'100%'}>
                    <LineChart data={salesData} margin={{ right: 20 }}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
                        <XAxis dataKey={'month'} stroke='#9CA3AF' />
                        <YAxis stroke='#9CA3AF' />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4B5563' }}
                            itemStyle={{ color: '#E5E7EB' }}
                        />
                        <Line
                            type='monotone'
                            dataKey='sales'
                            stroke='#6366F1'
                            strokeWidth={3}
                            dot={{ fill: '#6366F1', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export default SalesOverviewChart