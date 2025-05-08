import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CancelUseItem } from "@/services/apiServices/itemService";
import { useEffect, useState } from "react";

const ItemDetail = ({
  selectedItem,
  inventoryItems,
  handleUseItem,
  fetchInventoryData,
  setSelectedItem,
  setInventoryItems,
}) => {
  if (!selectedItem) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <p className="text-gray-500">Select an item to view details</p>
      </div>
    );
  }

  const isOwned = selectedItem.quantity > 0;
  const isEquippable =
    selectedItem?.itemType === "avatars" ||
    selectedItem?.itemType === "backgrounds" ||
    selectedItem?.itemType === "music" ||
    selectedItem?.itemType === "items";
  const isItemType = selectedItem?.itemType === "items";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center gap-4"
    >
      <img
        src={selectedItem.image}
        alt={selectedItem.name}
        className="w-32 h-32 object-cover rounded-lg"
      />
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800">{selectedItem.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{selectedItem.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          {isOwned ? `Quantity: ${selectedItem.quantity}` : "Not Owned"}
        </p>
        {selectedItem.isEquipped && isOwned && (
          <p className="text-sm text-green-600 font-medium mt-1">
            Currently Equipped
          </p>
        )}
      </div>

      {isOwned ? (
        selectedItem.isEquipped ? (
          <Button
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            onClick={async () => {
              try {
                await CancelUseItem(selectedItem.bagItemId);
                const updatedItems = await fetchInventoryData();
                setInventoryItems(updatedItems);
                setSelectedItem({ ...selectedItem, isEquipped: false });
                console.log("Item unequipped successfully");
              } catch (error) {
                console.error("Unequip failed:", error);
              }
            }}
          >
            Unequip
          </Button>
        ) : (
          <Button
            className="mt-4 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            onClick={() => handleUseItem(selectedItem.bagItemId)}
          >
            {isEquippable ? "Equip" : "Use"}
          </Button>
        )
      ) : (
        <Button
          variant="outline"
          className="mt-4 text-green-600 border-green-600 hover:bg-green-50"
        >
          Purchase
        </Button>
      )}
    </motion.div>
  );
};

export default ItemDetail;
