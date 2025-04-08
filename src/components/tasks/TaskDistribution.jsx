import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import useTaskData from "@/hooks/useTaskData"

// const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#2AB7CA']
const COLORS = ['#E5E7EB', '#2AB7CA' , '#FED766', '#10B981', '#FF6B6B']

const TaskDistribution = () => {
    const { taskData, isLoading, error } = useTaskData()
    const taskStatusData = [
        { name: 'Not Started', value: taskData?.filter((task) => task.status === 0).length },
        { name: 'In Progress', value: taskData?.filter((task) => task.status === 1).length },
        { name: 'Paused', value: taskData?.filter((task) => task.status === 2).length },
        { name: 'Completed', value: taskData?.filter((task) => task.status === 3).length },
        { name: 'Failed', value: taskData?.filter((task) => task.status === 4).length },
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
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Task Status Distribution</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={taskStatusData}
                            cx='50%'
                            cy='50%'
                            outerRadius={80}
                            fill='#8884d8'
                            dataKey='value'
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {taskStatusData.map((entry, index) => (
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

export default TaskDistribution