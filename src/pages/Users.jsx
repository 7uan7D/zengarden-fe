import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react"
import { motion } from "framer-motion"

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import UsersTable from "@/components/users/UsersTable"
import UserGrowthChart from "@/components/users/UserGrowthChart"
import UserActivityHeatmap from "@/components/users/UserActivityHeatmap"
import UserDemographicsChart from "@/components/users/UserDemographicsChart"
import useUserData from "@/hooks/useUserData"

const Users = () => {
    const { userData, isLoading, error } = useUserData()

    const today = new Date().toISOString().split('T')[0]

    const userStats = {
        totalUsers: userData?.length,
        newUsersToday: userData?.filter((user) => user.createdAt.split('T')[0] === today).length,
        activeUsers: userData?.filter((user) => user.status === 0).length,
        inactiveUsers: userData?.filter((user) => user.status === 1).length,
    }

    if (isLoading) {
        return <div></div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <AdminHeader title='Users' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* stats */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Users' icon={UsersIcon} value={userStats.totalUsers} color='#6366F1' />
                    <StatCard name='New Users Today' icon={UserPlus} value={userStats.newUsersToday} color='#10B981' />
                    <StatCard name='Active Users' icon={UserCheck} value={userStats.activeUsers} color='#F59E0B' />
                    <StatCard name='Inactive Users' icon={UserX} value={userStats.inactiveUsers} color='#EF4444' />
                </motion.div>

                {/* users table */}
                <UsersTable />

                {/* user charts */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
                    <UserGrowthChart />
                    {/* <UserActivityHeatmap /> */}
                    <UserDemographicsChart />
                </div>
            </main>
        </div>
    )
}

export default Users