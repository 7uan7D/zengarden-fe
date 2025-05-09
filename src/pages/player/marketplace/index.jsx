import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ShoppingCart, Play, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { GetTradeByStatus } from "@/services/apiServices/treesService";
import { GetAllTrees } from "@/services/apiServices/treesService";
import { GetAllItems } from "@/services/apiServices/itemService";
import { BuyItem } from "@/services/apiServices/itemService";
import { GetBagItems } from "@/services/apiServices/itemService";
import { GetUserInfo } from "@/services/apiServices/userService";
import parseJwt from "@/services/parseJwt";
import { toast } from "sonner";
import TradeDialog from "./TradeDialog";
import { GetAllPackages } from "@/services/apiServices/packageService";
import { PayPackage } from "@/services/apiServices/packageService";
import { GetAllTransaction } from "@/services/apiServices/transactionService";

// Danh sách các danh mục
const categories = [
  "Items",
  "Avatar",
  "Background",
  "Music",
  "Trade",
  "Package",
  "Transaction",
];

const rarityColorMap = {
  common: "text-gray-600",
  rare: "text-blue-600",
  epic: "text-purple-800",
  legendary: "text-orange-500",
};

const rarityOrder = {
  Legendary: 4,
  Epic: 3,
  Rare: 2,
  Common: 1,
};

// Dữ liệu cứng cho các gói nạp
const packageData = [
  { price: "20.000đ", coins: 200, image: "/images/coin.png" },
  { price: "50.000đ", coins: 500, image: "/images/bunch_coin_1.png" },
  { price: "100.000đ", coins: 1000, image: "/images/bunch_coin_2.png" },
  { price: "200.000đ", coins: 2000, image: "/images/bag_coin.png" },
  { price: "500.000đ", coins: 5000, image: "/images/chest_coin.png" },
];

