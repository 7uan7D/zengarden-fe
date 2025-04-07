import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Eye } from "lucide-react"
import useTaskData from "@/hooks/useTaskData"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const TasksTable = () => {
    const { taskData, isLoadingState, error } = useTaskData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredTasks, setFilteredTasks] = useState(taskData)
    const [openStates, setOpenStates] = useState({});
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (taskData) {
            setFilteredTasks(taskData)
        }
    }, [taskData])

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        const filtered = taskData.filter(
            (task) => task.taskId.toLowerCase().includes(term) || task.taskName.toLowerCase().includes(term)
        )
        setFilteredTasks(filtered)
    }

    const handleMouseEnter = (taskId) => {
        setOpenStates((prev) => ({ ...prev, [taskId]: true }));
    };

    const handleMouseLeave = (taskId) => {
        setOpenStates((prev) => ({ ...prev, [taskId]: false }));
    };

    if (!filteredTasks) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
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
                                User Tree
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Total Duration (mins)
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Work Duration (mins)
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Break Time (mins)
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Focus Method
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
                            <Popover key={task.taskId} open={openStates[task.taskId]}>
                                <PopoverTrigger asChild>
                                    <div style={{ display: 'contents' }}>
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
                                                {task.userTreeName}
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
                                                {task.focusMethodName}
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${task.status === 0 ? 'bg-gray-200 text-gray-800'
                                                        : task.status === 1 ? 'bg-blue-200 text-blue-800'
                                                            : task.status === 2 ? 'bg-yellow-200 text-yellow-800'
                                                                : task.status === 3 ? 'bg-green-200 text-green-800'
                                                                    : task.status === 4 ? 'bg-pink-200 text-pink-800'
                                                                        : task.status === 5 ? 'bg-purple-200 text-purple-800'
                                                                            : 'bg-red-200 text-red-800'
                                                    }`}
                                                >
                                                    {task.status === 0 ? 'Not Started'
                                                        : task.status === 1 ? 'In Progress'
                                                            : task.status === 2 ? 'Paused'
                                                                : task.status === 3 ? 'Completed'
                                                                    : task.status === 4 ? 'Failed'
                                                                        : task.status === 5 ? 'Overdue'
                                                                            : 'Cancelled'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <button 
                                                    className='text-indigo-400 hover:text-indigo-300 mr-2'
                                                    onMouseEnter={() => handleMouseEnter(task.taskId)}
                                                    onMouseLeave={() => handleMouseLeave(task.taskId)}
                                                >
                                                    <Eye size={18}/>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    </div>
                                </PopoverTrigger>

                                <PopoverContent
                                    className='bg-gray-800 text-gray-100 p-4 rounded-lg shadow-lg'
                                    side='bottom'
                                    align='end'
                                >
                                    <p className="text-gray-200 font-semibold">{task.taskName}</p>
                                    <p className="text-gray-500 text-left text-sm">
                                        {task.taskDescription}
                                    </p>
                                    <p className="text-gray-300 text-left text-sm">
                                        <p className="text-gray-300 text-sm font-bold mr-1">Task note:</p> 
                                        {task.taskNote === null ? 'none' : task.taskNote}
                                    </p>
                                    <p className="text-gray-300 text-left text-sm">
                                        <p className="text-gray-300 text-sm font-bold mr-1">Result:</p> 
                                        {/* check if taskresult is empty */}
                                        {task.taskResult === '' ? 'none' : task.taskResult}
                                    </p>
                                    <p className="text-gray-300 text-left text-sm">
                                        <p className="text-gray-300 text-sm font-bold mr-1">Start Date: </p> 
                                        {new Date(task.startDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-gray-300 text-left text-sm">
                                    <p className="text-gray-300 text-sm font-bold mr-1">End Date: </p> 
                                        {new Date(task.endDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        })}
                                    </p>
                                </PopoverContent>
                            </Popover>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

export default TasksTable