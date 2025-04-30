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
import usePackagesData from "@/hooks/usePackageData"
import { DeletePackageById, GetPackageById, UpdatePackageById } from "@/services/apiServices/packageService"

const PackagesModerateTable = () => {
    const { packageData, error } = usePackagesData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredPackages, setFilteredPackages] = useState(packageData)
    const [selectedPackageId, setSelectedPackageId] = useState(null)
    const [openEditPackage, setOpenEditPackage] = useState(false)
    const [openDeletePackage, setOpenDeletePackage] = useState(false)
    const [openStates, setOpenStates] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (packageData) {
            setFilteredPackages(packageData)
        }
    }, [packageData])

    const [editPackage, setEditPackage] = useState({
        packageId: 0,
        name: '',
        price: 0,
        amount: 0,
        isActive: false,
    })

    useEffect(() => {
        if (selectedPackageId) {
            setIsLoading(true)
            GetPackageById(selectedPackageId)
                .then((data) => setEditPackage({
                    packageId: 0,
                    name: data.name || '',
                    price: data.price || 0,
                    amount: data.amount || 0,
                    isActive: data.isActive || false,
                }))
                .catch((error) => console.error('Failed to load package info:', error))
                .finally(() => setIsLoading(false))
        }
    }, [selectedPackageId])

    const handleChange = (e) => {
        const { id, value } = e.target;
        let processedValue = value;

        if (id === 'packageId' || id === 'price' || id === 'amount') {
            const parsedValue = parseInt(value, 10);
            if (!isNaN(parsedValue)) {
                processedValue = parsedValue;
            } else {
                processedValue = 0;
                console.warn(`Invalid number entered for ${id}: ${value}`);
            }
        } else if (id === 'isActive') {
            const parsedValue = value === 'true' ? true : false;
            processedValue = parsedValue;
        }

        setEditPackage((prev) => ({
            ...prev,
            [id]: processedValue,
        }));

        console.log('Edit package state:', {
            ...editPackage,
            [id]: processedValue,
        });
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        if (packageData) {
            const filtered = packageData.filter(
                (package_) =>
                    package_.packageId.toString().includes(term) ||
                    package_.name.toLowerCase().includes(term)
            )
            setFilteredPackages(filtered)
        }
    }

    if (!filteredPackages) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    const handleDeleteClick = (packageId) => {
        setSelectedPackageId(packageId)
        setOpenDeletePackage(true)
    }

    const handleDeletePackage = async () => {
        setIsLoading(true)
        try {
            await DeletePackageById(selectedPackageId)
            toast.success('Package deleted successfully!')
            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.log('Failed to delete package:', error)
            toast.error('Delete package failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditClick = (packageId) => {
        setSelectedPackageId(packageId)
        setOpenEditPackage(true)
    }

    const handleSaveChanges = async () => {
        if (selectedPackageId) {
            console.log('Saving changes for package:', editPackage)
            setIsLoading(true)
            try {
                await UpdatePackageById(selectedPackageId, editPackage)
                toast.success('The information has been updated successfully!')

                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } catch (error) {
                console.log('Failed to update package:', error)
                toast.error('Update information failed!')
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold mb-4 text-gray-100'>Package List <p className='text-sm font-light text-gray-500'>(Click for detail)</p></h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search packages...'
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Package ID</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Price</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Amount</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Status</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredPackages.map((package_) => (
                            <Popover key={package_.packageId} open={openStates[package_.packageId]}>
                                <PopoverTrigger asChild >
                                    <div style={{ display: 'contents' }}>
                                        <motion.tr
                                            className='hover:bg-gray-700 rounded-lg transition duration-200 cursor-pointer'
                                            key={package_.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{package_.packageId}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{package_.name}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>${package_.price}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{package_.amount}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${package_.isActive === true
                                                        ? 'bg-green-800 text-green-100'
                                                        : 'bg-red-800 text-red-100'
                                                        }`}
                                                >
                                                    {package_.isActive === true ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <button
                                                    className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'
                                                    onClick={() => handleEditClick(package_.packageId)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className='text-red-400 hover:text-red-300 bg-transparent'
                                                    onClick={() => handleDeleteClick(package_.packageId)}
                                                >
                                                    Delete
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
                                    <p className='text-gray-200 font-semibold'>{package_.name}</p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Created at: </p>
                                        {new Date(package_.createdAt).toLocaleDateString('en-US', {
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
                                        {new Date(package_.updatedAt).toLocaleDateString('en-US', {
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

            <Dialog open={openDeletePackage} onOpenChange={setOpenDeletePackage}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Delete Package</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        Delete this package.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-2 bg-gray-800'>
                                    <div className='space-y-1'>
                                        <Label>Do you want to delete this package?</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className='bg-[#83aa6c] text-white'
                                        onClick={handleDeletePackage}
                                        disabled={isLoading}
                                    >
                                        Delete Package
                                    </Button>
                                    <Button
                                        className='bg-red-400 text-white ml-2'
                                        onClick={() => setOpenDeletePackage(false)}
                                    >
                                        Exit
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={openEditPackage} onOpenChange={setOpenEditPackage}>
                <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                    <DialogHeader>
                        <DialogTitle>Edit Package</DialogTitle>
                    </DialogHeader>

                    <Tabs className='w-[462px]'>
                        <TabsContent className='p-4'>
                            <Card className='bg-gray-800 text-white'>
                                <CardHeader>
                                    <CardDescription className='text-gray-400'>
                                        View and update your package details here.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className='space-y-2 bg-gray-800'>
                                    {editPackage ? (
                                        <>
                                            <div className='space-y-1'>
                                                <Label htmlFor='name'>Package Name</Label>
                                                <Input
                                                    id='name'
                                                    value={editPackage.name}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='price'>Price</Label>
                                                <Input
                                                    id='price'
                                                    type='number'
                                                    value={editPackage.price}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='amount'>Amount</Label>
                                                <Input
                                                    id='amount'
                                                    type='number'
                                                    value={editPackage.amount}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label htmlFor='isActive'>Status</Label>
                                                <select
                                                    id='isActive'
                                                    value={editPackage.isActive}
                                                    onChange={handleChange}
                                                    className='w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-sm'
                                                >
                                                    <option value={true}>Active</option>
                                                    <option value={false}>Inactive</option>
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

export default PackagesModerateTable