import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { DeleteUser, GetAllUsers, GetUserInfo, UpdateUserInfo } from "@/services/apiServices/userService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button"
import { toast } from "sonner"
import useUserData from "@/hooks/useUserData"

const UsersTable = () => {
    const { userData, isLoadingState, error } = useUserData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredUsers, setFilteredUsers] = useState(userData)
    const [openEditUser, setOpenEditUser] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [openDeleteUser, setOpenDeleteUser] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (userData) {
            setFilteredUsers(userData)
        }
    }, [userData])

    const [editUser, setEditUser] = useState({
        userName: '',
        email: '',
        phone: '',
    })

    useEffect(() => {
        if (selectedUserId) {
            setIsLoading(true)
            GetUserInfo(selectedUserId)
                .then((data) => setEditUser({
                    userName: data.userName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                }))
                .catch((error) => console.error('Failed to load user info:', error))
                .finally(() => setIsLoading(false))
        }
    }, [selectedUserId])

    const handleChange = (e) => {
        const { id, value } = e.target
        setEditUser((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        if (userData) {
            const filtered = userData.filter(
                (user) =>
                    user.userName.toLowerCase().includes(term) ||
                    user.email.toLowerCase().includes(term)
            )
            setFilteredUsers(filtered)
        }
    }
    
    if (!filteredUsers) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    const handleEditClick = (userId) => {
        setSelectedUserId(userId)
        setOpenEditUser(true)
    }

    const handleSaveChanges = async () => {
        if (selectedUserId) {
            setIsLoading(true)
            try {
                await UpdateUserInfo({
                    userId: selectedUserId,
                    ...editUser,
                })
                toast.success('The information has been updated successfully!')

                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } catch (error) {
                console.log('Failed to update user:', error)
                toast.error('Update information failed!')
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleDeleteClick = (userId) => {
        setSelectedUserId(userId)
        setOpenDeleteUser(true)
    }

    const handleDeleteUser = async () => {
        if (selectedUserId) {
            setIsLoading(true)
            try {
                await DeleteUser(selectedUserId)
                toast.success('User has been deleted successfully!')
                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } catch (error) {
                console.log('Failed to delete user:', error)
                toast.error('Delete user failed!')
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
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Users</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search users...'
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
                            <th className='px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                User ID
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                User Name
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Email
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Role
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Phone
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Status
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredUsers.map((user) => (
                            <motion.tr
                                className='hover:bg-gray-700 rounded-lg transition duration-200'
                                key={user.userId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-2 py-4 text-left whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{user.userId}</div>
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                            <Avatar className='cursor-pointer'>
                                                <AvatarImage
                                                    src={user?.imageUrl || 'https://github.com/shadcn.png'}
                                                    alt='User Avatar'
                                                />
                                                <AvatarFallback>
                                                    {user?.userName
                                                        ? user.userName.charAt(0).toUpperCase()
                                                        : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            {/* <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                                                {user.userName.charAt(0)}
                                            </div> */}
                                        </div>
                                        <div className='ml-4'>
                                            <div className='text-sm font-medium text-gray-100'>{user.userName}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className='px-6 py-4 text-left whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{user.email}</div>
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap'>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.roleId === 1
                                        ? 'bg-green-800 text-green-100' : user.roleId === 2 ? 'bg-blue-800 text-blue-100'
                                        : 'bg-yellow-800 text-yellow-100'
                                        }`}
                                    >
                                        {user.roleId === 1 ? 'Admin' : user.roleId === 2 ? 'Player' : 'Moderator'}
                                    </span>
                                </td>
                                <td className='px-6 py-4 text-left whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{user.phone}</div>
                                </td>

                                <td className='px-6 py-4 text-left whitespace-nowrap'>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 0
                                            ? 'bg-green-800 text-green-100'
                                            : 'bg-red-800 text-red-100'
                                            }`}
                                    >
                                        {user.status === 0 ? 'Active' : 'Inactive'}
                                    </span>
                                </td>

                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                    <button onClick={() => handleEditClick(user.userId)} className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'>Edit</button>
                                    <button onClick={() => handleDeleteClick(user.userId)} className='text-red-400 hover:text-red-300 bg-transparent'>Delete</button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={openEditUser} onOpenChange={setOpenEditUser}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        View and update your user details here.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className='space-y-2 bg-gray-800'>
                                    {editUser ? (
                                        <>
                                            <div className='space-y-2'>
                                                <div className='space-y-1'>
                                                    <Label htmlFor='userName'>Username</Label>
                                                    <Input
                                                        id='userName'
                                                        value={editUser.userName}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className='space-y-1'>
                                                    <Label htmlFor='email'>Email</Label>
                                                    <Input
                                                        id='email'
                                                        value={editUser.email}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className='space-y-1'>
                                                    <Label htmlFor='phone'>Phone</Label>
                                                    <Input
                                                        id='phone'
                                                        value={editUser.phone}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                {/* <div className='space-y-1'>
                                                    <Label>Wallet</Label>
                                                    {user?.wallet?.length > 0 ? (
                                                        <ul className='list-disc list-inside text-sm text-gray-700'>
                                                            {user.wallet.map((wallet, index) => (
                                                                <li key={index}>{wallet}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className='text-sm text-gray-500'>
                                                            No wallets available
                                                        </p>
                                                    )}
                                                </div> */}
                                            </div>
                                        </>
                                    ) : (
                                        <p className='text-sm text-gray-500'>Loading user...</p>
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
            
            <Dialog open={openDeleteUser} onOpenChange={setOpenDeleteUser}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        Delete your selected user.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-2 bg-gray-800'>
                                    <div className='space-y-1'>
                                        <Label>Are you sure you want to delete this user?</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleDeleteUser}
                                        disabled={isLoading}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        className='bg-red-400 text-white ml-2'
                                        onClick={() => setOpenDeleteUser(false)}
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

export default UsersTable