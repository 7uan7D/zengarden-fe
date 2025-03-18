import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import useUserData from "@/hooks/useUserData"

const UserGrowthChart = () => {
	const { userData, isLoading, error } = useUserData()

	const userGrowthData = [
		{ month: 'Jan', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '01').length },
		{ month: 'Feb', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '02').length },
		{ month: 'Mar', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '03').length },
		{ month: 'Apr', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '04').length },
		{ month: 'May', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '05').length },
		{ month: 'Jun', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '06').length },
		{ month: 'Jul', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '07').length },
		{ month: 'Aug', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '08').length },
		{ month: 'Sep', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '09').length },
		{ month: 'Oct', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '10').length },
		{ month: 'Nov', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '11').length },
		{ month: 'Dec', users: userData?.filter((user) => user.createdAt.split('T')[0].split('-')[1] === '12').length },
	]

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
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-xl font-semibold text-gray-100 mb-4'>User Growth</h2>
			<div className='h-[320px]'>
				<ResponsiveContainer width='100%' height='100%'>
					<LineChart data={userGrowthData} margin={{ right: 20 }}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='month' stroke='#9CA3AF' />
						<YAxis stroke='#9CA3AF' />
						<Tooltip
							contentStyle={{
								backgroundColor: 'rgba(31, 41, 55, 0.8)',
								borderColor: '#4B5563',
							}}
							itemStyle={{ color: '#E5E7EB' }}
						/>
						<Line
							type='monotone'
							dataKey='users'
							stroke='#8B5CF6'
							strokeWidth={2}
							dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
							activeDot={{ r: 8 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	)
}

export default UserGrowthChart