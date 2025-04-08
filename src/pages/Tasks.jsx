import { CalendarCheck, CheckCircle, CircleEllipsis, Clock } from "lucide-react"
import { motion } from "framer-motion"

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import DailyOrders from "@/components/tasks/DailyOrders"
import TaskDistribution from "@/components/tasks/TaskDistribution"
import TasksTable from "@/components/tasks/TasksTable"
import useTaskData from "@/hooks/useTaskData"

const TasksPage = () => {
    const { taskData, isLoading, error } = useTaskData()

    const taskStats = {
        totalTasks: taskData?.length,
        notStartedTasks: taskData?.filter((task) => task.status === 0).length,
        pendingTasks: taskData?.filter((task) => task.status === 2).length,
        completedTasks: taskData?.filter((task) => task.status === 3).length,
    }

    if (isLoading) {
        return <div></div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <div className='flex-1 relative z-10 overflow-auto'>
            <AdminHeader title={'Tasks'} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Tasks' icon={CalendarCheck} value={taskStats.totalTasks} color='#6366F1' />
                    <StatCard name='Not Started Tasks' icon={CircleEllipsis} value={taskStats.notStartedTasks} color='#FFFFFF' />
                    <StatCard name='Paused Tasks' icon={Clock} value={taskStats.pendingTasks} color='#F59E0B' />
                    <StatCard name='Completed Tasks' icon={CheckCircle} value={taskStats.completedTasks} color='#10B981' />
                </motion.div>

                <TasksTable />


                <div className='grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8'>
                    <TaskDistribution />
                </div> 

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'>
                    {/* <DailyOrders /> */}
                    {/* <TaskDistribution /> */}
                </div> 
            </main>
        </div>
    )
}

export default TasksPage