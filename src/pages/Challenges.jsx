import { CalendarCheck, CheckCircle, CircleEllipsis, Clock, XCircle } from "lucide-react"
import { motion } from "framer-motion"

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import DailyTasks from "@/components/tasks/DailyTasks"
import TaskDistribution from "@/components/tasks/TaskDistribution"
import useChallengeData from "@/hooks/useChallengeData"
import ChallengesTable from "@/components/challenges/ChallengesTable"

const ChallengesPage = () => {
    const { challengeData, isLoading, error } = useChallengeData()

    const challengeStats = {
        totalChallenges: challengeData?.length,
        notStartedChallenges: challengeData?.filter((challenge) => challenge.status === 0).length,
        activeChallenges: challengeData?.filter((challenge) => challenge.status === 1).length,
        canceledChallenges: challengeData?.filter((challenge) => challenge.status === 3).length,
    }

    if (isLoading) {
        return <div></div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <div className='flex-1 relative z-10 overflow-auto'>
            <AdminHeader title={'Challenges'} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Challenges' icon={CalendarCheck} value={challengeStats.totalChallenges} color='#6366F1' />
                    <StatCard name='Not Started Challenges' icon={CircleEllipsis} value={challengeStats.notStartedChallenges} color='#FFFFFF' />
                    <StatCard name='Active Challenges' icon={Clock} value={challengeStats.activeChallenges} color='#F59E0B' />
                    <StatCard name='Canceled Challenges' icon={XCircle} value={challengeStats.canceledChallenges} color='#FF6B6B' />
                </motion.div>

                <ChallengesTable />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'>
                    {/* <DailyTasks /> */}
                    {/* <TaskDistribution /> */}
                </div> 
            </main>
        </div>
    )
}

export default ChallengesPage