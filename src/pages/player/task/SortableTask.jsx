import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

export function SortableTask({
  task,
  columnKey,
  index,
  children,
  setSelectedTask,
  setIsTaskInfoDialogOpen,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.taskId,
    disabled: task.status === 1, // Vô hiệu hóa kéo thả nếu task đang hoạt động
  });

  const style = {
    transform: isDragging ? CSS.Transform.toString(transform) : "none",
    transition: isDragging
      ? "transform 0.1s ease, opacity 0.2s ease"
      : "none",
    opacity: isDragging ? 0.7 : 1,
    cursor: isDragging ? "grabbing" : "default",
    zIndex: isDragging ? 10000 : 1,
    width: isDragging ? "100%" : "auto",
    position: isDragging ? "absolute" : "static",
    top: isDragging ? 0 : "auto",
    left: isDragging ? 0 : "auto",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      animate={{
        boxShadow: isDragging
          ? "0px 8px 16px rgba(0, 0, 0, 0.2)"
          : "none",
      }}
      transition={{ duration: 0.15 }}
      onClick={(e) => {
        // Chỉ mở dialog khi nhấp ngoài drag-handle
        if (!e.target.closest(".drag-handle")) {
          setSelectedTask(task);
          setIsTaskInfoDialogOpen(true);
        }
      }}
    >
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </motion.div>
  );
}