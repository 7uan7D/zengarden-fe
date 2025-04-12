import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ItemDetail from "./ItemDetail";
import { GetBagItems, GetItemDetailByItemId } from "@/services/apiServices/itemService";

const InventoryDialog = ({ open, setOpen, user }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchInventoryData = async () => {
    try {
      const bagId = user?.bag?.bagId;
      console.log("Bag ID:", bagId);

      const bagItemsResponse = await GetBagItems(bagId);
      const bagItems = bagItemsResponse?.data || bagItemsResponse || [];

      const inventoryPromises = bagItems.map(async (bagItem) => {
        const item = bagItem.item || {};
        let itemDetail = {};
        try {
          const detailResponse = await GetItemDetailByItemId(
            item.itemId || bagItem.itemId
          );
          itemDetail = detailResponse?.itemDetail || {};
        } catch (err) {
          console.warn("Không lấy được chi tiết item", item.itemId, err);
        }

        return {
          bagItemId: bagItem.bagItemId,
          itemId: item.itemId || bagItem.itemId,
          name: item.name || "Unknown",
          image: itemDetail.mediaUrl || "/images/fallback.png",
          itemType: getTypeTextFromTypeId(item.type),
          quantity: bagItem.quantity || 0,
          isEquipped: bagItem.isEquipped,
          rarity: item.rarity,
          cost: item.cost,
          effect: itemDetail.effect,
          duration: itemDetail.duration,
          isUnique: itemDetail.isUnique,
        };
      });

      const inventory = await Promise.all(inventoryPromises);
      setInventoryItems(inventory);
    } catch (error) {
      console.error("❌ Lỗi khi lấy inventory:", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchInventoryData();
    }
  }, [open]);

  const getTypeTextFromTypeId = (type) => {
    switch (type) {
      case 0:
      case 1:
        return "items";
      case 2:
        return "avatars";
      case 3:
        return "backgrounds";
      case 4:
        return "music";
      default:
        return "others";
    }
  };

  const renderInventoryList = (type) => {
    const filteredItems = inventoryItems.filter(
      (item) => item.itemType === type
    );

    if (filteredItems.length === 0) {
      return <div className="p-4">No items found for {type}</div>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {filteredItems.map((item) => (
          <div
            key={item.itemId}
            className="border rounded-xl p-3 cursor-pointer hover:bg-gray-100"
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-24 object-cover rounded"
            />
            <div className="mt-2 font-semibold text-sm truncate">
              {item.name}
            </div>
            <div className="text-xs text-gray-500">x{item.quantity}</div>
            {item.isEquipped && (
              <div className="text-xs text-green-600 font-medium">Equipped</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">Inventory</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="trees"
          className="flex flex-col md:flex-row h-[60vh] overflow-hidden"
        >
          <div className="w-full md:w-[15%] bg-gray-50 border-r overflow-y-auto">
            <TabsList className="grid grid-cols-1 gap-2 p-4 bg-gray-50">
              <TabsTrigger value="items" className="text-sm py-3">
                Items
              </TabsTrigger>
              <TabsTrigger value="backgrounds" className="text-sm py-3">
                Backgrounds
              </TabsTrigger>
              <TabsTrigger value="music" className="text-sm py-3">
                Music
              </TabsTrigger>
              <TabsTrigger value="avatars" className="text-sm py-3">
                Avatars
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="w-full md:w-[50%] border-r overflow-y-auto">
            <TabsContent value="items">{renderInventoryList("items")}</TabsContent>
            <TabsContent value="backgrounds">{renderInventoryList("backgrounds")}</TabsContent>
            <TabsContent value="music">{renderInventoryList("music")}</TabsContent>
            <TabsContent value="avatars">{renderInventoryList("avatars")}</TabsContent>
          </div>
          <div className="w-full md:w-[35%] p-6 overflow-y-auto">
            <ItemDetail selectedItem={selectedItem} inventoryItems={inventoryItems} setInventoryItems={setInventoryItems} />
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDialog;