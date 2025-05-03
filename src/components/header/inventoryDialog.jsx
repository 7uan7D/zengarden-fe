import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import ItemDetail from "./itemDetail";
import {
  GetBagItems,
  GetItemDetailByItemId,
  UseItem,
} from "@/services/apiServices/itemService";

const InventoryDialog = ({ open, setOpen, user }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  /* Hàm lấy dữ liệu inventory từ API, được bọc trong useCallback để tối ưu hóa */
  const fetchInventoryData = useCallback(async () => {
    try {
      /* Lấy bagId từ user, kiểm tra nếu không có thì trả về mảng rỗng */
      const bagId = user?.bag?.bagId;
      if (!bagId) {
        console.error("Bag ID is undefined");
        setInventoryItems([]);
        return [];
      }
      console.log("Bag ID:", bagId);
      /* Gọi API để lấy danh sách item trong túi (bag) */
      const bagItemsResponse = await GetBagItems(bagId);
      /* Đảm bảo dữ liệu trả về là mảng, xử lý các trường hợp dữ liệu không đúng định dạng */
      const bagItems = Array.isArray(bagItemsResponse?.data)
        ? bagItemsResponse.data
        : Array.isArray(bagItemsResponse)
        ? bagItemsResponse
        : [];

      /* Lặp qua từng bagItem để lấy chi tiết item */
      const inventoryPromises = bagItems.map(async (bagItem) => {
        const item = bagItem.item || {};
        let itemDetail = {};
        try {
          /* Gọi API để lấy chi tiết item dựa trên itemId */
          const detailResponse = await GetItemDetailByItemId(
            item.itemId || bagItem.itemId
          );
          itemDetail = detailResponse?.itemDetail || {};
        } catch (err) {
          console.warn("Không lấy được chi tiết item", item.itemId, err);
        }

        /* Tạo object chứa thông tin item để hiển thị */
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

      /* Chờ tất cả promise hoàn thành và cập nhật state */
      const inventory = await Promise.all(inventoryPromises);
      setInventoryItems(inventory);
      return inventory;
    } catch (error) {
      console.error("❌ Lỗi khi lấy inventory:", error);
      setInventoryItems([]);
      return [];
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchInventoryData().then((items) => {
        console.log("Fetched inventory items:", items);
        setInventoryItems(items);
      });
    }
  }, [open, fetchInventoryData]);

  /* Hàm xử lý hành động sử dụng item */
  const handleUseItem = async (bagItemId) => {
    try {
      /* Gọi API để sử dụng item */
      const result = await UseItem(bagItemId);
      console.log("Use item result:", result);
      /* Cập nhật lại danh sách inventory sau khi sử dụng */
      const updatedItems = await fetchInventoryData();
      setInventoryItems(updatedItems);
      toast.success("Item used successfully!");
    } catch (error) {
      console.error("Error using item:", error);
      toast.error(error.response?.data?.message || "Failed to use item!");
    }
  };

  /* Hàm chuyển đổi type ID thành tên loại item để hiển thị */
  const getTypeTextFromTypeId = (type) => {
    switch (type) {
      case 0:
      case 1:
        return "items";
      case 2:
        return "avatars";
      case 3:
        return "backgrounds";
      default:
        return "others";
    }
  };

  /* Hàm render danh sách item theo loại (type) */
  const renderInventoryList = (type) => {
    /* Lọc các item theo loại, đảm bảo inventoryItems là mảng */
    const filteredItems = Array.isArray(inventoryItems)
      ? inventoryItems.filter((item) => item.itemType === type)
      : [];

    /* Nếu không có item nào thì hiển thị thông báo */
    if (filteredItems.length === 0) {
      return <div className="p-4">No items found for {type}</div>;
    }

    /* Hiển thị danh sách item trong lưới */
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

  /* Giao diện chính của dialog */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">Inventory</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="items"
          className="flex flex-col md:flex-row h-[60vh] overflow-hidden"
        >
          {/* Danh sách các tab để chọn loại item */}
          <div className="w-full md:w-[15%] bg-gray-50 border-r overflow-y-auto">
            <TabsList className="grid grid-cols-1 gap-2 p-4 bg-gray-50">
              <TabsTrigger value="items" className="text-sm py-3">
                Items
              </TabsTrigger>
              <TabsTrigger value="backgrounds" className="text-sm py-3">
                Backgrounds
              </TabsTrigger>
              <TabsTrigger value="avatars" className="text-sm py-3">
                Avatars
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Hiển thị danh sách item theo tab được chọn */}
          <div className="w-full md:w-[50%] border-r overflow-y-auto">
            <TabsContent value="items">
              {renderInventoryList("items")}
            </TabsContent>
            <TabsContent value="backgrounds">
              {renderInventoryList("backgrounds")}
            </TabsContent>
            <TabsContent value="avatars">
              {renderInventoryList("avatars")}
            </TabsContent>
          </div>
          {/* Hiển thị chi tiết item được chọn */}
          <div className="w-full md:w-[35%] p-6 overflow-y-auto">
            <ItemDetail
              selectedItem={selectedItem}
              inventoryItems={inventoryItems}
              handleUseItem={handleUseItem}
            />
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDialog;
