import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Play,
  BookCheck,
  BookX,
  Plus,
  Verified,
  Beaker,
  Check,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { motion } from "framer-motion";

const categories = ["My Challenges", "Get Challenges"];

const userChallengesData = [
  {
    id: 1,
    name: "Taking Surveys",
    reward: 42,
    creator: "Red Cross",
    createdDate: "2021-09-01",
  },
];

const challengesData = [
  {
    id: 1,
    name: "Taking Surveys",
    reward: 42,
    creator: "Red Cross",
    createdDate: "2021-09-01",
    types: ["Survey", "Research"],
    description:
      "Participate in short surveys 📓 to contribute to important research and earn rewards. Help make a difference while getting paid!",
  },
  {
    id: 2,
    name: "Stay Hydrated Challenge",
    reward: 71,
    creator: "Blue Sky",
    createdDate: "2021-09-01",
    types: ["Health", "Wellness"],
    description:
      "Boost your energy, focus, and health by drinking enough water every day! Stay refreshed and feel your best. 🌊💙",
  },
  {
    id: 3,
    name: "Be Happy Challenge",
    reward: 66,
    creator: "Yellow",
    createdDate: "2021-09-01",
    types: ["Happiness", "Wellness"],
    description:
      "Embark on a happiness adventure where you complete daily missions to boost your mood, spread positivity, and build lasting joy. Happiness is a skill—let’s level it up! 🌈🚀",
  },
  {
    id: 4,
    name: "Movie of the Week",
    reward: 51,
    creator: "Ollivander",
    createdDate: "2021-09-01",
    types: ["Entertainment", "Film"],
    description:
      "Watch the selected movie of the week and engage in discussions with other participants. Expand your cinematic horizons and connect with fellow film enthusiasts.",
  },
  {
    id: 5,
    name: "Music Challenge",
    reward: 22,
    creator: "Overture",
    createdDate: "2021-09-01",
    types: ["Entertainment", "Music"],
    description:
      "🎵 Listen to the selected music of the week and share your thought with other participants.",
  },
];

const challengeTypesData = [
  "Health",
  "Happiness",
  "Wellness",
  "Survey",
  "Research",
  "Entertainment",
  "Film",
  "Music",
  "Art",
  "Reading",
  "Writing",
  "Learning",
  "Fitness",
  // "Nutrition",
  // "Meditation",
  // "Sleep",
  // "Creativity",
  // "Technology",
];

export default function Challenges() {
  const [search, setSearch] = useState("");
  const [filteredChallengeTypes, setFilteredChallengeTypes] =
    useState(challengeTypesData);
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    const filtered = challengeTypesData.filter(
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

  const filteredChallenges = challengesData.filter((item) => {
    if (typeFilters.length === 0) return true;
    return typeFilters.some((type) => item.types.includes(type));
  });

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

          {/* <div className="flex justify-between items-center mb-4">
                        <p/>
                        <Button className="bg-green-600 text-white hover:bg-green-700">
                            <Plus className="h-4 w-4" />
                            Create Challenges
                        </Button>
                    </div> */}

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
                  {filteredChallenges.map((item) => {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <Popover>
                          <Card className="relative">
                            {item.id === 1 && cat === "Get Challenges" && (
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

                              <p className="font-semibold">{item.name}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                Reward:
                                <Beaker className="ml-1" color="darkcyan" />
                                <span className="font-bold ml-1">
                                  {item.reward} EXP
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Created by:
                                <span className="font-bold ml-1">
                                  {item.creator}
                                </span>
                                <Verified className="ml-1" color="navy" />
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Created Date:
                                <span className="font-bold ml-1">
                                  {item.createdDate}
                                </span>
                              </p>

                              <p className="text-sm text-gray-500 flex items-center">
                                Types:{" "}
                                {item.types.map((type) => (
                                  <span
                                    key={type}
                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs ml-1"
                                  >
                                    {type}
                                  </span>
                                ))}
                              </p>

                              <p className="text-sm text-gray-500 flex items-center text-left">
                                {item.description}
                              </p>

                              {cat === "My Challenges" ? (
                                <Button className="mt-2" variant="outline">
                                  <BookX className="mr-2 h-4 w-4" /> Leave
                                  Challenge
                                </Button>
                              ) : (
                                <Button className="mt-2" variant="outline">
                                  <BookCheck className="mr-2 h-4 w-4" /> Get
                                  Challenge
                                </Button>
                              )}
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
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
