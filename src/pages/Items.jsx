import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import ItemsTable from "@/components/items/ItemsTable"
import ItemsTrendChart from "@/components/items/ItemsTrendChart"
import CategoryDistributionChart from "@/components/overview/CategoryDistributionChart"

const Items = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <AdminHeader title='Items' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* stats */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Items' icon={Package} value='30' color='#6366F1' />
                    <StatCard name='Top Items' icon={TrendingUp} value='21' color='#10B981' />
                    <StatCard name='Limited' icon={AlertTriangle} value='12' color='#F59E0B' />
                    <StatCard name='Total Revenue' icon={DollarSign} value='12.5%' color='#EF4444' />
                </motion.div>

                {/* item table */}
                <ItemsTable />

                {/* item charts */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    <ItemsTrendChart />
                    <CategoryDistributionChart />
                </div>
            </main>
        </div>
    )
}

export default Items