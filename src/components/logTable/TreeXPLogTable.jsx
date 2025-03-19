import { GetAllTreeXPLogs, UpdateTreeXPLog } from "@/services/apiServices/treeXPLogService"
import { motion } from "framer-motion"
import { Search, Edit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button"
import { toast } from "sonner"

const TreeXPLogTable = () => {
    const [treeXPLogData, setTreeXPLogData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredLogs, setFilteredLogs] = useState(treeXPLogData)
    const [openEditLog, setOpenEditLog] = useState(false)
    const [selectedLogId, setSelectedLogId] = useState(null)
    const [openDeleteLog, setOpenDeleteLog] = useState(false)
    const [editLog, setEditLog] = useState({
        logId: '',
        taskId: '',
        activityType: '',
        xpAmount: '',
        tasks: '',
    })

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllTreeXPLogs()
                setTreeXPLogData(data)
                console.log(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if(treeXPLogData) {
            setFilteredLogs(treeXPLogData)
        }
    }, [treeXPLogData])

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase()
        setSearchTerm(term)
        const filtered = treeXPLogData.filter((item) => item.logId.toLowerCase().includes(term) || item.taskId.toLowerCase().includes(term))
        setFilteredLogs(filtered)
    }

    if (!filteredLogs) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }
    
    const handleChange = (e) => {
        const { id, value } = e.target
        setEditLog((prev) => ({
            ...prev,
            [id]: value,
        }))

        console.log(editLog)
    }

    const handleEditClick = (logId) => {
        setSelectedLogId(logId)
        setOpenEditLog(true)
    }

    const handleSaveChanges = async () => {
        if (selectedLogId) {
            setIsLoading(true)
            try {
                await UpdateTreeXPLog(selectedLogId, editLog)
                toast.success('The information has been updated successfully!')

                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            } catch (error) {
                console.log('Failed to update log:', error)
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Log Id</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Task Id</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Activity Type</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>XP Amount</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Created At</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Updated At</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Tasks</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredLogs.map((item) => (
                            <motion.tr
                                key={item.logId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                    {/* <img
                                        src={`https://banner2.cleanpng.com/20231230/xkg/transparent-cartoon-task-management-to-do-list-productivity-or-yellow-paper-with-task-list-and-1710949246698.webp`}
                                        alt={item.logId}
                                        className='size-10 rounded-full' 
                                    /> */}
                                    {item.logId}
                                </td>

                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.taskId}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.activityType}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.xpAmount} XP</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{new Date(item.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric',
                                })}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{new Date(item.updatedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric',
                                })}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>{item.tasks}</td>
                                <td className='px-6 py-4 text-left whitespace-nowrap text-sm text-gray-300'>
                                    <button onClick={() => handleEditClick(item.logId)} className='text-indigo-400 hover:text-indigo-300 mr-2 bg-transparent'>
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

export default TreeXPLogTable