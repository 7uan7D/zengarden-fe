import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Verified, Beaker, BookCheck, BookX } from "lucide-react";
import { GetAllChallenges } from "@/services/apiServices/challengeService";
import { GetAllChallengeTypes } from "@/services/apiServices/challengeTypeService";

export default function ChallengeDetails() {
    const { id } = useParams(); // Get the challenge ID from the URL
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
                    // Fetch challenge type name
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
                        <div className="container mx-auto px-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold">{challenge.challengeName}</CardTitle>
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
                                    <p className="text-gray-700">{challenge.description}</p>
                                    <div className="flex items-center">
                                        <Beaker className="mr-2 text-darkcyan" />
                                        <span className="font-semibold">Reward:</span> {challenge.reward} EXP
                                    </div>
                                    <div className="flex items-center">
                                        <Verified className="mr-2 text-navy" />
                                        <span className="font-semibold">Tasks:</span> {challenge.tasks ? challenge.tasks.length : 0} task(s)
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold">Start Date:</span>{" "}
                                        {new Date(challenge.startDate).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                            second: "numeric",
                                        })}
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold">End Date:</span>{" "}
                                        {new Date(challenge.endDate).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                            second: "numeric",
                                        })}
                                    </div>

                                    <div className="mt-6">
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
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    );
}