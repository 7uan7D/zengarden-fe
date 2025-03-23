import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import addIcon from "@/assets/images/add.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { GetUserTreeByUserId } from "@/services/apiServices/userTreesService";
import parseJwt from "@/services/parseJwt";

export default function TaskPage() {
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskType, setTaskType] = useState("");
  const [currentTree, setCurrentTree] = useState(0);
  const [userTrees, setUserTrees] = useState([]);
  const selectedTree = userTrees.find(
    (tree) => tree.userTreeId === currentTree
  );
  useEffect(() => {
    const fetchTrees = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const userId = parseJwt(token).sub;
        const responseData = await GetUserTreeByUserId(userId);
        if (responseData) {
          setUserTrees(responseData);
        }
      }
    };

    fetchTrees();
  }, []);

  useEffect(() => {
    if (userTrees.length > 0) {
      const savedTreeId = localStorage.getItem("selectedTreeId");
      const found = userTrees.find(
        (tree) => tree.userTreeId === parseInt(savedTreeId)
      );
      if (found) {
        setCurrentTree(found.userTreeId);
      } else {
        // Nếu không tìm thấy cây đã lưu, mặc định chọn cây đầu tiên
        setCurrentTree(userTrees[0].userTreeId);
        localStorage.setItem("selectedTreeId", userTrees[0].userTreeId);
      }
    }
  }, [userTrees]);
  const tasks = {
    daily: ["Do exercise", "Drink water", "Clean room"],
    simple: ["Make lemonade", "Read 10 pages", "Meditate"],
    complex: [
      "Finish project report",
      "Workout 3 times a week",
      "Plan monthly budget",
    ],
    done: ["Submit assignment", "Clean the house"],
  };
  const handleOpen = (type) => {
    setTaskType(type);
    setIsTaskDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setIsTreeDialogOpen(true);
  };

  return (
    <motion.div
      className="p-6 max-w-full mx-auto w-full" // Thay max-w-6xl thành max-w-full và thêm w-full
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md"></div>
      <div className="pt-20">
        <div className="bg-[#CCFFCC] text-black p-6 rounded-lg shadow-md mb-6 flex items-center gap-6 relative mt-6">
          {/* Hình cây */}
          <div className="relative cursor-pointer" onClick={handleOpenDialog}>
            <img
              src={currentTree ? `/tree-${currentTree}.png` : addIcon}
              alt="Your Tree"
              className="w-32 h-32 mx-auto hover:scale-105 transition-transform"
            />
          </div>

          {/* Dialog chọn cây */}
          <Dialog open={isTreeDialogOpen} onOpenChange={setIsTreeDialogOpen}>
            <DialogContent className="max-w-xl w-full flex gap-4 justify-center p-6 flex-wrap">
              <DialogTitle className="text-center w-full">
                Choose your tree
              </DialogTitle>

              {userTrees.map((tree) => {
                const totalNeeded = tree.totalXp + tree.xpToNextLevel;
                const progress =
                  totalNeeded > 0 ? (tree.totalXp / totalNeeded) * 100 : 0;

                return (
                  <div
                    key={tree.userTreeId}
                    className="p-4 bg-white rounded-lg shadow-lg w-48 text-center cursor-pointer transition-transform hover:scale-105"
                    onClick={() => {
                      setCurrentTree(tree.userTreeId);
                      localStorage.setItem("selectedTreeId", tree.userTreeId);
                      setIsTreeDialogOpen(false);
                    }}
                  >
                    <img
                      src={`/tree-${tree.userTreeId}.png`} // hoặc thay bằng ảnh mặc định
                      alt={`${tree.name}`}
                      className="w-20 h-20 mx-auto"
                    />
                    <h3 className="font-bold mt-2">{tree.name}</h3>
                    <p>Level: {tree.levelId}</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm mt-1">
                      XP: {tree.totalXp} / {totalNeeded}
                    </p>
                  </div>
                );
              })}
            </DialogContent>
          </Dialog>

          {/* Thông tin cây và trang */}
          <div className="flex-1">
            {selectedTree ? (
              <>
                <h2 className="text-xl font-bold">
                  {selectedTree.name} - Level {selectedTree.levelId}
                </h2>
                <p className="text-sm mt-2 font-semibold">Experience</p>
                <div className="relative w-full h-4 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-[#83aa6c] transition-all duration-700 ease-out"
                    style={{
                      width: `${
                        (selectedTree.totalXp /
                          (selectedTree.totalXp + selectedTree.xpToNextLevel)) *
                        100
                      }%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
                    style={{
                      left: `min(calc(${
                        (selectedTree.totalXp /
                          (selectedTree.totalXp + selectedTree.xpToNextLevel)) *
                        100
                      }% - 40px), calc(100% - 86px))`,
                      // 80px là chiều rộng ước tính của box, căn chỉnh cho không bị tràn
                    }}
                  >
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded-full shadow-md border border-gray-300 whitespace-nowrap">
                      {selectedTree.totalXp} /{" "}
                      {selectedTree.totalXp + selectedTree.xpToNextLevel} XP
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-sm">Equipped Items:</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                    Item 1
                  </span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                    Item 2
                  </span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                    Item 3
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm italic">Haven't chosen any tree yet</p>
            )}
          </div>

          {/* Button tạo task */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="absolute right-6 top-6 bg-black text-white hover:bg-gray-800">
                Create Task
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpen("Simple Task")}>
                Simple Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpen("Complex Task")}>
                Complex Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dialog tạo task */}
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create {taskType}</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new task.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Task Name</Label>
                  <Input placeholder="Enter task name" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your task" />
                </div>
                <div>
                  <Label>Base XP</Label>
                  <Input type="number" placeholder="Enter XP amount" />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" placeholder="Task duration" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setIsTaskDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-green-600 text-white hover:bg-green-700">
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 w-full">
        {" "}
        {/* Thay grid-cols-3 thành grid-cols-4 và thêm w-full */}
        <TaskColumn title="Daily Task" tasks={tasks.daily} />
        <TaskColumn title="Simple Task" tasks={tasks.simple} />
        <TaskColumn title="Complex Task" tasks={tasks.complex} />
        <TaskColumn title="Complete Task" tasks={tasks.done} isDone />
      </div>
    </motion.div>
  );
}

function TaskColumn({ title, tasks, isDone }) {
  const [timers, setTimers] = useState({});
  const [running, setRunning] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTaskIndex, setPendingTaskIndex] = useState(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const isAnyTaskRunning = () => {
    return Object.values(timers).some((time) => time > 0);
  };

  const startTimer = (taskIndex) => {
    if (isAnyTaskRunning() && !timers[taskIndex]) {
      setPendingTaskIndex(taskIndex);
      setDialogOpen(true);
    } else {
      setTimers((prev) => ({
        ...prev,
        [taskIndex]: 600,
      }));
      setRunning((prev) => ({
        ...prev,
        [taskIndex]: true,
      }));
    }
  };

  const stopAllTimers = () => {
    setTimers({});
    setRunning({});
  };

  const handleSwitchTask = () => {
    stopAllTimers();
    startTimer(pendingTaskIndex);
    setDialogOpen(false);
    setPendingTaskIndex(null);
  };

  const handleKeepCurrentTask = () => {
    setDialogOpen(false);
    setPendingTaskIndex(null);
  };

  const toggleTimer = (taskIndex) => {
    setRunning((prev) => ({
      ...prev,
      [taskIndex]: !prev[taskIndex],
    }));
  };

  const stopTimer = (taskIndex) => {
    setTimers((prev) => {
      const newTimers = { ...prev };
      delete newTimers[taskIndex];
      return newTimers;
    });
    setRunning((prev) => {
      const newRunning = { ...prev };
      delete newRunning[taskIndex];
      return newRunning;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach((taskIndex) => {
          if (running[taskIndex] && newTimers[taskIndex] > 0) {
            newTimers[taskIndex] -= 1;
          } else if (newTimers[taskIndex] === 0) {
            delete newTimers[taskIndex];
            setRunning((prev) => {
              const newRunning = { ...prev };
              delete newRunning[taskIndex];
              return newRunning;
            });
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-full" // Thêm h-full để đảm bảo cột đầy chiều cao
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <Separator className="mb-3" />
      <ScrollArea className="h-[400px] overflow-y-auto">
        <div className="grid gap-3">
          {tasks.map((task, index) => (
            <motion.div
              key={index}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-4 flex justify-between items-center">
                <span>{task}</span>
                {isDone ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600">Completed</span>
                  </div>
                ) : timers[index] !== undefined ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                      onClick={() => toggleTimer(index)}
                    >
                      {formatTime(timers[index])}{" "}
                      {running[index] ? "(Pause)" : "(Resume)"}
                    </span>
                    <Button
                      size="sm"
                      className="bg-gray-900 text-white hover:bg-gray-700"
                      onClick={() => stopTimer(index)}
                    >
                      Stop
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => startTimer(index)}>
                    Start Task
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Task</DialogTitle>
            <DialogDescription>
              Do you want to stop the current task and switch to a new one?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleKeepCurrentTask}>
              No
            </Button>
            <Button onClick={handleSwitchTask}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
