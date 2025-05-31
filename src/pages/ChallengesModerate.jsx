import { CalendarCheck, CheckCircle, CircleEllipsis, Clock, Plus, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import { GetAllChallengeTypes } from "@/services/apiServices/challengeTypeService";
import { CreateChallenge } from "@/services/apiServices/challengeService";
import { toast } from "sonner";

import AdminHeader from "@/components/common/AdminHeader"
import StatCard from "@/components/common/StatCard"
import useChallengeData from "@/hooks/useChallengeData"
import ChallengeDistribution from "@/components/challenges/ChallengeDistribution"
import DailyChallenges from "@/components/challenges/DailyChallenges"
import ChallengesModerateTable from "@/components/challenges/ChallengesModerateTable";

const ChallengesModerate = () => {
    const { challengeData, error } = useChallengeData()

    const challengeStats = {
        totalChallenges: challengeData?.length,
        notStartedChallenges: challengeData?.filter((challenge) => challenge.status === 0).length,
        activeChallenges: challengeData?.filter((challenge) => challenge.status === 1).length,
        canceledChallenges: challengeData?.filter((challenge) => challenge.status === 3).length,
    }

    const [challengeTypesData, setChallengeTypesData] = useState([]);
    useEffect(() => {
        const fetchChallengeTypes = async () => {
            // const token = localStorage.getItem("token");
            // if (!token) return;

            try {
                const data = await GetAllChallengeTypes();
                setChallengeTypesData(data);
            } catch (error) {
                console.error("Error fetching challenge types:", error);
            }
        };

        fetchChallengeTypes();
    }, []);

    const [openCreateChallenge, setOpenCreateChallenge] = useState(false);
    const handleCreateChallengeClick = () => {
        setOpenCreateChallenge(true);
    };

    const [newChallengeData, setNewChallengeData] = useState({
        challengeTypeId: 0,
        challengeName: "",
        description: "",
        reward: 0,
        startDate: "",
        endDate: "",
    });

    const handleChange = (e) => {
        const { id, value } = e.target
        setNewChallengeData((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const [isLoading, setIsLoading] = useState(false);
    const handleSaveChanges = async () => {
        console.log("Saving changes with data: ", newChallengeData);
        setIsLoading(true);
        try {
            await CreateChallenge(newChallengeData);

            toast.success("Challenge created successfully!");

            setTimeout(() => {
                window.location.reload()
            }, 3000)
        } catch (error) {
            console.error("Error creating challenge:", error);
            toast.error("Failed to create challenge. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div></div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    return (
        <div className='flex-1 relative z-10 overflow-auto'>
            <AdminHeader title={'Challenges Moderate'} />

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

                {/* <div className="flex justify-between items-center mb-4">
                    <p />
                    <Button className="bg-teal-700 text-gray hover:bg-teal-900" onClick={handleCreateChallengeClick}>
                        <Plus className="h-4 w-4" />
                        Create Challenge
                    </Button>
                </div> */}

                <ChallengesModerateTable />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'>
                    <DailyChallenges />
                    <ChallengeDistribution />
                </div>

                <Dialog open={openCreateChallenge} onOpenChange={setOpenCreateChallenge}>
                    <DialogContent className='dialog-overlay bg-gray-800 text-white'>
                        <DialogHeader>
                            <DialogTitle>Create New Challenge</DialogTitle>
                        </DialogHeader>

                        <Tabs className='w-[462px]'>
                            <TabsContent className=''>
                                <div className='space-y-1 mb-3'>
                                    <Label htmlFor='challengeName'>Challenge Name:</Label>
                                    <Input
                                        id='challengeName'
                                        value={newChallengeData.challengeName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='space-y-1 mb-3'>
                                    <Label htmlFor='description'>Description:</Label>
                                    <Input
                                        id='description'
                                        value={newChallengeData.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='space-y-1 mb-3'>
                                    <Label htmlFor='challengeTypeId'>Type:</Label>
                                    <select
                                        id='challengeTypeId'
                                        value={newChallengeData.challengeTypeId}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-sm"
                                    >
                                        <option value='' disabled>Select Challenge Type</option>
                                        {challengeTypesData.map((type) => (
                                            <option key={type.challengeTypeId} value={type.challengeTypeId}>
                                                {type.challengeTypeName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='space-y-1 mb-3'>
                                    <Label htmlFor='reward'>Reward (coins): </Label>
                                    <Input
                                        id='reward'
                                        value={newChallengeData.reward}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='space-y-1 mb-3'>
                                    <Label htmlFor='startDate'>Start Date:</Label>
                                    <Input
                                        type='datetime-local'
                                        id='startDate'
                                        value={newChallengeData.startDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='space-y-1 mb-5'>
                                    <Label htmlFor='endDate'>End Date:</Label>
                                    <Input
                                        type='datetime-local'
                                        id='endDate'
                                        value={newChallengeData.endDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <Button
                                    className='bg-[#83aa6c] text-white'
                                    onClick={handleSaveChanges}
                                    disabled={isLoading}
                                >
                                    Save Changes
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}

export default ChallengesModerate