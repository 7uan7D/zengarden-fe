import { motion } from "framer-motion"
import { Search, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

const userXPLogData = [
    { id: 1, userId: 1, activityType: 2, XPAmount: 59, createdAt: 'Apr 9, 2025, 8:32:50 AM', updatedAt: 'Apr 9, 2025, 8:32:50 AM'  },
    { id: 2, userId: 2, activityType: 1, XPAmount: 39, createdAt: 'Apr 9, 2025, 8:32:50 AM', updatedAt: 'Apr 9, 2025, 8:32:50 AM' },
    { id: 3, userId: 3, activityType: 3, XPAmount: 19, createdAt: 'Apr 9, 2025, 8:32:50 AM', updatedAt: 'Apr 9, 2025, 8:32:50 AM' },
    { id: 4, userId: 4, activityType: 3, XPAmount: 29, createdAt: 'Apr 9, 2025, 8:32:50 AM', updatedAt: 'Apr 9, 2025, 8:32:50 AM' },
    { id: 5, userId: 5, activityType: 1, XPAmount: 79, createdAt: 'Apr 9, 2025, 8:32:50 AM', updatedAt: 'Apr 9, 2025, 8:32:50 AM' },
]

const UserXPLogTable = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredLogs, setFilteredLogs] = useState(userXPLogData)

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = userXPLogData.filter((item) => item.userId.toLowerCase().includes(term));
        setFilteredLogs(filtered);
    }

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold mb-4 text-gray-100'>Logs List</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search logs...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>User Id</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Activity Type</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>XP Amount</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Created At</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Updated At</th>
                            {/* <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th> */}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredLogs.map((item) => (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'>
                                    {/* <img
                                        src={`https://banner2.cleanpng.com/20231230/xkg/transparent-cartoon-task-management-to-do-list-productivity-or-yellow-paper-with-task-list-and-1710949246698.webp`}
                                        alt={item.userId}
                                        className='size-10 rounded-full' 
                                    /> */}
                                    {item.userId}
                                </td>

                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.activityType}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.XPAmount} XP</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.createdAt}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.updatedAt}</td>
                                {/* <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'>
                                        <Edit size={18} />
                                    </button>
                                    <button className='text-red-400 hover:text-red-300 bg-transparent'>
                                        <Trash2 size={18} />
                                    </button>
                                </td> */}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

export default UserXPLogTable