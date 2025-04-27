import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Edit, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import usePackagesData from "@/hooks/usePackageData"

const PackagesTable = () => {
    const { packageData, isLoading, error } = usePackagesData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredPackages, setFilteredPackages] = useState(packageData)
    const [openStates, setOpenStates] = useState({})

    useEffect(() => {
        if (packageData) {
            setFilteredPackages(packageData)
        }
    }, [packageData])

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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Created At</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Updated At</th>
                            {/* <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th> */}
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
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{package_.price}</td>
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
                                                {new Date(package_.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    second: 'numeric',
                                                })}
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                {new Date(package_.updatedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    second: 'numeric',
                                                })}
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
        </motion.div>
    )
}

export default PackagesTable