import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Eye } from "lucide-react"
import { DeleteTaskById, GetTaskById, UpdateTaskById } from "@/services/apiServices/taskService"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import useChallengeData from "@/hooks/useChallengeData"
import { GetAllChallengeTypes } from "@/services/apiServices/challengeTypeService"

const ChallengesTable = () => {
    const { challengeData, isLoadingState, error } = useChallengeData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredChallenges, setFilteredChallenges] = useState(challengeData)
    // const [openEditTask, setOpenEditTask] = useState(false)
    // const [selectedTaskId, setSelectedTaskId] = useState(null)
    // const [openDeleteTask, setOpenDeleteTask] = useState(false)
    const [openStates, setOpenStates] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        if (challengeData) {
            setFilteredChallenges(challengeData)
        }
    }, [challengeData])

    // const [editTask, setEditTask] = useState({
    //     taskId: null,
    //     taskName: '',
    //     taskDescription: '',
    //     taskNote: '',
    //     totalDuration: 0,
    //     workDuration: 0,
    //     breakTime: 0,
    //     startDate: '',
    //     endDate: '',
    // })

    // useEffect(() => {
    //     if (selectedTaskId) {
    //         setIsLoading(true)
    //         GetTaskById(selectedTaskId)
    //             .then((data) => setEditTask({
    //                 taskId: data.taskId || null,
    //                 taskName: data.taskName || '',
    //                 taskDescription: data.taskDescription || '',
    //                 taskNote: data.taskNote || 'none',
    //                 totalDuration: data.totalDuration || 0,
    //                 workDuration: data.workDuration || 0,
    //                 breakTime: data.breakTime || 0,
    //                 startDate: data.startDate || '',
    //                 endDate: data.endDate || '',
    //             }))
    //             .catch((error) => console.error('Failed to load task info:', error))
    //             .finally(() => setIsLoading(false))
    //     }
    // }, [selectedTaskId])

    // const handleChange = (e) => {
    //     const { id, value } = e.target
    //     setEditTask((prev) => ({
    //         ...prev,
    //         [id]: value,
    //     }))
    // }

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        if (challengeData) {
            const filtered = challengeData.filter(
                (challenge) =>
                    challenge.challengeId.toString().includes(term) ||
                    challenge.challengeName.toLowerCase().includes(term)
            )
            setFilteredChallenges(filtered)
        }
    }

    const [challengeTypes, setChallengeTypes] = useState([])
    useEffect(() => {
        const fetchChallengeTypes = async () => {
            try {
                const response = await GetAllChallengeTypes()
                setChallengeTypes(response)
            } catch (error) {
                console.error('Failed to fetch challenge types:', error)
            }
        }

        fetchChallengeTypes()
    }, [])

    if (!filteredChallenges) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    // const handleEditClick = (taskId) => {
    //     setSelectedTaskId(taskId)
    //     setOpenEditTask(true)
    // }

    // const handleSaveChanges = async () => {
    //     if (selectedTaskId) {
    //         setIsLoading(true)
    //         try {
    //             await UpdateTaskById(selectedTaskId, editTask)
    //             toast.success('The information has been updated successfully!')

    //             setTimeout(() => {
    //                 window.location.reload()
    //             }, 3000)
    //         } catch (error) {
    //             console.log('Failed to update task:', error)
    //             toast.error('Update information failed!')
    //         } finally {
    //             setIsLoading(false)
    //         }
    //     }
    // }

    // const handleDeleteClick = (taskId) => {
    //     setSelectedTaskId(taskId)
    //     setOpenDeleteTask(true)
    // }

    // const handleDeleteTask = async () => {
    //     if (selectedTaskId) {
    //         setIsLoading(true)
    //         try {
    //             await DeleteTaskById(selectedTaskId)
    //             toast.success('Task has been deleted successfully!')
    //             setTimeout(() => {
    //                 window.location.reload()
    //             }, 3000)
    //         } catch (error) {
    //             console.log('Failed to delete task:', error)
    //             toast.error('Delete task failed!')
    //         } finally {
    //             setIsLoading(false)
    //         }
    //     }
    // }

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredChallenges.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage)

    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    const renderPageNumbers = () => {
        const pageNumbers = []
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => paginate(i)}
                    className={`mx-1 px-3 py-1 rounded-md ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-blue-500'}`}
                >
                    {i}
                </button>
            )
        }
        return pageNumbers
    }

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Challenge List <p className='text-sm font-light text-gray-500'>(Click for detail)</p></h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search challenges...'
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
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Challenge ID
                            </th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Name
                            </th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Type
                            </th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Reward
                            </th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Status
                            </th>
                            <th className='px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Created At
                            </th>
                            <th className='px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Updated At
                            </th>
                            {/* <th className='px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th> */}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentItems.map((challenge) => (
                            <Popover key={challenge.challengeId} open={openStates[challenge.challengeId]}>
                                <PopoverTrigger asChild >
                                    <div style={{ display: 'contents' }}>
                                        <motion.tr
                                            className='hover:bg-gray-700 rounded-lg transition duration-200 cursor-pointer'
                                            key={challenge.challengeId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {challenge.challengeId}
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {challenge.challengeName}
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {challengeTypes.find((type) => type.challengeTypeId === challenge.challengeTypeId)?.challengeTypeName || 'Unknown'}
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {challenge.reward} coins
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${challenge.status === 0 ? 'bg-gray-200 text-gray-800'
                                                        : challenge.status === 1 ? 'bg-blue-200 text-blue-800'
                                                            : challenge.status === 2 ? 'bg-green-200 text-green-800'
                                                                : 'bg-red-200 text-red-800'
                                                    }`}
                                                >
                                                    {challenge.status === 0 ? 'Not Started'
                                                        : challenge.status === 1 ? 'Active'
                                                            : challenge.status === 2 ? 'Completed'
                                                                : 'Cancelled'}
                                                </span>
                                            </td>
                                            <td className='px-5 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                {new Date(challenge.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    second: 'numeric',
                                                })}
                                            </td>
                                            <td className='px-5 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                {new Date(challenge.updatedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    second: 'numeric',
                                                })}
                                            </td>
                                            {/* <td className='px-5 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <button onClick={() => handleEditClick(challenge.challengeId)} className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'>Edit</button>
                                                <button onClick={() => handleDeleteClick(challenge.challengeId)} className='text-red-400 hover:text-red-300 bg-transparent'>Delete</button>
                                            </td> */}
                                        </motion.tr>
                                    </div>
                                </PopoverTrigger>

                                <PopoverContent
                                    className='bg-gray-800 text-gray-100 p-4 rounded-lg shadow-lg right-0 top-0'
                                    side='right'
                                    align='start'
                                    style={{ position: 'fixed', right: '-1460px', top: '20px' }}
                                >
                                    <p className='text-gray-200 font-semibold'>{challenge.challengeName}</p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        {challenge.description}
                                    </p>

                                    <p className='text-gray-400 text-left text-sm'>
                                        {challenge.tasks.length === 0 ? (
                                            <p className='text-gray-200 text-sm font-bold mr-1'>No tasks available</p>
                                        ) : (
                                            <>
                                                <p className='text-gray-200 text-sm font-bold mr-1'>Tasks: </p>
                                                {challenge.tasks.map((task) => (
                                                    <ul key={task.taskId} className='list-disc list-inside'>
                                                        <li className='text-gray-400 text-sm'>{task.taskName}</li>
                                                    </ul>
                                                ))}
                                            </>
                                        )}

                                    </p>

                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Start Date: </p>
                                        {new Date(challenge.startDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        })}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>End Date: </p>
                                        {new Date(challenge.endDate).toLocaleDateString('en-US', {
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

            <div className='flex justify-center items-center mt-6'>
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='mx-1 px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    Previous
                </button>
                {renderPageNumbers()}
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className='mx-1 px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    Next
                </button>
            </div>

            {/* <Dialog open={openEditTask} onOpenChange={setOpenEditTask}>
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
                                                    <Label htmlFor='totalDuration'>Total Duration ({('>')} 30 mins) </Label>
                                                    <Input
                                                        id='totalDuration'
                                                        type='number'
                                                        placeholder='≥ Work + Break Time'
                                                        value={editTask.totalDuration}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className='space-y-1'>
                                                    <Label htmlFor='workDuration'>Work Duration (mins)</Label>
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
            </Dialog> */}
        </motion.div>
    )
}

export default ChallengesTable