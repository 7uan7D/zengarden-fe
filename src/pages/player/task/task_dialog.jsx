// components/DialogComponents.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CompleteTask } from "@/services/apiServices/taskService";

export function ConfirmCompletionDialog({
  isConfirmDialogOpen,
  setIsConfirmDialogOpen,
  taskToComplete,
  setTaskToComplete,
  selectedTree,
  tasks,
  setTasks,
  currentTask,
  setCurrentTask,
  setIsRunning,
  refreshTreeExp,
  currentTree,
  fetchTasks,
}) {
  return (
    //Dialog xác nhận hoàn thành task.
    <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Completion</DialogTitle>
          <DialogDescription>
            Do you want to complete <b>{taskToComplete?.taskName}</b> to grow the tree <b>{selectedTree?.name}</b>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await CompleteTask(taskToComplete.taskId, selectedTree.userTreeId);
              const updated = { ...tasks };
              updated[taskToComplete.columnKey] = [...updated[taskToComplete.columnKey]];
              updated[taskToComplete.columnKey][taskToComplete.realIndex] = {
                ...updated[taskToComplete.columnKey][taskToComplete.realIndex],
                status: 4,
              };
              setTasks(updated);
              if (
                currentTask &&
                currentTask.column === taskToComplete.columnKey &&
                currentTask.taskIndex === taskToComplete.realIndex
              ) {
                setCurrentTask(null);
                setIsRunning(false);
              }
              setIsConfirmDialogOpen(false);
              setTaskToComplete(null);
              await refreshTreeExp(currentTree);
              await fetchTasks(selectedTree?.userTreeId);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WorkspaceSwitchDialog({
  isWorkspaceDialogOpen,
  setIsWorkspaceDialogOpen,
  taskToStart,
  setTaskToStart,
  startTimer,
}) {
  return (
    //Dialog xác nhận chuyển sang workspace.
    <Dialog
      open={isWorkspaceDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsWorkspaceDialogOpen(false);
          setTaskToStart(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch to Workspace?</DialogTitle>
          <DialogDescription>
            Do you want to switch to the Workspace to continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              startTimer(taskToStart.column, taskToStart.taskIndex);
              setIsWorkspaceDialogOpen(false);
              setTaskToStart(null);
            }}
          >
            No
          </Button>
          <Button
            onClick={() => {
              startTimer(taskToStart.column, taskToStart.taskIndex);
              setIsWorkspaceDialogOpen(false);
              setTaskToStart(null);
              window.location.href = "/workspace";
            }}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}