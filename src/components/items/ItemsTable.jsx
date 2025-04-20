import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Edit, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import useItemData from "@/hooks/useItemData"

const ItemsTable = () => {
    const { itemData, isLoading, error } = useItemData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredItems, setFilteredItems] = useState(itemData)
    const [openStates, setOpenStates] = useState({})

    useEffect(() => {
        if (itemData) {
            setFilteredItems(itemData)
        }
    }, [itemData])

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        if (itemData) {
            const filtered = itemData.filter(
                (item) =>
                    item.itemId.toString().includes(term) ||
                    item.name.toLowerCase().includes(term) ||
                    item.rarity.toLowerCase().includes(term)
            )
            setFilteredItems(filtered)
        }
    }

    if (!filteredItems) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Item ID</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Type</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Rarity</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Image</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Cost</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Unique</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Sold Quantity</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Monthly Purchase Limit</th>
                            {/* <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th> */}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredItems.map((item) => (
                            <Popover key={item.itemId} open={openStates[item.itemId]}>
                                <PopoverTrigger asChild >
                                    <div style={{ display: 'contents' }}>
                                        <motion.tr
                                            className='hover:bg-gray-700 rounded-lg transition duration-200 cursor-pointer'
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {item.itemId}
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {item.name}
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.type}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${item.rarity === "Legendary" ? 'bg-yellow-200 text-yellow-800'
                                                        : item.rarity === "Epic" ? 'bg-violet-200 text-violet-800'
                                                            : item.rarity === "Rare" ? 'bg-blue-200 text-blue-800'
                                                                : 'bg-gray-200 text-gray-800'
                                                    }`}
                                                >
                                                    {item.rarity === "Legendary" ? 'Legendary'
                                                        : item.rarity === "Epic" ? 'Epic'
                                                            : item.rarity === "Rare" ? 'Rare'
                                                                : 'Common'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <img
                                                    src={item.itemDetail.mediaUrl}
                                                    alt={item.name}
                                                    className='w-14 h-14 rounded-full'
                                                />
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.cost} coins</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${item.itemDetail.isUnique === true ? 'bg-green-200 text-green-800'
                                                        : 'bg-red-200 text-red-800'
                                                    }`}
                                                >
                                                    {item.itemDetail.isUnique === true ? 'Unique' : 'Not Unique'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                {item.itemDetail.sold}
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                {item.itemDetail.monthlyPurchaseLimit === null ? 'No limit' : item.itemDetail.monthlyPurchaseLimit }
                                            </td>
                                            {/* <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <button className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'>
                                                    <Edit size={18} />
                                                </button>
                                                <button className='text-red-400 hover:text-red-300 bg-transparent'>
                                                    <Trash2 size={18} />
                                                </button>
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
                                    <p className='text-gray-200 font-semibold'>{item.name}</p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        {item.itemDetail.description}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Created at: </p>
                                        {new Date(item.updatedAt).toLocaleDateString('en-US', {
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
                                        {new Date(item.updatedAt).toLocaleDateString('en-US', {
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

export default ItemsTable