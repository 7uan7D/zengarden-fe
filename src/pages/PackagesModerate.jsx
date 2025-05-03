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
import { CreatePackage } from "@/services/apiServices/packageService"
import { toast } from "sonner"

import AdminHeader from "@/components/common/AdminHeader"
import PackagesModerateTable from "@/components/package/PackagesModerateTable"

const PackagesModerate = () => {
    const [openCreatePackage, setOpenCreatePackage] = useState(false)
    const handleCreatePackageClick = () => {
        setOpenCreatePackage(true)
    }

    const [newPackageData, setNewPackageData] = useState({
        name: '',
        price: 0,
        amount: 0,
        isActive: false,
    })

    const handleChange = (e) => {
        const { id, value } = e.target
        setNewPackageData((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const [isLoading, setIsLoading] = useState(false)
    const handleSaveChanges = async () => {
        console.log('Saving changes with data: ', newPackageData)
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', newPackageData.name)
            formData.append('price', newPackageData.price)
            formData.append('amount', newPackageData.amount)
            formData.append('isActive', newPackageData.isActive)
            
            for (const key of formData.entries()) {
                console.log(key[0] + ', ' + key[1])
            }

            await CreatePackage(newPackageData)

            toast.success('Package created successfully!')

            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.error('Error creating package:', error)
            toast.error('Failed to create package. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div></div>
    }

    return (
        <div className='flex-1 relative z-10 overflow-auto'>
            <AdminHeader title={'Packages Moderate'} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <div className='flex justify-between items-center mb-4'>
                    <p />
                    <Button
                        className='bg-teal-700 text-gray hover:bg-teal-900'
                        onClick={handleCreatePackageClick}
                    >
                        <Plus className='h-4 w-4' />
                        Create Package
                    </Button>
                </div>

                <PackagesModerateTable />

                <Dialog open={openCreatePackage} onOpenChange={setOpenCreatePackage}>
                    <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                        <DialogHeader>
                            <DialogTitle>Create New Package</DialogTitle>
                        </DialogHeader>

                        <Tabs className='w-[462px]'>
                            <TabsContent className=''>
                                <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='name'>Package Name:</Label>
                                        <Input
                                            id='name'
                                            value={newPackageData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='price'>Price:</Label>
                                        <Input
                                            id='price'
                                            type='number'
                                            value={newPackageData.price}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='amount'>Amount:</Label>
                                        <Input
                                            id='amount'
                                            type='number'
                                            value={newPackageData.amount}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className='space-y-1 mb-3'>
                                        <Label htmlFor='isActive'>Status:</Label>
                                        <select
                                            id='isActive'
                                            value={newPackageData.isActive}
                                            onChange={handleChange}
                                            className='w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-sm'
                                        >
                                            <option value={true}>Active</option>
                                            <option value={false}>Inactive</option>
                                        </select>
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

export default PackagesModerate