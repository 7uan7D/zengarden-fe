import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Play,
  BookCheck,
  BookX,
  Plus,
  Trophy,
  Check,
  XCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { motion } from "framer-motion";
import parseJwt from "@/services/parseJwt";
import { GetAllChallengeTypes } from "@/services/apiServices/challengeTypeService";
import {
  CreateChallenge,
  GetAllChallenges,
  GetChallengeById,
  JoinChallengeById,
  LeaveChallengeById,
} from "@/services/apiServices/challengeService";
import { GetAllUserChallenges } from "@/services/apiServices/userChallengeService";
import { Link } from "react-router-dom";
import { GetUserTreeByUserId } from "@/services/apiServices/userTreesService";
import { toast } from "sonner";
import ChallengeDetails from "./ChallengeDetails";

const categories = ["My Challenges", "Get Challenges"];

export default function Challenges({ challenges }) {
  const [search, setSearch] = useState("");
  const [challengeTypesData, setChallengeTypesData] = useState([]);

  //dialog challenge details
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);

  const handleOpenChallenge = (id) => {
    setSelectedChallengeId(id);
    setOpenDialog(true);
  };

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

  const [filteredChallengeTypes, setFilteredChallengeTypes] = useState([]);
  const [challengeTypesDataNames, setChallengeTypesDataNames] = useState([]);
  useEffect(() => {
    if (challengeTypesData) {
      setChallengeTypesDataNames(
        challengeTypesData.map((type) => type.challengeTypeName)
      );
      setFilteredChallengeTypes(challengeTypesDataNames);
    }
  }, [challengeTypesData]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    const filtered = challengeTypesDataNames.filter(
      (item) =>
        item.toLowerCase().includes(term) || item.toLowerCase().includes(term)
    );
    setFilteredChallengeTypes(filtered);
  };

  const [typeFilters, setTypeFilters] = useState([]);
  const handleTypeFilter = (type) => {
    if (typeFilters.includes(type)) {
      setTypeFilters(typeFilters.filter((t) => t !== type));
    } else {
      setTypeFilters([...typeFilters, type]);
    }
    console.log(filteredChallenges);
  };

  const [challengesData, setChallengesData] = useState([]);
  useEffect(() => {
    const fetchChallenges = async () => {
      // const token = localStorage.getItem("token");
      // if (!token) return;

      try {
        const data = await GetAllChallenges();
        const filteredChallengesStatus = data.filter(
          (item) => item && item.status === 1
        );
        setChallengesData(filteredChallengesStatus);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, []);

  const filteredChallenges = challengesData.filter((item) => {
    if (typeFilters.length === 0) return true;
    const selectedTypeIds = challengeTypesData
      .filter((type) => typeFilters.includes(type.challengeTypeName))
      .map((type) => type.challengeTypeId);
    return selectedTypeIds.includes(item.challengeTypeId);
  });

  const token = localStorage.getItem("token");

  const [userChallengeInfo, setUserChallengeInfo] = useState([]);
  const [userChallengesData, setUserChallengesData] = useState([]);
  useEffect(() => {
    const fetchUserChallenges = async () => {
      if (!token) return;

      try {
        const data = await GetAllUserChallenges();

        const userId = parseJwt(token).sub;
        const LoggedUserChallenges = data.filter(
          (challenge) => challenge.userId === parseInt(userId)
        );
        setUserChallengeInfo(LoggedUserChallenges); // this is for userChallenge detail page

        userChallengeInfo.map((challenge) => {});

        filteredChallenges.map((item) => {
          // find if userChallengeInfo has challengeId and status === 4
          if (
            userChallengeInfo.find(
              (challenge) =>
                challenge.challengeId === parseInt(item.challengeId) &&
                challenge.status !== 4
            )
          ) {
            console.log("challenge id", item.challengeId);
          }
        });

        // console.log("check", userChallengeInfo.find((challenge) => challenge.challengeId === parseInt(item.challengeId) && challenge.status === 4))

        // get all challengeId from LoggedUserChallenges
        const challengeIds = LoggedUserChallenges.map(
          (challenge) => challenge.challengeId
        );

        // get all challengeData by challengeId from getChallengeById
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

  // console.log("userChallengeInfo", userChallengeInfo);
  // console.log("userChallengesData", userChallengesData);

  const filteredUserChallenges = userChallengesData.filter((item) => {
    if (typeFilters.length === 0) return true;
    const selectedTypeIds = challengeTypesData
      .filter((type) => typeFilters.includes(type.challengeTypeName))
      .map((type) => type.challengeTypeId);
    return selectedTypeIds.includes(item.challengeTypeId);
  });

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
    console.log(
      "Joining challenge with ID:",
      challengeId,
      "userTreeId:",
      userTreeId
    );

    try {
      await JoinChallengeById(challengeId, { userTreeId });

      toast.success("Joined challenge successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast.error("Failed to join challenge. Please try again.");
    }
  };

  const handleLeaveChallenge = async (challengeId) => {
    if (!token) return;

    try {
      await LeaveChallengeById(challengeId);

      toast.success("Left challenge successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error leaving challenge:", error);
      toast.error("Failed to leave challenge. Please try again.");
    }
  };

  const [openCreateChallenge, setOpenCreateChallenge] = useState(false);
  const handleCreateChallengeClick = () => {
    setOpenCreateChallenge(true);
  };

  const [newChallengeData, setNewChallengeData] = useState({
    challengeTypeId: 1,
    challengeName: "",
    description: "",
    reward: 0,
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewChallengeData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleSaveChanges = async () => {
    console.log("Saving changes with data: ", newChallengeData);
    setIsLoading(true);
    try {
      await CreateChallenge(newChallengeData);

      toast.success("Challenge created successfully!");

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error("Failed to create challenge. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl font-bold">
          Please log in to view your challenges
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md"></div>

      <div className="flex flex-1 pt-[80px]">
        <div
          className="w-64 p-6 bg-gray-50 dark:bg-gray-800 sticky top-[80px] 
                    h-[calc(100vh-80px)] overflow-auto rounded-tr-2xl shadow-lg 
                    border border-gray-300 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          <Input
            placeholder="Search filters..."
            value={search}
            onChange={handleSearch}
            className="mb-4"
          />

          {/* checkboxes */}
          <div className="mt-4">
            {filteredChallengeTypes.map((type) => (
              <div key={type} className="flex items-center mb-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    id={type}
                    checked={typeFilters.includes(type)}
                    onChange={() => handleTypeFilter(type)}
                    className="peer sr-only"
                  />
                  <div className="mb-2.5 w-4 h-4 border border-gray-300 rounded-sm peer-checked:bg-teal-600 peer-checked:border-teal-600">
                    <svg
                      className="absolute hidden w-3 h-3 text-white pointer-events-none peer-checked:block top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 12"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5.917 5.724 10.5 15 1.5"
                      />
                    </svg>
                  </div>
                </div>
                <label htmlFor={type} className="ml-2 text-sm mb-2">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Challenges</h1>

          <div className="flex justify-between items-center mb-4">
            <p />
            <Button
              className="bg-teal-500 text-white hover:bg-teal-700"
              onClick={handleCreateChallengeClick}
            >
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </div>

          <Tabs defaultValue={categories[0]}>
            <TabsList className="mb-4">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat} value={cat}>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                  {cat === "Get Challenges" &&
                    filteredChallenges.map((item) => (
                      <motion.div
                        key={item.challengeId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <Popover>
                          <Card
                            className="relative"
                            onClick={() => {
                              setSelectedChallengeId(item.challengeId);
                              setOpenDialog(true);
                            }}
                          >
                            {/* check if item.challengeId appears in userChallengesData */}
                            {userChallengesData.some(
                              (userChallenge) =>
                                userChallenge.challengeId === item.challengeId
                            ) &&
                              cat === "Get Challenges" && (
                                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                                  Joined
                                </span>
                              )}

                            <CardContent className="flex flex-col items-start p-4 cursor-pointer">
                              {/* {cat === "Avatar" ? (
                                      <Avatar className="h-20 w-20 mb-2" />
                                  ) : cat === "Background" ? (
                                      <div className="h-32 w-full bg-gray-300 rounded-lg mb-2" />
                                  ) : cat === "Music" ? (
                                      <Button
                                          variant="outline"
                                          className="mb-2 bg-white"
                                      >
                                          <Play className="h-6 w-6" /> Play Preview
                                      </Button>
                                  ) : (
                                      <div className="h-20 w-20 bg-gray-300 rounded-lg mb-2" />
                                  )} */}

                              <p className="font-semibold">
                                {item.challengeName}
                              </p>

                              <p className="text-sm text-gray-500 flex items-center text-left mb-3">
                                {item.description}
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Reward{" "}
                                <Trophy className="ml-1" color="orange" />:
                                <span className="font-bold ml-1">
                                  {item.reward} coins
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Including:
                                {/* <Verified className="ml-1" color="navy" />: */}
                                <span className="font-bold ml-1">
                                  {item.tasks ? item.tasks.length : 0} task(s)
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Start Date:
                                <span className="font-bold ml-1">
                                  {new Date(item.startDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      second: "numeric",
                                    }
                                  )}
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                End Date:
                                <span className="font-bold ml-1">
                                  {new Date(item.endDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      second: "numeric",
                                    }
                                  )}
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Type:{" "}
                                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs ml-1">
                                  {/* get challenge type by id */}
                                  {challengeTypesData
                                    .filter(
                                      (type) =>
                                        type.challengeTypeId ===
                                        item.challengeTypeId
                                    )
                                    .map((type) => type.challengeTypeName)}
                                </span>
                              </p>

                              <div className="flex items-center mt-3">
                                {userChallengeInfo.find(
                                  (challenge) =>
                                    challenge.challengeId ===
                                      parseInt(item.challengeId) &&
                                    challenge.status !== 4 &&
                                    challenge.challengeRole >= 1
                                ) ? (
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleLeaveChallenge(item.challengeId)
                                    }
                                  >
                                    <BookX className="mr-2 h-4 w-4" /> Leave
                                    Challenge
                                  </Button>
                                ) : userChallengeInfo.find(
                                    (challenge) =>
                                      challenge.challengeId ===
                                        parseInt(item.challengeId) &&
                                      challenge.status === 4
                                  ) ? (
                                  <Button
                                    variant="outline"
                                    className="text-red-500"
                                    disabled
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> Already
                                    Left
                                  </Button>
                                ) : userChallengeInfo.find(
                                    (challenge) =>
                                      challenge.challengeId ===
                                        parseInt(item.challengeId) &&
                                      challenge.status !== 4 &&
                                      challenge.challengeRole === 0
                                  ) ? (
                                  <Button
                                    variant="outline"
                                    className="text-red-500"
                                    disabled
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> You
                                    Created This Challenge
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleJoinChallenge(id)}
                                  >
                                    <BookCheck className="mr-2 h-4 w-4" /> Join
                                    Challenge
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          <PopoverContent
                            className="w-64 text-sm"
                            side="top"
                            align="center"
                          >
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-gray-500 text-left text-sm">
                              {item.description}
                            </p>
                          </PopoverContent>
                        </Popover>
                      </motion.div>
                    ))}
                  {/* Dialog đặt ngoài map */}
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="max-w-8xl max-h-[85vh] overflow-y-auto p-6">
                      <DialogTitle className="text-2xl font-bold mb-4 text-center">
                        Challenge Details
                      </DialogTitle>
                      {selectedChallengeId && (
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1 overflow-auto">
                            <ChallengeDetails id={selectedChallengeId} />
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {cat === "My Challenges" &&
                    filteredUserChallenges.map((item) => (
                      <motion.div
                        key={item.userChallengeId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <Popover>
                          <Card
                            className="relative"
                            onClick={() => {
                              setSelectedChallengeId(item.challengeId);
                              setOpenDialog(true);
                            }}
                          >
                            <CardContent className="flex flex-col items-start p-4 cursor-pointer">
                              <p className="font-semibold">
                                {item.challengeName}
                              </p>

                              <p className="text-sm text-gray-500 flex items-center text-left mb-3">
                                {item.description}
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Reward{" "}
                                <Trophy className="ml-1" color="orange" />:
                                <span className="font-bold ml-1">
                                  {item.reward} coins
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Including:
                                {/* <Verified className="ml-1" color="navy" />: */}
                                <span className="font-bold ml-1">
                                  {item.tasks ? item.tasks.length : 0} task(s)
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Start Date:
                                <span className="font-bold ml-1">
                                  {new Date(item.startDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      second: "numeric",
                                    }
                                  )}
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                End Date:
                                <span className="font-bold ml-1">
                                  {new Date(item.endDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      second: "numeric",
                                    }
                                  )}
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Type:{" "}
                                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs ml-1">
                                  {/* get challenge type by id */}
                                  {challengeTypesData
                                    .filter(
                                      (type) =>
                                        type.challengeTypeId ===
                                        item.challengeTypeId
                                    )
                                    .map((type) => type.challengeTypeName)}
                                </span>
                              </p>

                              <div className="flex items-center mt-3">
                                {userChallengeInfo.find(
                                  (challenge) =>
                                    challenge.challengeId ===
                                      parseInt(item.challengeId) &&
                                    challenge.status !== 4 &&
                                    challenge.challengeRole >= 1
                                ) ? (
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleLeaveChallenge(item.challengeId)
                                    }
                                  >
                                    <BookX className="mr-2 h-4 w-4" /> Leave
                                    Challenge
                                  </Button>
                                ) : userChallengeInfo.find(
                                    (challenge) =>
                                      challenge.challengeId ===
                                        parseInt(item.challengeId) &&
                                      challenge.status === 4
                                  ) ? (
                                  <Button
                                    variant="outline"
                                    className="text-red-500"
                                    disabled
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> Already
                                    Left
                                  </Button>
                                ) : userChallengeInfo.find(
                                    (challenge) =>
                                      challenge.challengeId ===
                                        parseInt(item.challengeId) &&
                                      challenge.status !== 4 &&
                                      challenge.challengeRole === 0
                                  ) ? (
                                  <Button
                                    variant="outline"
                                    className="text-red-500"
                                    disabled
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> You
                                    Created This Challenge
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleJoinChallenge(id)}
                                  >
                                    <BookCheck className="mr-2 h-4 w-4" /> Join
                                    Challenge
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                          <PopoverContent
                            className="w-64 text-sm"
                            side="top"
                            align="center"
                          >
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-gray-500 text-left text-sm">
                              {item.description}
                            </p>
                          </PopoverContent>
                        </Popover>
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <Dialog
          open={openCreateChallenge}
          onOpenChange={setOpenCreateChallenge}
        >
          <DialogContent className="dialog-overlay">
            <DialogHeader className="relative bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-t-xl shadow-md">
              <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                Create New Challenge
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-100 mt-1">
                Enter your challenge details here.
              </DialogDescription>
            </DialogHeader>

            <Tabs className="w-[462px]">
              <TabsContent className="">
                <div className="space-y-1 mb-3">
                  <Label htmlFor="challengeName">Challenge Name:</Label>
                  <Input
                    id="challengeName"
                    value={newChallengeData.challengeName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1 mb-3">
                  <Label htmlFor="description">
                    Require (Conditions to be winner):
                  </Label>
                  <Input
                    id="description"
                    value={newChallengeData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1 mb-3">
                  <Label htmlFor="challengeTypeId">Type:</Label>
                  <select
                    id="challengeTypeId"
                    value={newChallengeData.challengeTypeId}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
                  >
                    <option value="" disabled>
                      Select Challenge Type
                    </option>
                    {challengeTypesData.map((type) => (
                      <option
                        key={type.challengeTypeId}
                        value={type.challengeTypeId}
                      >
                        {type.challengeTypeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 mb-3">
                  <Label htmlFor="reward" className="flex items-center gap-1">
                    Reward
                    <img
                      src="/images/coin.png"
                      alt="coin"
                      className="w-5 h-5 inline"
                    />
                    :
                  </Label>

                  {/* Nút chọn nhanh */}
                  <div className="flex gap-2 flex-wrap mb-2">
                    {[10, 20, 50, 100, 200].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setNewChallengeData({
                            ...newChallengeData,
                            reward: value,
                          })
                        }
                        className={`px-3 py-1 rounded border ${
                          newChallengeData.reward == value
                            ? "bg-yellow-400 text-white"
                            : "bg-white hover:bg-yellow-100"
                        }`}
                      >
                        {value}
                        <img
                          src="/images/coin.png"
                          alt="coin"
                          className="w-4 h-4 inline ml-1"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Ô nhập thủ công */}
                  <Input
                    id="reward"
                    type="number"
                    value={newChallengeData.reward}
                    onChange={(e) =>
                      setNewChallengeData({
                        ...newChallengeData,
                        reward: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-1 mb-3">
                  <Label htmlFor="startDate">Start Date:</Label>
                  <Input
                    type="datetime-local"
                    id="startDate"
                    value={newChallengeData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1 mb-5">
                  <Label htmlFor="endDate">End Date:</Label>
                  <Input
                    type="datetime-local"
                    id="endDate"
                    value={newChallengeData.endDate}
                    onChange={handleChange}
                  />
                </div>

                <Button
                  className="bg-[#83aa6c] text-white"
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
