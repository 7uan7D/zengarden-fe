import { CheckCircle, Edit, Package, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import AdminHeader from "@/components/common/AdminHeader"
import { AutoPauseTasks, ResetDailyStatus, ResetWeeklyPriorities, UpdateOverdueTasks } from "@/services/apiServices/taskService"
import { HandleExpiredChallenges } from "@/services/apiServices/challengeService"

const DataRefreshModerate = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [openUpdateOverdue, setOpenUpdateOverdue] = useState(false)
    const [openResetWeeklyPriorities, setOpenResetWeeklyPriorities] = useState(false)
    const [openResetDailyStatus, setOpenResetDailyStatus] = useState(false)
    const [openAutoPause, setOpenAutoPause] = useState(false)
    const [openHandleExpiredChallenges, setOpenHandleExpiredChallenges] = useState(false)

    const handleUpdateOverdue = async () => {
        setIsLoading(true)
        try {
            await UpdateOverdueTasks()
            toast.success('Overdue tasks updated successfully!')
            setIsLoading(false)
            setOpenUpdateOverdue(false)
        } catch (error) {
            console.error('Failed to update overdue tasks:', error)
            toast.error('Update overdue tasks failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetWeeklyPriorities = async () => {
        setIsLoading(true)
        try {
            await ResetWeeklyPriorities()
            toast.success('Weekly priorities reset successfully!')
            setIsLoading(false)
            setOpenResetWeeklyPriorities(false)
        } catch (error) {
            console.error('Failed to reset weekly priorities:', error)
            toast.error('Reset weekly priorities failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetDailyStatus = async () => {
        setIsLoading(true)
        try {
            await ResetDailyStatus()
            toast.success('Daily status reset successfully!')
            setIsLoading(false)
            setOpenResetDailyStatus(false)
        } catch (error) {
            console.error('Failed to reset daily status:', error)
            toast.error('Reset daily status failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleHandleExpiredChallenges = async () => {
        setIsLoading(true)
        try {
            await HandleExpiredChallenges()
            toast.success('Expired challenges handled successfully!')
            setIsLoading(false)
            setOpenHandleExpiredChallenges(false)
        } catch (error) {
            console.error('Failed to handle expired challenges:', error)
            toast.error('Handle expired challenges failed!')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAutoPause = async () => {
        setIsLoading(true)
        try {
            await AutoPauseTasks()
            toast.success('Tasks auto-pause successfully!')
            setIsLoading(false)
            setOpenAutoPause(false)
        } catch (error) {
            console.error('Failed to auto-pause tasks:', error)
            toast.error('Auto-pause tasks failed!')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className='flex-1 relative z-10 overflow-auto'>
            <AdminHeader title={'Data Refresh Moderate'} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <h2 className='text-2xl font-bold mb-4'>Tasks</h2>
                <div className='flex items-center justify-between mb-4'>
                    <Button
                        className='bg-teal-700 text-gray hover:bg-teal-900'
                        onClick={() => setOpenUpdateOverdue(true)}
                    >
                        <Edit className='h-4 w-4' />
                        Update Overdue Tasks
                    </Button>
                    <p className='text-gray-400 text-sm'>Update the status of overdue tasks.</p>
                </div>

                <div className='flex items-center justify-between mb-4'>
                    <Button
                        className='bg-teal-700 text-gray hover:bg-teal-900'
                        onClick={() => setOpenResetDailyStatus(true)}
                    >
                        <Edit className='h-4 w-4' />
                        Reset Daily Status
                    </Button>
                    <p className='text-gray-400 text-sm'>Reset the status of recurring daily tasks.</p>
                </div>

                <div className='flex items-center justify-between mb-4'>
                    <Button
                        className='bg-teal-700 text-gray hover:bg-teal-900'
                        onClick={() => setOpenResetWeeklyPriorities(true)}
                    >
                        <Edit className='h-4 w-4' />
                        Reset Weekly Priorities
                    </Button>
                    <p className='text-gray-400 text-sm'>Reset the priority level of weekly tasks.</p>
                </div>

                <div className='flex items-center justify-between mb-4'>
                    <Button
                        className='bg-teal-700 text-gray hover:bg-teal-900'
                        onClick={() => setOpenAutoPause(true)}
                    >
                        <Edit className='h-4 w-4' />
                        Auto Pause Tasks
                    </Button>
                    <p className='text-gray-400 text-sm'>Automatically pause tasks that have been running too long.</p>
                </div>

                <h2 className='text-2xl font-bold mb-4'>Challenges</h2>
                <div className='flex items-center justify-between mb-4'>
                    <Button
                        className='bg-teal-700 text-gray hover:bg-teal-900'
                        onClick={() => setOpenHandleExpiredChallenges(true)}
                    >
                        <Edit className='h-4 w-4' />
                        Handle Expired Challenges
                    </Button>
                    <p className='text-gray-400 text-sm'>Handles expired challenges manually, updates the status of the challenges and participants.</p>
                </div>

                <Dialog open={openUpdateOverdue} onOpenChange={setOpenUpdateOverdue}>
                    <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                        <DialogHeader>
                            <DialogTitle>Update Overdue</DialogTitle>
                        </DialogHeader>

                        <Tabs className='w-[462px]'>
                            <TabsContent className='p-4'>
                                <Card className='bg-gray-800 text-white'>
                                    <CardHeader>
                                        <CardDescription className='text-gray-400'>
                                            Update the status of overdue tasks.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-2 bg-gray-800'>
                                        <div className='space-y-1'>
                                            <Label>Do you want to update overdue tasks?</Label>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className='bg-[#83aa6c] text-white'
                                            onClick={handleUpdateOverdue}
                                            disabled={isLoading}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            className='bg-red-400 text-white ml-2'
                                            onClick={() => setOpenUpdateOverdue(false)}
                                        >
                                            Exit
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>

                <Dialog open={openResetWeeklyPriorities} onOpenChange={setOpenResetWeeklyPriorities}>
                    <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                        <DialogHeader>
                            <DialogTitle>Reset Weekly Priorities</DialogTitle>
                        </DialogHeader>

                        <Tabs className='w-[462px]'>
                            <TabsContent className='p-4'>
                                <Card className='bg-gray-800 text-white'>
                                    <CardHeader>
                                        <CardDescription className='text-gray-400'>
                                            Reset the priority level of weekly tasks.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-2 bg-gray-800'>
                                        <div className='space-y-1'>
                                            <Label>Do you want to reset weekly priorities?</Label>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className='bg-[#83aa6c] text-white'
                                            onClick={handleResetWeeklyPriorities}
                                            disabled={isLoading}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            className='bg-red-400 text-white ml-2'
                                            onClick={() => setResetWeeklyPriorities(false)}
                                        >
                                            Exit
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>

                <Dialog open={openResetDailyStatus} onOpenChange={setOpenResetDailyStatus}>
                    <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                        <DialogHeader>
                            <DialogTitle>Reset Daily Status</DialogTitle>
                        </DialogHeader>

                        <Tabs className='w-[462px]'>
                            <TabsContent className='p-4'>
                                <Card className='bg-gray-800 text-white'>
                                    <CardHeader>
                                        <CardDescription className='text-gray-400'>
                                            Reset the status of recurring daily tasks.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-2 bg-gray-800'>
                                        <div className='space-y-1'>
                                            <Label>Do you want to reset daily status?</Label>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className='bg-[#83aa6c] text-white'
                                            onClick={handleResetDailyStatus}
                                            disabled={isLoading}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            className='bg-red-400 text-white ml-2'
                                            onClick={() => setOpenResetDailyStatus(false)}
                                        >
                                            Exit
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>

                <Dialog open={openAutoPause} onOpenChange={setOpenAutoPause}>
                    <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                        <DialogHeader>
                            <DialogTitle>Auto Pause Tasks</DialogTitle>
                        </DialogHeader>

                        <Tabs className='w-[462px]'>
                            <TabsContent className='p-4'>
                                <Card className='bg-gray-800 text-white'>
                                    <CardHeader>
                                        <CardDescription className='text-gray-400'>
                                            Automatically pause tasks that have been running too long.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-2 bg-gray-800'>
                                        <div className='space-y-1'>
                                            <Label>Do you want to auto-pause tasks?</Label>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className='bg-[#83aa6c] text-white'
                                            onClick={handleAutoPause}
                                            disabled={isLoading}
                                        >
                                            Pause
                                        </Button>
                                        <Button
                                            className='bg-red-400 text-white ml-2'
                                            onClick={() => setOpenAutoPause(false)}
                                        >
                                            Exit
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>

                <Dialog open={openHandleExpiredChallenges} onOpenChange={setOpenHandleExpiredChallenges}>
                    <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                        <DialogHeader>
                            <DialogTitle>Handle Expired Challenges</DialogTitle>
                        </DialogHeader>

                        <Tabs className='w-[462px]'>
                            <TabsContent className='p-4'>
                                <Card className='bg-gray-800 text-white'>
                                    <CardHeader>
                                        <CardDescription className='text-gray-400'>
                                            Handles expired challenges manually, updates the status of the challenges and participants.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-2 bg-gray-800'>
                                        <div className='space-y-1'>
                                            <Label>Do you want to handle expired challenges?</Label>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className='bg-[#83aa6c] text-white'
                                            onClick={handleHandleExpiredChallenges}
                                            disabled={isLoading}
                                        >
                                            Handle
                                        </Button>
                                        <Button
                                            className='bg-red-400 text-white ml-2'
                                            onClick={() => setOpenHandleExpiredChallenges(false)}
                                        >
                                            Exit
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}

export default DataRefreshModerate