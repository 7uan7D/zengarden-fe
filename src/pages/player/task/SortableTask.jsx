import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion"; // nếu bạn muốn hiệu ứng mượt hơn

export function SortableTask({ task, columnKey, index, children, overId }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.taskId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOver = task.taskId === overId;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      animate={{
        scale: isOver ? 1.05 : 1,
        boxShadow: isOver
          ? "0px 0px 0px 2px #22c55e"
          : "0px 0px 0px 0px transparent",
        zIndex: isOver ? 10 : 1,
      }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
