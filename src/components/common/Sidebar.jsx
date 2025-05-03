import { BarChart2, DollarSign, Menu, Settings, ShoppingBag, TrendingUp, Users, ScrollText, CalendarCheck, Trophy, Leaf, PackageOpen } from "lucide-react"
import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"

const SIDEBAR_ITEMS = [
    // { name: 'Overview', icon: BarChart2, color: '#6366F1', href: '/overview' },
    { name: 'Users', icon: Users, color: '#EC4899', href: '/users' },
    { name: 'Items', icon: ShoppingBag, color: '#8B5CF6', href: '/items' },
    { name: 'Tasks', icon: CalendarCheck, color: '#3B82F6', href: '/tasks' },
    { name: 'Challenges', icon: Trophy, color: '#F59E0B', href: '/challenges-admin' },
    { name: 'Trees', icon: Leaf, color: '#0ECB70', href: '/trees' },
    { name: 'Packages', icon: PackageOpen, color: '#2FE123', href: '/packages' },
    { name: 'Trade History', icon: BarChart2, color: '#FBBF24', href: '/trade-history' },
    { name: 'Transactions', icon: DollarSign, color: '#10B981', href: '/transactions' },
    // { name: 'User Experience Log', icon: ScrollText, color: '#6EE7B7', href: '/userXPLog' },
    { name: 'Tree Experience Log', icon: ScrollText, color: '#9621B6', href: '/treeXPLog' },
    <hr key="separator" className="my-2 border-t border-gray-700" />,
    { name: 'Challenges Moderate', icon: Trophy, color: '#F59E0B', href: '/challenges-moderate' },
    { name: 'Items Moderate', icon: ShoppingBag, color: '#8B5CF6', href: '/items-moderate' },
    { name: 'Packages Moderate', icon: PackageOpen, color: '#2FE123', href: '/packages-moderate' },
    // { name: 'Sales', icon: DollarSign, color: '#10B981', href: '/sales' },
    // { name: 'Analytics', icon: TrendingUp, color: '#3B82F6', href: '/analytics' },
    { name: 'Settings', icon: Settings, color: '#6366F1', href: '/settings' },
]

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    return (
        <motion.div
            className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
            animate={{ width: isSidebarOpen ? 256 : 85 }}
            style={{ overflowY: 'auto', maxHeight: '100vh' }}
        >
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
                >
                    <Menu size={24} />
                </motion.button>

                <nav className='mt-8 flex-grow'>
                    {SIDEBAR_ITEMS.map((item, index) => (
                        React.isValidElement(item) ? (
                            item
                        ) : (
                            <Link key={item.href} to={item.href}>
                                <motion.div
                                    className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'
                                >
                                    <item.icon size={20} style={{ color: item.color, minWidth: '20px' }} />

                                    <AnimatePresence>
                                        {isSidebarOpen && (
                                            <motion.span

                                                className='ml-4 whitespace-nowrap'
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2, delay: 0.3 }}

                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                </motion.div>
                            </Link>
                        )
                    ))}
                </nav>
            </div>
        </motion.div>
    )
}

export default Sidebar