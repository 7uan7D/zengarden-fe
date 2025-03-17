import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { GetAllUsers, GetUserInfo } from "@/services/apiServices/userService"

const UsersTable = () => {
    const [userData, setUserData] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredUsers, setFilteredUsers] = useState(null)

    useEffect(() => {
        GetAllUsers()
            .then((data) => {
                setUserData(data)
                setFilteredUsers(data)
            })
            .catch((error) => console.error("Failed to load users:", error))
    }, [])

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
        return <div>Loading...</div>;
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
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 text-left whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                            <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                                                {user.userName.charAt(0)}
                                            </div>
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
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 1
                                            ? 'bg-green-800 text-green-100' ? user.role === 2 : 'bg-blue-800 text-blue-100'
                                            : 'bg-yellow-800 text-yellow-100'
                                            }`}
                                    >
                                        {user.role === 1 ? 'Admin' : user.role === 2 ? 'Player' : 'Moderator'}
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
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'>Edit</button>
                                    <button className='text-red-400 hover:text-red-300 bg-transparent'>Delete</button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

export default UsersTable