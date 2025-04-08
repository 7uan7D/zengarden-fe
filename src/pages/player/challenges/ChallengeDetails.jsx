import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Verified, Beaker, BookCheck, BookX, Clock, Coffee, Calendar, Flag, CheckCircle, ClipboardCheck, StickyNote, ArrowBigLeft } from "lucide-react";
import { GetAllChallenges } from "@/services/apiServices/challengeService";
import { GetAllChallengeTypes } from "@/services/apiServices/challengeTypeService";

export default function ChallengeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [challengeType, setChallengeType] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isJoined, setIsJoined] = useState(false); // Placeholder for join status

    useEffect(() => {
        const fetchChallengeDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const allChallenges = await GetAllChallenges();
                const foundChallenge = allChallenges.find((c) => c.challengeId === parseInt(id));

                if (foundChallenge) {
                    setChallenge(foundChallenge);
                    const allChallengeTypes = await GetAllChallengeTypes();
                    const foundChallengeType = allChallengeTypes.find(
                        (type) => type.challengeTypeId === foundChallenge.challengeTypeId
                    );
                    setChallengeType(foundChallengeType);
                } else {
                    setError("Challenge not found");
                }
            } catch (err) {
                console.error("Error fetching challenge details:", err);
                setError("Failed to load challenge details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchChallengeDetails();

        // Placeholder logic to check if the user has joined the challenge
        // In a real application, you would likely have user-specific data
        // and an API endpoint to check join status.
        // For now, we'll just set a default state.
        // You might fetch user's joined challenges and check if the current ID exists.
        setIsJoined(id === "1"); // Example: Assume challenge ID 1 is joined
    }, [id]);

    const handleJoinChallenge = () => {
        // Implement logic to join the challenge (e.g., API call)
        console.log(`Joining challenge with ID: ${id}`);
        setIsJoined(true);
        // Optionally, show a success message
    };

    const handleLeaveChallenge = () => {
        // Implement logic to leave the challenge (e.g., API call)
        console.log(`Leaving challenge with ID: ${id}`);
        setIsJoined(false);
        // Optionally, show a success message
    };

    if (isLoading) {
        return <div></div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!challenge) {
        return <div>Challenge details not available.</div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md"></div>

            <div className="flex flex-1 pt-[80px]">
                <div className="flex-1 p-6 overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">Challenges</h1>
                    <div className="min-h-screen py-8">
                        <div className="container mx-auto px-4 flex"> {/* Use flex container */}
                            <Card className="w-[70%] mr-4">
                                <CardHeader className="flex flex-col items-start">
                                    <CardTitle className="text-2xl font-bold">
                                        <span className="text-cyan-800">
                                            {challenge.challengeName}
                                        </span>
                                    </CardTitle>
                                    {challengeType && (
                                        <CardDescription className="text-gray-500 flex items-center">
                                            Type:
                                            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs ml-1">
                                                {challengeType.challengeTypeName}
                                            </span>
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <h2 className="text-lg font-semibold">To do's</h2>
                                    {challenge.tasks && challenge.tasks.length > 0 ? (
                                        challenge.tasks.map((task, index) => (
                                            <Card key={index} className="mb-4">
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-semibold text-cyan-800">{task.taskName}</CardTitle>
                                                    <p className="items-center text-sm font-bold">{task.taskDescription}</p>
                                                </CardHeader>
                                                <CardContent className="space-y-2 text-gray-500">
                                                    <div className="flex items-center text-sm">
                                                        <Clock className="mr-2 h-4 w-4" />
                                                            <p className="text-sm font-bold mr-1">Duration:</p>
                                                            {task.workDuration}/{task.totalDuration} min
                                                        (Work/Total)
                                                    </div>
                                                    {task.breakTime > 0 && (
                                                        <div className="flex items-center text-sm">
                                                            <Coffee className="mr-2 h-4 w-4" />
                                                            <p className="text-sm font-bold mr-1">Break:</p>
                                                            {task.breakTime} min
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        <p className="text-sm font-bold mr-1">Start:</p>
                                                        {new Date(challenge.startDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                            second: 'numeric',
                                                        })}
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <Flag className="mr-2 h-4 w-4" />
                                                        <p className="text-sm font-bold mr-1">End:</p>
                                                        {new Date(challenge.endDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                            second: 'numeric',
                                                        })}
                                                    </div>
                                                    {task.taskNote && (
                                                        <div className="flex items-center text-sm">
                                                            <StickyNote className="mr-2 h-4 w-4" />
                                                            <p className="text-sm font-bold mr-1">Note:</p>
                                                            {task.taskNote}
                                                        </div>
                                                    )}
                                                    {/* <div className="flex items-center text-sm">
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Status: {getStatusText(task.status)}
                                                    </div> */}
                                                    {task.taskResult && (
                                                        <div className="flex items-center text-sm">
                                                            <ClipboardCheck className="mr-2 h-4 w-4" />
                                                            <p className="text-sm font-bold mr-1">Result:</p>
                                                            {task.taskResult}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p>No tasks available for this challenge.</p>
                                    )}
                                </CardContent>

                            </Card>
                            <Card className="w-[30%]">
                                <CardHeader>
                                    <div className="mt-6">
                                        <Button className="mr-2" variant="outline" onClick={() => navigate(-1)}>
                                            <ArrowBigLeft className="mr-2 h-4 w-4" /> Back
                                        </Button>
                                        {isJoined ? (
                                            <Button variant="destructive" onClick={handleLeaveChallenge}>
                                                <BookX className="mr-2 h-4 w-4" /> Leave Challenge
                                            </Button>
                                        ) : (
                                            <Button onClick={handleJoinChallenge}>
                                                <BookCheck className="mr-2 h-4 w-4" /> Join Challenge
                                            </Button>
                                        )}
                                        
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-gray-500 flex items-center text-left font-bold">
                                        {challenge.description}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        Reward <Beaker className="ml-1" color="darkcyan" />:
                                        <span className="font-bold ml-1">
                                            {challenge.reward} EXP
                                        </span>
                                    </p>

                                    {/* <p className="text-sm text-gray-500 flex items-center">
                                        Including <Verified className="ml-1" color="navy" />:
                                        <span className="font-bold ml-1">
                                            {challenge.tasks ? challenge.tasks.length : 0} task(s)
                                        </span>
                                    </p> */}

                                    <p className="text-sm text-gray-500 flex items-center">
                                        Start Date:
                                        <span className="font-bold ml-1">
                                            {new Date(challenge.startDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric',
                                            })}
                                        </span>
                                    </p>

                                    <p className="text-sm text-gray-500 flex items-center">
                                        End Date:
                                        <span className="font-bold ml-1">
                                            {new Date(challenge.endDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric',
                                            })}
                                        </span>
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}