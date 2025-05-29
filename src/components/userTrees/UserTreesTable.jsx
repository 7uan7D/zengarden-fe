import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Edit, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import useUserTreeData from "@/hooks/useUserTreeData"
import { UpdateTreeHealth } from "@/services/apiServices/userTreesService"

const UserTreesTable = () => {
    const { userTreeData, error } = useUserTreeData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredUserTrees, setFilteredUserTrees] = useState(userTreeData)
    const [openStates, setOpenStates] = useState({})
    const [selectedUserTree, setSelectedUserTree] = useState(null)
    const [openUpdateUserTreeHealth, setOpenUpdateUserTreeHealth] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        if (userTreeData) {
            setFilteredUserTrees(userTreeData)
        }
    }, [userTreeData])

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        console.log(term)
        setSearchTerm(term)
        if (userTreeData) {
            const filtered = userTreeData.filter(
                (userTree) =>
                    userTree.userTreeId.toString().includes(term) ||
                    userTree.userId.toString().includes(term) ||
                    userTree.userName.toLowerCase().includes(term) ||
                    userTree.name.toString().includes(term) 
            )
            setFilteredUserTrees(filtered)
        }
    }

    const handleUpdateClick = (userTreeId) => {
        setSelectedUserTree(userTreeId)
        setOpenUpdateUserTreeHealth(true)
    }

    const handleUpdateTreeHealth = async () => {
        setIsLoading(true)
        try {
            await UpdateTreeHealth(selectedUserTree)
            toast.success("User tree health updated successfully!")
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.error("Failed to update user tree health:", error)
            toast.error("Update user tree health failed!")
        } finally {
            setIsLoading(false)
        }
    }

    if (!filteredUserTrees) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredUserTrees.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredUserTrees.length / itemsPerPage)

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
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold mb-4 text-gray-100'>Update User Tree Health <p className='text-sm font-light text-gray-500'>(Click for detail)</p></h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search user trees...'
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
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>User Tree ID</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>User ID</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>User Name</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Tree Owner ID</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Tree Name</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Max Level</th>
                            {/* <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Tree Status</th> */}
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Final Tree ID</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Final Tree Name</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Final Tree Rarity</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentItems.map((userTree) => (
                            <Popover key={userTree.userTreeId} open={openStates[userTree.userTreeId]}>
                                <PopoverTrigger asChild >
                                    <div style={{ display: 'contents' }}>
                                        <motion.tr
                                            className='hover:bg-gray-700 rounded-lg transition duration-200 cursor-pointer'
                                            key={userTree.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{userTree.userTreeId}</td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{userTree.userId}</td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{userTree.userName}</td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{userTree.treeOwnerId}</td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{userTree.name}</td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${userTree.isMaxLevel === true ? 'bg-green-200 text-green-800'
                                                            : 'bg-red-200 text-red-800'
                                                        }`}
                                                >
                                                    {userTree.isMaxLevel === true ? 'Max Level' : 'Not Max Level'}
                                                </span>
                                            </td>
                                            {/* <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${userTree.treeStatus === 0 ? 'bg-yellow-200 text-yellow-800'
                                                        : userTree.treeStatus === 1 ? 'bg-green-200 text-green-800'
                                                            : userTree.treeStatus === 2 ? 'bg-gray-200 text-gray-800'
                                                            : 'bg-blue-200 text-blue-800'
                                                    }`}
                                                >
                                                    {userTree.treeStatus === 0 ? 'Seed'
                                                        : userTree.treeStatus === 1 ? 'Growing'
                                                            : userTree.treeStatus === 2 ? 'Withered'
                                                                : 'Max Level'}
                                                </span>
                                            </td> */}
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{userTree.finalTreeId ? userTree.finalTreeId : '...'}</td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{userTree.finalTreeName ? userTree.finalTreeName : '...'}</td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${userTree.finalTreeRarity === "Legendary" ? 'bg-yellow-200 text-yellow-800'
                                                        : userTree.finalTreeRarity === "Epic" ? 'bg-violet-200 text-violet-800'
                                                            : userTree.finalTreeRarity === "Rare" ? 'bg-blue-200 text-blue-800'
                                                                : userTree.finalTreeRarity === "Common" ? 'bg-gray-200 text-gray-800'
                                                                : ''
                                                    }`}
                                                >
                                                    {userTree.finalTreeRarity === "Legendary" ? 'Legendary'
                                                        : userTree.finalTreeRarity === "Epic" ? 'Epic'
                                                            : userTree.finalTreeRarity === "Rare" ? 'Rare'
                                                                : userTree.finalTreeRarity === "Common" ? 'Common'
                                                                    : '...'}
                                                </span>
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <button
                                                    className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'
                                                    onClick={() => handleUpdateClick(userTree.userTreeId)}
                                                >
                                                    Update
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
                                    <p className='text-gray-200 font-semibold'>Tree: {userTree.name}</p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Level ID: </p>
                                        {userTree.levelId}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>XP To Next Level: </p>
                                        {userTree.xpToNextLevel.toFixed(2)}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Total XP: </p>
                                        {userTree.totalXp.toFixed(2)}
                                    </p>

                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Created at: </p>
                                        {new Date(userTree.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        })}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Updated at: </p>
                                        {new Date(userTree.updatedAt).toLocaleDateString('en-US', {
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

            <Dialog open={openUpdateUserTreeHealth} onOpenChange={setOpenUpdateUserTreeHealth}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Update User Tree Health</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        Update the health of a specific tree (based on User Tree ID).
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className='space-y-2 bg-gray-800'>
                                    <div className='space-y-1'>
                                        <Label>Do you want to update this user tree's health?</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleUpdateTreeHealth}
                                        disabled={isLoading}
                                    >
                                        Update
                                    </Button>
                                    <Button
                                        className='bg-red-400 text-white ml-2'
                                        onClick={() => setOpenUpdateUserTreeHealth(false)}
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

export default UserTreesTable