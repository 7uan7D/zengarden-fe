import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Eye } from "lucide-react"
import {
  DeleteTaskById,
  GetTaskById,
  UpdateTaskById,
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

const TasksTable = () => {
  const { taskData, isLoadingState, error } = useTaskData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTasks, setFilteredTasks] = useState(taskData)
  const [openEditTask, setOpenEditTask] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [openDeleteTask, setOpenDeleteTask] = useState(false)
  const [openStates, setOpenStates] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (taskData) {
      setFilteredTasks(taskData)
    }
  }, [taskData])

  const [editTask, setEditTask] = useState({
    taskId: null,
    taskName: '',
    taskDescription: '',
    taskNote: '',
    totalDuration: 0,
    workDuration: 0,
    breakTime: 0,
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    if (selectedTaskId) {
      setIsLoading(true)
      GetTaskById(selectedTaskId)
        .then((data) =>
          setEditTask({
            taskId: data.taskId || null,
            taskName: data.taskName || '',
            taskDescription: data.taskDescription || '',
            taskNote: data.taskNote || 'none',
            totalDuration: data.totalDuration || 0,
            workDuration: data.workDuration || 0,
            breakTime: data.breakTime || 0,
            startDate: data.startDate || '',
            endDate: data.endDate || '',
          })
        )
        .catch((error) => console.error('Failed to load task info:', error))
        .finally(() => setIsLoading(false))
    }
  }, [selectedTaskId])

  const handleChange = (e) => {
    const { id, value } = e.target
    setEditTask((prev) => ({
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

  // const handleClick = (taskId) => {
  //     setOpenStates((prev) => ({ ...prev, [taskId]: true }))
  // }

  // const handleMouseLeave = (taskId) => {
  //     setOpenStates((prev) => ({ ...prev, [taskId]: false }))
  // }

  if (!filteredTasks) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
  }

  const handleEditClick = (taskId) => {
    setSelectedTaskId(taskId)
    setOpenEditTask(true)
  }

  const handleSaveChanges = async () => {
    if (selectedTaskId) {
      console.log('Saving changes for task:', editTask)
      setIsLoading(true)
      try {
        const startDateUTC = editTask.startDate ? new Date(editTask.startDate).toISOString() : null;
        const endDateUTC = editTask.endDate ? new Date(editTask.endDate).toISOString() : null;

        const taskToUpdate = {
            ...editTask,
            startDate: startDateUTC,
            endDate: endDateUTC,
        };

        await UpdateTaskById(selectedTaskId, taskToUpdate);
        toast.success('The information has been updated successfully!')

        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } catch (error) {
        console.log('Failed to update task:', error)
        toast.error('Update information failed!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteClick = (taskId) => {
    setSelectedTaskId(taskId)
    setOpenDeleteTask(true)
  }

  const handleDeleteTask = async () => {
    if (selectedTaskId) {
      setIsLoading(true)
      try {
        await DeleteTaskById(selectedTaskId)
        toast.success('Task has been deleted successfully!')
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } catch (error) {
        console.log('Failed to delete task:', error)
        toast.error('Delete task failed!')
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
                                                    ${
                                                      task.status === 0
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
                        {/* <button 
                                                    className='text-indigo-400 hover:text-indigo-300 mr-2'
                                                    onClick={() => handleClick(task.taskId)}
                                                    onMouseLeave={() => handleMouseLeave(task.taskId)}
                                                >
                                                    <Eye size={18}/>
                                                </button> */}
                        <button
                          onClick={() => handleEditClick(task.taskId)}
                          className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(task.taskId)}
                          className='text-red-400 hover:text-red-300 bg-transparent'
                        >
                          Delete
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

      <Dialog open={openEditTask} onOpenChange={setOpenEditTask}>
        <DialogContent className='dialog-overlay bg-gray-800 text-white'>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>

          <Tabs className='w-[462px]'>
            <TabsContent className='p-4'>
              <Card className='bg-gray-800 text-white'>
                <CardHeader>
                  <CardDescription className='text-gray-400'>
                    View and update your task details here.
                  </CardDescription>
                </CardHeader>

                <CardContent className='space-y-2 bg-gray-800'>
                  {editTask ? (
                    <>
                      <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                        <div className='space-y-1'>
                          <Label htmlFor='taskName'>Task Name</Label>
                          <Input
                            id='taskName'
                            value={editTask.taskName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className='space-y-1'>
                          <Label htmlFor='taskDescription'>Description</Label>
                          <Input
                            id='taskDescription'
                            value={editTask.taskDescription}
                            onChange={handleChange}
                          />
                        </div>
                        <div className='space-y-1'>
                          <Label htmlFor='taskNote'>Task Note</Label>
                          <Input
                            id='taskNote'
                            value={editTask.taskNote}
                            onChange={handleChange}
                          />
                        </div>
                        <div className='space-y-1'>
                          <Label htmlFor='totalDuration'>
                            Total Duration (mins){' '}
                          </Label>
                          <Input
                            id='totalDuration'
                            type='number'
                            placeholder='≥ Work + Break Time'
                            value={editTask.totalDuration}
                            onChange={handleChange}
                            disabled
                          />
                        </div>
                        <div className='space-y-1'>
                          <Label htmlFor='workDuration'>
                            Work Duration (mins)
                          </Label>
                          <Input
                            id='workDuration'
                            type='number'
                            value={editTask.workDuration}
                            onChange={handleChange}
                            disabled
                          />
                        </div>
                        <div className='space-y-1'>
                          <Label htmlFor='breakTime'>Break Time (mins)</Label>
                          <Input
                            id='breakTime'
                            type='number'
                            value={editTask.breakTime}
                            onChange={handleChange}
                            disabled
                          />
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <Label htmlFor='startDate'>Start Date</Label>
                        <Input
                          id='startDate'
                          type='datetime-local'
                          value={editTask.startDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label htmlFor='endDate'>End Date</Label>
                        <Input
                          id='endDate'
                          type='datetime-local'
                          value={editTask.endDate}
                          onChange={handleChange}
                        />
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

      <Dialog open={openDeleteTask} onOpenChange={setOpenDeleteTask}>
        <DialogContent className='dialog-overlay bg-gray-800 text-white'>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>

          <Tabs className='w-[462px]'>
            <TabsContent className='p-4'>
              <Card className='bg-gray-800 text-white'>
                <CardHeader>
                  <CardDescription className='text-gray-400'>
                    Delete your selected task.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-2 bg-gray-800'>
                  <div className='space-y-1'>
                    <Label>Are you sure you want to delete this task?</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className='bg-[#83aa6c] text-white'
                    onClick={handleDeleteTask}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                  <Button
                    className='bg-red-400 text-white ml-2'
                    onClick={() => setOpenDeleteTask(false)}
                  >
                    Cancel
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

export default TasksTable
