import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const InventoryItemCard = ({ item, onSelect, isSelected }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelect(item)}
            className={`p-4 flex flex-col items-center gap-2 cursor-pointer rounded-lg transition-all ${
              isSelected
                ? "bg-green-100 border-green-500"
                : "hover:bg-gray-100 border-gray-200"
            } border`}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{item.name}</p>
          <p className="text-sm text-gray-600">{item.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InventoryItemCard;