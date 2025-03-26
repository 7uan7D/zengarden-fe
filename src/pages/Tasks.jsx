import { CalendarCheck, CheckCircle, Clock, DollarSign } from "lucide-react"
import { motion } from "framer-motion"

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import DailyOrders from "@/components/tasks/DailyOrders"
import OrderDistribution from "@/components/tasks/OrderDistribution"
import TasksTable from "@/components/tasks/TasksTable"

const taskStats = {
    totalTasks: '1,234',
    pendingTasks: '56',
    completedTasks: '1,178',
    totalRevenue: '$98,765',
}

const TasksPage = () => {
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
                    <StatCard name='Pending Tasks' icon={Clock} value={taskStats.pendingTasks} color='#F59E0B' />
                    <StatCard
                        name='Completed Tasks'
                        icon={CheckCircle}
                        value={taskStats.completedTasks}
                        color='#10B981'
                    />
                    <StatCard name='Total Revenue' icon={DollarSign} value={taskStats.totalRevenue} color='#EF4444' />
                </motion.div>

                <TasksTable />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'>
                    {/* <DailyOrders /> */}
                    {/* <OrderDistribution /> */}
                </div> 
            </main>
        </div>
    )
}

export default TasksPage