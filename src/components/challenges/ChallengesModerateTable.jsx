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
import { ActiveChallengeById, CancelChallengeById, GetChallengeById, GetRankingByChallengeId, SelectWinnerByChallengeId, UpdateChallengeById } from "@/services/apiServices/challengeService"

const ChallengesModerateTable = () => {
    const { challengeData, isLoadingState, error } = useChallengeData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredChallenges, setFilteredChallenges] = useState(challengeData)
    const [selectedChallengeId, setSelectedChallengeId] = useState(null)
    const [openEditChallenge, setOpenEditChallenge] = useState(false)
    const [openStartChallenge, setOpenStartChallenge] = useState(false)
    const [openCancelChallenge, setOpenCancelChallenge] = useState(false)
    const [openRejectChallenge, setOpenRejectChallenge] = useState(false)
    const [openSelectWinner, setOpenSelectWinner] = useState(false)
    const [openStates, setOpenStates] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [rankingData, setRankingData] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        if (challengeData) {
            setFilteredChallenges(challengeData)
        }
    }, [challengeData])

    useEffect(() => {
        const fetchRanking = async () => {
            if (!selectedChallengeId || !openSelectWinner) return

            try {
                const data = await GetRankingByChallengeId(selectedChallengeId)
                setRankingData(data)
            } catch (error) {
                console.error('Error fetching ranking:', error)
            }
        }

        fetchRanking()
    }, [selectedChallengeId, openSelectWinner])

    const [editChallenge, setEditChallenge] = useState({
        challengeTypeId: 0,
        challengeName: '',
        description: '',
        reward: 0,
        maxParticipants: 0,
        startDate: '',
        endDate: '',
    })

    const [selectWinnerChange, setSelectWinnerChange] = useState({
        userId: 0,
        reason: "string"
    })

    useEffect(() => {
        if (selectedChallengeId) {
            setIsLoading(true)
            GetChallengeById(selectedChallengeId)
                .then((data) => setEditChallenge({
                    challengeTypeId: data.challengeTypeId || 0,
                    challengeName: data.challengeName || '',
                    description: data.description || '',
                    reward: data.reward || 0,
                    maxParticipants: data.maxParticipants || 0,
                    startDate: data.startDate || '',
                    endDate: data.endDate || '',
                }))
                .catch((error) => console.error('Failed to load challenge info:', error))
                .finally(() => setIsLoading(false))
        }
    }, [selectedChallengeId])

    const handleChange = (e) => {
        const { id, value } = e.target
        setEditChallenge((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

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

    const handleStartClick = (challengeId) => {
        setSelectedChallengeId(challengeId)
        setOpenStartChallenge(true)
    }

    const handleStartChallenge = async () => {
        setIsLoading(true)
        try {
            await ActiveChallengeById(selectedChallengeId)
            toast.success('Challenge started successfully!')
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.log('Failed to start challenge:', error)
            toast.error('Start challenge failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelClick = (challengeId) => {
        setSelectedChallengeId(challengeId)
        setOpenCancelChallenge(true)
    }

    const handleCancelChallenge = async () => {
        setIsLoading(true)
        try {
            await CancelChallengeById(selectedChallengeId)
            toast.success('The challenge has been cancelled!')
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.log('Failed to cancel challenge:', error)
            toast.error('Cancel challenge failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRejectClick = (challengeId) => {
        setSelectedChallengeId(challengeId)
        setOpenRejectChallenge(true)
    }

    const handleRejectChallenge = async () => {
        setIsLoading(true)
        try {
            await CancelChallengeById(selectedChallengeId)
            toast.success('The challenge has been rejected!')
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.log('Failed to reject challenge:', error)
            toast.error('Reject challenge failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditClick = (challengeId) => {
        setSelectedChallengeId(challengeId)
        setOpenEditChallenge(true)
    }

    const handleSaveChanges = async () => {
        if(selectedChallengeId) {
            setIsLoading(true)
            try {
                await UpdateChallengeById(selectedChallengeId, editChallenge)
                toast.success('The information has been updated successfully!')

                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } catch (error) {
                console.log('Failed to update challenge:', error)
                toast.error('Update information failed!')
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleSelectWinnerClick = (challengeId) => {
        setSelectedChallengeId(challengeId)
        setOpenSelectWinner(true)
    }

    const handleSelectWinnerChange = (e) => {
        const { id, value } = e.target
        setSelectWinnerChange((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleSaveWinner = async () => {
        console.log('Saving changes with data: ', selectWinnerChange)
        if(selectedChallengeId) {
            setIsLoading(true)
            try {
                await SelectWinnerByChallengeId(selectedChallengeId, selectWinnerChange)
                toast.success('The information has been updated successfully!')

                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } catch (error) {
                console.log('Failed to select winner:', error)
                toast.error('Select winner failed!')
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
                                Actions
                            </th>
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
                                                        : challenge.status === 1 ? 'bg-green-200 text-green-800'
                                                            : challenge.status === 2 ? 'bg-yellow-200 text-yellow-800'
                                                                : challenge.status === 3 ? 'bg-red-200 text-red-800'
                                                                    : 'bg-orange-200 text-orange-800'
                                                    }`}
                                                >
                                                    {challenge.status === 0 ? 'Pending'
                                                        : challenge.status === 1 ? 'Active'
                                                            : challenge.status === 2 ? 'Expired'
                                                                : challenge.status === 3 ? 'Cancelled'
                                                                    : 'Rejected'}
                                                </span>
                                            </td>
                                            <td className='px-5 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <button
                                                    onClick={() => handleEditClick(challenge.challengeId)}
                                                    className={'mr-2 bg-transparent text-indigo-400 hover:text-indigo-300'}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleStartClick(challenge.challengeId)}
                                                    className={`mr-2 bg-transparent ${challenge.status !== 0 ? 'text-gray-500' : 'text-green-400 hover:text-green-300'}`}
                                                    disabled={challenge.status !== 0}
                                                >
                                                    Start
                                                </button>
                                                <button
                                                    onClick={() => handleCancelClick(challenge.challengeId)}
                                                    className={`bg-transparent ${challenge.status === 2 || challenge.status === 3 || challenge.status === 4 ? 'text-gray-500' : 'text-red-400 hover:text-red-300'}`}
                                                    disabled={challenge.status === 2 || challenge.status === 3 || challenge.status === 4}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleRejectClick(challenge.challengeId)}
                                                    className={`bg-transparent ${challenge.status === 2 || challenge.status === 3 || challenge.status === 4 ? 'text-gray-500' : 'text-orange-400 hover:text-orange-300'}`}
                                                    disabled={challenge.status === 2 || challenge.status === 3 || challenge.status === 4}
                                                >
                                                    Reject
                                                </button>
                                                {/* <button
                                                    onClick={() => handleSelectWinnerClick(challenge.challengeId)}
                                                    className={`bg-transparent ${challenge.status !== 2 ? 'text-gray-500' : 'text-yellow-600 hover:text-yellow-500'}`}
                                                    disabled={challenge.status !== 2}
                                                >
                                                    Select Winner
                                                </button> */}
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
                                    <p className='text-gray-200 font-semibold'>{challenge.challengeName}</p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        {challenge.description}
                                    </p>

                                    <div className='text-gray-400 text-left text-sm'>
                                        {challenge.tasks.length === 0 ? (
                                            <p className='text-gray-200 text-sm font-bold'>No tasks available</p>
                                        ) : (
                                            <>
                                                <p className='text-gray-200 text-sm font-bold mb-1'>Tasks: </p>
                                                <ul className='list-disc list-inside ml-4'>
                                                    {challenge.tasks.map((task) => (
                                                        <li key={task.taskId} className='text-gray-400 text-sm'>
                                                            {task.taskName}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </div>

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
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Created At: </p>
                                        {new Date(challenge.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        })}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Updated At: </p>
                                        {new Date(challenge.updatedAt).toLocaleDateString('en-US', {
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

            <Dialog open={openStartChallenge} onOpenChange={setOpenStartChallenge}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Start Challenge</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        Start this challenge to earn rewards and complete tasks.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-2 bg-gray-800'>
                                    <div className='space-y-1'>
                                        <Label>Do you want to start this challenge?</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleStartChallenge}
                                        disabled={isLoading}
                                    >
                                        Start
                                    </Button>
                                    <Button
                                        className='bg-red-400 text-white ml-2'
                                        onClick={() => setOpenStartChallenge(false)}
                                    >
                                        Exit
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={openCancelChallenge} onOpenChange={setOpenCancelChallenge}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Cancel Challenge</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        Cancel this challenge.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-2 bg-gray-800'>
                                    <div className='space-y-1'>
                                        <Label>Do you want to cancel this challenge?</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleCancelChallenge}
                                        disabled={isLoading}
                                    >
                                        Cancel Challenge
                                    </Button>
                                    <Button
                                        className='bg-red-400 text-white ml-2'
                                        onClick={() => setOpenCancelChallenge(false)}
                                    >
                                        Exit
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={openRejectChallenge} onOpenChange={setOpenRejectChallenge}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Reject Challenge</DialogTitle>
                    </DialogHeader>
                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        Reject this challenge.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-2 bg-gray-800'>
                                    <div className='space-y-1'>
                                        <Label>Do you want to reject this challenge?</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleRejectChallenge}
                                        disabled={isLoading}
                                    >
                                        Reject Challenge
                                    </Button>
                                    <Button
                                        className='bg-red-400 text-white ml-2'
                                        onClick={() => setOpenRejectChallenge(false)}
                                    >
                                        Exit
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={openEditChallenge} onOpenChange={setOpenEditChallenge}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Edit Challenge</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        View and update your challenge details here.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className='space-y-2 bg-gray-800'>
                                    {editChallenge ? (
                                        <>
                                            <div className='space-y-1'>
                                                <Label htmlFor='challengeName'>Challenge Name</Label>
                                                <Input
                                                    id='challengeName'
                                                    value={editChallenge.challengeName}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='description'>Description</Label>
                                                <Input
                                                    id='description'
                                                    value={editChallenge.description}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                                                <div className='space-y-1'>
                                                    <Label htmlFor='reward'>Reward (coins)</Label>
                                                    <Input
                                                        id='reward'
                                                        value={editChallenge.reward}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className='space-y-1'>
                                                    <Label htmlFor='maxParticipants'>Max Paticipants</Label>
                                                    <Input
                                                        id='maxParticipants'
                                                        value={editChallenge.maxParticipants}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='challengeTypeId'>Challenge Type</Label>
                                                <select
                                                    id='challengeTypeId'
                                                    value={editChallenge.challengeTypeId}
                                                    onChange={handleChange}
                                                    className='w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-sm'
                                                >
                                                    <option value='' disabled>Select Challenge Type</option>
                                                    {challengeTypes.map((challenge) => (
                                                        <option key={challenge.challengeTypeId} value={challenge.challengeTypeId}>
                                                            {challenge.challengeTypeName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='startDate'>Start Date</Label>
                                                <Input
                                                    id='startDate'
                                                    type='datetime-local'
                                                    value={editChallenge.startDate}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='endDate'>End Date</Label>
                                                <Input
                                                    id='endDate'
                                                    type='datetime-local'
                                                    value={editChallenge.endDate}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <p className='text-sm text-gray-500'>Loading challenge...</p>
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

            {/* <Dialog open={openSelectWinner} onOpenChange={setOpenSelectWinner}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Select Winner</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        Choose a winner for this challenge.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className='space-y-2 bg-gray-800'>
                                    {editChallenge ? (
                                        <>
                                            <p className='text-sm text-emerald-500 flex items-center text-left font-bold'>
                                                Leaderboard:
                                            </p>

                                                    <div className='overflow-x-auto'>
                                                        <table className='min-w-full divide-y divide-gray-200'>
                                                            <thead className='bg-gray-800'>
                                                                <tr>
                                                                    <th className='py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Rank</th>
                                                                    <th className='py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>User</th>
                                                                    <th className='py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>Progress</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className='bg-gray-800 divide-y divide-gray-200'>
                                                                {rankingData && rankingData.length > 0 ? (
                                                                    rankingData.map((user, index) => (
                                                                        <tr key={index}>
                                                                            <td className={`py-4 whitespace-nowrap text-sm font-medium text-center ${index === 0 ? 'text-rose-500' : index === 1 ? 'text-pink-500' : index === 2 ? 'text-fuchsia-500' : 'text-gray-500'}`}>
                                                                                {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                                                                            </td>

                                                                            <td className={`py-4 whitespace-nowrap text-sm font-bold text-center ${index === 0 ? 'text-rose-500' : index === 1 ? 'text-pink-500' : index === 2 ? 'text-fuchsia-500' : 'text-gray-500'}`}>
                                                                                {user.userName}
                                                                            </td>

                                                                            <td className={`py-4 whitespace-nowrap text-sm font-bold text-center ${index === 0 ? 'text-rose-500' : index === 1 ? 'text-pink-500' : index === 2 ? 'text-fuchsia-500' : 'text-gray-500'}`}>
                                                                                {user.progress}%
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td className='py-4 whitespace-nowrap text-sm text-gray-500 text-center' colSpan='3'>Loading ranking data.</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                            <div className='space-y-1'>
                                                <Label htmlFor='userId'>Participant</Label>
                                                <select
                                                    id='userId'
                                                    value={selectWinnerChange.userId}
                                                    onChange={handleSelectWinnerChange}
                                                    className='w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-sm'
                                                >
                                                    <option value='' disabled>Select A Participant</option>
                                                    {rankingData.map((user) => (
                                                        <option key={user.userId} value={user.userId}>
                                                            {user.userName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='reason'>Reason</Label>
                                                <Input
                                                    id='reason'
                                                    value={selectWinnerChange.reason}
                                                    onChange={handleSelectWinnerChange}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <p className='text-sm text-gray-500'>Loading challenge...</p>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleSaveWinner}
                                        disabled={isLoading}
                                    >
                                        Save Changes
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

export default ChallengesModerateTable