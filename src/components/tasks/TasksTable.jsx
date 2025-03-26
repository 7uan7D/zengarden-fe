import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Eye } from "lucide-react"

const tasksData = [
    { taskId: 'ORD001', taskName: 'John Doe', taskTypeName: 'Simple', totalDuration: 2, workDuration: 50, breakTime: 10, startDate: '2025-03-24T15:07:25', endDate: '2025-06-25T15:07:25', status: 'Delivered'},
    { taskId: 'ORD002', taskName: 'Jane Smith', taskTypeName: 'Complex', totalDuration: 4, workDuration: 30, breakTime: 10, startDate: '2025-03-24T15:07:25', endDate: '2025-06-25T15:07:25', status: 'Processing'},
    { taskId: 'ORD003', taskName: 'Bob Johnson', taskTypeName: 'Simple', totalDuration: 1, workDuration: 20, breakTime: 10, startDate: '2025-03-24T15:07:25', endDate: '2025-06-25T15:07:25', status: 'Shipped'},
]

const TasksTable = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredTasks, setFilteredTasks] = useState(tasksData)

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        const filtered = tasksData.filter(
            (task) => task.taskId.toLowerCase().includes(term) || task.taskName.toLowerCase().includes(term)
        )
        setFilteredTasks(filtered)
    }

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Task List</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search tasks...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Task ID
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Name
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Type
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Total Duration
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Work Duration
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Break Time
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Start Date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                End Date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Status
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide divide-gray-700'>
                        {filteredTasks.map((task) => (
                            <motion.tr
                                key={task.taskId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {task.taskId}
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {task.taskName}
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {task.taskTypeName}
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {task.totalDuration}
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {task.workDuration}
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {task.breakTime}
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {new Date(task.startDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        second: 'numeric',
                                    })}
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {new Date(task.endDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        second: 'numeric',
                                    })}
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.status === 'Delivered'
                                                ? 'bg-green-100 text-green-800'
                                                : task.status === 'Processing'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : task.status === 'Shipped'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {task.status}
                                    </span>
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

export default TasksTable