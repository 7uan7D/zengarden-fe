import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

const salesData = [
    { month: 'Jan', sales: 5400 },
    { month: 'Feb', sales: 4200 },
    { month: 'Mar', sales: 4600 },
    { month: 'Apr', sales: 5100 },
    { month: 'May', sales: 3800 },
    { month: 'Jun', sales: 7200 },
];

const SalesTrendChart = () => {
    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className='text-xl font-semibold mb-4 text-gray-100'>Sales Trend</h2>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={salesData} margin={{ right: 20 }}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis dataKey={'month'} stroke='#9CA3AF' />
                        <YAxis stroke='#9CA3AF' />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4B5563' }}
                            itemStyle={{ color: '#E5E7EB' }}
                        />
                        <Legend />
                        <Line type='linear' dataKey='sales' stroke='#6366F1' strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export default SalesTrendChart