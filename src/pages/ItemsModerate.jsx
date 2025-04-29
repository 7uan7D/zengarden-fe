import { CheckCircle, Package, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CreateItem } from "@/services/apiServices/itemService"
import { toast } from "sonner"

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import useItemData from "@/hooks/useItemData"
import ItemDistribution from "@/components/items/ItemDistribution"
import ItemsModerateTable from "@/components/items/ItemsModerateTable"

const ItemsModerate = () => {
    const { itemData, error } = useItemData()

    const itemStats = {
        commonItems: itemData?.filter((item) => item.rarity === 'Common').length,
        rareItems: itemData?.filter((item) => item.rarity === 'Rare').length,
        epicItems: itemData?.filter((item) => item.rarity === 'Epic').length,
        legendaryItems: itemData?.filter((item) => item.rarity === 'Legendary')
            .length,
    }

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

    const [openCreateItem, setOpenCreateItem] = useState(false)
    const handleCreateItemClick = () => {
        setOpenCreateItem(true)
    }

    const [newItemData, setNewItemData] = useState({
        name: '',
        type: 0,
        rarity: '',
        cost: 0,
        file: null,
        status: 0,
        itemDetail: {
            description: '',
            effect: '',
            duration: 0,
            sold: 0,
            isUnique: false,
            monthlyPurchaseLimit: 0,
        },
    })

    const handleChange = (e) => {
        const { id, value } = e.target
        setNewItemData((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        setNewItemData((prev) => ({
            ...prev,
            file: file,
        }))
    }

    const [isLoading, setIsLoading] = useState(false)
    const handleSaveChanges = async () => {
        console.log('Saving changes with data: ', newItemData)

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', newItemData.name)
            formData.append('type', newItemData.type)
            formData.append('rarity', newItemData.rarity)
            formData.append('cost', newItemData.cost)
            if (newItemData.file) {
                formData.append('file', newItemData.file)
            }
            formData.append('itemDetail[description]', newItemData.itemDetail.description)
            formData.append('itemDetail[effect]', newItemData.itemDetail.effect)
            formData.append('itemDetail[duration]', newItemData.itemDetail.duration)
            formData.append('itemDetail[sold]', newItemData.itemDetail.sold)
            formData.append('itemDetail[isUnique]', newItemData.itemDetail.isUnique)
            formData.append(
                'itemDetail[monthlyPurchaseLimit]',
                newItemData.itemDetail.monthlyPurchaseLimit
            )
            for (const key of formData.entries()) {
                console.log(key[0] + ', ' + key[1])
            }

            await CreateItem(newItemData)

            toast.success('Item created successfully!')

            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.error('Error creating item:', error)
            toast.error('Failed to create item. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div></div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <div className='flex-1 relative z-10 overflow-auto'>
            <AdminHeader title={'Items Moderate'} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Common Items' icon={Package} value={itemStats.commonItems} color='#FFFFFF' />
                    <StatCard name='Rare Items' icon={Package} value={itemStats.rareItems} color='#3B82F6' />
                    <StatCard name='Epic Items' icon={Package} value={itemStats.epicItems} color='#8884D8' />
                    <StatCard name='Legendary Items' icon={Package} value={itemStats.legendaryItems} color='#FED766' />
                </motion.div>

                <div className='flex justify-between items-center mb-4'>
                    <p />
                    <Button
                        className='bg-teal-700 text-gray hover:bg-teal-900'
                        onClick={handleCreateItemClick}
                    >
                        <Plus className='h-4 w-4' />
                        Create Item
                    </Button>
                </div>

                <ItemsModerateTable />

                <div className='grid grid-cols-1 lg:grid-cols-1 gap-8'>
                    <ItemDistribution />
                </div>

                <Dialog open={openCreateItem} onOpenChange={setOpenCreateItem}>
                    <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                        <DialogHeader>
                            <DialogTitle>Create New Item</DialogTitle>
                        </DialogHeader>

                        <Tabs className='w-[462px]'>
                            <TabsContent className=''>
                                <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='name'>Item Name:</Label>
                                        <Input
                                            id='name'
                                            value={newItemData.name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='type'>Type:</Label>
                                        <select
                                            id='type'
                                            value={newItemData.type}
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

                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='rarity'>Rarity:</Label>
                                        <select
                                            id='rarity'
                                            value={newItemData.rarity}
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

                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='cost'>Cost (coins):</Label>
                                        <Input
                                            id='cost'
                                            type='number'
                                            value={newItemData.cost}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='file'>File:</Label>
                                        <Input
                                            id='file'
                                            type='file'
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='status'>Status:</Label>
                                        <select
                                            id='status'
                                            value={newItemData.status}
                                            onChange={handleChange}
                                            className='w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-sm'
                                        >
                                            <option value={0}>Active</option>
                                            <option value={1}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <DialogHeader className='mt-5 mb-1'>
                                    <DialogTitle>Enter Item's Detail:</DialogTitle>
                                </DialogHeader>
                                <div className='space-y-1 mb-3'>
                                    <Label htmlFor='description'>Description:</Label>
                                    <Input
                                        id='description'
                                        value={newItemData.itemDetail.description}
                                        onChange={(e) =>
                                            setNewItemData((prev) => ({
                                                ...prev,
                                                itemDetail: {
                                                    ...prev.itemDetail,
                                                    description: e.target.value,
                                                },
                                            }))
                                        }
                                    />
                                </div>
                                <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='effect'>Effect:</Label>
                                        <Input
                                            id='effect'
                                            value={newItemData.itemDetail.effect}
                                            onChange={(e) =>
                                                setNewItemData((prev) => ({
                                                    ...prev,
                                                    itemDetail: {
                                                        ...prev.itemDetail,
                                                        effect: e.target.value,
                                                    },
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='duration'>Duration:</Label>
                                        <Input
                                            id='duration'
                                            type='number'
                                            value={newItemData.itemDetail.duration}
                                            onChange={(e) =>
                                                setNewItemData((prev) => ({
                                                    ...prev,
                                                    itemDetail: {
                                                        ...prev.itemDetail,
                                                        duration: e.target.value,
                                                    },
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className='flex items-center space-x-2 mb-3'>
                                        <Label htmlFor='isUnique'>Is Unique:</Label>
                                        <Input
                                            id='isUnique'
                                            type='checkbox'
                                            checked={newItemData.itemDetail.isUnique}
                                            onChange={(e) =>
                                                setNewItemData((prev) => ({
                                                    ...prev,
                                                    itemDetail: {
                                                        ...prev.itemDetail,
                                                        isUnique: e.target.checked,
                                                    },
                                                }))
                                            }
                                            className='w-4 h-4'
                                        />
                                    </div>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='monthlyPurchaseLimit'>
                                            Monthly Purchase Limit:
                                        </Label>
                                        <Input
                                            id='monthlyPurchaseLimit'
                                            type='number'
                                            value={newItemData.itemDetail.monthlyPurchaseLimit}
                                            onChange={(e) =>
                                                setNewItemData((prev) => ({
                                                    ...prev,
                                                    itemDetail: {
                                                        ...prev.itemDetail,
                                                        monthlyPurchaseLimit: e.target.value,
                                                    },
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <Button
                                    className='bg-[#83aa6c] text-white'
                                    onClick={handleSaveChanges}
                                    disabled={isLoading}
                                >
                                    Save Changes
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}

export default ItemsModerate