import { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Verified, Trophy, BookCheck, BookX, Clock, Coffee, Calendar, Flag, CheckCircle, ClipboardCheck, StickyNote, ArrowBigLeft } from "lucide-react";
import { GetAllChallenges, GetChallengeById, GetProgressByChallengeId, GetRankingByChallengeId, JoinChallengeById, LeaveChallengeById } from "@/services/apiServices/challengeService";
import { GetAllChallengeTypes } from "@/services/apiServices/challengeTypeService";
import { GetAllUserChallenges } from "@/services/apiServices/userChallengeService";
import parseJwt from "@/services/parseJwt";
import { GetUserTreeByUserId } from "@/services/apiServices/userTreesService";
import { toast } from "sonner";

export default function ChallengeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [challengeType, setChallengeType] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");
    const [userChallengesData, setUserChallengesData] = useState([]);
    useEffect(() => {
        const fetchUserChallenges = async () => {
            if (!token) return;

            try {
                const data = await GetAllUserChallenges();

                const userId = parseJwt(token).sub;
                const LoggedUserChallenges = data.filter(challenge => challenge.userId === parseInt(userId));

                const challengeIds = LoggedUserChallenges.map(
                    (challenge) => challenge.challengeId
                );

                const challengeData = await Promise.all(
                    challengeIds.map(async (challengeId) => {
                        const data = await GetChallengeById(challengeId);
                        return data;
                    })
                );

                setUserChallengesData(challengeData);
            } catch (error) {
                console.error("Error fetching challenges:", error);
            }
        };

        fetchUserChallenges();
    }, []);

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
    }, [id]);

    const [UserTrees, setUserTrees] = useState([]);
    useEffect(() => {
        const fetchTrees = async () => {
            if (!token) return;
            try {
                const userId = parseJwt(token).sub;
                const data = await GetUserTreeByUserId(userId);
                if (data) {
                    setUserTrees(data);
                }
            } catch (error) {
                console.error("Error fetching user trees:", error);
            }
        };

        fetchTrees();
    }, []);

    const handleJoinChallenge = async (challengeId) => {
        if (!token) return;

        if (!UserTrees || UserTrees.length === 0 || !UserTrees[0]?.userTreeId) {
            console.error("User tree is not available.");
            return;
        }

        const userTreeId = parseInt(UserTrees[0].userTreeId);
        console.log("Joining challenge with ID:", challengeId, "userTreeId:", userTreeId);

        try {
            await JoinChallengeById(challengeId, { userTreeId });

            toast.success("Joined challenge successfully!");
            setTimeout(() => {
                window.location.reload()
            }, 3000);

            // handle join challenge logic here
        } catch (error) {
            console.error("Error joining challenge:", error);
            toast.error("Failed to join challenge. Please try again.");
        }
    }

    const handleLeaveChallenge = async (challengeId) => {
        if (!token) return;

        try {
            await LeaveChallengeById(challengeId);

            toast.success("Left challenge successfully!");
            setTimeout(() => {
                window.location.reload()
            }, 2000);

        } catch (error) {
            console.error("Error leaving challenge:", error);
            toast.error("Failed to leave challenge. Please try again.");
        }
    };

    const [rankingData, setRankingData] = useState([]);
    useEffect(() => {
        const fetchRanking = async () => {
            if (!token) return;

            try {
                const data = await GetRankingByChallengeId(id);
                const rankingDataWithoutUserId = data.map(({ userId, ...rest }) => rest);
                setRankingData(rankingDataWithoutUserId);
            } catch (error) {
                console.error("Error fetching ranking:", error);
            }
        };

        fetchRanking();
    }, [id]);

    const [userChallengeProgress, setUserChallengeProgress] = useState(null);
    useEffect(() => {
        const fetchProgress = async () => {
            if (!token) return;

            try {
                const data = await GetProgressByChallengeId(id);
                setUserChallengeProgress(data.progress);
            } catch (error) {
                console.error("Error fetching progress:", error);
            }
        };

        fetchProgress();
    }, [id]);

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
                                        {userChallengesData.some(
                                            (userChallenge) => userChallenge.challengeId === parseInt(id)
                                        ) ? (
                                            <Button variant="destructive" onClick={() => handleLeaveChallenge(id)}>
                                                <BookX className="mr-2 h-4 w-4" /> Leave Challenge
                                            </Button>
                                        ) : (
                                            <Button onClick={() => handleJoinChallenge(id)}>
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
                                        Reward <Trophy className="ml-1" color="orange" />:
                                        <span className="font-bold ml-1">
                                            {challenge.reward} coins
                                        </span>
                                    </p>

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

                                    <p className="text-sm text-cyan-500 flex items-center text-left font-bold">
                                        Your progress:
                                    </p>

                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-cyan-600 h-2.5 rounded-full"
                                            style={{ width: `${userChallengeProgress}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-end mt-2">
                                        <p className="text-sm text-gray-500 flex items-center">
                                            {userChallengeProgress}% completed
                                        </p>
                                    </div>

                                    <p className="text-sm text-emerald-500 flex items-center text-left font-bold">
                                        Leaderboard:
                                    </p>

                                    <Card className="mt-2">
                                        <CardContent className="space-y-2">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                                            <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                            <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {rankingData && rankingData.length > 0 ? (
                                                            rankingData.map((user, index) => (
                                                                <tr key={index}>
                                                                    {/* <td className="py-4 whitespace-nowrap text-sm text-gray-500 text-center">{index + 1}</td> */}

                                                                    <td className={`py-4 whitespace-nowrap text-sm font-medium text-center ${index === 0 ? 'text-rose-500' : index === 1 ? 'text-pink-500' : index === 2 ? 'text-fuchsia-500' : 'text-gray-500'}`}>
                                                                        {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                                                                    </td>

                                                                    <td className={`py-4 whitespace-nowrap text-sm font-bold text-center ${index === 0 ? 'text-rose-500' : index === 1 ? 'text-pink-500' : index === 2 ? 'text-fuchsia-500' : 'text-gray-500'}`}>
                                                                        {user.userName}
                                                                    </td>

                                                                    <td className={`py-4 whitespace-nowrap text-sm font-bold text-center ${index === 0 ? 'text-rose-500' : index === 1 ? 'text-pink-500' : index === 2 ? 'text-fuchsia-500' : 'text-gray-500'}`}>
                                                                        {user.progress}%
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td className="py-4 whitespace-nowrap text-sm text-gray-500 text-center" colSpan="3">No ranking data available.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}