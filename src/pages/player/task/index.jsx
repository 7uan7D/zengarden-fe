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
import { GetAllTrees } from "@/services/apiServices/treesService";
import { CreateUserTree } from "@/services/apiServices/userTreesService";
import { toast } from "sonner";
import parseJwt from "@/services/parseJwt";
import { useUserExperience } from "@/context/UserExperienceContext";
import { useTreeExperience } from "@/context/TreeExperienceContext";

export default function TaskPage() {
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskType, setTaskType] = useState("");
  const [currentTree, setCurrentTree] = useState(0);
  const [userTrees, setUserTrees] = useState([]);
  const [trees, setTrees] = useState([]);

  const selectedTree = userTrees.find(
    (tree) => tree.userTreeId === currentTree
  );
  const treeLevel = selectedTree?.levelId;
  const finalTreeId = selectedTree?.finalTreeId;
  const selectedFinalTree = trees.find((t) => t.treeId === finalTreeId);
  const treeImageSrc =
    treeLevel && treeLevel < 4
      ? `/src/assets/images/lv${treeLevel}.png`
      : selectedFinalTree?.imageUrl || "/src/assets/images/default.png";
  const [newTreeName, setNewTreeName] = useState("");
  const [isCreateTreeDialogOpen, setIsCreateTreeDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { refreshXp } = useUserExperience();
  const { treeExp, refreshTreeExp } = useTreeExperience();

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const allTrees = await GetAllTrees();
        setTrees(allTrees);
      } catch (error) {
        console.error("Error fetching trees:", error);
      }
    };

    fetchTrees();
  }, []);

  useEffect(() => {
    if (currentTree) {
      (async () => {
        await refreshTreeExp(currentTree);
      })();
    }
  }, [currentTree]);

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

  const handleCreateTree = async () => {
    try {
      setIsCreating(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in!");
        return;
      }

      const userId = parseJwt(token).sub;
      const result = await CreateUserTree(userId, newTreeName);

      if (result) {
        toast.success("Tree created successfully!");
        setIsCreateTreeDialogOpen(false);
        setNewTreeName("");
        const updatedUserTrees = await GetUserTreeByUserId(userId);
        setUserTrees(updatedUserTrees);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the tree!");
    } finally {
      setIsCreating(false);
      refreshXp();
      refreshTreeExp(currentTree);
    }
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
          <div
            className="relative cursor-pointer"
            onClick={() => {
              if (userTrees.length === 0) {
                // Nếu chưa có cây, mở luôn dialog tạo cây
                setIsTreeDialogOpen(false);
                setIsCreateTreeDialogOpen(true);
              } else {
                // Nếu có rồi thì mở dialog chọn cây
                setIsTreeDialogOpen(true);
              }
            }}
          >
            <img
              src={userTrees.length > 0 ? treeImageSrc : addIcon}
              className="w-32 h-32 mx-auto hover:scale-105 transition-transform rounded-full border-4 border-green-300 shadow-md"
            />
          </div>

          {/* Dialog chọn cây */}
          <Dialog open={isTreeDialogOpen} onOpenChange={setIsTreeDialogOpen}>
            <DialogContent className="max-w-xl w-full flex gap-4 justify-center p-6 flex-wrap">
              <DialogTitle className="text-center w-full">
                Choose your tree
              </DialogTitle>

              {userTrees
                .filter((tree) => tree.treeStatus === "Growing")
                .map((tree) => {
                  const totalNeeded = tree.totalXp + tree.xpToNextLevel;
                  const progress =
                    totalNeeded > 0 ? (tree.totalXp / totalNeeded) * 100 : 0;

                  const finalTree = trees.find(
                    (t) => t.treeId === tree.finalTreeId
                  );
                  const treeImageSrc =
                    tree.levelId < 4
                      ? `/src/assets/images/lv${tree.levelId}.png`
                      : finalTree?.imageUrl || "/src/assets/images/default.png";

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
                        src={treeImageSrc}
                        alt={`${tree.name}`}
                        className="w-20 h-20 mx-auto rounded-full border-2 border-green-300 shadow-sm"
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

              {/* Chỉ hiện AddIcon nếu cây đang Growing < 2 */}
              {userTrees.filter((tree) => tree.treeStatus === "Growing")
                .length < 2 && (
                <div
                  className="p-4 bg-white rounded-lg shadow-lg w-48 text-center cursor-pointer transition-transform hover:scale-105 flex flex-col items-center justify-center"
                  onClick={() => {
                    setIsTreeDialogOpen(false);
                    setIsCreateTreeDialogOpen(true);
                  }}
                >
                  <img
                    src={addIcon}
                    alt="Add New Tree"
                    className="w-20 h-20 mx-auto opacity-80 hover:opacity-100"
                  />
                  <h3 className="font-bold mt-2 text-green-600">
                    Create New Tree
                  </h3>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* dialog tạo cây */}
          <Dialog
            open={isCreateTreeDialogOpen}
            onOpenChange={setIsCreateTreeDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new tree</DialogTitle>
                <DialogDescription>Fill in the tree details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="treeName">Tree Name</Label>
                <Input
                  id="treeName"
                  placeholder="Enter tree name"
                  value={newTreeName}
                  onChange={(e) => setNewTreeName(e.target.value)}
                />
                <Button
                  onClick={handleCreateTree}
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Thông tin cây và trang */}
          <div className="flex-1">
            {selectedTree ? (
              <>
                <h2 className="text-3xl font-bold text-[#609994] tracking-wide flex items-center gap-3">
                  {selectedTree.name}
                  <span className="text-base font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shadow-inner">
                    Level {selectedTree.levelId}
                  </span>
                </h2>

                {treeExp && (
                  <div className="relative w-full mt-3 h-4 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      style={{
                        width: `${
                          (treeExp.totalXp /
                            (treeExp.totalXp + treeExp.xpToNextLevel)) *
                          100
                        }%`,
                      }}
                      className="h-full bg-gradient-to-r from-[#a1d99b] via-[#f9d976] to-[#f49a8c] rounded-full"
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 drop-shadow-sm">
                      {selectedTree.levelId === 4
                        ? "Level Max"
                        : `${treeExp.totalXp} / ${
                            treeExp.totalXp + treeExp.xpToNextLevel
                          } XP`}
                    </span>
                  </div>
                )}

                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">
                    Equipped Items:
                  </span>
                  {[1, 2, 3].map((item) => (
                    <span
                      key={item}
                      className="text-xs bg-[#83aa6c] text-white px-3 py-1 rounded-full shadow hover:opacity-90 transition"
                    >
                      Item {item}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm italic text-gray-500">
                Haven't chosen any tree yet
              </p>
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
              <DropdownMenuItem onClick={() => handleOpen("Daily Task")}>
                Daily Task
              </DropdownMenuItem>
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
