import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import ItemsTable from "@/components/items/ItemsTable"
import useItemData from "@/hooks/useItemData"
import ItemDistribution from "@/components/items/ItemDistribution"

const Items = () => {
    const { itemData, isLoading, error } = useItemData()

    const itemStats = {
        commonItems: itemData?.filter((item) => item.rarity === "Common").length,
        rareItems: itemData?.filter((item) => item.rarity === "Rare").length,
        epicItems: itemData?.filter((item) => item.rarity === "Epic").length,
        legendaryItems: itemData?.filter((item) => item.rarity === "Legendary").length,
    }

    if (isLoading) {
        return <div></div>
    }

    if (error) {
        return <div>{error.message}</div>
    }
    
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <AdminHeader title='Items' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Common Items' icon={Package} value={itemStats.commonItems} color='#FFFFFF' />
                    <StatCard name='Rare Items' icon={Package} value={itemStats.rareItems} color='#3B82F6' />
                    <StatCard name='Epic Items' icon={Package} value={itemStats.epicItems} color='#8884D8' />
                    <StatCard name='Legendary Items' icon={Package} value={itemStats.legendaryItems} color='#FED766' />
                </motion.div>

                <ItemsTable />

                <div className='grid grid-cols-1 lg:grid-cols-1 gap-8'>
                    <ItemDistribution />
                </div>
            </main>
        </div>
    )
}

export default Items