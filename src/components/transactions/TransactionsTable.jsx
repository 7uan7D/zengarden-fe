import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Edit, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import useTransactionData from "@/hooks/useTransactionData"
import useUserData from "@/hooks/useUserData"

const TransactionsTable = () => {
    const { transactionData, isLoading, error } = useTransactionData()
    const { userData } = useUserData()
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredTransactions, setFilteredTransactions] = useState(transactionData)
    const [openStates, setOpenStates] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    useEffect(() => {
        if (transactionData) {
            setFilteredTransactions(transactionData)
        }
    }, [transactionData])

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        if (transactionData) {
            const filtered = transactionData.filter(
                (transaction) =>
                    transaction.transactionId.toString().includes(term) ||
                    transaction.userId.toString().includes(term) ||
                    userData?.find((user) => user.userId === transaction.userId)?.userName?.toLowerCase().includes(term)
            )
            setFilteredTransactions(filtered)
        }
    }

    if (!filteredTransactions) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

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
                <h2 className='text-xl font-semibold mb-4 text-gray-100'>Transaction List <p className='text-sm font-light text-gray-500'>(Click for detail)</p></h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search transactions...'
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Transaction ID</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>User ID</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>User Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Wallet ID</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Package ID</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Amount</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Type</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Status</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Payment Method</th>
                            {/* <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th> */}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentItems.map((transaction) => (
                            <Popover key={transaction.transactionId} open={openStates[transaction.transactionId]}>
                                <PopoverTrigger asChild >
                                    <div style={{ display: 'contents' }}>
                                        <motion.tr
                                            className='hover:bg-gray-700 rounded-lg transition duration-200 cursor-pointer'
                                            key={transaction.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{transaction.transactionId}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{transaction.userId}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>
                                                {userData && userData.find((user) => user.userId === transaction.userId)?.userName}
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{transaction.walletId}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{transaction.packageId}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>${transaction.amount}</td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{transaction.type}</td>
                                            <td className='px-2 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${transaction.status === 1 ? 'bg-gray-200 text-gray-800'
                                                        : transaction.status === 2 ? 'bg-green-200 text-green-800'
                                                            : 'bg-red-200 text-red-800'
                                                    }`}
                                                >
                                                    {transaction.status === 1 ? 'Pending'
                                                        : transaction.status === 2 ? 'Success'
                                                            : 'Cancelled'}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-100'>{transaction.paymentMethod}</td>
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
                                    <p className='text-gray-200 font-semibold'>Transaction ID: {transaction.transactionId}</p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Transaction Ref: </p>
                                        {transaction.transactionRef}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Transaction Time: </p>
                                        {new Date(transaction.transactionTime).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                        })}
                                    </p>
                                    <p className='text-gray-400 text-left text-sm'>
                                        <p className='text-gray-200 text-sm font-bold mr-1'>Created at: </p>
                                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
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
                                        {new Date(transaction.updatedAt).toLocaleDateString('en-US', {
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
        </motion.div>
    )
}

export default TransactionsTable