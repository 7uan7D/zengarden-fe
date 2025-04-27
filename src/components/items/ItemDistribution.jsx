import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import useItemData from "@/hooks/useItemData"

const COLORS = ['#E5E7EB', '#3B82F6' , '#8884D8', '#FED766', '#10B981', '#FF6B6B']

const ItemDistribution = () => {
    const { itemData, isLoading, error } = useItemData()

    const itemStatusData = [
        { name: 'Common', value: itemData?.filter((item) => item.rarity === 'Common').length },
        { name: 'Rare', value: itemData?.filter((item) => item.rarity === 'Rare').length },
        { name: 'Epic', value: itemData?.filter((item) => item.rarity === 'Epic').length },
        { name: 'Legendary', value: itemData?.filter((item) => item.rarity === 'Legendary').length },
    ]

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
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Item Rarity Distribution</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={itemStatusData}
                            cx='50%'
                            cy='50%'
                            outerRadius={80}
                            fill='#8884d8'
                            dataKey='value'
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {itemStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4B5563',
                            }}
                            itemStyle={{ color: '#E5E7EB' }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export default ItemDistribution