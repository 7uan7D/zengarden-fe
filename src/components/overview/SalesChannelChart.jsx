import { motion } from "framer-motion"
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Cell } from "recharts"

const salesChannelData = [
    { name: 'Website', value: 45600 },
    { name: 'Marketplace', value: 29800 },
    { name: 'Social Media', value: 18700 },
]

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6']

const SalesChannelChart = () => {
    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className='text-xl font-semibold mb-4 text-gray-100'>Sales by Channel</h2>

            <div className='h-80'>
                <ResponsiveContainer width={'100%'} height={'100%'}>
                    <BarChart data={salesChannelData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
                        <XAxis dataKey={'name'} stroke='#9CA3AF' />
                        <YAxis stroke='#9CA3AF' />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4B5563' }}
                            itemStyle={{ color: '#E5E7EB' }}
                        />
                         
                        <Bar dataKey={'value'} fill='#8884D8'>
                            {salesChannelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export default SalesChannelChart