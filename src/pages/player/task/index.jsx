import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const tasks = {
  simple: ["Drink water", "Read 10 pages", "Meditate"],
  complex: [
    "Finish project report",
    "Workout 3 times a week",
    "Plan monthly budget",
  ],
  done: ["Submit assignment", "Clean the house"],
};

export default function TaskPage() {
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskType, setTaskType] = useState("");

  const handleOpen = (type) => {
    setTaskType(type);
    setIsTaskDialogOpen(true);
  };

  return (
    <motion.div
      className="p-6 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md">
        <Header />
      </div>
      <div className="pt-20">
        <div className="bg-white text-black p-6 rounded-lg shadow-md mb-6 flex items-center gap-6 relative mt-6">
          <div className="absolute top-3 left-[7%] transform -translate-x-1/2">
            <a
              href="#"
              className="text-black text-sm hover:underline"
              onClick={() => setIsTreeDialogOpen(true)}
            >
              Change Tree &gt;
            </a>

            <Dialog open={isTreeDialogOpen} onOpenChange={setIsTreeDialogOpen}>
              <DialogContent className="max-w-xl w-full flex gap-4 justify-center p-6">
                {[1, 2].map((tree) => (
                  <div
                    key={tree}
                    className="p-4 bg-white rounded-lg shadow-lg w-48 text-center cursor-pointer transition-transform hover:scale-105"
                    onClick={() => alert(`Bạn đã chọn cây ${tree}`)}
                  >
                    <img
                      src={`/tree-${tree}.png`}
                      alt={`Tree ${tree}`}
                      className="w-20 h-20 mx-auto"
                    />
                    <h3 className="font-bold mt-2">Tree {tree}</h3>
                    <p>Level: {tree * 2}</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${tree * 30}%` }}
                      />
                    </div>
                  </div>
                ))}
              </DialogContent>
            </Dialog>
          </div>
          <div className="w-24 h-24 bg-gray-300 rounded-full relative"></div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Tree Name - Level 3</h2>
            <p className="text-sm mt-2">Experience</p>
            <Progress value={40} max={100} className="h-2 bg-[#83aa6c]" />
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
          </div>
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

      <div className="grid grid-cols-3 gap-4">
        <TaskColumn title="Simple Task" tasks={tasks.simple} />
        <TaskColumn title="Complex Task" tasks={tasks.complex} />
        <TaskColumn title="Complete Task" tasks={tasks.done} isDone />
      </div>
    </motion.div>
  );
}

function TaskColumn({ title, tasks, isDone }) {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-4 flex flex-col"
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
                {!isDone && <Button size="sm">Start Task</Button>}
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
