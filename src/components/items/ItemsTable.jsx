import { motion } from "framer-motion"
import { Search, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

const itemsData = [
    { id: 1, name: 'Item 1', type: 'Type 1', rarity: 2 , cost: 59, limited: 'Limited' },
    { id: 2, name: 'Item 2', type: 'Type 2', rarity: 1, cost: 39, limited: 'Unlimited' },
    { id: 3, name: 'Item 3', type: 'Type 3', rarity: 3, cost: 19, limited: 'Limited' },
    { id: 4, name: 'Item 4', type: 'Type 4', rarity: 3, cost: 29, limited: 'Limited' },
    { id: 5, name: 'Item 5', type: 'Type 5', rarity: 1, cost: 79, limited: 'Unlimited' },
]

const ItemsTable = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredItems, setFilteredItems] = useState(itemsData)

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = itemsData.filter((item) => item.name.toLowerCase().includes(term) || item.type.toLowerCase().includes(term));
        setFilteredItems(filtered);
    }

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold mb-4 text-gray-100'>Item List</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search items...'
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Type</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Rarity</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Cost</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Limited</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredItems.map((item) => (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'>
                                    <img
                                        src={`https://banner2.cleanpng.com/20231230/xkg/transparent-cartoon-task-management-to-do-list-productivity-or-yellow-paper-with-task-list-and-1710949246698.webp`}
                                        alt={item.name}
                                        className='size-10 rounded-full' 
                                    />
                                    {item.name}
                                </td>

                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.type}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.rarity}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.cost} coins</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.limited}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'>
                                        <Edit size={18} />
                                    </button>
                                    <button className='text-red-400 hover:text-red-300 bg-transparent'>
                                        <Trash2 size={18} />
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

export default ItemsTable