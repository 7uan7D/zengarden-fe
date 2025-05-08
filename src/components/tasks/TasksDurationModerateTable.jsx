import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Eye } from "lucide-react"
import {
    GetTaskById,
    UpdateTaskById,
    UpdateTaskDurationById,
} from "@/services/apiServices/taskService"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import useTaskData from "@/hooks/useTaskData"

const TasksDurationModerateTable = () => {
    const { taskData, isLoadingState, error } = useTaskData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredTasks, setFilteredTasks] = useState(taskData)
    const [openEditTaskDuration, setOpenEditTaskDuration] = useState(false)
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [openStates, setOpenStates] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (taskData) {
            setFilteredTasks(taskData)
        }
    }, [taskData])

    const [editTaskDuration, setEditTaskDuration] = useState({
        totalDuration: 0,
    })

    useEffect(() => {
        if (selectedTaskId) {
            setIsLoading(true)
            GetTaskById(selectedTaskId)
                .then((data) =>
                    setEditTaskDuration({
                        totalDuration: data.totalDuration || 0,
                    })
                )
                .catch((error) => console.error('Failed to load task info:', error))
                .finally(() => setIsLoading(false))
        }
    }, [selectedTaskId])

    const handleChange = (e) => {
        const { id, value } = e.target
        setEditTaskDuration((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        if (taskData) {
            const filtered = taskData.filter(
                (task) =>
                    task.taskId.toString().includes(term) ||
                    task.taskName.toLowerCase().includes(term) ||
                    task.taskTypeName.toLowerCase().includes(term)
            )
            setFilteredTasks(filtered)
        }
    }

    if (!filteredTasks) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    const handleEditClick = (taskId) => {
        setSelectedTaskId(taskId)
        setOpenEditTaskDuration(true)
    }

    const handleSaveChanges = async () => {
        if (selectedTaskId) {
            console.log('Saving changes for task:', editTaskDuration)
            setIsLoading(true)
            try {
                await UpdateTaskDurationById(selectedTaskId, editTaskDuration.totalDuration)
                toast.success('The information has been updated successfully!')

                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } catch (error) {
                console.log('Failed to update task duration:', error)
                toast.error('Update information failed!')
            } finally {
                setIsLoading(false)
            }
        }
    }
    
    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>
                    Task List{' '}
                    <p className='text-sm font-light text-gray-500'>(Click for detail)</p>
                </h2>
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
                            <th className='px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Task ID
                            </th>
                            <th className='px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Name
                            </th>
                            <th className='px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Type
                            </th>
                            <th className='px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                User Tree
                            </th>
                            <th className='px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Total Duration (mins)
                            </th>
                            <th className='px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Work Duration (mins)
                            </th>
                            <th className='px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Break Time (mins)
                            </th>
                            <th className='px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Status
                            </th>
                            <th className='px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredTasks.map((task) => (
                            <Popover key={task.taskId} open={openStates[task.taskId]}>
                                <PopoverTrigger asChild>
                                    <div style={{ display: 'contents' }}>
                                        <motion.tr
                                            className='hover:bg-gray-700 rounded-lg transition duration-200 cursor-pointer'
                                            key={task.taskId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className='px-5 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {task.taskId}
                                            </td>
                                            <td className='px-5 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {task.taskName}
                                            </td>
                                            <td className='px-5 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {task.taskTypeName}
                                            </td>
                                            <td className='px-5 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {task.userTreeName ? task.userTreeName : 'None'}
                                            </td>
                                            <td className='px-2 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {task.totalDuration ? task.totalDuration : '...'}
                                            </td>
                                            <td className='px-2 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {task.workDuration ? task.workDuration : '...'}
                                            </td>
                                            <td className='px-2 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {task.breakTime ? task.breakTime : '...'}
                                            </td>
                                            <td className='px-2 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${task.status === 0
                                                            ? 'bg-gray-200 text-gray-800'
                                                            : task.status === 1
                                                                ? 'bg-blue-200 text-blue-800'
                                                                : task.status === 2
                                                                    ? 'bg-yellow-200 text-yellow-800'
                                                                    : task.status === 3
                                                                        ? 'bg-green-200 text-green-800'
                                                                        : task.status === 4
                                                                            ? 'bg-pink-200 text-pink-800'
                                                                            : task.status === 5
                                                                                ? 'bg-purple-200 text-purple-800'
                                                                                : 'bg-red-200 text-red-800'
                                                        }`}
                                                >
                                                    {task.status === 0
                                                        ? 'Not Started'
                                                        : task.status === 1
                                                            ? 'In Progress'
                                                            : task.status === 2
                                                                ? 'Paused'
                                                                : task.status === 3
                                                                    ? 'Completed'
                                                                    : task.status === 4
                                                                        ? 'Failed'
                                                                        : task.status === 5
                                                                            ? 'Overdue'
                                                                            : 'Cancelled'}
                                                </span>
                                            </td>
                                            <td className='px-5 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <button
                                                    onClick={() => handleEditClick(task.taskId)}
                                                    className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'
                                                >
                                                    Edit Duration
                                                </button>
                                            </td>
                                        </motion.tr>
                                    </div>
                                </PopoverTrigger>

                                <PopoverContent
                                    className='bg-gray-800 text-gray-100 p-4 rounded-lg shadow-lg right-0 top-0'
                                    side='right'
                                    align='start'
                                    style={{ position: 'fixed', right: '-1460px', top: '20px' }}
                                >
                                    <p className='text-gray-200 font-semibold'>{task.taskName}</p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        {task.taskDescription}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>
                                            Focus method:
                                        </p>
                                        {task.focusMethodName === ''
                                            ? 'None'
                                            : task.focusMethodName === null
                                                ? 'None'
                                                : task.focusMethodName}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>
                                            Task note:
                                        </p>
                                        {task.taskNote === ''
                                            ? 'None'
                                            : task.taskNote === null
                                                ? 'None'
                                                : task.taskNote}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm overflow-hidden'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>
                                            Result:
                                        </p>
                                        {task.taskResult === ''
                                            ? 'None'
                                            : task.taskResult === null
                                                ? 'None'
                                                : task.taskResult}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>
                                            Start Date:{' '}
                                        </p>
                                        {new Date(task.startDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        })}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>
                                            End Date:{' '}
                                        </p>
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

            <Dialog open={openEditTaskDuration} onOpenChange={setOpenEditTaskDuration}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Edit Task Duration</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        View and update your task duration here.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className='space-y-2 bg-gray-800'>
                                    {editTaskDuration ? (
                                        <>
                                            <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                                                <div className='space-y-1'>
                                                    <Label htmlFor='totalDuration'>
                                                        Total Duration (mins){' '}
                                                    </Label>
                                                    <Input
                                                        id='totalDuration'
                                                        type='number'
                                                        placeholder='≥ Work + Break Time'
                                                        value={editTaskDuration.totalDuration}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className='text-sm text-gray-500'>Loading task...</p>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleSaveChanges}
                                        disabled={isLoading}
                                    >
                                        Save Changes
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}

export default TasksDurationModerateTable
