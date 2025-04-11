import { CalendarCheck, CheckCircle, CircleEllipsis, Clock, Leaf, XCircle } from "lucide-react"
import { motion } from "framer-motion"

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import useTreeData from "@/hooks/useTreeData"
import TreesTable from "@/components/trees/TreesTable"
import TreeDistribution from "@/components/trees/TreeDistribution"

const TreesPage = () => {
    const { treeData, isLoading, error } = useTreeData()

    const treeStats = {
        commonTrees: treeData?.filter((tree) => tree.rarity === 'Common').length,
        rareTrees: treeData?.filter((tree) => tree.rarity === 'Rare').length,
        epicTrees: treeData?.filter((tree) => tree.rarity === 'Epic').length,
        legendaryTrees: treeData?.filter((tree) => tree.rarity === 'Legendary').length,
    }

    if (isLoading) {
        return <div></div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <div className='flex-1 relative z-10 overflow-auto'>
            <AdminHeader title={'Trees'} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Common Trees' icon={Leaf} value={treeStats.commonTrees} color='#FFFFFF' />
                    <StatCard name='Rare Trees' icon={Leaf} value={treeStats.rareTrees} color='#3B82F6' />
                    <StatCard name='Epic Trees' icon={Leaf} value={treeStats.epicTrees} color='#8884D8' />
                    <StatCard name='Legendary Trees' icon={Leaf} value={treeStats.legendaryTrees} color='#FED766' />
                </motion.div>

                <TreesTable />

                <div className='grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8'>
                    <TreeDistribution />
                </div>
            </main>
        </div>
    )
}

export default TreesPage