import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

export function DateTimePicker({ label, date, onDateChange, onTimeChange }) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const selectedDate = date ? new Date(date) : undefined;
  const formattedTime = date
    ? new Date(date).toISOString().split("T")[1].slice(0, 5)
    : "00:00";

  const handleDateSelect = useCallback(
    (newDate) => {
      onDateChange(newDate);
      setIsPopoverOpen(false);
    },
    [onDateChange]
  );

  const handleTimeChange = useCallback(
    (time) => {
      onTimeChange(time);
    },
    [onTimeChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-medium text-gray-700">{label}</Label>
      <div className="flex items-center gap-2">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[150px] h-10 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 shadow-md bg-white rounded-lg">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>

        <TimePicker
          onChange={handleTimeChange}
          value={formattedTime}
          disableClock={true}
          className="h-10 w-[100px] text-center border-gray-300 rounded-lg focus:border-green-500 focus:ring focus:ring-green-200 transition-all"
          clearIcon={null}
          clockIcon={null}
        />
      </div>
    </div>
  );
}

// phần hiển thị các tab trong task list
export function TaskColumn({
  title,
  taskList,
  columnKey,
  activeTabs,
  setActiveTabs,
  tasks,
  currentTask,
  isRunning,
  toggleTimer,
  startTimer,
  setTaskToComplete,
  setIsConfirmDialogOpen,
  setIsWorkspaceDialogOpen,
  setTaskToStart,
  setSelectedTask,
  setIsTaskInfoDialogOpen,
  formatTime,
}) {
  const filteredTasks =
    activeTabs[columnKey] === "all"
      ? taskList
      : activeTabs[columnKey] === "current"
      ? taskList.filter((task) => task.status !== 4 && task.status !== 3)
      : taskList.filter((task) => task.status === 4 || task.status === 3);

  return (
    //giao diện hiển thị các task trong task list gồm 3 tab: all, current, complete
    <motion.div
      className={`task-column ${columnKey}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-3">
        <h2>{title}</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTabs[columnKey] === "all" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setActiveTabs({ ...activeTabs, [columnKey]: "all" })
            }
          >
            All
          </Button>
          <Button
            variant={
              activeTabs[columnKey] === "current" ? "default" : "outline"
            }
            size="sm"
            onClick={() =>
              setActiveTabs({ ...activeTabs, [columnKey]: "current" })
            }
          >
            Current
          </Button>
          <Button
            variant={
              activeTabs[columnKey] === "complete" ? "default" : "outline"
            }
            size="sm"
            onClick={() =>
              setActiveTabs({ ...activeTabs, [columnKey]: "complete" })
            }
          >
            Complete
          </Button>
        </div>
      </div>
      <Separator className="mb-3" />
      <ScrollArea className="h-[400px] overflow-y-auto">
        <div className="grid gap-3">
          {filteredTasks.map((task, index) => {
            const columnTasks = tasks[columnKey];
            if (!columnTasks) return null;

            const realIndex = columnTasks.findIndex(
              (t) => t.taskId === task.taskId
            );
            if (realIndex === -1 || !columnTasks[realIndex]) {
              console.warn("Task not found or invalid realIndex:", task);
              return null;
            }

            const realTask = columnTasks[realIndex];
            const totalDurationSeconds = task.totalDuration * 60;
            const isCurrentTask =
              currentTask &&
              currentTask.column === columnKey &&
              currentTask.taskIndex === realIndex;
            const remainingTime = isCurrentTask
              ? currentTask.time
              : task.status === 4 || task.status === 3
              ? 0
              : totalDurationSeconds;
            const workDurationSeconds = task.workDuration * 60;
            const breakTimeSeconds = task.breakTime * 60;
            const cycleDuration = workDurationSeconds + breakTimeSeconds;
            const completedCycles = Math.floor(
              (totalDurationSeconds - remainingTime) / cycleDuration
            );
            const remainingInCycle =
              (totalDurationSeconds - remainingTime) % cycleDuration;

            let workProgress, breakProgress;
            if (task.status === 4 || task.status === 3) {
              const totalCycles = Math.ceil(
                totalDurationSeconds / cycleDuration
              );
              workProgress =
                (workDurationSeconds / totalDurationSeconds) *
                100 *
                totalCycles;
              breakProgress =
                (breakTimeSeconds / totalDurationSeconds) * 100 * totalCycles;
            } else {
              workProgress =
                (task.workDuration / task.totalDuration) *
                100 *
                (completedCycles +
                  (remainingInCycle < workDurationSeconds
                    ? remainingInCycle / workDurationSeconds
                    : 1));
              breakProgress =
                (task.breakTime / task.totalDuration) *
                100 *
                (completedCycles +
                  (remainingInCycle >= workDurationSeconds
                    ? (remainingInCycle - workDurationSeconds) /
                      breakTimeSeconds
                    : 0));
            }

            const isTaskRunning = isCurrentTask && isRunning;
            const isAlmostDone = remainingTime <= 10 && remainingTime > 0;
            const isOutOfTime = remainingTime <= 0;

            return (
              <TaskItem
                key={realIndex}
                task={task}
                realIndex={realIndex}
                columnKey={columnKey}
                isCurrentTask={isCurrentTask}
                remainingTime={remainingTime}
                workProgress={workProgress}
                breakProgress={breakProgress}
                workDurationSeconds={workDurationSeconds}
                cycleDuration={cycleDuration}
                remainingInCycle={remainingInCycle}
                isTaskRunning={isTaskRunning}
                isAlmostDone={isAlmostDone}
                isOutOfTime={isOutOfTime}
                realTask={realTask}
                toggleTimer={toggleTimer}
                startTimer={startTimer}
                setTaskToComplete={setTaskToComplete}
                setIsConfirmDialogOpen={setIsConfirmDialogOpen}
                setIsWorkspaceDialogOpen={setIsWorkspaceDialogOpen}
                setTaskToStart={setTaskToStart}
                setSelectedTask={setSelectedTask}
                setIsTaskInfoDialogOpen={setIsTaskInfoDialogOpen}
                formatTime={formatTime}
                currentTask={currentTask}
              />
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}

export function TaskItem({
  task,
  realIndex,
  columnKey,
  isCurrentTask,
  remainingTime,
  workProgress,
  breakProgress,
  workDurationSeconds,
  cycleDuration,
  remainingInCycle,
  isAlmostDone,
  isOutOfTime,
  realTask,
  toggleTimer,
  startTimer,
  setTaskToComplete,
  setIsConfirmDialogOpen,
  setIsWorkspaceDialogOpen,
  setTaskToStart,
  setSelectedTask,
  setIsTaskInfoDialogOpen,
  formatTime,
  currentTask,
}) {
  return (
    //giao diện hiển thị từng task trong task list, bao gồm tên task, thời gian còn lại, trạng thái task (đang chạy, đã hoàn thành, tạm dừng)
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: realIndex * 0.1 }}
    >
      <Card className="task-item">
        <div className="flex-1 flex flex-col justify-between text-left">
          <div
            className="cursor-pointer"
            onClick={() => {
              setSelectedTask(task);
              setIsTaskInfoDialogOpen(true);
            }}
          >
            <span className="text-gray-700 font-medium">
              {task.taskName}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="text-sm text-gray-600">
              Remaining: {formatTime(remainingTime)}
            </span>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="work-progress bg-blue-500"
                  style={{
                    width: `${Math.min(workProgress, 100)}%`,
                  }}
                />
                <div
                  className="break-progress bg-yellow-500"
                  style={{
                    width: `${Math.min(breakProgress, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex flex-col items-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {isCurrentTask && (
            <span className="text-sm text-gray-600">
              {remainingInCycle < workDurationSeconds
                ? `Work: ${formatTime(
                    workDurationSeconds - remainingInCycle
                  )}`
                : `Break: ${formatTime(
                    cycleDuration - remainingInCycle
                  )}`}
            </span>
          )}
          {(isAlmostDone || isOutOfTime) &&
          realTask.status !== 4 &&
          realTask.status !== 3 ? (
            <Button
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => {
                setTaskToComplete({
                  columnKey,
                  realIndex,
                  taskName: task.taskName,
                  taskId: task.taskId,
                });
                setIsConfirmDialogOpen(true);
              }}
            >
              Complete
            </Button>
          ) : task.status === 4 || task.status === 3 ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600">Done</span>
            </div>
          ) : realTask.status === 1 ? (
            <Button
              onClick={() => toggleTimer(columnKey, realIndex)}
            >
              Pause
            </Button>
          ) : realTask.status === 2 ? (
            <Button
              onClick={() => toggleTimer(columnKey, realIndex)}
            >
              Resume
            </Button>
          ) : realTask.status === 0 ? (
            <Button
              onClick={() => {
                if (columnKey === "simple") {
                  setTaskToStart({
                    column: columnKey,
                    taskIndex: realIndex,
                  });
                  setIsWorkspaceDialogOpen(true);
                } else {
                  startTimer(columnKey, realIndex);
                }
              }}
              disabled={currentTask !== null}
            >
              Start
            </Button>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}

export function TaskInfoDialog({
  isOpen,
  onOpenChange,
  selectedTask,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedTask?.taskName}</DialogTitle>
          <DialogDescription>
            {selectedTask?.taskDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <p>
            <strong>Start Date:</strong>{" "}
            {new Date(selectedTask?.startDate).toLocaleString()}
          </p>
          <p>
            <strong>End Date:</strong>{" "}
            {new Date(selectedTask?.endDate).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {selectedTask?.status === 3 ? "Completed" : "In Progress"}
          </p>
          <p>
            <strong>Focus Method:</strong> {selectedTask?.focusMethodName}
          </p>
          <p>
            <strong>Total Duration:</strong> {selectedTask?.totalDuration}{" "}
            minutes
          </p>
          <p>
            <strong>Work Duration:</strong> {selectedTask?.workDuration}{" "}
            minutes
          </p>
          <p>
            <strong>Break Time:</strong> {selectedTask?.breakTime} minutes
          </p>
          <p>
            <strong>Tree:</strong> {selectedTask?.userTreeName}
          </p>
          <p>
            <strong>Task Type:</strong> {selectedTask?.taskTypeName}
          </p>
          {selectedTask?.taskNote && (
            <p>
              <strong>Task Note:</strong> {selectedTask?.taskNote}
            </p>
          )}
          {selectedTask?.taskResult && (
            <p>
              <strong>Task Result:</strong> {selectedTask?.taskResult}
            </p>
          )}
          {selectedTask?.remainingTime !== null && (
            <p>
              <strong>Remaining Time:</strong>{" "}
              {selectedTask?.remainingTime}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TaskCreationDialog({
  isOpen,
  onOpenChange,
  taskData,
  setTaskData,
  step,
  setStep,
  focusSuggestion,
  setFocusSuggestion,
  handleNext,
  handleBack,
  handleCreateTask,
  handleDateChange,
  handleTimeChange,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white rounded-xl shadow-2xl p-6">
        <DialogHeader className="relative bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-t-xl shadow-md">
          <DialogTitle className="text-2xl font-bold text-white tracking-tight">
            {step === 3 ? "Confirm Task" : "Create Task"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-100 mt-1">
            {step === 1 && "Fill in the details for your new task."}
            {step === 2 && "Suggested focus method based on your task."}
            {step === 3 && "Review and confirm your task details."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Task Name</Label>
              <Input
                name="taskName"
                placeholder="Enter task name"
                value={taskData.taskName}
                onChange={(e) =>
                  setTaskData({ ...taskData, taskName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                name="taskDescription"
                placeholder="Describe your task"
                value={taskData.taskDescription}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    taskDescription: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                placeholder="Task duration"
                value={taskData.totalDuration}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    totalDuration: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-4">
              <DateTimePicker
                label="Start Date"
                date={taskData.startDate}
                onDateChange={(newDate) =>
                  handleDateChange("startDate", newDate)
                }
                onTimeChange={(time) =>
                  handleTimeChange("startDate", time)
                }
              />
              <DateTimePicker
                label="End Date"
                date={taskData.endDate}
                onDateChange={(newDate) =>
                  handleDateChange("endDate", newDate)
                }
                onTimeChange={(time) => handleTimeChange("endDate", time)}
              />
            </div>
          </div>
        )}

        {step === 2 && focusSuggestion && (
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold">
                {focusSuggestion.focusMethodName}
              </p>
              <p>XP Multiplier: {focusSuggestion.xpMultiplier}</p>
              <p className="text-sm text-gray-500">
                Min Duration: {focusSuggestion.minDuration} mins, Max
                Duration: {focusSuggestion.maxDuration} mins
              </p>
              <p className="text-sm text-gray-500">
                Min Break: {focusSuggestion.minBreak} mins, Max Break:{" "}
                {focusSuggestion.maxBreak} mins
              </p>
            </div>
            <div>
              <Label>Work Duration (minutes)</Label>
              <Input
                type="number"
                min={focusSuggestion.minDuration}
                max={focusSuggestion.maxDuration}
                value={taskData.workDuration}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    workDuration: Number(e.target.value),
                  })
                }
              />
              <p className="text-sm text-gray-500">
                Recommended: {focusSuggestion.defaultDuration} mins
              </p>
            </div>
            <div>
              <Label>Break Time (minutes)</Label>
              <Input
                type="number"
                min={focusSuggestion.minBreak}
                max={focusSuggestion.maxBreak}
                value={taskData.breakTime}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    breakTime: Number(e.target.value),
                  })
                }
              />
              <p className="text-sm text-gray-500">
                Recommended: {focusSuggestion.defaultBreak} mins
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p>
              <strong>Task Name:</strong> {taskData.taskName}
            </p>
            <p>
              <strong>Description:</strong> {taskData.taskDescription}
            </p>
            <p>
              <strong>Total Duration:</strong> {taskData.totalDuration}{" "}
              minutes
            </p>
            <p>
              <strong>Start Date:</strong> {taskData.startDate.toString()}
            </p>
            <p>
              <strong>End Date:</strong> {taskData.endDate.toString()}
            </p>
            <p>
              <strong>Focus Method:</strong>{" "}
              {focusSuggestion?.focusMethodName}
            </p>
            <p>
              <strong>Work Duration:</strong> {taskData.workDuration}{" "}
              minutes
            </p>
            <p>
              <strong>Break Time:</strong> {taskData.breakTime} minutes
            </p>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button
              variant="ghost"
              className="bg-white border-black"
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          {step < 3 && (
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
          {step === 3 && (
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => handleCreateTask(taskData)}
            >
              Create
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}