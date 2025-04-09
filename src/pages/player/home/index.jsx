import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, ShoppingCart, Leaf, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import "../home/index.css";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [timers, setTimers] = useState({
    daily: null,
    simple: null,
    complex: null,
  });
  const [isRunning, setIsRunning] = useState({
    daily: false,
    simple: false,
    complex: false,
  });

  const startTimer = (taskType) => {
    if (!timers[taskType]) {
      setTimers((prev) => ({ ...prev, [taskType]: 600 }));
      setIsRunning((prev) => ({ ...prev, [taskType]: true }));
    }
  };

  const toggleTimer = (taskType) => {
    setIsRunning((prev) => ({ ...prev, [taskType]: !prev[taskType] }));
  };

  const stopTimer = (taskType) => {
    setTimers((prev) => ({ ...prev, [taskType]: null }));
    setIsRunning((prev) => ({ ...prev, [taskType]: false }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach((taskType) => {
          if (isRunning[taskType] && newTimers[taskType] > 0) {
            newTimers[taskType] -= 1;
          } else if (newTimers[taskType] === 0) {
            newTimers[taskType] = null;
            setIsRunning((prev) => ({ ...prev, [taskType]: false }));
            toast.success(
              `Task '${
                taskType === "daily"
                  ? "Do exercise"
                  : taskType === "simple"
                  ? "Make Lemonade"
                  : "Workout 3 times a week"
              }' completed!`
            );
          }
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="p-6 pt-2 mt-20 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome back, {user?.username || "Farmer"}!
        </h1>
        <p className="text-gray-500 mt-1">
          Let's grow your garden and achieve your goals today.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Task Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-cyan-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Your Tasks</h2>
          </div>
          <div className="space-y-2">
            {/* Daily Task */}
            <div className="flex items-center">
              <span className="inline-block w-24 text-center py-2 bg-cyan-100 text-cyan-700 font-medium text-sm rounded-tl-lg rounded-bl-lg">
                Daily
              </span>
              <Card className="flex-1 p-4 bg-gray-50 rounded-tr-lg rounded-br-lg border-t-2 border-b-2 border-l-0 border-cyan-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-medium">Do exercise</span>
                  <div className="flex items-center gap-2">
                    {timers.daily !== null ? (
                      <>
                        <span className="text-sm text-gray-600 font-mono">
                          {formatTime(timers.daily)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-cyan-600 border-cyan-600 hover:bg-cyan-50"
                          onClick={() => toggleTimer("daily")}
                        >
                          {isRunning.daily ? "Pause" : "Resume"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => stopTimer("daily")}
                        >
                          Stop
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-cyan-600 text-white hover:bg-cyan-700"
                        onClick={() => startTimer("daily")}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Simple Task */}
            <div className="flex items-center">
              <span className="inline-block w-24 text-center py-2 bg-green-100 text-green-700 font-medium text-sm rounded-tl-lg rounded-bl-lg">
                Simple
              </span>
              <Card className="flex-1 p-4 bg-gray-50 rounded-tr-lg rounded-br-lg border-t-2 border-b-2 border-l-0 border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-medium">Make Lemonade</span>
                  <div className="flex items-center gap-2">
                    {timers.simple !== null ? (
                      <>
                        <span className="text-sm text-gray-600 font-mono">
                          {formatTime(timers.simple)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-cyan-600 border-cyan-600 hover:bg-cyan-50"
                          onClick={() => toggleTimer("simple")}
                        >
                          {isRunning.simple ? "Pause" : "Resume"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => stopTimer("simple")}
                        >
                          Stop
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-cyan-600 text-white hover:bg-cyan-700"
                        onClick={() => startTimer("simple")}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Complex Task */}
            <div className="flex items-center">
              <span className="inline-block w-24 text-center py-2 bg-purple-100 text-purple-700 font-medium text-sm rounded-tl-lg rounded-bl-lg">
                Complex
              </span>
              <Card className="flex-1 p-4 bg-gray-50 rounded-tr-lg rounded-br-lg border-t-2 border-b-2 border-l-0 border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-medium">Workout 3 times a week</span>
                  <div className="flex items-center gap-2">
                    {timers.complex !== null ? (
                      <>
                        <span className="text-sm text-gray-600 font-mono">
                          {formatTime(timers.complex)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-cyan-600 border-cyan-600 hover:bg-cyan-50"
                          onClick={() => toggleTimer("complex")}
                        >
                          {isRunning.complex ? "Pause" : "Resume"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => stopTimer("complex")}
                        >
                          Stop
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-cyan-600 text-white hover:bg-cyan-700"
                        onClick={() => startTimer("complex")}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <Button
            className="mt-6 w-full bg-cyan-600 text-white hover:bg-cyan-700"
            asChild
          >
            <Link to="/task">View All Tasks</Link>
          </Button>
        </Card>

        {/* Các widget khác giữ nguyên */}
        {/* Trees Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Your Tree</h2>
          </div>
          <div className="text-center">
            <img
              src="/tree-1.png"
              alt="Tree"
              className="w-32 h-32 mx-auto mb-4"
            />
            <p className="font-semibold text-gray-800">Oak - Level 3</p>
            <p className="text-sm text-gray-500">120 / 200 XP</p>
          </div>
          <Button
            className="mt-4 w-full bg-green-600 text-white hover:bg-green-700"
            asChild
          >
            <Link to="/tree">Manage Trees</Link>
          </Button>
        </Card>

        {/* Challenges Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Challenges
            </h2>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Stay Hydrated</p>
            <p className="text-sm text-gray-500">Reward: 71 EXP</p>
            <div className="h-16 w-16 bg-yellow-100 rounded-full mx-auto mt-4 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <Button
            className="mt-4 w-full bg-yellow-600 text-white hover:bg-yellow-700"
            asChild
          >
            <Link to="/challenges">View Challenges</Link>
          </Button>
        </Card>

        {/* Calendar Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Mar 25: Task Deadline
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Mar 28: Challenge Starts
            </li>
          </ul>
          <Button
            className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700"
            asChild
          >
            <Link to="/calendar">View Calendar</Link>
          </Button>
        </Card>

        {/* Marketplace Widget */}
        <Card className="p-6 bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Marketplace
            </h2>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 bg-purple-100 rounded-lg mx-auto mb-4"></div>
            <p className="font-semibold text-gray-800">Items Item 1</p>
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <img
                src="/src/assets/images/coin.png"
                alt="Coin"
                className="w-5 h-5 mr-1"
              />
              100
            </p>
          </div>
          <Button
            className="mt-4 w-full bg-purple-600 text-white hover:bg-purple-700"
            asChild
          >
            <Link to="/marketplace">View Marketplace</Link>
          </Button>
        </Card>
      </div>
    </motion.div>
  );
};

export default HomePage;