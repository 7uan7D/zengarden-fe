import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Edit, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import useItemData from "@/hooks/useItemData"
import { ActivateItemById, DeactivateItemById, GetItemById, UpdateItemById } from "@/services/apiServices/itemService"

const ItemsModerateTable = () => {
    const { itemData, error } = useItemData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredItems, setFilteredItems] = useState(itemData)
    const [selectedItemId, setSelectedItemId] = useState(null)
    const [openActivateItem, setOpenActivateItem] = useState(false)
    const [openDeactivateItem, setOpenDeactivateItem] = useState(false)
    const [openEditItem, setOpenEditItem] = useState(false)
    const [openStates, setOpenStates] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const itemTypesData = [
        { type: 0, typeName: 'XP Protect' },
        { type: 1, typeName: 'XP Boost Tree' },
        { type: 2, typeName: 'Avatar' },
        { type: 3, typeName: 'Background' },
        { type: 4, typeName: 'Music' },
    ]

    const itemRaritiesData = [
        { rarity: 'Common', rarityName: 'Common' },
        { rarity: 'Rare', rarityName: 'Rare' },
        { rarity: 'Epic', rarityName: 'Epic' },
        { rarity: 'Legendary', rarityName: 'Legendary' },
    ]
    
    useEffect(() => {
        if (itemData) {
            setFilteredItems(itemData)
        }
    }, [itemData])

    const [editItem, setEditItem] = useState({
        itemId: 0,
        name: '',
        type: 0,
        rarity: '',
        cost: 0,
        status: 0,
    })

    useEffect(() => {
        if (selectedItemId) {
            setIsLoading(true)
            GetItemById(selectedItemId)
                .then((data) => setEditItem({
                    itemId: 0,
                    name: data.name || '',
                    type: data.type || 0,
                    rarity: data.rarity || '',
                    cost: data.cost || 0,
                    status: data.status || 0,
                }))
                .catch((error) => console.error('Failed to load item info:', error))
                .finally(() => setIsLoading(false))
        }
    }, [selectedItemId])

    const handleChange = (e) => {
        const { id, value } = e.target;
        let processedValue = value;

        if (id === 'itemId' || id === 'cost' || id === 'status' || id === 'type') {
            const parsedValue = parseInt(value, 10);
            if (!isNaN(parsedValue)) {
                processedValue = parsedValue;
            } else {
                processedValue = 0;
                console.warn(`Invalid number entered for ${id}: ${value}`);
            }
        }

        setEditItem((prev) => ({
            ...prev,
            [id]: processedValue,
        }));

        console.log('Edit item state:', {
            ...editItem,
            [id]: processedValue,
        }); 
    };

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

    const handleActivateClick = (itemId) => {
        setSelectedItemId(itemId)
        setOpenActivateItem(true)
    }

    const handleActiveItem = async () => {
        setIsLoading(true)
        try {
            await ActivateItemById(selectedItemId)
            toast.success('The item has been activated!')
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.log('Failed to activate item:', error)
            toast.error('Activate item failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeactivateClick = (itemId) => {
        setSelectedItemId(itemId)
        setOpenDeactivateItem(true)
    }

    const handleDeactivateItem = async () => {
        setIsLoading(true)
        try {
            await DeactivateItemById(selectedItemId)
            toast.success('The item has been deactivated!')
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.log('Failed to deactivate item:', error)
            toast.error('Deactivate item failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditClick = (itemId) => {
        setSelectedItemId(itemId)
        setOpenEditItem(true)
    }

    const handleSaveChanges = async () => {
        if (selectedItemId) {
            console.log('Saving changes for item:', editItem)
            setIsLoading(true)
            try {
                await UpdateItemById(selectedItemId, editItem)
                toast.success('The information has been updated successfully!')

                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } catch (error) {
                console.log('Failed to update item:', error)
                toast.error('Update information failed!')
            } finally {
                setIsLoading(false)
            }
        }
    }

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

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
                <h2 className='text-xl font-semibold mb-4 text-gray-100'>Item List <p className='text-sm font-light text-gray-500'>(Click for detail)</p></h2>
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
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Item ID</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Type</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Status</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Rarity</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Image</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Cost</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Unique</th>
                            <th className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentItems.map((item) => (
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
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {item.itemId}
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {item.name}
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span>
                                                    {item.type === 0 ? 'XP Protect'
                                                        : item.type === 1 ? 'XP Boost Tree'
                                                            : item.type === 2 ? 'Avatar'
                                                                : item.type === 3 ? 'Background'
                                                                    : 'Music'}
                                                </span>
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${item.status === 0 ? 'bg-green-200 text-green-800'
                                                        : 'bg-red-200 text-red-800'
                                                    }`}
                                                >
                                                    {item.status === 0 ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${item.rarity === 'Legendary' ? 'bg-yellow-200 text-yellow-800'
                                                        : item.rarity === 'Epic' ? 'bg-violet-200 text-violet-800'
                                                            : item.rarity === 'Rare' ? 'bg-blue-200 text-blue-800'
                                                                : 'bg-gray-200 text-gray-800'
                                                    }`}
                                                >
                                                    {item.rarity === 'Legendary' ? 'Legendary'
                                                        : item.rarity === 'Epic' ? 'Epic'
                                                            : item.rarity === 'Rare' ? 'Rare'
                                                                : 'Common'}
                                                </span>
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <img
                                                    src={item.itemDetail.mediaUrl}
                                                    alt={item.name}
                                                    className='w-14 h-14 rounded-full'
                                                />
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.cost} coins</td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${item.itemDetail.isUnique === true ? 'bg-green-200 text-green-800'
                                                        : 'bg-red-200 text-red-800'
                                                    }`}
                                                >
                                                    {item.itemDetail.isUnique === true ? 'Unique' : 'Not Unique'}
                                                </span>
                                            </td>
                                            <td className='px-3 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <button 
                                                    onClick={() => handleActivateClick(item.itemId)} 
                                                    className={`bg-transparent mr-2 ${item.status === 0 ? 'text-gray-500' : 'text-indigo-400 hover:text-indigo-300'}`}
                                                    disabled={item.status === 0}
                                                >
                                                    Activate
                                                </button>
                                                <button
                                                    onClick={() => handleDeactivateClick(item.itemId)}
                                                    className={`bg-transparent mr-2 ${item.status === 1 ? 'text-gray-500' : 'text-red-400 hover:text-red-300'}`}
                                                    disabled={item.status === 1}
                                                >
                                                    Deactivate
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(item.itemId)}
                                                    className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'
                                                >
                                                    Edit
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
                                    <p className='text-gray-200 font-semibold'>{item.name}</p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        {item.itemDetail.description}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Sold quantity: </p>
                                        {item.itemDetail.sold}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Monthly Purchase Limit: </p>
                                        {item.itemDetail.monthlyPurchaseLimit}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Created at: </p>
                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
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

            <Dialog open={openActivateItem} onOpenChange={setOpenActivateItem}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Activate Item</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        Activate this item.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-2 bg-gray-800'>
                                    <div className='space-y-1'>
                                        <Label>Do you want to activate this item?</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleActiveItem}
                                        disabled={isLoading}
                                    >
                                        Activate Item
                                    </Button>
                                    <Button
                                        className='bg-red-400 text-white ml-2'
                                        onClick={() => setOpenActivateItem(false)}
                                    >
                                        Exit
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={openDeactivateItem} onOpenChange={setOpenDeactivateItem}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Deactivate Item</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        Deactivate this item.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-2 bg-gray-800'>
                                    <div className='space-y-1'>
                                        <Label>Do you want to deactivate this item?</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleDeactivateItem}
                                        disabled={isLoading}
                                    >
                                        Deactivate Item
                                    </Button>
                                    <Button
                                        className='bg-red-400 text-white ml-2'
                                        onClick={() => setOpenDeactivateItem(false)}
                                    >
                                        Exit
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={openEditItem} onOpenChange={setOpenEditItem}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        View and update your item details here.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className='space-y-2 bg-gray-800'>
                                    {editItem ? (
                                        <>
                                            <div className='space-y-1'>
                                                <Label htmlFor='name'>Item Name</Label>
                                                <Input
                                                    id='name'
                                                    value={editItem.name}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='rarity'>Rarity:</Label>
                                                <select
                                                    id='rarity'
                                                    value={editItem.rarity}
                                                    onChange={handleChange}
                                                    className='w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-sm'
                                                >
                                                    {itemRaritiesData.map((rarity) => (
                                                        <option key={rarity.rarity} value={rarity.rarity}>
                                                            {rarity.rarityName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='cost'>Cost (coins)</Label>
                                                <Input
                                                    id='cost'
                                                    value={parseInt(editItem.cost)}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='type'>Type:</Label>
                                                <select
                                                    id='type'
                                                    type='number'
                                                    value={editItem.type}
                                                    onChange={handleChange}
                                                    className='w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-sm'
                                                >
                                                    {itemTypesData.map((type) => (
                                                        <option key={type.type} value={type.type}>
                                                            {type.typeName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='status'>Status</Label>
                                                <select
                                                    id='status'
                                                    type='number'
                                                    value={editItem.status}
                                                    onChange={handleChange}
                                                    className='w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-sm'
                                                >
                                                    <option value={0}>Active</option>
                                                    <option value={1}>Inactive</option>
                                                </select>
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
        </motion.div>
    )
}

export default ItemsModerateTable