import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import useChallengeData from "@/hooks/useChallengeData"

const DailyChallenges = () => {
    const { challengeData, isLoading, error } = useChallengeData()

    function transformChallengeDataForDailyChart(challengeData) {
        if (!challengeData) {
            return []
        }

        const dailyChallengesMap = {}

        challengeData.forEach(challenge => {
            const createdAtDate = new Date(challenge.createdAt).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'numeric',
            }).replace(/^(\d)\//, '0$1/')

            if (dailyChallengesMap[createdAtDate]) {
                dailyChallengesMap[createdAtDate]++
            } else {
                dailyChallengesMap[createdAtDate] = 1
            }
        })

        const resultData = Object.entries(dailyChallengesMap).map(([date, count]) => {
            const [month, day] = date.split('/')
            return {
                date: `${day}/${month}`,
                challenges: count
            }
        })

        resultData.sort((a, b) => {
            const [monthA, dayA] = a.date.split('/').map(Number)
            const [monthB, dayB] = b.date.split('/').map(Number)
            if (monthA !== monthB) {
                return monthA - monthB
            }
            return dayA - dayB
        })

        return resultData
    }

    const dailyChallengesData = transformChallengeDataForDailyChart(challengeData)

    if (isLoading) {
        return <div></div>
    }

	if (error) {
        return <div>{error.message}</div>
    }

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Daily Challenges Analytics</h2>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={dailyChallengesData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis dataKey='date' stroke='#9CA3AF' />
                        <YAxis stroke='#9CA3AF' />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4B5563',
                            }}
                            itemStyle={{ color: '#E5E7EB' }}
                        />
                        <Legend />
                        <Line type='linear' dataKey='challenges' stroke='#8B5CF6' strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export default DailyChallenges