// Dữ liệu giả lập cho Transaction History
const transactionHistory = [
  {
    id: 1,
    date: "2025-04-01",
    description: "Purchased Oak Seed",
    amount: -10,
    status: "Completed",
  },
  {
    id: 2,
    date: "2025-04-03",
    description: "Reward for Task Completion",
    amount: 5,
    status: "Completed",
  },
  {
    id: 3,
    date: "2025-04-05",
    description: "Purchased Watering Can",
    amount: -15,
    status: "Completed",
  },
  {
    id: 4,
    date: "2025-04-07",
    description: "Daily Login Bonus",
    amount: 2,
    status: "Completed",
  },
];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(categories[0]);
  const location = useLocation();
  const [tradeItems, setTradeItems] = useState([]);
  const [allTrees, setAllTrees] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [bagItems, setBagItems] = useState([]);
  const [bagId, setBagId] = useState(null);

  const fetchUserBagItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token.");

      const decodedToken = parseJwt(token);
      const userId = decodedToken?.sub;
      if (!userId) throw new Error("Token không hợp lệ.");

      const userInfo = await GetUserInfo(userId);
      const bagId = userInfo?.bag?.bagId;

      if (!bagId) throw new Error("Không tìm thấy bagId của user.");

      setBagId(bagId);
      const bagItems = await GetBagItems(bagId);
      setBagItems(bagItems);
    } catch (error) {
      console.error("Lỗi khi lấy bagItems:", error);
    }
  };

  useEffect(() => {
    fetchUserBagItems();
  }, []);

  useEffect(() => {
    if (activeTab === "Trade") {
      const fetchTrades = async () => {
        try {
          const trades = await GetTradeByStatus(0);
          setTradeItems(trades);
        } catch (error) {
          console.error("Failed to fetch trade items:", error);
        }
      };

      fetchTrades();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const trees = await GetAllTrees();
        setAllTrees(trees);
      } catch (error) {
        console.error("Failed to fetch all trees:", error);
      }
    };

    fetchTrees();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await GetAllItems();

        // Sort theo rarity
        const sortedItems = items.sort((a, b) => {
          const r1 = rarityOrder[a.rarity] || 0;
          const r2 = rarityOrder[b.rarity] || 0;
          return r2 - r1; // Descending: Legendary -> Common
        });

        setAllItems(sortedItems);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    };

    if (
      activeTab === "Items" ||
      activeTab === "Avatar" ||
      activeTab === "Background" ||
      activeTab === "Music"
    ) {
      fetchItems();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchBagItems = async () => {
      try {
        if (!bagId) return;
        const data = await GetBagItems(bagId);
        setBagItems(data);
      } catch (error) {
        console.error("Lỗi khi lấy bag items:", error);
      }
    };

    fetchBagItems();
  }, [bagId]); // chạy lại khi bagId thay đổi

  const findOwnedItem = (itemId) => {
    return bagItems.find((b) => b.itemId === itemId);
  };

  // Xử lý query parameter để chọn tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && categories.includes(tab)) {
      setActiveTab(tab);
      setFilter(tab.toLowerCase());
    }
  }, [location]);

  // Hàm xử lý khi chọn filter
  const handleFilterChange = (value) => {
    setFilter(value);
    // Nếu value khớp với một category, chuyển sang tab đó
    const matchedCategory = categories.find(
      (cat) => cat.toLowerCase() === value.toLowerCase()
    );
    if (matchedCategory) {
      setActiveTab(matchedCategory);
    }
  };

  const getTradeCoin = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case "legendary":
        return 300;
      case "epic":
        return 200;
      case "rare":
        return 100;
      case "common":
        return 50;
      default:
        return 0;
    }
  };

  const fetchBagItems = async () => {
    try {
      if (!bagId) return;
      const res = await GetBagItems(bagId);
      setBagItems(res);
    } catch (error) {
      console.error("Lỗi khi fetchBagItems:", error);
    }
  };

  const fetchAllItems = async () => {
    const res = await GetAllItems();
    setAllItems(res);
  };

  const handleBuyItem = async (itemId) => {
    try {
      const result = await BuyItem(itemId);
      await fetchBagItems();
      await fetchAllItems();
      toast.success("Mua item thành công!");
    } catch (error) {
      console.error("Lỗi khi mua item:", error);
      toast.error("Có lỗi xảy ra khi mua item.");
    }
  };

  const [packageData, setPackageData] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await GetAllPackages();
        setPackageData(
          data.map((pkg) => ({
            ...pkg,
            coins: pkg.amount,
            image: "/images/package-icon.png", // hoặc dynamic nếu có
          }))
        );
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      }
    };

    fetchPackages();
  }, []);

  const handleBuy = async (packageId) => {
    const token = localStorage.getItem("token");
    const decoded = parseJwt(token);

    if (!decoded) {
      toast.error("Vui lòng đăng nhập lại.");
      return;
    }

    const userId = parseInt(decoded.sub);
    const userInfo = await GetUserInfo(userId);
    const walletId = userInfo.wallet.walletId; // ✅ Thêm dòng này

    console.log("Buying package:", packageId);
    console.log("UserID:", userId);
    console.log("WalletID:", walletId);

    try {
      const result = await PayPackage(userId, walletId, packageId);
      console.log("API result:", result);

      const checkoutUrl = result?.clientSecret?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Không lấy được đường dẫn thanh toán.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      toast.error("Lỗi khi thanh toán.");
    }
  };

  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const parsedToken = parseJwt(token);

        const userId = parsedToken?.sub;

        const allTransactions = await GetAllTransaction();
        const userTransactions = allTransactions.filter(
          (tx) => String(tx.userId) === String(userId)
        );

        setTransactionHistory(userTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 pt-[80px]">
        <div
          className="w-64 p-4 bg-gray-50 dark:bg-gray-800 sticky top-[80px] 
              h-[calc(100vh-80px)] overflow-auto rounded-br-2xl rounded-tr-2xl shadow-lg 
              border border-gray-300 dark:border-gray-700 my-4"
        >
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {/* Popover giống Tree */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left"
              >
                {filter === "all"
                  ? "All"
                  : filter.charAt(0).toUpperCase() + filter.slice(1)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1">
              <div className="flex flex-col gap-1">
                {/* Categories */}
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant="ghost"
                    className="justify-start hover:bg-gray-100 bg-white"
                    onClick={() => handleFilterChange(cat.toLowerCase())}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Marketplace</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => {
              if (cat === "Trade") {
                return (
                  <TabsContent key="Trade" value="Trade">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {tradeItems.length > 0 ? (
                        tradeItems.map((item, i) => {
                          const treeInfo = allTrees.find(
                            (tree) => tree.treeId === item.finalTreeId
                          );
                          const desiredTree = allTrees.find(
                            (tree) => tree.treeId === item.desiredTreeAID
                          );
                          const rarityClass =
                            rarityColorMap[treeInfo?.rarity?.toLowerCase()] ||
                            "text-gray-400";
                          const coin = getTradeCoin(treeInfo?.rarity);

                          return (
                            <motion.div
                              key={item.id || i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: i * 0.1 }}
                            >
                              <Card className="relative overflow-hidden">
                                <CardContent className="flex flex-col items-center p-4">
                                  <img
                                    src={
                                      treeInfo?.imageUrl ||
                                      "/images/default-tree.png"
                                    }
                                    alt={treeInfo?.name || "Tree"}
                                    className="h-20 w-20 object-cover rounded-lg mb-2"
                                  />
                                  <p
                                    className={`font-semibold mb-1 ${rarityClass}`}
                                  >
                                    {treeInfo?.rarity || "Unknown Rarity"}
                                  </p>
                                  <p className="font-semibold">
                                    {treeInfo?.name || `Trade Item ${i + 1}`}
                                  </p>
                                  <p className="text-sm text-gray-500 flex items-center space-x-2">
                                    <span className="flex items-center">
                                      <img
                                        src="/images/coin.png"
                                        alt="Coin"
                                        className="w-5 h-5 mr-1"
                                      />
                                      {coin}
                                    </span>

                                    {desiredTree && (
                                      <img
                                        src={desiredTree.imageUrl}
                                        alt={desiredTree.name}
                                        className="w-8 h-8 rounded object-cover border border-gray-300"
                                      />
                                    )}
                                  </p>
                                  <Button
                                    className="mt-2"
                                    variant="outline"
                                    onClick={() => setSelectedTrade(item)}
                                  >
                                    <ShoppingCart className="mr-2 h-4 w-4" />{" "}
                                    Trade
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })
                      ) : (
                        <p>No trade items available.</p>
                      )}
                    </div>
                    <TradeDialog
                      open={!!selectedTrade}
                      tradeItem={selectedTrade}
                      onClose={() => setSelectedTrade(null)}
                    />
                  </TabsContent>
                );
              }

              if (cat === "Transaction") {
                return (
                  <TabsContent key="Transaction" value="Transaction">
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">
                          Transaction History
                        </h2>
                        <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
                          {transactionHistory.map((transaction) => (
                            <li
                              key={transaction.transactionId}
                              className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">
                                  {transaction.paymentMethod} -{" "}
                                  {transaction.transactionRef}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(
                                    transaction.transactionTime
                                  ).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-800 font-semibold">
                                  Amount: ${transaction.amount.toFixed(2)}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span
                                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                                    transaction.status === 1
                                      ? "bg-green-100 text-green-700"
                                      : transaction.status === 2
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {transaction.status === 1
                                    ? "Success"
                                    : transaction.status === 2
                                    ? "Cancelled"
                                    : "Pending"}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              }

              const filteredItems = allItems.filter((item) => {
                const typeMap = {
                  Items: [0, 1],
                  Avatar: [2],
                  Background: [3],
                  Music: [4],
                };
                return typeMap[cat]?.includes(item.type);
              });

              return (
                <TabsContent key={cat} value={cat}>
                  {cat === "Package" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {[...packageData]
                        .sort((a, b) => a.price - b.price)
                        .map((pkg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card className="relative overflow-hidden">
                              <CardContent className="flex flex-col items-center p-4">
                                <div className="flex items-center mb-2">
                                  <span className="text-sm font-semibold">
                                    {pkg.coins}
                                  </span>
                                  <img
                                    src="/images/coin.png"
                                    alt="Coin"
                                    className="w-5 h-5 ml-1"
                                  />
                                </div>

                                {/* Chọn hình ảnh phù hợp với amount */}
                                <img
                                  src={
                                    pkg.amount < 500
                                      ? "/images/bunch_coin_1.png"
                                      : pkg.amount <= 1000
                                      ? "/images/bunch_coin_2.png"
                                      : pkg.amount <= 1500
                                      ? "/images/bunch_coin_3.png"
                                      : pkg.amount <= 2000
                                      ? "/images/bag_coin.png"
                                      : "/images/chest_coin.png"
                                  }
                                  alt={`Package ${pkg.price}`}
                                  className="w-20 h-20 object-cover rounded-lg mb-2"
                                />

                                <p className="font-semibold text-lg mb-2">
                                  ${pkg.price}
                                </p>
                                <Button
                                  className="mt-2"
                                  variant="outline"
                                  onClick={() => handleBuy(pkg.packageId)}
                                >
                                  <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredItems.map((item, i) => {
                        const detail = item.itemDetail;
                        const rarityClass =
                          rarityColorMap[item.rarity?.toLowerCase()] ||
                          "text-gray-400";

                        return (
                          <motion.div
                            key={item.itemId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          >
                            <Card className="relative overflow-hidden">
                              {/* Badge Quantity ở góc phải nếu là tab "Items" */}
                              {(() => {
                                const owned = findOwnedItem(item.itemId);
                                const isQuantityVisible = activeTab === "Items";

                                if (owned && isQuantityVisible) {
                                  return (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
                                      x{owned.quantity}
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              <CardContent className="flex flex-col items-center p-4 cursor-pointer">
                                {cat === "Music" ? (
                                  <div className="relative w-20 h-20 bg-gray-10 rounded-lg overflow-hidden">
                                    <button
                                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm"
                                      onClick={() => {
                                        const audio = new Audio(
                                          detail.mediaUrl
                                        );
                                        audio.currentTime = 0;
                                        audio.play();
                                        audio.ontimeupdate = () => {
                                          if (audio.currentTime > 15) {
                                            audio.pause();
                                            audio.currentTime = 0;
                                          }
                                        };
                                      }}
                                    >
                                      ▶️ Preview
                                    </button>
                                  </div>
                                ) : (
                                  <img
                                    src={detail.mediaUrl}
                                    alt={item.name}
                                    className={`object-cover rounded-lg mb-2 ${
                                      cat === "Background"
                                        ? "w-full h-32"
                                        : "h-20 w-20"
                                    }`}
                                  />
                                )}
                                <p
                                  className={`font-semibold mb-1 ${rarityClass}`}
                                >
                                  {item.rarity}
                                </p>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-gray-500 text-center mb-1">
                                  {detail.description}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <img
                                    src="/images/coin.png"
                                    alt="Coin"
                                    className="w-5 h-5 mr-1"
                                  />
                                  {item.cost}
                                </p>

                                {/* Buy / Owned / Quantity Button */}
                                {(() => {
                                  const owned = findOwnedItem(item.itemId);
                                  const isQuantityVisible =
                                    activeTab === "Items";
                                  const isOwnedVisible = [
                                    "Avatar",
                                    "Background",
                                    "Music",
                                  ].includes(activeTab);

                                  if (owned && isOwnedVisible) {
                                    return (
                                      <Button
                                        className="mt-2"
                                        variant="secondary"
                                        disabled
                                      >
                                        Owned
                                      </Button>
                                    );
                                  }

                                  return (
                                    <Button
                                      className="mt-2"
                                      variant="outline"
                                      onClick={() => handleBuyItem(item.itemId)}
                                    >
                                      <ShoppingCart className="mr-2 h-4 w-4" />{" "}
                                      Buy
                                    </Button>
                                  );
                                })()}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
